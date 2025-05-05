
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncResult {
  success: boolean;
  stopsCreated: number;
  error?: string;
}

export function useRecurringOrderSync() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  /**
   * Sync recurring orders for a specific date
   */
  const syncRecurringOrders = async (date: string): Promise<SyncResult> => {
    try {
      setSyncing(true);

      // Call the forceSyncForDate function via RPC
      const { data, error } = await supabase.rpc('sync_recurring_orders_for_date', {
        date_str: date
      });

      if (error) throw error;

      console.log('Sync result:', data);

      toast({
        title: "Sync Complete",
        description: `Added ${data.stops_created || 0} recurring stops to schedule.`,
      });

      return {
        success: true,
        stopsCreated: data.stops_created || 0
      };
    } catch (error: any) {
      console.error('Error syncing recurring orders:', error);
      
      toast({
        title: "Error",
        description: `Failed to sync recurring orders: ${error.message}`,
        variant: "destructive"
      });
      
      return {
        success: false,
        stopsCreated: 0,
        error: error.message
      };
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    syncRecurringOrders
  };
}
