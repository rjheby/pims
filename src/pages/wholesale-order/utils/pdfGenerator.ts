
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
  
  // Add Company Logo instead of text
  doc.setFillColor(42, 65, 49); // Woodbourne Green
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo
  const logoUrl = '/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png';
  try {
    doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 40, 10, 80, 20, undefined, 'FAST');
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    // Fallback if image loading fails
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("Order Summary", pageWidth / 2, 25, { align: "center" });
  }
  
  // Reset text color for the rest of the document
  doc.setTextColor(0, 0, 0);
  
  // Add title with status
  doc.setFontSize(20);
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
  let yPos = 70;
  
  // Order date
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 15, yPos);
  yPos += 10;
  
  // Delivery date - now bold
  if (orderData.delivery_date) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Delivery Date: ${new Date(orderData.delivery_date).toLocaleDateString()}`, 15, yPos);
    doc.setFont('helvetica', 'normal');
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
  
  // Format items data for table - concatenating name fields as requested
  const formattedItems = orderData.items.map(item => {
    // Create concatenated name field
    const name = [
      item.species, 
      item.length, 
      item.thickness, 
      item.bundleType
    ].filter(Boolean).join(' - ');
    
    return {
      quantity: item.pallets || 0,
      name: name,
      unitCost: item.unitCost || 0,
      totalCost: (item.pallets || 0) * (item.unitCost || 0)
    };
  });
  
  // Add items table with new structure and larger font
  autoTable(doc, {
    head: [['Quantity', 'Name', 'Unit Cost', 'Total Cost']],
    body: formattedItems.map(item => [
      item.quantity.toString(),
      item.name,
      `$${item.unitCost.toFixed(2)}`,
      `$${item.totalCost.toFixed(2)}`
    ]),
    startY: yPos,
    styles: { 
      fontSize: 12,  // Increased font size
      cellPadding: 6 // More padding for readability
    },
    headStyles: { 
      fillColor: [42, 65, 49],  // Woodbourne Green 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 13 // Slightly larger header text
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 }, // Quantity - centered, narrower
      1: { halign: 'left', cellWidth: 'auto' }, // Name - left-aligned, take available space
      2: { halign: 'right', cellWidth: 30 }, // Unit Cost - right-aligned
      3: { halign: 'right', cellWidth: 30 }  // Total Cost - right-aligned
    },
    alternateRowStyles: { 
      fillColor: [240, 245, 240] // Lighter alternate row color for better contrast
    },
    margin: { top: 60 }
  });
  
  // Get final Y position
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  // Add summary
  doc.setFontSize(14); // Slightly larger for summary
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Quantity: ${totalPallets}`, 15, finalY);
  doc.text(`Total Value: $${totalValue.toFixed(2)}`, 15, finalY + 10);
  
  // Add notes if available
  if (orderData.notes) {
    const notesY = finalY + 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Notes:", 15, notesY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
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
