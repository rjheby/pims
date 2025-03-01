
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTemplates, OrderTemplate } from "./hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SearchIcon, Loader2, Pencil, Trash, ArrowLeft, Eye } from "lucide-react";
import { format } from "date-fns";
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
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function TemplateManagement() {
  const { templates, isLoading, error, fetchTemplates, deleteTemplate } = useTemplates();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateFromTemplate = async (template: OrderTemplate) => {
    try {
      const today = new Date().toISOString();
      
      // Generate order number (YYMM-XX format)
      const orderDate = new Date();
      const year = orderDate.getFullYear().toString().slice(-2);
      const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
      
      const yearMonth = `${year}${month}`;
      const { data: existingOrders } = await supabase
        .from('wholesale_orders')
        .select('order_number')
        .ilike('order_number', `${yearMonth}-%`)
        .order('order_number', { ascending: false });

      let sequence = 1;
      if (existingOrders && existingOrders.length > 0) {
        const latestOrder = existingOrders[0];
        const currentSequence = parseInt(latestOrder.order_number.split('-')[1]);
        sequence = currentSequence + 1;
      }

      const orderSequence = sequence.toString().padStart(2, '0');
      const orderNumber = `${yearMonth}-${orderSequence}`;

      // Create new order from template
      const { data: newOrder, error } = await supabase
        .from("wholesale_orders")
        .insert([{
          order_date: today,
          delivery_date: null,
          order_number: orderNumber,
          items: JSON.stringify(template.items),
          status: 'draft',
          template_id: template.id
        }])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!newOrder) throw new Error("Failed to create new order");

      toast({
        title: "Order created",
        description: `New order created from template "${template.name}"`
      });

      navigate(`/wholesale-orders/${newOrder.id}`, { replace: true });
    } catch (error: any) {
      console.error("Error creating order from template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create order from template",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      await fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleViewTemplateItems = (template: OrderTemplate) => {
    // Display items in a modal (for future implementation)
    toast({
      title: "Template Items",
      description: `"${template.name}" has ${template.items.length} items`,
    });
  };

  const handleEditTemplate = (template: OrderTemplate) => {
    navigate(`/wholesale-orders/templates/edit/${template.id}`);
  };

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Order Templates</CardTitle>
              <CardDescription>Manage your reusable order templates</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link to="/wholesale-orders">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Orders
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No templates match your search" : "No templates found. Create a new template from an order."}
            </div>
          ) : (
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
                          variant="default"
                          onClick={() => handleCreateFromTemplate(template)}
                          className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                        >
                          Use
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewTemplateItems(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash className="h-4 w-4" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
