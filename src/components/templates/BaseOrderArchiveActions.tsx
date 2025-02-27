
import { Button } from "@/components/ui/button";
import { Copy, Download, Link as LinkIcon, Share, Edit } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface BaseOrderArchiveActionsProps {
  orderId: string;
  onEdit?: (orderId: string) => void;
  onDuplicate?: (order: any) => void;
  onDownload?: (order: any) => void;
  onShare?: (orderId: string, method: 'email' | 'sms') => void;
  order: any;
  disableShare?: boolean;
}

export function BaseOrderArchiveActions({
  orderId,
  onEdit,
  onDuplicate,
  onDownload,
  onShare,
  order,
  disableShare = false
}: BaseOrderArchiveActionsProps) {
  const handleCopyLink = () => {
    const link = `${window.location.origin}/wholesale-orders/${orderId}/view`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "The order view link has been copied to your clipboard."
    });
  };

  return (
    <div className="flex gap-2 justify-end">
      {onEdit && (
        <Button
          onClick={() => onEdit(orderId)}
          variant="outline"
          size="sm"
          className="bg-gray-100 hover:bg-gray-200"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}

      {onDuplicate && (
        <Button
          onClick={() => onDuplicate(order)}
          variant="outline"
          size="sm"
          className="bg-gray-100 hover:bg-gray-200"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}

      {onDownload && (
        <Button
          onClick={() => onDownload(order)}
          variant="outline"
          size="sm"
          className="bg-gray-100 hover:bg-gray-200"
        >
          <Download className="h-4 w-4" />
        </Button>
      )}

      <Button
        onClick={handleCopyLink}
        variant="outline"
        size="sm"
        className="bg-gray-100 hover:bg-gray-200"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      {!disableShare && onShare && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-100 hover:bg-gray-200"
            >
              <Share className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onShare(orderId, 'email')}>
              Share via Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(orderId, 'sms')}>
              Share via SMS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
