import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { OrderItem, safeNumber } from "./types";

interface WholesaleOrderSheetProps {
  open: boolean;
  onClose: () => void;
  orderData: {
    orderNumber: string;
    orderDate: string;
    deliveryDate?: string;
    items: OrderItem[];
  };
}

export function WholesaleOrderSheet({ open, onClose, orderData }: WholesaleOrderSheetProps) {
  const { orderNumber, orderDate, deliveryDate, items } = orderData;
  
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (safeNumber(item.pallets) * safeNumber(item.unitCost));
    }, 0);
  };
  
  // Use safeNumber to check numeric values
  const hasValidItems = items.some(item => safeNumber(item.pallets) > 0);
  
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Order #{orderNumber}</SheetTitle>
          <SheetDescription>
            {orderDate} {deliveryDate ? `• Delivery: ${deliveryDate}` : ''}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Order Details</h3>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {item.species} - {item.length} - {item.bundleType}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.thickness}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Quantity:</span>
                    <span>{item.pallets} pallets</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Unit Cost:</span>
                    <span>${safeNumber(item.unitCost).toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${(safeNumber(item.pallets) * safeNumber(item.unitCost)).toFixed(2)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex justify-between font-medium text-lg">
              <span>Order Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              variant="outline" 
              className="w-full justify-center" 
              onClick={onClose}
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
