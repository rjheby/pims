import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, UserPlus, Hash, ExternalLink, Edit, Calendar } from "lucide-react";
import { Customer } from "@/pages/customers/types";
import { Driver } from "@/types/driver";
import { StopFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomerEditSheet } from "@/pages/customers/components/CustomerEditSheet";
import { Switch } from "@/components/ui/switch";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import RecurrenceForm from "./RecurrenceForm";
import { validateStopForm } from "./schemas";

interface AddStopFormProps {
  customers: Customer[];
  drivers: Driver[];
  onStopChange: (data: StopFormData) => void;
  readOnly?: boolean;
}

const AddStopForm: React.FC<AddStopFormProps> = ({ customers, drivers, onStopChange, readOnly = false }) => {
  const { toast } = useToast();
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showEditCustomerSheet, setShowEditCustomerSheet] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    type: 'commercial',
    address: '',
    phone: '',
    email: '',
  });

  const [currentStop, setCurrentStop] = useState<StopFormData>({
    customer: "",
    driver: "",
    notes: "",
    is_recurring: false,
    recurrence_frequency: "weekly",
    preferred_day: "monday",
    next_occurrence_date: null,
    recurrence_end_date: null,
    stop_number: 1
  });

  const selectedCustomer = customers.find(c => c.id === currentStop.customer);

  const handleCreateCustomer = useCallback(async () => {
    if (!newCustomer.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("customers")
        .insert(newCustomer)
        .select();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create customer: " + error.message,
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0) {
        toast({
          title: "Success", 
          description: "Customer created successfully"
        });
        
        onStopChange({ ...currentStop, customer: data[0].id });
        setShowNewCustomerForm(false);
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [newCustomer, currentStop, onStopChange, toast]);

  const handleUpdateCustomer = useCallback(async (customerData: Partial<Customer>) => {
    if (!selectedCustomer) return;
    
    try {
      const { error } = await supabase
        .from("customers")
        .update(customerData)
        .eq("id", selectedCustomer.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update customer: " + error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success", 
        description: "Customer updated successfully"
      });
      
      setShowEditCustomerSheet(false);
      
      // Refresh customer data
      // Note: In a real application, you might want to update the customer list
      // without a full page refresh, possibly by using a context or refetching data
    } catch (err) {
      console.error("Error updating customer:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  }, [selectedCustomer, toast]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    onStopChange({
      ...currentStop,
      customer: customer.id
    });
  }, [currentStop, onStopChange]);

  const handleDriverSelect = useCallback((driver: Driver) => {
    onStopChange({
      ...currentStop,
      driver: driver.id
    });
  }, [currentStop, onStopChange]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data using Zod schema
    const validationResult = validateStopForm(currentStop);
    
    if (!validationResult.success) {
      // Display validation errors
      const errors = validationResult.error.errors;
      toast({
        title: "Validation Error",
        description: errors.map(err => err.message).join(", "),
        variant: "destructive"
      });
      return;
    }
    
    onStopChange(currentStop);
  }, [currentStop, onStopChange, toast]);

  if (readOnly) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4 mb-6">
      <h3 className="text-lg font-medium">Add Delivery Stop</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer</Label>
          <div className="flex gap-2">
            <Select 
              value={currentStop.customer} 
              onValueChange={(value) => onStopChange({ ...currentStop, customer: value })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={showNewCustomerForm} onOpenChange={setShowNewCustomerForm}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Name *</Label>
                    <Input 
                      id="customerName" 
                      value={newCustomer.name} 
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerType">Type *</Label>
                    <Select 
                      value={newCustomer.type} 
                      onValueChange={(value) => setNewCustomer({...newCustomer, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerAddress">Address</Label>
                    <Input 
                      id="customerAddress" 
                      value={newCustomer.address || ''} 
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input 
                      id="customerPhone" 
                      value={newCustomer.phone || ''} 
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input 
                      id="customerEmail" 
                      value={newCustomer.email || ''} 
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewCustomerForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCustomer}>Create Customer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Driver</Label>
          <Select 
            value={currentStop.driver} 
            onValueChange={(value) => onStopChange({ ...currentStop, driver: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCustomer && (
          <div className="space-y-2 md:col-span-2 bg-gray-50 p-3 rounded-md border">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 font-medium">Customer Information</div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center p-0 h-auto"
                onClick={() => setShowEditCustomerSheet(true)}
              >
                <Edit className="mr-1 h-3 w-3" /> Edit Customer
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
              <div>
                <span className="text-xs text-gray-500">Address:</span>
                <div className="text-sm">{selectedCustomer.address || 'Not provided'}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Phone:</span>
                <div className="text-sm">{selectedCustomer.phone || 'Not provided'}</div>
              </div>
              {selectedCustomer.email && (
                <div className="md:col-span-2">
                  <span className="text-xs text-gray-500">Email:</span>
                  <div className="text-sm">{selectedCustomer.email}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Notes</Label>
          <textarea
            value={currentStop.notes}
            onChange={(e) => onStopChange({ ...currentStop, notes: e.target.value })}
            readOnly={readOnly}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>

        <div className="md:col-span-2">
          <RecurrenceForm 
            data={currentStop} 
            onChange={onStopChange} 
            readOnly={readOnly} 
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button 
          onClick={handleSubmit}
          className="bg-[#2A4131] hover:bg-[#2A4131]/90"
          disabled={!currentStop.customer}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Stop
        </Button>
      </div>

      {/* Customer Edit Sheet */}
      {selectedCustomer && (
        <CustomerEditSheet
          customer={selectedCustomer}
          isOpen={showEditCustomerSheet}
          onClose={() => setShowEditCustomerSheet(false)}
          onSave={handleUpdateCustomer}
        />
      )}
    </div>
  );
};

export default AddStopForm;
