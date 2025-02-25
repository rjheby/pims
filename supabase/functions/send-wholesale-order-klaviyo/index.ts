
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const KLAVIYO_API_KEY = Deno.env.get("KLAVIYO_PRIVATE_API_KEY");
const KLAVIYO_TEMPLATE_ID = Deno.env.get("KLAVIYO_TEMPLATE_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, recipientEmail } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Fetch order data
    const { data: order, error: orderError } = await supabaseClient
      .from('wholesale_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Format order data for Klaviyo
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const formattedOrder = {
      order_number: order.order_number,
      delivery_date: order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'Not set',
      items: items.map((item: any) => ({
        species: item.species,
        length: item.length,
        bundle_type: item.bundleType,
        thickness: item.thickness,
        packaging: item.packaging,
        pallets: item.pallets,
        unit_cost: item.unitCost,
        total: (item.pallets * item.unitCost).toFixed(2)
      })),
      total_value: items.reduce((sum: number, item: any) => 
        sum + (Number(item.pallets || 0) * Number(item.unitCost || 0)), 0
      ).toFixed(2)
    };

    // Send email via Klaviyo
    const response = await fetch('https://a.klaviyo.com/api/v2/email/template/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_API_KEY}`
      },
      body: JSON.stringify({
        template_id: KLAVIYO_TEMPLATE_ID,
        from_email: 'your-verified-sender@yourdomain.com', // Update this with your verified sender
        from_name: 'Woodbourne',
        to: [{ email: recipientEmail }],
        context: formattedOrder
      })
    });

    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
