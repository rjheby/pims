
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTemplates, OrderTemplate } from "../hooks/useTemplates";
import { format } from "date-fns";
import { SearchIcon, Loader2, Pencil, Trash, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

interface TemplateManagementDialogProps {
  trigger?: React.ReactNode;
}

export function TemplateManagementDialog({ trigger }: TemplateManagementDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { templates, isLoading, error, updateTemplate, deleteTemplate } = useTemplates();
  
  const [editMode, setEditMode] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OrderTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEditClick = (template: OrderTemplate) => {
    setEditingTemplate(template);
    setEditName(template.name);
    setEditDescription(template.description || "");
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingTemplate(null);
    setEditName("");
    setEditDescription("");
  };

  const handleSaveEdit = async () => {
    if (!editingTemplate) return;
    
    if (!editName.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      await updateTemplate(editingTemplate.id, {
        name: editName,
        description: editDescription || null
      });
      
      setEditMode(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error("Error updating template:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Manage Templates</Button>}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px]">
        {!editMode ? (
          <>
            <DialogHeader>
              <DialogTitle>Manage Templates</DialogTitle>
              <DialogDescription>
                View, edit, and delete your saved order templates.
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
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.description || "-"}</TableCell>
                        <TableCell>{template.items.length}</TableCell>
                        <TableCell>
                          {format(new Date(template.updated_at || template.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditClick(template)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the template "{template.name}"? 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update the template details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              
              {editingTemplate && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground">
                    Items
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{editingTemplate.items.length} item{editingTemplate.items.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
