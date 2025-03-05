
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, Download, Copy, Share, MoreHorizontal, Phone, Mail, Link, Trash2, Calendar, Truck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface DispatchSchedule {
  id: string;
  schedule_number: string;
  schedule_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DispatchCardProps {
  schedule: DispatchSchedule;
  onEdit: (scheduleId: string) => void;
  onDuplicate: (schedule: DispatchSchedule) => void;
  onDownload: (schedule: DispatchSchedule) => void;
  onCopyLink: (scheduleId: string) => void;
  onShare: (scheduleId: string, method: 'email' | 'sms') => void;
  onDelete: (scheduleId: string) => void;
  searchTerm?: string;
}

function highlightText(text: string, searchTerm: string) {
  if (!searchTerm || !text) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
  );
}

export function DispatchCard({ 
  schedule, 
  onEdit, 
  onDuplicate, 
  onDownload, 
  onCopyLink, 
  onShare, 
  onDelete,
  searchTerm = "" 
}: DispatchCardProps) {
  const { toast } = useToast();

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">
              {searchTerm ? 
                highlightText(`Schedule #${schedule.schedule_number}`, searchTerm) :
                `Schedule #${schedule.schedule_number}`
              }
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              {searchTerm ? 
                highlightText(format(new Date(schedule.created_at), "MMM d, yyyy"), searchTerm) :
                format(new Date(schedule.created_at), "MMM d, yyyy")
              }
            </CardDescription>
          </div>
          {schedule.status && (
            <Badge variant={getStatusBadgeVariant(schedule.status)}>
              {searchTerm ? 
                highlightText(schedule.status, searchTerm) :
                schedule.status
              }
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground mr-2">Type:</span>
            <span>Dispatch</span>
          </div>
          
          {schedule.schedule_date && (
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground mr-2">Scheduled:</span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {searchTerm ? 
                  highlightText(format(new Date(schedule.schedule_date), "MMM d, yyyy"), searchTerm) :
                  format(new Date(schedule.schedule_date), "MMM d, yyyy")
                }
              </span>
            </div>
          )}
          
          {schedule.notes && (
            <div className="mt-4 text-sm">
              <span className="text-muted-foreground block mb-1">Notes:</span>
              <div className="bg-muted p-2 rounded text-xs">
                {searchTerm ? 
                  highlightText(schedule.notes, searchTerm) :
                  schedule.notes
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onEdit(schedule.id)}
        >
          <Edit className="mr-1 h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Edit</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onDownload(schedule)}
        >
          <Download className="mr-1 h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Download</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onCopyLink(schedule.id)}
        >
          <Link className="mr-1 h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Link</span>
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete dispatch schedule #{schedule.schedule_number}?
                This action cannot be undone. All schedule data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(schedule.id)}
              >
                Yes, Delete Schedule
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex-grow-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onDuplicate(schedule)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(schedule.id, 'email')}>
              <Mail className="mr-2 h-4 w-4" />
              Share via Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(schedule.id, 'sms')}>
              <Phone className="mr-2 h-4 w-4" />
              Share via SMS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
