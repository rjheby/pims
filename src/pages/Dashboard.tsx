
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Truck, Package, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: 0,
    drivers: 0,
    orders: 0,
    schedules: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [customersResult, driversResult, ordersResult, schedulesResult] = await Promise.all([
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('drivers').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('dispatch_schedules').select('id', { count: 'exact', head: true })
        ]);

        setStats({
          customers: customersResult.count || 0,
          drivers: driversResult.count || 0,
          orders: ordersResult.count || 0,
          schedules: schedulesResult.count || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="responsive-container space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="responsive-grid">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.customers}</div>
            <p className="text-xs text-muted-foreground">
              Active customer accounts
            </p>
            <Link to="/customers">
              <Button variant="outline" size="sm" className="mt-3">
                Manage Customers
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.drivers}</div>
            <p className="text-xs text-muted-foreground">
              Available delivery drivers
            </p>
            <Link to="/drivers">
              <Button variant="outline" size="sm" className="mt-3">
                Manage Drivers
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.orders}</div>
            <p className="text-xs text-muted-foreground">
              All-time order count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispatch Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.schedules}</div>
            <p className="text-xs text-muted-foreground">
              Total schedules created
            </p>
            <Link to="/dispatch-schedule">
              <Button variant="outline" size="sm" className="mt-3">
                View Schedules
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Dispatch Management System</CardTitle>
          <CardDescription>
            Your application is connected to Supabase with a comprehensive dispatch management schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This system is designed to manage deliveries with support for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Customer management (residential and commercial)</li>
              <li>Driver management with commission tracking</li>
              <li>Order processing and inventory management</li>
              <li>Route planning and dispatch scheduling</li>
              <li>Financial tracking and reporting</li>
            </ul>
            <div className="flex gap-4 mt-6">
              <Link to="/customers">
                <Button>Get Started with Customers</Button>
              </Link>
              <Link to="/drivers">
                <Button variant="outline">Add Drivers</Button>
              </Link>
              <Link to="/dispatch-schedule">
                <Button variant="outline">View Schedules</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
