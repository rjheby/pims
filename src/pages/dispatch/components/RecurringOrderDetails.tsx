
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { RecurringOrderForm } from './RecurringOrderForm';
import { calculateNextOccurrences, updateRecurringSchedule } from '../utils/recurringOrderUtils';
import { ItemSelector } from "./stops/ItemSelector";

interface RecurringOrderDetailsProps {
  orderId: string;
  customers: any[];
  onSaved: () => void;
  onCancel: () => void;
}

export function RecurringOrderDetails({
  orderId,
  customers,
  onSaved,
  onCancel
}: RecurringOrderDetailsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [futureOccurrences, setFutureOccurrences] = useState<Date[]>([]);
  const [isItemSelectorOpen, setIsItemSelectorOpen] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('recurring_orders')
        .select(`
          *,
          customer:customer_id (
            id, name, address, phone, email
          )
        `)
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      
      setOrderDetails(data);
      console.log("Fetched recurring order details:", data);
      
      // Calculate future occurrences
      if (data) {
        const occurrences = calculateNextOccurrences(
          new Date(),
          data.frequency,
          data.preferred_day,
          5
        );
        
        setFutureOccurrences(occurrences);
      }
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load recurring order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      setSaving(true);
      
      // Update the recurring order
      const { error } = await supabase
        .from('recurring_orders')
        .update({
          customer_id: formData.customer_id,
          frequency: formData.frequency,
          preferred_day: formData.preferred_day,
          preferred_time: formData.preferred_time,
          items: formData.items, // Include items in the update
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // After updating the recurring order, we need to update the recurring schedules
      await updateRecurringSchedule(orderId);
      
      toast({
        title: "Success",
        description: "Recurring order updated successfully",
      });
      
      onSaved();
    } catch (error: any) {
      console.error('Error updating recurring order:', error);
      toast({
        title: "Error",
        description: `Failed to update order: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectItems = (items: string) => {
    if (orderDetails) {
      setOrderDetails({
        ...orderDetails,
        items
      });
    }
    setIsItemSelectorOpen(false);
  };

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="py-8 text-center">
        <p>Order not found.</p>
        <Button onClick={onCancel} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      <RecurringOrderForm
        customers={customers}
        onSubmit={handleSave}
        onCancel={onCancel}
        initialValues={{
          customer_id: orderDetails.customer_id,
          frequency: orderDetails.frequency,
          preferred_day: orderDetails.preferred_day,
          preferred_time: orderDetails.preferred_time,
          items: orderDetails.items, // Include items in initial values
        }}
      />
      
      <Separator />
      
      <div>
        <h3 className="text-sm font-medium mb-2">Next 5 Occurrences</h3>
        
        {futureOccurrences.length > 0 ? (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {futureOccurrences.map((date, index) => (
              <div 
                key={index} 
                className="flex items-center p-2 bg-gray-50 rounded-md"
              >
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span>
                  {format(date, "EEEE, MMMM d, yyyy")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Could not calculate future occurrences
          </p>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          disabled={saving} 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={saving}
          onClick={() => handleSave({
            customer_id: orderDetails.customer_id,
            frequency: orderDetails.frequency,
            preferred_day: orderDetails.preferred_day,
            preferred_time: orderDetails.preferred_time,
            items: orderDetails.items,
          })}
          className="bg-[#2A4131] hover:bg-[#2A4131]/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Item Selector Dialog */}
      <ItemSelector
        open={isItemSelectorOpen}
        onOpenChange={setIsItemSelectorOpen}
        onSelect={handleSelectItems}
        onCancel={() => setIsItemSelectorOpen(false)}
        initialItems={orderDetails.items}
      />
    </div>
  );
}
