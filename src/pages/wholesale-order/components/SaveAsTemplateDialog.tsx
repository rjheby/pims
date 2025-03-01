
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { OrderItem } from "../types";
import { useTemplates } from "../hooks/useTemplates";

interface SaveAsTemplateDialogProps {
  items: OrderItem[];
  trigger?: React.ReactNode;
  onTemplateSaved?: () => void;
}

export function SaveAsTemplateDialog({ 
  items, 
  trigger, 
  onTemplateSaved 
}: SaveAsTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { saveTemplate } = useTemplates();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveTemplate(name, description || null, items);
      setOpen(false);
      setName("");
      setDescription("");
      
      if (onTemplateSaved) {
        onTemplateSaved();
      }
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Save as Template</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Create a reusable template from the current order items. This template can be used to quickly create new orders in the future.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Template name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Optional description"
            />
          </div>
          <div className="col-span-4">
            <div className="text-sm text-muted-foreground mt-2">
              This template will include {items.length} item{items.length !== 1 ? 's' : ''}.
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
