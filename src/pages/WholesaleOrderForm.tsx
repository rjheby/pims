import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useTemplates } from "./wholesale-order/hooks/useTemplates";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Copy, Edit, Trash2, Plus, Save } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

const WholesaleOrderForm = () => {
  const [orderName, setOrderName] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [lastOrderNumber, setLastOrderNumber] = useState<string>("");
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSubmissionErrors, setOrderSubmissionErrors] = useState<string[]>(
    []
  );
  const [isTemplateSheetOpen, setIsTemplateSheetOpen] = useState<boolean>(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [templateName, setTemplateName] = useState<string>("");
  const [templateDescription, setTemplateDescription] = useState<string>("");
  const [isDeletingTemplate, setIsDeletingTemplate] = useState<boolean>(false);
  const { templates, loadTemplate, saveTemplate, deleteTemplate, refreshTemplates } = useTemplates();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  const { templateId: selectedTemplateId } = useParams();
  const orderNumberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshTemplates();
  }, [refreshTemplates]);

  useEffect(() => {
    if (selectedTemplateId) {
      loadSelectedTemplate(selectedTemplateId);
    }
  }, [selectedTemplateId, loadTemplate]);

  useEffect(() => {
    const fetchLastOrderNumber = async () => {
      try {
        const { data, error } = await supabase
          .from("wholesale_orders")
          .select("order_number")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching last order number:", error);
        } else if (data && data.length > 0) {
          setLastOrderNumber(data[0].order_number);
        }
      } catch (error) {
        console.error("Failed to fetch last order number:", error);
      }
    };

    fetchLastOrderNumber();
  }, []);

  const loadSelectedTemplate = async (templateId: string) => {
    const template = await loadTemplate(templateId);
    if (template) {
      setCurrentOrder(template.items as OrderItem[]);
      setTemplateName(template.name);
      setTemplateDescription(template.description);
    } else {
      toast({
        title: "Template Not Found",
        description: "The selected template could not be loaded.",
        variant: "destructive",
      });
    }
  };

  const generateOrderNumber = () => {
    const baseNumber = lastOrderNumber ? parseInt(lastOrderNumber.slice(3), 10) : 1000;
    const newOrderNumber = `WB-${baseNumber + 1}`;
    setOrderNumber(newOrderNumber);
    return newOrderNumber;
  };

  const handleAddItem = () => {
    if (!newItemName || !newItemDescription || !newItemQuantity || !newItemPrice) {
      toast({
        title: "Error",
        description: "Please fill in all item details.",
        variant: "destructive",
      });
      return;
    }

    const newItem: OrderItem = {
      id: uuidv4(),
      name: newItemName,
      description: newItemDescription,
      quantity: newItemQuantity,
      price: newItemPrice,
    };

    setCurrentOrder([...currentOrder, newItem]);
    setNewItemName("");
    setNewItemDescription("");
    setNewItemQuantity(1);
    setNewItemPrice(0);
  };

  const handleRemoveItem = (id: string) => {
    setCurrentOrder(currentOrder.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setCurrentOrder(
      currentOrder.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveOrder = async () => {
    try {
      const validationErrors = validateOrder(currentOrder);
      if (validationErrors.length > 0) {
        setOrderSubmissionErrors(validationErrors);
        return;
      }

      setOrderSubmissionErrors([]);
      setIsSubmitting(true);

      const orderData = {
        order_name: orderName,
        order_number: orderNumber || generateOrderNumber(),
        order_date: new Date().toISOString(),
        items: JSON.stringify(currentOrder),
        status: "pending",
        admin_editable: true,
        ...(selectedTemplateId ? { template_id: selectedTemplateId } : {})
      };

      const { data, error } = await supabase
        .from("wholesale_orders")
        .insert(orderData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setLastOrderNumber(orderData.order_number);

      toast({
        title: "Order Created",
        description: `Order ${orderData.order_number} has been created successfully.`,
      });

      navigate(`/wholesale-order/${data.id}`);
    } catch (error) {
      console.error("Failed to save order:", error);
      toast({
        title: "Error",
        description: "Failed to save order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateOrder = (order: OrderItem[]) => {
    const errors: string[] = [];
    if (!orderName) {
      errors.push("Order name is required.");
    }
    if (order.length === 0) {
      errors.push("Order must contain at least one item.");
    }
    return errors;
  };

  const calculateTotal = () => {
    return currentOrder.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
  };

  const handleOpenTemplateSheet = () => {
    setIsTemplateSheetOpen(true);
  };

  const handleCloseTemplateSheet = () => {
    setIsTemplateSheetOpen(false);
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName) {
      toast({
        title: "Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      await saveTemplate(templateName, templateDescription, currentOrder);
      toast({
        title: "Template Saved",
        description: "Template saved successfully.",
      });
      handleCloseTemplateSheet();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setIsDeletingTemplate(true);
    try {
      await deleteTemplate(templateId);
      toast({
        title: "Template Deleted",
        description: "Template deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  const handleLoadTemplate = async (templateId: string) => {
    const template = await loadTemplate(templateId);
    if (template) {
      setCurrentOrder(template.items as OrderItem[]);
      toast({
        title: "Template Loaded",
        description: `Template "${template.name}" loaded successfully.`,
      });
      handleCloseTemplateSheet();
    } else {
      toast({
        title: "Error",
        description: "Failed to load template. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateItem = (item: OrderItem) => {
    const newItem: OrderItem = {
      ...item,
      id: uuidv4(),
    };
    setCurrentOrder([...currentOrder, newItem]);
  };

  const memoizedTotal = useMemo(() => calculateTotal(), [currentOrder]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Wholesale Order Form</h1>

      {orderSubmissionErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          <h2 className="font-semibold">Please correct the following errors:</h2>
          <ul className="list-disc pl-5">
            {orderSubmissionErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="orderName">Order Name</Label>
          <Input
            type="text"
            id="orderName"
            placeholder="Enter order name"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <div className="relative">
            <Input
              type="text"
              id="orderNumber"
              placeholder="Auto-generated"
              value={orderNumber}
              ref={orderNumberInputRef}
              readOnly
            />
            <Button
              type="button"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
              onClick={generateOrderNumber}
            >
              Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="newItemName">Item Name</Label>
          <Input
            type="text"
            id="newItemName"
            placeholder="Item name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="newItemDescription">Description</Label>
          <Input
            type="text"
            id="newItemDescription"
            placeholder="Description"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="newItemQuantity">Quantity</Label>
          <Input
            type="number"
            id="newItemQuantity"
            placeholder="1"
            value={newItemQuantity}
            onChange={(e) => setNewItemQuantity(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="newItemPrice">Price</Label>
          <Input
            type="number"
            id="newItemPrice"
            placeholder="0.00"
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(Number(e.target.value))}
          />
        </div>
      </div>
      <Button
        type="button"
        className="mb-4 bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
        onClick={handleAddItem}
      >
        Add Item
      </Button>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrder.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Input
                    type="text"
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "name", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "description", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "quantity", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleUpdateItem(item.id, "price", Number(e.target.value))
                    }
                  />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleDuplicateItem(item)}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete
                              the item from the order.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell>
                {memoizedTotal.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      <div className="mt-4 flex gap-4">
        <Button
          className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
          onClick={handleSaveOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Save Order"}
        </Button>

        <Sheet open={isTemplateSheetOpen} onOpenChange={setIsTemplateSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">Template Actions</Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Template Actions</SheetTitle>
              <SheetDescription>
                Manage your order templates here. You can save the current order
                as a template or load an existing template.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="templateName" className="text-right">
                  Name
                </Label>
                <Input
                  type="text"
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="templateDescription" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <SheetFooter>
              <Button
                type="button"
                className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white"
                onClick={handleSaveAsTemplate}
                disabled={isSavingTemplate}
              >
                {isSavingTemplate ? "Saving..." : "Save as Template"}
              </Button>
            </SheetFooter>
            <Separator className="my-4" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Load Template</h3>
              {templates && templates.length > 0 ? (
                <ul className="space-y-2">
                  {templates.map((template) => (
                    <li
                      key={template.id}
                      className="flex items-center justify-between"
                    >
                      <span>{template.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadTemplate(template.id)}
                        >
                          Load
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently
                                delete the template from your templates.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteTemplate(template.id)}
                                disabled={isDeletingTemplate}
                              >
                                {isDeletingTemplate ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No templates saved yet.</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default WholesaleOrderForm;
