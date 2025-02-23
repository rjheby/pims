
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useWholesaleOrder } from "../context/WholesaleOrderContext";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export function OrderActions() {
  const { items, setItems, orderNumber } = useWholesaleOrder();
  const { toast } = useToast();
  
  const totalPallets = items.reduce((sum, item) => sum + (item.pallets || 0), 0);

  const addRow = () => {
    if (totalPallets + 0 > 24) {
      toast({
        title: "Warning",
        description: "Adding more pallets would exceed the 24-pallet limit for a tractor trailer.",
        variant: "destructive",
      });
      return;
    }

    setItems([
      ...items,
      {
        id: items.length + 1,
        species: "",
        length: "",
        bundleType: "",
        thickness: "",
        packaging: "Pallets",
        pallets: 0,
      },
    ]);
  };

  const handleSubmit = async () => {
    const orderElement = document.getElementById('order-content');
    if (!orderElement) return;

    try {
      const canvas = await html2canvas(orderElement);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`WholesaleOrder-${orderNumber}.pdf`);

      toast({
        title: "Success",
        description: "Order has been processed and PDF has been downloaded.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
      <Button 
        onClick={addRow} 
        className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300 w-full sm:w-auto"
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Row
      </Button>
      <Button 
        onClick={handleSubmit}
        className="bg-[#2A4131] hover:bg-[#2A4131]/90 text-white transition-all duration-300 w-full sm:w-auto"
        disabled={totalPallets === 0}
      >
        Submit Order
      </Button>
    </div>
  );
}
