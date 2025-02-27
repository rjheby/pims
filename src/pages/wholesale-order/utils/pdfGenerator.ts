
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
  customer?: string;
  notes?: string;
  status?: string;
}

export const generateOrderPDF = (orderData: OrderData) => {
  // Create PDF document with autotable plugin
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add Company Logo/header
  doc.setFillColor(42, 65, 49); // Woodbourne Green
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("Woodbourne Timber", pageWidth / 2, 20, { align: "center" });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text("Order Summary", pageWidth / 2, 30, { align: "center" });
  
  // Reset text color for the rest of the document
  doc.setTextColor(0, 0, 0);
  
  // Add title with status
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order #${orderData.order_number}`, 15, 55);
  
  if (orderData.status) {
    // Add status indicator
    const statusX = pageWidth - 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    let statusColor;
    switch (orderData.status.toLowerCase()) {
      case 'draft':
        statusColor = [120, 120, 120]; // Gray
        break;
      case 'submitted':
        statusColor = [38, 114, 236]; // Blue
        break;
      case 'processing':
        statusColor = [245, 158, 11]; // Amber
        break;
      case 'completed':
        statusColor = [16, 185, 129]; // Green
        break;
      case 'cancelled':
        statusColor = [239, 68, 68]; // Red
        break;
      default:
        statusColor = [120, 120, 120]; // Default gray
    }
    
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(statusX - 5, 50, 50, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(orderData.status.toUpperCase(), statusX + 20, 58, { align: "center" });
    doc.setTextColor(0, 0, 0);
  }
  
  // Add order details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  let yPos = 70;
  
  doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 15, yPos);
  yPos += 10;
  
  if (orderData.delivery_date) {
    doc.text(`Delivery Date: ${new Date(orderData.delivery_date).toLocaleDateString()}`, 15, yPos);
    yPos += 10;
  }
  
  if (orderData.customer) {
    doc.text(`Customer: ${orderData.customer}`, 15, yPos);
    yPos += 10;
  }

  // Calculate totals if not provided
  const totalPallets = orderData.totalPallets || 
    orderData.items.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0);
  
  const totalValue = orderData.totalValue || 
    orderData.items.reduce((sum, item) => sum + ((Number(item.pallets) || 0) * (Number(item.unitCost) || 0)), 0);
  
  yPos += 5;
  
  // Add items table
  const headers = [
    { header: "Species", dataKey: "species" },
    { header: "Length", dataKey: "length" },
    { header: "Bundle Type", dataKey: "bundleType" },
    { header: "Thickness", dataKey: "thickness" },
    { header: "Packaging", dataKey: "packaging" },
    { header: "Pallets", dataKey: "pallets" },
    { header: "Unit Cost", dataKey: "unitCost" },
    { header: "Total", dataKey: "total" }
  ];
  
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
    head: [headers.map(h => h.header)],
    body: data,
    startY: yPos,
    styles: { fontSize: 10 },
    headStyles: { 
      fillColor: [42, 65, 49],  // Woodbourne Green 
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    margin: { top: 60 }
  });
  
  // Get final Y position
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  // Add summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Pallets: ${totalPallets}`, 15, finalY);
  doc.text(`Total Value: $${totalValue.toFixed(2)}`, 15, finalY + 10);
  
  // Add notes if available
  if (orderData.notes) {
    const notesY = finalY + 30;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Notes:", 15, notesY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Split long notes into multiple lines with word wrap
    const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 30);
    doc.text(splitNotes, 15, notesY + 10);
  }
  
  // Add footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: "center" });
  
  return doc;
};

// Helper function to get a public URL for the PDF for sharing
export const getOrderPdfUrl = async (orderData: OrderData): Promise<string> => {
  // This is a placeholder for a real implementation that would upload the PDF to a server
  // and return a public URL, or generate a link to a route that serves the PDF
  
  // For now, we'll just return a frontend route that would handle displaying the order
  const baseUrl = window.location.origin;
  return `${baseUrl}/wholesale-orders/${orderData.order_number}/view`;
};
