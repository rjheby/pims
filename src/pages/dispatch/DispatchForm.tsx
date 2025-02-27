
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Archive, Save, CheckCircle } from "lucide-react";

export function DispatchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(id ? true : false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // State for form fields
  const [formData, setFormData] = useState({
    id: "",
    clientName: "",
    phoneNumber: "",
    stopNumber: "",
    driver: "",
    items: "",
    revenue: "",
    cogs: "",
    notes: "",
    address: "",
    status: "scheduled",
    scheduledDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (id) {
      // Simulate fetching data
      setTimeout(() => {
        // Mock data for initial testing
        if (id === "1") {
          setFormData({
            id: "1",
            clientName: "Johnson Residence",
            phoneNumber: "555-123-4567",
            stopNumber: "1",
            driver: "Michael Smith",
            items: "2 Cords Mixed Hardwood",
            revenue: "520",
            cogs: "320", 
            address: "123 Oak St, Springfield, IL",
            notes: "Deliver to backyard",
            status: "scheduled",
            scheduledDate: "2025-03-05"
          });
        }
        setLoading(false);
      }, 500);
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Validate form
    if (!formData.clientName || !formData.scheduledDate) {
      toast({
        title: "Validation Error",
        description: "Client name and scheduled date are required",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }

    // Simulate saving
    setTimeout(() => {
      toast({
        title: "Success",
        description: id ? "Dispatch updated successfully" : "New dispatch created successfully"
      });
      setIsSaving(false);
      navigate("/dispatch/schedule");
    }, 800);
  };

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    
    // Simulate marking as complete
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Dispatch marked as completed"
      });
      setIsCompleting(false);
      navigate("/dispatch/archive");
    }, 800);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A4131]"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{id ? "Edit Dispatch" : "New Dispatch"}</CardTitle>
            {formData.status === "completed" && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Completed
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stopNumber">Stop #</Label>
                <Input
                  id="stopNumber"
                  name="stopNumber"
                  type="number"
                  value={formData.stopNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="driver">Driver</Label>
                <Select value={formData.driver} onValueChange={(value) => handleSelectChange("driver", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Michael Smith">Michael Smith</SelectItem>
                    <SelectItem value="Sarah Jones">Sarah Jones</SelectItem>
                    <SelectItem value="Robert Johnson">Robert Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="items">Items</Label>
                <Input
                  id="items"
                  name="items"
                  value={formData.items}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="revenue">Revenue ($)</Label>
                <Input
                  id="revenue"
                  name="revenue"
                  type="number"
                  value={formData.revenue}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cogs">COGS ($)</Label>
                <Input
                  id="cogs"
                  name="cogs"
                  type="number"
                  value={formData.cogs}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                asChild
              >
                <Link to="/dispatch/schedule" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  <span>Back to Schedule</span>
                </Link>
              </Button>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave} 
                  className="bg-gray-600 hover:bg-gray-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
                
                {formData.status !== "completed" && (
                  <Button 
                    onClick={handleMarkComplete} 
                    className="bg-[#2A4131] hover:bg-[#2A4131]/90"
                    disabled={isCompleting}
                  >
                    {isCompleting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
