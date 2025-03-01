
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrderItem } from "../types";
import { useTemplates, OrderTemplate } from "../hooks/useTemplates";
import { format } from "date-fns";
import { SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LoadTemplateDialogProps {
  onTemplateSelected: (items: OrderItem[]) => void;
  trigger?: React.ReactNode;
}

export function LoadTemplateDialog({ onTemplateSelected, trigger }: LoadTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { templates, isLoading, error } = useTemplates();

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleTemplateSelect = (template: OrderTemplate) => {
    onTemplateSelected(template.items);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Load Template</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Load Template</DialogTitle>
          <DialogDescription>
            Select a template to load its items into your current order.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? "No templates match your search" : "No templates found"}
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description || "-"}</TableCell>
                    <TableCell>{template.items.length}</TableCell>
                    <TableCell>
                      {format(new Date(template.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        onClick={() => handleTemplateSelect(template)}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
