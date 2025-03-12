
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { recurrenceOptions, dayOptions } from './utils';

interface RecurringOrderFormProps {
  onRecurrenceChange: (recurrenceData: RecurrenceData) => void;
  initialRecurrence?: RecurrenceData;
}

export interface RecurrenceData {
  isRecurring: boolean;
  frequency: string;
  preferredDay?: string;
  startDate?: string;
  endDate?: string;
}

export const RecurringOrderForm = ({ 
  onRecurrenceChange, 
  initialRecurrence 
}: RecurringOrderFormProps) => {
  const [recurrenceData, setRecurrenceData] = useState<RecurrenceData>(
    initialRecurrence || {
      isRecurring: false,
      frequency: 'none',
    }
  );

  const handleChange = (field: keyof RecurrenceData, value: any) => {
    const updatedData = { ...recurrenceData, [field]: value };
    
    // If toggling recurrence off, reset other fields
    if (field === 'isRecurring' && value === false) {
      updatedData.frequency = 'none';
      updatedData.preferredDay = undefined;
    }
    
    // If toggling recurrence on, set default frequency
    if (field === 'isRecurring' && value === true && recurrenceData.frequency === 'none') {
      updatedData.frequency = 'weekly';
    }
    
    setRecurrenceData(updatedData);
    onRecurrenceChange(updatedData);
  };

  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="isRecurring" className="font-medium">Recurring Delivery</Label>
        <Switch
          id="isRecurring"
          checked={recurrenceData.isRecurring}
          onCheckedChange={(checked) => handleChange('isRecurring', checked)}
        />
      </div>
      
      {recurrenceData.isRecurring && (
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="frequency" className="text-sm font-medium">Frequency</Label>
            <Select
              value={recurrenceData.frequency}
              onValueChange={(value) => handleChange('frequency', value)}
            >
              <SelectTrigger id="frequency" className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.filter(option => option.value !== 'none').map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="preferredDay" className="text-sm font-medium">Preferred Day</Label>
            <Select
              value={recurrenceData.preferredDay}
              onValueChange={(value) => handleChange('preferredDay', value)}
            >
              <SelectTrigger id="preferredDay" className="w-full">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={recurrenceData.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={recurrenceData.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
