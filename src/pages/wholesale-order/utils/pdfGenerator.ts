
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { OrderItem, safeNumber } from "../types";

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
  const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Create white background for the header for better logo visibility
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo with improved positioning
  const logoUrl = '/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png';
  try {
    doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 35, 8, 70, 18, undefined, 'FAST');
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    // Fallback if image loading fails
    doc.setTextColor(42, 65, 49); // Woodbourne Green text instead
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("Order Summary", pageWidth / 2, 25, { align: "center" });
  }
  
  // Add a separator line under the header
  doc.setDrawColor(42, 65, 49); // Woodbourne Green
  doc.setLineWidth(0.5);
  doc.line(15, 40, pageWidth - 15, 40);
  
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
  let yPos = 70;
  
  // Order date
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 15, yPos);
  yPos += 10;
  
  // Delivery date
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
    orderData.items.reduce((sum, item) => sum + safeNumber(item.pallets), 0);
  
  const totalValue = orderData.totalValue || 
    orderData.items.reduce((sum, item) => sum + (safeNumber(item.pallets) * safeNumber(item.unitCost)), 0);
  
  yPos += 5;
  
  // Format items data for table with packaging type information
  const tableData = orderData.items.map(item => {
    // Create concatenated name field with packaging type included
    const name = [
      item.species, 
      item.length, 
      item.bundleType, 
      item.thickness,
      item.packaging // Added packaging to the description
    ].filter(Boolean).join(' - ');
    
    const itemUnitCost = safeNumber(item.unitCost);
    const itemPallets = safeNumber(item.pallets);
    const itemTotal = itemPallets * itemUnitCost;
    
    return [
      itemPallets.toString(),                         // Qty
      name,                                           // Name
      itemUnitCost ? `$${itemUnitCost.toFixed(2)}` : '$0.00',  // Unit Cost
      itemTotal ? `$${itemTotal.toFixed(2)}` : '$0.00'  // Total Cost
    ];
  });
  
  // Add items table with improved formatting
  autoTable(doc, {
    head: [['Qty', 'Product Description', 'Unit Price', 'Total']],
    body: tableData,
    startY: yPos,
    styles: { 
      fontSize: 10,
      cellPadding: 6,
      font: 'helvetica',
      overflow: 'linebreak',
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [42, 65, 49],  // Woodbourne Green 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'center',
      cellPadding: 5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },                // Qty - centered, narrow column
      1: { halign: 'left', cellWidth: 'auto' },              // Product Description - left-aligned, flexible width
      2: { halign: 'right', cellWidth: 35 },                 // Unit Price - right-aligned
      3: { halign: 'right', cellWidth: 35 }                  // Total - right-aligned
    },
    alternateRowStyles: { 
      fillColor: [245, 247, 245] // Very light green tint for alternate rows
    },
    margin: { top: 60, right: 15, bottom: 15, left: 15 },
    tableLineColor: [220, 220, 220],
    tableLineWidth: 0.2,
    showHead: 'firstPage',
    didDrawPage: function(data) {
      // Add page number on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" });
      }
    }
  });
  
  // Get final Y position
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  // Add summary box with border
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 250, 250);
  const summaryBoxHeight = 50;
  doc.roundedRect(pageWidth - 120, finalY - 10, 105, summaryBoxHeight, 3, 3, 'FD');
  
  // Add summary text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Quantity: ${totalPallets} items`, pageWidth - 110, finalY + 5);
  doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 110, finalY + 25);
  
  // Add notes if available
  if (orderData.notes) {
    const notesY = finalY + 60;
    doc.setFillColor(245, 247, 245);
    doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 65, 49);
    doc.text("Notes:", 25, notesY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    // Split long notes into multiple lines with word wrap
    const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
    doc.text(splitNotes, 25, notesY + 20);
  }
  
  // Add footer with generation timestamp
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: "center" });
  
  return doc;
};

// Helper function to generate a shareable URL for the order
export const getOrderPdfUrl = async (orderData: OrderData): Promise<string> => {
  try {
    // First create a blob URL from the PDF
    const pdfDoc = generateOrderPDF(orderData);
    const pdfBlob = pdfDoc.output('blob');
    
    // For browser sharing, create a download URL
    // In a real production app, you'd upload this to storage and return a persistent URL
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Error creating shareable PDF:", error);
    // If PDF generation fails, fall back to a view URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/wholesale-orders/${orderData.order_number}/view`;
  }
};
