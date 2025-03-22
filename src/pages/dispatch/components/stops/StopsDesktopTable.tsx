
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Copy } from "lucide-react";
import { formatPrice } from "./utils";
import { DeliveryStop, Customer, Driver } from "./types";

interface StopsDesktopTableProps {
  stops: DeliveryStop[];
  onStopsChange: (stops: DeliveryStop[]) => void;
  useMobileLayout: boolean;
  readOnly?: boolean;
  masterScheduleId?: string;
  customers?: Customer[];
  drivers?: Driver[];
  editingIndex: number;
  editForm: any;
  onEditFormChange: (form: any) => void;
  onEditStart: (index: number) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onRemoveStop: (index: number) => void;
  selectedStops?: string[];
  onSelectStop?: (stopId: string, index: number, event?: React.MouseEvent) => void;
  onDuplicateStop?: (index: number) => void;
  draggable?: boolean;
  onOpenCustomerDialog: () => void;
  onOpenItemsDialog: () => void;
}

const StopsDesktopTable: React.FC<StopsDesktopTableProps> = ({ 
  stops, 
  onStopsChange, 
  useMobileLayout, 
  readOnly,
  onRemoveStop,
  onEditStart,
  onDuplicateStop,
  customers,
  drivers
}) => {
  console.log("StopsDesktopTable rendering with stops:", 
    stops.map(stop => ({
      id: stop.id,
      stop_number: stop.stop_number,
      customer: stop.customer_name,
      driver: stop.driver_name,
      items: stop.items,
      price: stop.price,
      itemsData: stop.itemsData
    }))
  );
  
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStops = React.useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return stops.filter((stop) => {
      const customerName = stop.customer_name?.toLowerCase() || "";
      const items = stop.items?.toLowerCase() || "";
      return customerName.includes(lowerSearchTerm) || items.includes(lowerSearchTerm);
    });
  }, [stops, searchTerm]);

  const getDriverName = (driverId: string | null | undefined) => {
    if (!driverId) return "Unassigned";
    const driver = drivers?.find(d => d.id === driverId);
    return driver ? driver.name : "Unknown";
  };

  // Format item list for display
  const formatItemsList = (stop: DeliveryStop) => {
    // If we have itemsData array with content, use it
    if (Array.isArray(stop.itemsData) && stop.itemsData.length > 0) {
      return (
        <div>
          {stop.itemsData.map((item, idx) => (
            <div key={idx} className="text-sm mb-1">
              {item.quantity}x {item.name} 
              {item.price ? ` @$${item.price}` : ''}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback to items string
    if (stop.items) {
      return stop.items;
    }
    
    // If nothing else, show "No items"
    return 'No items';
  };

  if (useMobileLayout) {
    return (
      <div className="text-center p-4">
        <Badge variant="outline">
          Please use a larger screen to view the desktop table.
        </Badge>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-2">Stop #</TableHead>
            <TableHead className="px-4 py-2">Customer</TableHead>
            <TableHead className="px-4 py-2">Address</TableHead>
            <TableHead className="px-4 py-2">Phone</TableHead>
            <TableHead className="px-4 py-2">Driver</TableHead>
            <TableHead className="px-4 py-2">Items</TableHead>
            <TableHead className="px-4 py-2 text-center">Price</TableHead>
            <TableHead className="px-4 py-2 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stops.length === 0 && !searchTerm ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                {stops.length === 0 ? "No stops added yet." : "No stops found."}
              </TableCell>
            </TableRow>
          ) : null}
          
          {filteredStops.map((stop, index) => {
            const customer = customers?.find(c => c.id === stop.customer_id);
            const address = stop.customer_address || customer?.address || 'N/A';
            const phone = stop.customer_phone || customer?.phone || 'N/A';
            const stopNumber = stop.stop_number || index + 1;
            const driverName = stop.driver_name || getDriverName(stop.driver_id);
            
            // Construct full address if components are available
            let fullAddress = address;
            if (customer) {
              const addressParts = [
                customer.street_address,
                customer.city,
                customer.state,
                customer.zip_code
              ].filter(Boolean);
              
              if (addressParts.length > 0) {
                fullAddress = addressParts.join(', ');
              }
            }
            
            // Log the price calculation for debugging
            console.log(`Stop #${stopNumber} price calculation:`, {
              price: stop.price,
              items: stop.items,
              itemsData: stop.itemsData
            });
            
            return (
              <TableRow key={stop.id || index}>
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">
                  {stopNumber}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  {stop.customer_name || customer?.name || 'N/A'}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {fullAddress}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {phone}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {driverName}
                </TableCell>
                
                <TableCell className="px-4 py-2 text-sm">
                  {formatItemsList(stop)}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">
                  {stop.price !== undefined && stop.price !== null 
                    ? formatPrice(typeof stop.price === 'string' ? Number(stop.price) : stop.price) 
                    : '$0.00'}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-2">
                    {!readOnly && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEditStart(index)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {onDuplicateStop && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => onDuplicateStop(index)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => onRemoveStop(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {stops.length === 0 && searchTerm ? (
        <div className="text-center p-4">
          <Badge variant="outline">No stops found.</Badge>
        </div>
      ) : null}
    </div>
  );
};

export default StopsDesktopTable;
