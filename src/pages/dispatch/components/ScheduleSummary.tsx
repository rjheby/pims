
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Truck, Package, Clock, DollarSign } from "lucide-react";
import { formatPrice } from "../utils/inventoryUtils";
import { ScheduleSummaryData } from "../utils/inventoryUtils";

interface ScheduleSummaryProps {
  data: ScheduleSummaryData;
  scheduleNumber: string;
  scheduleDate: string;
}

const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({ 
  data, 
  scheduleNumber,
  scheduleDate 
}) => {
  const { 
    totalStops, 
    stopsByDriver, 
    totalPrice, 
    laborCost, 
    itemizedInventory, 
    capacityUtilization 
  } = data;

  // Get top categories with most items
  const topCategories = Object.entries(data.inventoryByCategory)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center justify-between">
            <span>Schedule #{scheduleNumber} Summary</span>
            <span className="text-sm font-normal text-muted-foreground">{scheduleDate}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Stops</p>
                <p className="text-2xl font-bold">{totalStops}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{itemizedInventory.reduce((sum, item) => sum + item.quantity, 0)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(totalPrice)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 text-primary rounded-full">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Labor Cost</p>
                <p className="text-2xl font-bold">{formatPrice(laborCost)}</p>
              </div>
            </div>
          </div>
          
          {/* Capacity utilization */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Truck Capacity Utilization</h4>
              <span className="text-sm font-medium">{capacityUtilization}%</span>
            </div>
            <Progress value={capacityUtilization} className="h-2" />
          </div>
          
          {/* Inventory Breakdown */}
          <div>
            <h4 className="text-sm font-medium mb-3">Inventory Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Drivers section */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground">Stops by Driver</h5>
                {Object.entries(stopsByDriver).map(([driver, count]) => (
                  <div key={driver} className="flex justify-between items-center">
                    <span className="text-sm">{driver}</span>
                    <span className="text-sm font-medium">{count} stops</span>
                  </div>
                ))}
              </div>
              
              {/* Categories section */}
              <div className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground">Top Product Categories</h5>
                {topCategories.map(([category, items]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm">{category}</span>
                    <span className="text-sm font-medium">{items.length} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleSummary;
