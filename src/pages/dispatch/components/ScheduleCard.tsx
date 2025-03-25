import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parse } from "date-fns";
import { 
  CalendarIcon, 
  ClipboardCheck, 
  Clock, 
  MoreVertical, 
  Pencil, 
  Copy, 
  Download, 
  Link, 
  Mail, 
  MessageSquare, 
  Trash2, 
  Calendar, 
  CalendarDays
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ScheduleCardProps {
  schedule: {
    id: string;
    schedule_number: string;
    schedule_date: string;
    notes?: string;
    status: string;
    stops?: number;
    isRecurring?: boolean;
  };
  onEdit: (scheduleId: string) => void;
  onDuplicate: (schedule: any) => void;
  onDownload: (schedule: any) => void;
  onCopyLink: (scheduleId: string) => void;
  onShare: (scheduleId: string, method: 'email' | 'sms') => void;
  onDelete: (scheduleId: string) => void;
  highlightTerm?: string;
}

export function ScheduleCard({
  schedule,
  onEdit,
  onDuplicate,
  onDownload,
  onCopyLink,
  onShare,
  onDelete,
  highlightTerm = ''
}: ScheduleCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCopyLink = () => {
    onCopyLink(schedule.id);
    toast({
      title: "Link copied",
      description: "Schedule link copied to clipboard",
    });
  };

  // Function to highlight search terms
  const highlightText = (text: string) => {
    if (!highlightTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlightTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === highlightTerm.toLowerCase() 
        ? <span key={i} className="bg-yellow-200 text-black px-0.5 rounded-sm">{part}</span> 
        : part
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date for display, ensuring we parse it correctly from the database format
  const formattedDate = (() => {
    try {
      // Make sure we're parsing the date correctly from the database's yyyy-MM-dd format
      const parsedDate = parse(schedule.schedule_date, 'yyyy-MM-dd', new Date());
      return format(parsedDate, "EEEE, MMMM d, yyyy");
    } catch (error) {
      console.error("Date parsing error:", error, schedule.schedule_date);
      // Fallback to displaying the raw date if parsing fails
      return schedule.schedule_date;
    }
  })();
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 bg-muted/40 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-lg">
                {highlightText(schedule.schedule_number)}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                {highlightText(formattedDate)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusColor(schedule.status)}>
                {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(schedule.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Schedule
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(schedule)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownload(schedule)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Link className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(schedule.id, 'email')}>
                    <Mail className="mr-2 h-4 w-4" />
                    Share via Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(schedule.id, 'sms')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Share via SMS
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2 text-sm">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <span>{schedule.stops || 0} Stops</span>
            </div>
            
            {schedule.isRecurring && (
              <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <CalendarDays className="h-3 w-3" />
                Recurring
              </Badge>
            )}
          </div>
          
          {schedule.notes && (
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="line-clamp-2">{highlightText(schedule.notes)}</p>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600"
              onClick={() => onEdit(schedule.id)}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              View Schedule
            </Button>
          </div>
        </div>
      </CardContent>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this dispatch schedule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(schedule.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
