
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function DriversView() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [currentDriver, setCurrentDriver] = useState<Partial<Driver> | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("name");
        
      if (error) throw error;
      
      setDrivers(data || []);
    } catch (error: any) {
      console.error("Error fetching drivers:", error);
      toast({
        title: "Error",
        description: "Failed to load drivers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = () => {
    setCurrentDriver({ name: "", email: "", phone: "", status: "active" });
    setDriverDialogOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setCurrentDriver({ ...driver });
    setDriverDialogOpen(true);
  };

  const handleSaveDriver = async () => {
    if (!currentDriver || !currentDriver.name) {
      toast({
        title: "Error",
        description: "Driver name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (currentDriver.id) {
        // Update existing driver
        const { error } = await supabase
          .from("drivers")
          .update({
            name: currentDriver.name,
            email: currentDriver.email,
            phone: currentDriver.phone,
            status: currentDriver.status || "active",
            updated_at: new Date().toISOString()
          })
          .eq("id", currentDriver.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Driver updated successfully"
        });
      } else {
        // Insert new driver
        const { error } = await supabase
          .from("drivers")
          .insert({
            name: currentDriver.name,
            email: currentDriver.email,
            phone: currentDriver.phone,
            status: currentDriver.status || "active"
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Driver added successfully"
        });
      }
      
      setDriverDialogOpen(false);
      fetchDrivers();
    } catch (error: any) {
      console.error("Error saving driver:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save driver",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver?")) return;
    
    try {
      const { error } = await supabase
        .from("drivers")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Driver deleted successfully"
      });
      
      fetchDrivers();
    } catch (error: any) {
      console.error("Error deleting driver:", error);
      toast({
        title: "Error",
        description: "Failed to delete driver. They may have associated schedules.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (driver: Driver) => {
    const newStatus = driver.status === "active" ? "inactive" : "active";
    
    try {
      const { error } = await supabase
        .from("drivers")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", driver.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Driver ${newStatus === "active" ? "activated" : "deactivated"} successfully`
      });
      
      fetchDrivers();
    } catch (error: any) {
      console.error("Error updating driver status:", error);
      toast({
        title: "Error",
        description: "Failed to update driver status",
        variant: "destructive"
      });
    }
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(search.toLowerCase()) ||
    (driver.email && driver.email.toLowerCase().includes(search.toLowerCase())) ||
    (driver.phone && driver.phone.includes(search))
  );

  return (
    <div className="container max-w-7xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Drivers</h1>
        <Button onClick={handleAddDriver}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Drivers</CardTitle>
            <div className="w-64">
              <Input
                placeholder="Search drivers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        {search ? "No drivers match your search criteria" : "No drivers found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.email || "-"}</TableCell>
                        <TableCell>{driver.phone || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            driver.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {driver.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>{format(new Date(driver.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleStatus(driver)}
                          >
                            {driver.status === "active" ? "Deactivate" : "Activate"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditDriver(driver)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteDriver(driver.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={driverDialogOpen} onOpenChange={setDriverDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentDriver?.id ? "Edit Driver" : "Add New Driver"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={currentDriver?.name || ""}
                onChange={(e) => setCurrentDriver(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Driver name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentDriver?.email || ""}
                onChange={(e) => setCurrentDriver(prev => prev ? { ...prev, email: e.target.value } : null)}
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={currentDriver?.phone || ""}
                onChange={(e) => setCurrentDriver(prev => prev ? { ...prev, phone: e.target.value } : null)}
                placeholder="Phone number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriverDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDriver}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
