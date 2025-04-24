import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RecurrenceData } from '@/types';

export interface RecurrenceSettingsFormProps {
  data: RecurrenceData;
  onChange: (recurrenceData: RecurrenceData) => void;
  onCancel: () => void;
}

// Enhanced recurrence options with descriptions
export const recurrenceOptions = [
  { value: 'none', label: 'None' },
  { value: 'weekly', label: 'Weekly', description: 'Deliver once every week' },
  { value: 'biweekly', label: 'Bi-Weekly', description: 'Deliver once every two weeks' },
  { value: 'monthly', label: 'Monthly', description: 'Deliver once per month' },
  { value: 'custom', label: 'Custom', description: 'Define a custom schedule' }
];

export const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export const RecurrenceSettingsForm = ({ 
  data, 
  onChange,
  onCancel 
}: RecurrenceSettingsFormProps) => {
  // Use a summary state to display a human-readable description
  const [summary, setSummary] = useState<string>('');
  
  // Update summary whenever recurrence data changes
  useEffect(() => {
    if (!data.isRecurring) {
      setSummary('');
      return;
    }
    
    let summaryText = '';
    const frequency = recurrenceOptions.find(o => o.value === data.frequency)?.label || '';
    const day = dayOptions.find(d => d.value === data.preferredDay)?.label || '';
    
    if (frequency && day) {
      summaryText = `Delivers ${frequency.toLowerCase()} on ${day}`;
      
      if (data.startDate) {
        try {
          const formattedDate = new Date(data.startDate).toLocaleDateString();
          summaryText += ` starting ${formattedDate}`;
        } catch (e) {
          // Invalid date, skip
        }
      }
      
      if (data.endDate) {
        try {
          const formattedDate = new Date(data.endDate).toLocaleDateString();
          summaryText += ` until ${formattedDate}`;
        } catch (e) {
          // Invalid date, skip
        }
      }
    }
    
    setSummary(summaryText);
  }, [data]);

  const handleChange = (field: keyof RecurrenceData, value: any) => {
    const updatedData = { ...data, [field]: value };
    
    // If toggling recurrence off, reset other fields
    if (field === 'isRecurring' && value === false) {
      updatedData.frequency = 'none';
      updatedData.preferredDay = undefined;
    }
    
    // If toggling recurrence on, set default frequency
    if (field === 'isRecurring' && value === true && data.frequency === 'none') {
      updatedData.frequency = 'weekly';
    }
    
    onChange(updatedData);
  };

  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="isRecurring" className="font-medium">Recurring Delivery</Label>
        <Switch
          id="isRecurring"
          checked={data.isRecurring}
          onCheckedChange={(checked) => handleChange('isRecurring', checked)}
        />
      </div>
      
      {summary && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-medium">{summary}</span>
          </CardContent>
        </Card>
      )}
      
      {data.isRecurring && (
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="frequency" className="text-sm font-medium">Frequency</Label>
            <Select
              value={data.frequency}
              onValueChange={(value) => handleChange('frequency', value)}
            >
              <SelectTrigger id="frequency" className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.filter(option => option.value !== 'none').map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="preferredDay" className="text-sm font-medium">Preferred Day</Label>
            <Select
              value={data.preferredDay}
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
                value={data.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={data.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
