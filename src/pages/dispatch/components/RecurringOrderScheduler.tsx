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
import { RecurringOrder, DeliveryStop } from './stops/types';
import { Customer } from '@/pages/customers/types';
import { RecurringFrequency, PreferredDay } from '@/types/recurring';

interface RecurringOrderSchedulerProps {
  selectedRecurringOrder?: RecurringOrder | null;
  onSave?: (items: string, frequency: RecurringFrequency, preferredDay: PreferredDay | undefined, startDate: string | undefined, endDate: string | undefined) => void;
  onCancel?: () => void;
  customers?: Customer[];
  scheduleDate: Date;
  onAddStops: (newStops: DeliveryStop[]) => void;
  existingCustomerIds: string[];
}

export function RecurringOrderScheduler({
  selectedRecurringOrder = null,
  onSave = () => {},
  onCancel = () => {},
  customers = [],
  scheduleDate,
  onAddStops,
  existingCustomerIds = []
}: RecurringOrderSchedulerProps) {
  const [frequency, setFrequency] = useState<RecurringFrequency>(selectedRecurringOrder?.frequency || 'weekly');
  const [preferredDay, setPreferredDay] = useState<PreferredDay | undefined>(selectedRecurringOrder?.preferred_day);
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
            customer:customers(*)
          `)
          .eq('is_active', true);

        if (error) {
          throw error;
        }

        // Filter out orders for customers that are already in the schedule
        const filteredOrders = data.filter(order => !existingCustomerIds.includes(order.customer_id));
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
  }, [existingCustomerIds, toast]);

  const handleSave = useCallback(() => {
    const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined;
    const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined;
    onSave(items, frequency, preferredDay, startDate, endDate);
  }, [date, frequency, preferredDay, items, onSave]);

  const getCustomerName = useCallback((customerId: string | undefined) => {
    if (!customerId || !customers) return 'N/A';
    const customer = customers.find((c) => c.id === customerId);
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
      status: "PENDING",
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
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select value={frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Preferred Day</Label>
          <Select value={preferredDay} onValueChange={handlePreferredDayChange}>
            <SelectTrigger>
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

        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Items</Label>
          <Textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="Enter items for this recurring order"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Available Recurring Orders</h3>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : availableRecurringOrders.length > 0 ? (
          <div className="space-y-4">
            {availableRecurringOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{getCustomerName(order.customer_id)}</div>
                  <div className="text-sm text-gray-500">
                    {order.frequency} - {order.preferred_day}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newStop: DeliveryStop = {
                      stop_number: 1,
                      client_id: order.customer_id,
                      customer_name: order.customer?.name || 'Unknown Customer',
                      customer_address: order.customer?.address || '',
                      customer_phone: order.customer?.phone || '',
                      customer: order.customer,
                      driver_id: "",
                      driver_name: "",
                      items: order.items || "",
                      notes: `Recurring order (${order.frequency})`,
                      status: "PENDING",
                      is_recurring: true,
                      recurring_order_id: order.id,
                      master_schedule_id: ""
                    };
                    onAddStops([newStop]);
                  }}
                >
                  Add to Schedule
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No recurring orders available for this date
          </div>
        )}
      </div>
    </div>
  );
}
