import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StopFormData } from "./types";

interface RecurrenceFormProps {
  data: StopFormData;
  onChange: (data: StopFormData) => void;
  readOnly?: boolean;
}

/**
 * RecurrenceForm component for handling recurring delivery settings
 * Extracted from AddStopForm for reusability
 */
const RecurrenceForm: React.FC<RecurrenceFormProps> = ({ data, onChange, readOnly = false }) => {
  const handleRecurrenceToggle = useCallback((checked: boolean) => {
    onChange({
      ...data,
      is_recurring: checked
    });
  }, [data, onChange]);

  const handleFrequencyChange = useCallback((value: string) => {
    onChange({
      ...data,
      recurrence_frequency: value as "weekly" | "bi-weekly" | "monthly"
    });
  }, [data, onChange]);

  const handlePreferredDayChange = useCallback((value: string) => {
    onChange({
      ...data,
      preferred_day: value as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
    });
  }, [data, onChange]);

  const handleNextOccurrenceChange = useCallback((date: Date | undefined) => {
    onChange({
      ...data,
      next_occurrence_date: date || null
    });
  }, [data, onChange]);

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    onChange({
      ...data,
      recurrence_end_date: date || null
    });
  }, [data, onChange]);

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Recurring Delivery</Label>
        <Switch
          checked={data.is_recurring}
          onCheckedChange={handleRecurrenceToggle}
          disabled={readOnly}
        />
      </div>

      {data.is_recurring && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Recurrence Frequency</Label>
            <Select
              value={data.recurrence_frequency}
              onValueChange={handleFrequencyChange}
              disabled={readOnly}
            >
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
            <Select
              value={data.preferred_day}
              onValueChange={handlePreferredDayChange}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Next Occurrence</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.next_occurrence_date && "text-muted-foreground"
                  )}
                  disabled={readOnly}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {data.next_occurrence_date ? (
                    format(new Date(data.next_occurrence_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={data.next_occurrence_date ? new Date(data.next_occurrence_date) : undefined}
                  onSelect={handleNextOccurrenceChange}
                  initialFocus
                  disabled={readOnly}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.recurrence_end_date && "text-muted-foreground"
                  )}
                  disabled={readOnly}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {data.recurrence_end_date ? (
                    format(new Date(data.recurrence_end_date), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined}
                  onSelect={handleEndDateChange}
                  initialFocus
                  disabled={readOnly}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurrenceForm; 