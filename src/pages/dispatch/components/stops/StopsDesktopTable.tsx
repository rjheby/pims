
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
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
  customers
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredStops = React.useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return stops.filter((stop) => {
      const customerName = stop.customer_name?.toLowerCase() || "";
      const items = stop.items?.toLowerCase() || "";
      return customerName.includes(lowerSearchTerm) || items.includes(lowerSearchTerm);
    });
  }, [stops, searchTerm]);

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
            <TableHead className="px-4 py-2">Customer</TableHead>
            <TableHead className="px-4 py-2">Address</TableHead>
            <TableHead className="px-4 py-2">Items</TableHead>
            <TableHead className="px-4 py-2 text-center">Price</TableHead>
            <TableHead className="px-4 py-2 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stops.length === 0 && !searchTerm ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                {stops.length === 0 ? "No stops added yet." : "No stops found."}
              </TableCell>
            </TableRow>
          ) : null}
          
          {filteredStops.map((stop, index) => {
            const customer = customers?.find(c => c.id === stop.customer_id);
            const address = customer?.address || 'N/A';
            // Using optional chaining to safely access potentially missing properties
            const city = customer?.city || 'N/A';
            const state = customer?.state || 'N/A';
            const zipCode = customer?.zip_code || 'N/A';
            const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
            
            return (
              <TableRow key={stop.id || index}>
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  {stop.customer_name || customer?.name || 'N/A'}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {fullAddress}
                </TableCell>
                
                <TableCell className="px-4 py-2 text-sm">
                  {stop.items || 'N/A'}
                </TableCell>
                
                <TableCell className="px-4 py-2 whitespace-nowrap text-sm font-medium text-center">
                  {stop.price !== undefined && stop.price !== null ? formatPrice(stop.price) : 'N/A'}
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
