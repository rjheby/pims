
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { OrderItem } from "../types";

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

interface OrderData {
  order_number: string;
  order_date: string;
  delivery_date?: string | null;
  items: OrderItem[];
  totalPallets?: number;
  totalValue?: number;
}

export const generateOrderPDF = (orderData: OrderData) => {
  // Create PDF document with autotable plugin
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add title
  doc.setFontSize(18);
  doc.text(`Order #${orderData.order_number}`, pageWidth / 2, 20, { align: "center" });
  
  // Add order details
  doc.setFontSize(12);
  doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 15, 40);
  
  if (orderData.delivery_date) {
    doc.text(`Delivery Date: ${new Date(orderData.delivery_date).toLocaleDateString()}`, 15, 50);
  }
  
  // Calculate totals if not provided
  const totalPallets = orderData.totalPallets || 
    orderData.items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
  
  const totalValue = orderData.totalValue || 
    orderData.items.reduce((sum, item) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0);
  
  // Add items table
  const headers = ["Species", "Length", "Bundle Type", "Thickness", "Packaging", "Pallets", "Unit Cost", "Total"];
  const data = orderData.items.map(item => [
    item.species || '',
    item.length || '',
    item.bundleType || '',
    item.thickness || '',
    item.packaging || '',
    (item.pallets || 0).toString(),
    item.unitCost ? `$${item.unitCost.toFixed(2)}` : '$0.00',
    item.unitCost ? `$${((item.pallets || 0) * (item.unitCost || 0)).toFixed(2)}` : '$0.00'
  ]);
  
  // Create table using autoTable
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 60,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [42, 65, 49] },
    margin: { top: 60 }
  });
  
  // Get final Y position - autoTable directly modifies the document
  // and returns the final Y position
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text(`Total Pallets: ${totalPallets}`, 15, finalY);
  doc.text(`Total Value: $${totalValue.toFixed(2)}`, 15, finalY + 10);
  
  return doc;
};
