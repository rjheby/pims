import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client'; 
import { useManualStopActions } from '@/services/stops/useManualStopActions';
import { DeliveryStop } from '@/types';

interface AddOrderLoggerProps {
  scheduleId?: string;
  scheduleNumber?: string;
}

export function AddOrderLogger({ scheduleId, scheduleNumber }: AddOrderLoggerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [orderAdded, setOrderAdded] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const { addManualStop } = useManualStopActions({
    stops,
    onStopsChange: setStops,
    masterScheduleId: scheduleId
  });

  // Add log message
  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, message]);
    console.log(`[AddOrderLogger] ${message}`);
  };

  // Load schedule data
  useEffect(() => {
    async function loadScheduleData() {
      if (!scheduleNumber) return;
      
      setLoading(true);
      addLog(`Step 1: Loading schedule data for ${scheduleNumber}`);
      
      try {
        // First load the schedule data
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('dispatch_schedules')
          .select('*')
          .eq('schedule_number', scheduleNumber)
          .single();
          
        if (scheduleError) {
          throw scheduleError;
        }
        
        if (!scheduleData) {
          addLog(`Error: Schedule ${scheduleNumber} not found`);
          return;
        }
        
        setScheduleData(scheduleData);
        addLog(`Step 2: Found schedule with ID ${scheduleData.id}`);
        
        // Then load stops for this schedule
        const { data: stopsData, error: stopsError } = await supabase
          .from('delivery_stops')
          .select('*')
          .eq('master_schedule_id', scheduleData.id);
          
        if (stopsError) {
          throw stopsError;
        }
        
        setStops(stopsData || []);
        addLog(`Step 3: Loaded ${stopsData?.length || 0} existing stops`);
        
        // Load customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('name');
          
        if (customersError) {
          throw customersError;
        }
        
        setCustomers(customersData || []);
        addLog(`Step 4: Loaded ${customersData?.length || 0} customers`);
        
        // Find Aromi customer
        const aromiCustomer = customersData?.find(c => 
          c.name.toLowerCase().includes('aromi') || 
          (c.type === 'RESTAURANT' && c.name.toLowerCase().includes('pizza'))
        );
        
        if (aromiCustomer) {
          addLog(`Step 5: Found Aromi customer with ID ${aromiCustomer.id}`);
        } else {
          addLog(`Warning: Could not find a customer named "Aromi" - using first restaurant customer instead`);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        addLog(`Error loading schedule data: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    }
    
    loadScheduleData();
  }, [scheduleNumber]);
  
  const handleAddAromiOrder = async () => {
    addLog('Step 6: Beginning process to add Aromi order with 1 bundle of pizza wood');
    
    if (!scheduleData) {
      addLog('Error: No schedule data loaded');
      return;
    }
    
    // Find Aromi customer - or fall back to first restaurant customer
    let aromiCustomer = customers.find(c => 
      c.name.toLowerCase().includes('aromi') || 
      (c.type === 'RESTAURANT' && c.name.toLowerCase().includes('pizza'))
    );
    
    // If no restaurant customer found, use first customer
    if (!aromiCustomer && customers.length > 0) {
      aromiCustomer = customers[0];
      addLog(`Note: Using customer "${aromiCustomer.name}" as Aromi was not found`);
    }
    
    if (!aromiCustomer) {
      addLog('Error: No customers found in the system');
      return;
    }
    
    // Format address from components if needed
    const customerAddress = aromiCustomer.address || 
      `${aromiCustomer.street_address || ''} ${aromiCustomer.city || ''}, ${aromiCustomer.state || ''} ${aromiCustomer.zip_code || ''}`.trim();
    
    addLog(`Step 7: Adding stop for ${aromiCustomer.name} with address: ${customerAddress}`);
    
    // 1. First add it to our local stops state using the hooks function
    const locallyAdded = addManualStop(
      aromiCustomer.id,
      aromiCustomer.name,
      customerAddress,
      aromiCustomer.phone || '',
      '1 bundle of pizza wood'
    );
    
    if (locallyAdded) {
      addLog(`Step 8: Successfully added stop to local state`);
    } else {
      addLog(`Error: Failed to add stop to local state`);
      return;
    }
    
    // 2. Then add it directly to Supabase
    try {
      setLoading(true);
      
      const newStop = {
        master_schedule_id: scheduleData.id,
        customer_id: aromiCustomer.id,
        customer_name: aromiCustomer.name,
        customer_address: customerAddress,
        customer_phone: aromiCustomer.phone || '',
        stop_number: stops.length + 1,
        items: '1 bundle of pizza wood',
        price: 45, // Price for pizza wood bundle
        status: 'pending'
      };
      
      addLog(`Step 9: Sending stop to database with data: ${JSON.stringify(newStop, null, 2)}`);
      
      const { data, error } = await supabase
        .from('delivery_stops')
        .insert(newStop)
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        addLog(`Step 10: Successfully added stop to database with ID ${data[0].id}`);
        
        // 3. Create a delivery schedule entry
        const { error: scheduleError } = await supabase
          .from('delivery_schedules')
          .insert({
            customer_id: aromiCustomer.id,
            master_schedule_id: scheduleData.id,
            delivery_date: scheduleData.schedule_date,
            schedule_type: 'standard',
            driver_id: null,
            items: '1 bundle of pizza wood',
            status: 'draft'
          });
          
        if (scheduleError) {
          addLog(`Warning: Created stop but failed to create delivery schedule entry: ${scheduleError.message}`);
        } else {
          addLog(`Step 11: Successfully created delivery schedule entry`);
        }
        
        // 4. Verify the stop was added by fetching the latest data
        const { data: verifyData, error: verifyError } = await supabase
          .from('delivery_stops')
          .select('*')
          .eq('master_schedule_id', scheduleData.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (verifyError) {
          addLog(`Warning: Unable to verify stop was added: ${verifyError.message}`);
        } else if (verifyData && verifyData.length > 0) {
          const verifiedStop = verifyData[0];
          addLog(`Step 12: Verified stop was added correctly with items "${verifiedStop.items}"`);
          setOrderAdded(true);
        }
      }
    } catch (error) {
      console.error('Error adding order:', error);
      addLog(`Error adding order to database: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Order Process Logger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="mb-2"><strong>Schedule:</strong> {scheduleNumber || 'Not specified'}</p>
            <p className="mb-2"><strong>Schedule ID:</strong> {scheduleData?.id || 'Not loaded'}</p>
            <p className="mb-2"><strong>Stops Count:</strong> {stops.length}</p>
          </div>
          
          <Button 
            onClick={handleAddAromiOrder} 
            disabled={loading || !scheduleData || orderAdded}
            className="bg-[#2A4131] hover:bg-[#2A4131]/90 w-full"
          >
            {loading ? 'Adding Order...' : orderAdded ? 'Order Added!' : 'Add Aromi Pizza Wood Order'}
          </Button>
          
          <div className="mt-4 p-4 bg-gray-50 rounded border overflow-auto max-h-60">
            <h3 className="font-medium mb-2">Process Log:</h3>
            <div className="space-y-1 text-sm font-mono">
              {logMessages.map((message, index) => (
                <div key={index} className="border-b pb-1">
                  {message}
                </div>
              ))}
              {logMessages.length === 0 && (
                <p className="text-gray-500">No actions logged yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
