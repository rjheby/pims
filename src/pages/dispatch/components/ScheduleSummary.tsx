
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScheduleSummaryData, formatPrice } from "../utils/inventoryUtils";
import { Progress } from "@/components/ui/progress";
import { Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const { toast } = useToast();
  const summaryRef = React.useRef<HTMLDivElement>(null);

  const printSummary = () => {
    const content = document.getElementById("scheduleSummaryPrint");
    if (!content) return;
    
    const originalDisplay = window.getComputedStyle(content).display;
    
    // Apply print-specific styles
    content.style.display = "block";
    
    window.print();
    
    // Restore original styles
    content.style.display = originalDisplay;
    
    toast({
      title: "Print started",
      description: "Your summary has been sent to the printer",
    });
  };

  const downloadAsPDF = async () => {
    if (!summaryRef.current) return;
    
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your PDF",
    });
    
    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297)); // 297 is A4 height
      
      pdf.save(`Schedule_Summary_${scheduleNumber.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your schedule summary has been saved as a PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Schedule Summary</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={printSummary}
              className="flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadAsPDF}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={summaryRef} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="font-semibold text-green-800 mb-1 text-sm">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-900">{formatPrice(data.totalPrice)}</p>
                <p className="text-sm text-green-700 mt-1">Labor Cost: {formatPrice(data.laborCost)}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-blue-800 mb-1 text-sm">Delivery Stops</h3>
                <p className="text-2xl font-bold text-blue-900">{data.totalStops} stops</p>
                <p className="text-sm text-blue-700 mt-1">
                  {Object.entries(data.stopsByDriver)
                    .map(([driver, count]) => `${driver}: ${count}`)
                    .join(', ')}
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-md">
                <h3 className="font-semibold text-amber-800 mb-1 text-sm">Capacity Utilization</h3>
                <p className="text-2xl font-bold text-amber-900">{data.capacityUtilization}%</p>
                <div className="mt-2">
                  <Progress value={data.capacityUtilization} className="h-2" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 text-slate-700">Inventory Requirements (Packing List)</h3>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Est. Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.itemizedInventory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.estimatedPrice)}</TableCell>
                      </TableRow>
                    ))}
                    {data.itemizedInventory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          No items added to this schedule yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hidden printable version with more details for warehouse staff */}
      <div id="scheduleSummaryPrint" className="hidden print:block">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Delivery Schedule Summary</h1>
            <p className="text-gray-600">Schedule #{scheduleNumber}</p>
            <p className="text-gray-600">Date: {scheduleDate}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Financial Summary</h3>
              <p>Total Revenue: {formatPrice(data.totalPrice)}</p>
              <p>Labor Cost (18%): {formatPrice(data.laborCost)}</p>
              <p>Net Revenue: {formatPrice(data.totalPrice - data.laborCost)}</p>
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <p>Total Stops: {data.totalStops}</p>
              {Object.entries(data.stopsByDriver).map(([driver, count], i) => (
                <p key={i}>{driver}: {count} stops</p>
              ))}
            </div>
            
            <div className="border p-4 rounded-md">
              <h3 className="font-semibold mb-2">Capacity</h3>
              <p>Utilization: {data.capacityUtilization}%</p>
              <p>Total Items: {data.itemizedInventory.reduce((sum, item) => sum + item.quantity, 0)}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3 border-b pb-2">WAREHOUSE PACKING LIST</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item Description</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.itemizedInventory.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="text-right p-2">{item.quantity}</td>
                    <td className="text-right p-2">{formatPrice(item.estimatedPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="p-2">TOTALS</td>
                  <td className="text-right p-2">
                    {data.itemizedInventory.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="text-right p-2">{formatPrice(data.totalPrice)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="mt-8 pt-8 border-t text-sm">
            <p className="mb-2">Notes for Warehouse Staff:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Please ensure all items are properly labeled and packaged</li>
              <li>Verify quantities before loading onto delivery vehicles</li>
              <li>Report any inventory discrepancies immediately</li>
              <li>Use proper handling equipment for large items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSummary;
