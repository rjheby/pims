
import React from "react";
import { 
  FileText, 
  Pencil, 
  Copy, 
  Link2, 
  Send, 
  MapPin, 
  User, 
  Phone, 
  DollarSign,
  CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DispatchCardProps {
  dispatch: {
    id: string;
    clientName: string;
    phoneNumber: string;
    stopNumber: number;
    driver: string;
    items: string;
    revenue: number;
    cogs: number;
    address: string;
    notes?: string;
    status: string;
    scheduledDate: string;
  };
  onEdit: (dispatchId: string) => void;
  onDuplicate: (dispatch: any) => void;
  onShare: (dispatchId: string, method: 'email' | 'sms') => void;
  onMarkComplete?: (dispatchId: string) => void;
  archived?: boolean;
}

export function DispatchCard({ 
  dispatch, 
  onEdit, 
  onDuplicate, 
  onShare, 
  onMarkComplete,
  archived = false 
}: DispatchCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isCompleted = dispatch.status === 'completed';
  
  // Format the date for display
  const formattedDate = new Date(dispatch.scheduledDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const handleCopyLink = (dispatchId: string) => {
    const url = `${window.location.origin}/dispatch/view/${dispatchId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Success",
      description: "Link copied to clipboard",
    });
  };

  const profit = dispatch.revenue - dispatch.cogs;
  const profitMargin = dispatch.revenue > 0 ? (profit / dispatch.revenue) * 100 : 0;
  
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-lg">{dispatch.clientName}</span>
            {isCompleted && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                Completed
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {formattedDate} - Stop #{dispatch.stopNumber}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1e8c7]">
          <span className="text-[#2A4131] font-bold">{dispatch.stopNumber}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-3 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <User className="h-3.5 w-3.5" />
          <span>Driver:</span>
        </div>
        <div className="truncate">{dispatch.driver}</div>
        
        <div className="flex items-center gap-1 text-gray-600">
          <Phone className="h-3.5 w-3.5" />
          <span>Phone:</span>
        </div>
        <div className="truncate">{dispatch.phoneNumber}</div>
        
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span>Address:</span>
        </div>
        <div className="truncate">{dispatch.address}</div>
        
        <div className="flex items-center gap-1 text-gray-600">
          <DollarSign className="h-3.5 w-3.5" />
          <span>Revenue:</span>
        </div>
        <div>${dispatch.revenue.toLocaleString()}</div>
        
        <div className="col-span-2 mt-2">
          <div className="font-medium">Items:</div>
          <div className="text-sm">{dispatch.items}</div>
        </div>
        
        {dispatch.notes && (
          <div className="col-span-2 mt-1">
            <div className="font-medium">Notes:</div>
            <div className="text-sm text-gray-600">{dispatch.notes}</div>
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <div className="flex justify-between text-sm mb-2">
          <span>Profit:</span>
          <span className={`font-medium ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${profit.toLocaleString()} ({profitMargin.toFixed(1)}%)
          </span>
        </div>
        
        <div className="flex gap-2 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => onEdit(dispatch.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {archived ? 'View details' : 'Edit dispatch'}
              </TooltipContent>
            </Tooltip>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {archived ? 'Recreate dispatch' : 'Duplicate dispatch'}
                  </TooltipContent>
                </Tooltip>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {archived ? 'Recreate Dispatch' : 'Duplicate Dispatch'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will create a new dispatch with the same details.
                    {archived ? ' The status will be set to scheduled.' : ''}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDuplicate(dispatch)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => handleCopyLink(dispatch.id)}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy link</TooltipContent>
            </Tooltip>

            <Popover>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Send className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent className="w-40 p-2">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => onShare(dispatch.id, 'email')}
                  >
                    Share via Email
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => onShare(dispatch.id, 'sms')}
                  >
                    Share via SMS
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {!archived && !isCompleted && onMarkComplete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-green-50 border-green-200 hover:bg-green-100" 
                    onClick={() => onMarkComplete(dispatch.id)}
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark as complete</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
