import React, { useState, useEffect, useCallback } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RecurringOrder, 
  DeliveryStop, 
  Customer, 
  DeliveryStatus, 
  RecurringFrequency, 
  PreferredDay 
} from '@/types';

interface RecurringOrderSchedulerProps {
  selectedRecurringOrder?: RecurringOrder | null;
  onSave?: (items: string, frequency: string, preferredDay: string | undefined, startDate: string | undefined, endDate: string | undefined) => void;
  onCancel?: () => void;
  customers?: Customer[];
  scheduleDate: Date;
  onAddStops: (newStops: DeliveryStop[]) => void;
  existingClientIds: string[];
}

export function RecurringOrderScheduler({
  selectedRecurringOrder = null,
  onSave = () => {},
  onCancel = () => {},
  customers = [],
  scheduleDate,
  onAddStops,
  existingClientIds = []
}: RecurringOrderSchedulerProps) {
  const [frequency, setFrequency] = useState<RecurringFrequency>(selectedRecurringOrder?.frequency || 'weekly');
  const [preferredDay, setPreferredDay] = useState<PreferredDay>(selectedRecurringOrder?.preferred_day || 'monday');
  const [items, setItems] = useState(selectedRecurringOrder?.items || '');
  const [date, setDate] = useState<DateRange | undefined>({
    from: selectedRecurringOrder?.start_date ? new Date(selectedRecurringOrder.start_date) : undefined,
    to: selectedRecurringOrder?.end_date ? new Date(selectedRecurringOrder.end_date) : undefined,
  });
  const [loading, setLoading] = useState(false);
  const [availableRecurringOrders, setAvailableRecurringOrders] = useState<RecurringOrder[]>([]);
  const { toast } = useToast();

  const preferredDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ] as const;

  // Fetch recurring orders on component mount
  useEffect(() => {
    const fetchRecurringOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('recurring_orders')
          .select(`
            *,
            customer:customer_id (
              id, name, address, phone, email
            )
          `)
          .eq('active_status', true);

        if (error) {
          throw error;
        }

        // Filter out customers that are already in the current schedule
        const filteredOrders = data?.filter(order => 
          !existingClientIds.includes(order.customer_id)
        ) || [];

        setAvailableRecurringOrders(filteredOrders);
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to fetch recurring orders: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecurringOrders();
  }, [existingClientIds, toast]);

  const handleSave = useCallback(() => {
    const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined;
    const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined;
    const itemsString = typeof selectedRecurringOrder?.items === 'string' 
      ? selectedRecurringOrder.items 
      : JSON.stringify(selectedRecurringOrder?.items || []);
    onSave(itemsString, frequency, preferredDay, startDate, endDate);
  }, [date, frequency, preferredDay, selectedRecurringOrder, onSave]);

  const getCustomerName = useCallback((clientId: string | undefined) => {
    if (!clientId || !customers) return 'N/A';
    const customer = customers.find((c) => c.id === clientId);
    return customer ? customer.name : 'Unknown Customer';
  }, [customers]);

  const handleFrequencyChange = useCallback((value: string) => {
    setFrequency(value as RecurringFrequency);
  }, []);

  const handlePreferredDayChange = useCallback((value: string) => {
    setPreferredDay(value as PreferredDay);
  }, []);

  // Convert recurring orders to delivery stops
  const handleAddRecurringStops = useCallback(() => {
    if (availableRecurringOrders.length === 0) {
      toast({
        title: "No Orders",
        description: "No recurring orders available for this date",
        variant: "default"
      });
      return;
    }

    const newStops: DeliveryStop[] = availableRecurringOrders.map((order, index) => ({
      stop_number: index + 1,
      client_id: order.customer_id,
      customer_name: order.customer?.name || 'Unknown Customer',
      customer_address: order.customer?.address || '',
      customer_phone: order.customer?.phone || '',
      customer: order.customer,
      driver_id: "",
      driver_name: "",
      items: order.items || "",
      notes: `Recurring order (${order.frequency})`,
      status: "PENDING" as DeliveryStatus,
      is_recurring: true,
      recurring_order_id: order.id,
      master_schedule_id: ""
    }));

    onAddStops(newStops);
    
    toast({
      title: "Success",
      description: `Added ${newStops.length} recurring orders to schedule`,
      variant: "default"
    });
  }, [availableRecurringOrders, onAddStops, toast]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-medium mb-2">Available Recurring Orders</h3>
        <p className="text-sm text-gray-500 mb-4">
          {availableRecurringOrders.length === 0 
            ? "No recurring orders available for this date or all customers already added to schedule." 
            : `${availableRecurringOrders.length} recurring orders available to add to this schedule.`}
        </p>
        
        {availableRecurringOrders.length > 0 && (
          <>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Frequency</th>
                    <th className="px-4 py-2 text-left">Preferred Day</th>
                    <th className="px-4 py-2 text-left">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {availableRecurringOrders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-2">{order.customer?.name || 'Unknown'}</td>
                      <td className="px-4 py-2">{order.frequency}</td>
                      <td className="px-4 py-2">{order.preferred_day}</td>
                      <td className="px-4 py-2">{order.items}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleAddRecurringStops}
                disabled={loading || availableRecurringOrders.length === 0}
              >
                Add All Recurring Orders to Schedule
              </Button>
            </div>
          </>
        )}
      </div>
      
      {selectedRecurringOrder && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Edit Recurring Order</h3>
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Input id="customer" value={getCustomerName(selectedRecurringOrder?.client_id)} disabled />
          </div>
          <div className="mt-2">
            <Label htmlFor="items">Items</Label>
            <Textarea
              id="items"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Enter items"
            />
          </div>
          <div className="mt-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select 
              value={frequency} 
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {frequency === 'weekly' && (
            <div className="mt-2">
              <Label htmlFor="preferredDay">Preferred Day</Label>
              <Select 
                value={preferredDay} 
                onValueChange={handlePreferredDayChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select preferred day" />
                </SelectTrigger>
                <SelectContent>
                  {preferredDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="mt-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[240px] justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      `${format(date.from, 'MMM dd, yyyy')} - ${format(
                        date.to,
                        'MMM dd, yyyy'
                      )}`
                    ) : (
                      format(date.from, 'MMM dd, yyyy')
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
