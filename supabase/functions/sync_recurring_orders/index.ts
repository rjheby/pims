
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to format dates consistently
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
}

// Handle CORS preflight requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth header of the request
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the request body
    const { date } = await req.json()

    if (!date) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Date parameter is required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const targetDate = new Date(date)
    // Get the day name (e.g., "monday", "tuesday") from the date
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    
    console.log(`Syncing recurring orders for ${formatDate(targetDate)} (${dayName})`)

    // Get all active recurring orders for this day
    const { data: recurringOrders, error: ordersError } = await supabaseClient
      .from('recurring_orders')
      .select(`
        *,
        customer:customer_id (
          id, name, address, phone, email
        )
      `)
      .eq('preferred_day', dayName)
      .eq('active_status', true)

    if (ordersError) {
      throw ordersError
    }

    console.log(`Found ${recurringOrders?.length || 0} recurring orders for ${dayName}`)

    // Find or create a schedule for this date
    let scheduleId: string | null = null
    const formattedDate = formatDate(targetDate)
      
    // Check if a schedule already exists for this date
    const { data: existingSchedule, error: scheduleError } = await supabaseClient
      .from('dispatch_schedules')
      .select('id, schedule_number')
      .eq('schedule_date', formattedDate)
      .maybeSingle()
      
    if (scheduleError) {
      throw scheduleError
    }
      
    if (existingSchedule) {
      scheduleId = existingSchedule.id
      console.log(`Using existing schedule: ${existingSchedule.schedule_number}`)
    } else {
      // Create a new schedule
      const scheduleNumber = `DS-${formattedDate.replace(/-/g, '')}-01`
        
      const { data: newSchedule, error: createError } = await supabaseClient
        .from('dispatch_schedules')
        .insert({
          schedule_date: formattedDate,
          schedule_number: scheduleNumber,
          status: 'draft'
        })
        .select()
        .single()
        
      if (createError) {
        throw createError
      }
        
      scheduleId = newSchedule.id
      console.log(`Created new schedule: ${scheduleNumber}`)
    }

    // Process each recurring order and create stops
    let stopsCreated = 0
      
    for (const order of recurringOrders) {
      // Check if this order's frequency applies to this date
      let shouldCreate = false
        
      if (!order.frequency || order.frequency.toLowerCase() === 'weekly') {
        shouldCreate = true // Weekly orders always apply
      } else if (order.frequency.toLowerCase() === 'biweekly') {
        // For biweekly orders, check if this is the right week
        const orderCreation = new Date(order.created_at)
        const weeksDiff = Math.floor(
          (targetDate.getTime() - orderCreation.getTime()) / 
          (7 * 24 * 60 * 60 * 1000)
        )
        shouldCreate = weeksDiff % 2 === 0
      } else if (order.frequency.toLowerCase() === 'monthly') {
        // For monthly orders, check if this is the first occurrence of this day in the month
        const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
        let firstOccurrenceDate = firstDayOfMonth
          
        // Find first occurrence of this day in the month
        while (
          firstOccurrenceDate.getMonth() === targetDate.getMonth() && 
          firstOccurrenceDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() !== dayName
        ) {
          firstOccurrenceDate.setDate(firstOccurrenceDate.getDate() + 1)
        }
          
        // If this is the first occurrence date of this day in the month
        shouldCreate = targetDate.getDate() === firstOccurrenceDate.getDate()
      }
        
      if (!shouldCreate) {
        console.log(`Skipping order ${order.id} based on frequency rules`)
        continue
      }
        
      // Check if a stop already exists for this recurring order on this date
      const { data: existingStops, error: stopsCheckError } = await supabaseClient
        .from('delivery_stops')
        .select('id')
        .eq('master_schedule_id', scheduleId)
        .eq('recurring_id', order.id)
        
      if (stopsCheckError) {
        console.error(`Error checking for existing stops: ${stopsCheckError.message}`)
        continue
      }
        
      if (existingStops && existingStops.length > 0) {
        console.log(`Stop already exists for recurring order ${order.id}`)
        continue
      }
        
      // Check if we have customer data
      if (!order.customer || !order.customer.id) {
        console.warn(`Order ${order.id} has no customer data, skipping`)
        continue
      }
        
      // Create the stop
      const { error: createStopError } = await supabaseClient
        .from('delivery_stops')
        .insert({
          master_schedule_id: scheduleId,
          customer_id: order.customer.id,
          customer_name: order.customer.name,
          customer_address: order.customer.address || '',
          customer_phone: order.customer.phone || '',
          scheduling_status: 'scheduled',
          status: 'pending',
          is_recurring: true,
          recurring_id: order.id,
          items: order.items || '',
          notes: `Auto-generated from recurring order (${order.frequency})`
        })
        
      if (createStopError) {
        console.error(`Error creating stop: ${createStopError.message}`)
        continue
      }
        
      stopsCreated++
      console.log(`Created stop for recurring order ${order.id}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        stopsCreated: stopsCreated,
        scheduleId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing request:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
