
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';

const Customers = () => {
  const { customers, loading, addCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    street_address: '',
    city: 'Brooklyn',
    state: 'NY',
    zip_code: '',
    customer_type: 'RESIDENTIAL'
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchTerm))
  );

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.street_address) {
      return;
    }

    const result = await addCustomer(newCustomer);
    if (result.success) {
      setIsDialogOpen(false);
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        street_address: '',
        city: 'Brooklyn',
        state: 'NY',
        zip_code: '',
        customer_type: 'RESIDENTIAL'
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
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="street_address">Street Address *</Label>
                <Input
                  id="street_address"
                  value={newCustomer.street_address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, street_address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">Zip Code</Label>
                  <Input
                    id="zip_code"
                    value={newCustomer.zip_code}
                    onChange={(e) => setNewCustomer({ ...newCustomer, zip_code: e.target.value })}
                    placeholder="Zip code"
                  />
                </div>
              </div>
              <Button onClick={handleAddCustomer} className="w-full">
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCustomers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {searchTerm ? 'No customers match your search.' : 'No customers found.'}
              </p>
            ) : (
              <div className="grid gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{customer.name}</h3>
                        <p className="text-sm text-gray-600">
                          {customer.street_address}
                          {customer.city && `, ${customer.city}`}
                          {customer.state && `, ${customer.state}`}
                          {customer.zip_code && ` ${customer.zip_code}`}
                        </p>
                        {customer.email && (
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        )}
                        {customer.phone && (
                          <p className="text-sm text-gray-600">{customer.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          customer.customer_type === 'COMMERCIAL' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {customer.customer_type || 'RESIDENTIAL'}
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

export default Customers;
