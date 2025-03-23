
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, RefreshCw, Edit, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { updateRecurringSchedule } from '../utils/recurringOrderUtils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface RecurringOrderDetailsProps {
  schedule: {
    id: string;
    schedule_date: string;
    schedule_number: string;
  };
  recurringInfo: {
    recurring_order_id: string;
    modified_from_template: boolean;
    recurring_orders: {
      id: string;
      frequency: string;
      preferred_day: string;
      preferred_time?: string;
      customers: {
        id: string;
        name: string;
      };
    };
  };
  onRefreshData: () => void;
}

export function RecurringOrderDetails({ 
  schedule, 
  recurringInfo, 
  onRefreshData 
}: RecurringOrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updateType, setUpdateType] = useState<'single' | 'future' | 'all'>('single');
  const [updateNotes, setUpdateNotes] = useState('');
  const { toast } = useToast();
  
  const handleOpenEditDialog = () => {
    setUpdateType('single');
    setUpdateNotes('');
    setEditDialogOpen(true);
  };
  
  const handleUpdateRecurringSchedule = async () => {
    setIsUpdating(true);
    
    try {
      if (!updateNotes.trim()) {
        toast({
          title: "Required field",
          description: "Please add notes for this update",
          variant: "destructive"
        });
        return;
      }
      
      // Create the update object with the changes
      const updates = {
        notes: updateNotes
      };
      
      const success = await updateRecurringSchedule(
        schedule.id,
        updates,
        updateType,
        toast
      );
      
      if (success) {
        setEditDialogOpen(false);
        onRefreshData();
        
        toast({
          title: "Success",
          description: `Schedule ${updateType === 'single' ? 'occurrence' : 
            updateType === 'future' ? 'and future occurrences' : 'and all occurrences'} updated successfully`
        });
      }
    } catch (error) {
      console.error("Error updating recurring schedule:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
    }
  };
  
  const formatTime = (time?: string) => {
    if (!time) return "Any Time";
    
    if (time === "morning") return "Morning (8AM-12PM)";
    if (time === "afternoon") return "Afternoon (12PM-4PM)";
    if (time === "evening") return "Evening (4PM-8PM)";
    
    return time;
  };
  
  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2 text-blue-700">
          <RefreshCw className="h-4 w-4" />
          Recurring Order Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {formatFrequency(recurringInfo.recurring_orders.frequency)}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDay(recurringInfo.recurring_orders.preferred_day)}
            </Badge>
            
            {recurringInfo.recurring_orders.preferred_time && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(recurringInfo.recurring_orders.preferred_time)}
              </Badge>
            )}
            
            {recurringInfo.modified_from_template && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Modified from template
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This schedule is part of a recurring series for {recurringInfo.recurring_orders.customers.name}</p>
            <p className="mt-1">Customer ID: {recurringInfo.recurring_orders.customers.id}</p>
            <p>Recurring Order ID: {recurringInfo.recurring_order_id}</p>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-blue-700"
              onClick={handleOpenEditDialog}
              disabled={isUpdating}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isUpdating ? "Updating..." : "Manage Recurring Schedule"}
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Recurring Schedule</DialogTitle>
            <DialogDescription>
              Choose how you want to apply changes to this recurring schedule series.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <RadioGroup value={updateType} onValueChange={(value) => setUpdateType(value as 'single' | 'future' | 'all')}>
              <div className="flex items-start space-x-2 mb-3">
                <RadioGroupItem value="single" id="single" />
                <div className="grid gap-1.5">
                  <Label htmlFor="single" className="font-medium">
                    This occurrence only
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    The changes will only apply to this specific date.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 mb-3">
                <RadioGroupItem value="future" id="future" />
                <div className="grid gap-1.5">
                  <Label htmlFor="future" className="font-medium">
                    This and future occurrences
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    The changes will apply to this and all future occurrences in the series.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="all" id="all" />
                <div className="grid gap-1.5">
                  <Label htmlFor="all" className="font-medium">
                    All occurrences
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    The changes will apply to all occurrences in the recurring series, including past occurrences.
                  </p>
                </div>
              </div>
            </RadioGroup>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                placeholder="Enter notes for this update" 
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRecurringSchedule}
              disabled={isUpdating}
              className="bg-[#2A4131] hover:bg-[#2A4131]/90"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
