
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useDrivers } from '@/hooks/useDrivers';

const Drivers = () => {
  const { drivers, loading, addDriver } = useDrivers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    employment_type: 'CONTRACTOR',
    hourly_rate: 0,
    commission_rate: 15,
    is_active: true
  });

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.phone && driver.phone.includes(searchTerm))
  );

  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.employment_type) {
      return;
    }

    const result = await addDriver(newDriver);
    if (result.success) {
      setIsDialogOpen(false);
      setNewDriver({
        name: '',
        phone: '',
        employment_type: 'CONTRACTOR',
        hourly_rate: 0,
        commission_rate: 15,
        is_active: true
      });
    }
  };

  if (loading) {
    return (
      <div className="responsive-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  placeholder="Driver name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="employment_type">Employment Type *</Label>
                <Select 
                  value={newDriver.employment_type} 
                  onValueChange={(value) => setNewDriver({ ...newDriver, employment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    value={newDriver.hourly_rate}
                    onChange={(e) => setNewDriver({ ...newDriver, hourly_rate: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%)</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    value={newDriver.commission_rate}
                    onChange={(e) => setNewDriver({ ...newDriver, commission_rate: Number(e.target.value) })}
                    placeholder="15"
                  />
                </div>
              </div>
              <Button onClick={handleAddDriver} className="w-full">
                Add Driver
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Drivers</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDrivers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchTerm ? 'No drivers match your search.' : 'No drivers found.'}
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredDrivers.map((driver) => (
                  <Card key={driver.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{driver.name}</h3>
                        <p className="text-sm text-gray-600">{driver.employment_type}</p>
                        {driver.phone && (
                          <p className="text-sm text-gray-600">{driver.phone}</p>
                        )}
                        <div className="flex space-x-4 mt-2">
                          {driver.hourly_rate && driver.hourly_rate > 0 && (
                            <span className="text-sm text-gray-600">
                              Hourly: ${driver.hourly_rate}/hr
                            </span>
                          )}
                          {driver.commission_rate && driver.commission_rate > 0 && (
                            <span className="text-sm text-gray-600">
                              Commission: {driver.commission_rate}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          driver.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {driver.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Drivers;
