
import { jsPDF } from "jspdf";
import { OrderItem } from "../types";

interface OrderData {
  order_number: string;
  order_date: string;
  delivery_date: string;
  items: OrderItem[];
  totalPallets: number;
  totalValue: number;
}

export const generateOrderPDF = (orderData: OrderData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add logo
  doc.addImage("/lovable-uploads/708f416f-5b66-4f87-865c-029557d1af58.png", "PNG", 15, 15, 60, 20);
  
  // Add order details
  doc.setFontSize(18);
  doc.text(`Order #${orderData.order_number}`, pageWidth / 2, 50, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 15, 70);
  doc.text(`Delivery Date: ${new Date(orderData.delivery_date).toLocaleDateString()}`, 15, 80);
  
  // Add items table
  const headers = ["Species", "Length", "Bundle Type", "Thickness", "Packaging", "Pallets", "Unit Cost", "Total"];
  const data = orderData.items.map(item => [
    item.species,
    item.length,
    item.bundleType,
    item.thickness,
    item.packaging,
    item.pallets.toString(),
    `$${item.unitCost.toFixed(2)}`,
    `$${(item.pallets * item.unitCost).toFixed(2)}`
  ]);
  
  // Create table
  doc.autoTable({
    head: [headers],
    body: data,
    startY: 100,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [42, 65, 49] },
  });
  
  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text(`Total Pallets: ${orderData.totalPallets}`, 15, finalY);
  doc.text(`Total Value: $${orderData.totalValue.toFixed(2)}`, 15, finalY + 10);
  
  return doc;
};
