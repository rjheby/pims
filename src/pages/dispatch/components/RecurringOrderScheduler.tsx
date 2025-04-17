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
import { RecurringOrder, Customer } from './stops/types';

interface RecurringOrderSchedulerProps {
  selectedRecurringOrder?: RecurringOrder | null;
  onSave?: (items: string, frequency: string, preferredDay: string | undefined, startDate: string | undefined, endDate: string | undefined) => void;
  onCancel?: () => void;
  customers?: Customer[];
  scheduleDate?: Date;
  onAddStops?: (newStops: any[]) => void;
  existingCustomerIds?: string[];
}

export function RecurringOrderScheduler({
  selectedRecurringOrder,
  onSave,
  onCancel,
  customers,
  scheduleDate,
  onAddStops,
  existingCustomerIds = []
}: RecurringOrderSchedulerProps) {
  const [frequency, setFrequency] = useState(selectedRecurringOrder?.frequency || 'weekly');
  const [preferredDay, setPreferredDay] = useState(selectedRecurringOrder?.preferred_day || 'monday');
  const [items, setItems] = useState(selectedRecurringOrder?.items || '');
  const [date, setDate] = useState<DateRange | undefined>({
    from: selectedRecurringOrder?.startDate ? new Date(selectedRecurringOrder.startDate) : undefined,
    to: selectedRecurringOrder?.endDate ? new Date(selectedRecurringOrder.endDate) : undefined,
  });

  const preferredDays = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const handleSave = () => {
    const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined;
    const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined;
    const itemsString = typeof selectedRecurringOrder?.items === 'string' 
      ? selectedRecurringOrder.items 
      : JSON.stringify(selectedRecurringOrder?.items || []);
    onSave(itemsString, frequency, preferredDay, startDate, endDate);
  };

  const getCustomerName = useCallback((customerId: string | undefined) => {
    if (!customerId) return 'N/A';
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  }, [customers]);

  const parsedItems = typeof selectedRecurringOrder?.items === 'string'
  ? JSON.parse(selectedRecurringOrder.items)
  : (selectedRecurringOrder?.items || []);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="customer">Customer</Label>
        <Input id="customer" value={getCustomerName(selectedRecurringOrder?.customer_id)} disabled />
      </div>
      <div>
        <Label htmlFor="items">Items</Label>
        <Textarea
          id="items"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          placeholder="Enter items"
        />
      </div>
      <div>
        <Label htmlFor="frequency">Frequency</Label>
        <Select value={frequency} onValueChange={setFrequency}>
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
        <div>
          <Label htmlFor="preferredDay">Preferred Day</Label>
          <Select value={preferredDay} onValueChange={setPreferredDay}>
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
      <div>
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
      <div className="flex justify-end space-x-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
