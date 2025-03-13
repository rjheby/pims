
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { OrderItem, safeNumber } from "../types";

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: typeof autoTable;
}

// Add type for horizontal alignment from jspdf-autotable
type HAlignType = 'left' | 'center' | 'right' | undefined;

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
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Create white background for the header
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo with improved positioning
  try {
    const logoUrl = '/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png';
    doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 35, 8, 70, 18, undefined, 'FAST');
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    // Fallback if image loading fails
    doc.setTextColor(42, 65, 49); // Woodbourne Green text instead
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("Order Summary", pageWidth / 2, 20, { align: "center" });
  }
  
  // Add a separator line under the header
  doc.setDrawColor(42, 65, 49); // Woodbourne Green
  doc.setLineWidth(0.5);
  doc.line(15, 32, pageWidth - 15, 32);
  
  // Reset text color for the rest of the document
  doc.setTextColor(0, 0, 0);
  
  // Add title with status
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order #${orderData.order_number}`, 15, 45);
  
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
    doc.roundedRect(statusX - 5, 38, 50, 14, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(orderData.status.toUpperCase(), statusX + 20, 46, { align: "center" });
    doc.setTextColor(0, 0, 0);
  }
  
  // Add order details
  doc.setFontSize(12);
  let yPos = 60;
  
  // Order date
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 15, yPos);
  yPos += 8;
  
  // Delivery date
  if (orderData.delivery_date) {
    doc.text(`Delivery Date: ${new Date(orderData.delivery_date).toLocaleDateString()}`, 15, yPos);
    yPos += 8;
  }
  
  if (orderData.customer) {
    doc.text(`Customer: ${orderData.customer}`, 15, yPos);
    yPos += 8;
  }

  // Calculate totals if not provided
  const totalPallets = orderData.totalPallets || 
    orderData.items.reduce((sum, item) => sum + safeNumber(item.pallets), 0);
  
  const totalValue = orderData.totalValue || 
    orderData.items.reduce((sum, item) => sum + (safeNumber(item.pallets) * safeNumber(item.unitCost)), 0);
  
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
      `$${itemUnitCost.toFixed(2)}`,                  // Unit Cost
      `$${itemTotal.toFixed(2)}`                      // Total Cost
    ];
  });
  
  // Define consistent column alignment with correct HAlignType values
  const colAlignments: HAlignType[] = ['center', 'left', 'center', 'center'];
  
  // Add items table with improved formatting and wider quantity column
  autoTable(doc, {
    head: [['Qty', 'Product Description', 'Unit Price', 'Total']],
    body: tableData,
    startY: yPos + 2,
    styles: { 
      fontSize: 10,
      cellPadding: 6,
      halign: 'center', // Default alignment for all cells
      valign: 'middle'
    },
    headStyles: { 
      fillColor: [42, 65, 49],  // Woodbourne Green 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: colAlignments[0], cellWidth: 35 }, // Increased width for quantity field
      1: { halign: colAlignments[1], cellWidth: 'auto' },
      2: { halign: colAlignments[2], cellWidth: 30 },
      3: { halign: colAlignments[3], cellWidth: 30 }
    },
    alternateRowStyles: { 
      fillColor: [245, 247, 245] // Very light green tint for alternate rows
    },
    margin: { top: 10, right: 15, bottom: 20, left: 15 },
    showHead: 'everyPage',
    didDrawPage: function(data) {
      // Add page number on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }
      
      // Add header to every page after the first
      if (data.pageNumber > 1) {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(42, 65, 49);
        doc.text(`Order #${orderData.order_number} - Continued`, pageWidth / 2, 15, { align: "center" });
      }
    }
  });
  
  // Get final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Add summary box with ADA compliant colors
  const summaryBoxHeight = 40;
  const summaryBoxY = finalY;
  
  // Check if there's enough space for the summary box
  const isEnoughSpace = summaryBoxY + summaryBoxHeight + 20 < pageHeight;
  
  if (!isEnoughSpace) {
    // Add a new page if there's not enough space
    doc.addPage();
    
    // Reset the summary box position for the new page
    const summaryBoxY = 30;
    
    // Add a small header on the new page
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 65, 49);
    doc.text(`Order #${orderData.order_number} - Summary`, pageWidth / 2, 15, { align: "center" });
    
    // Draw the summary box with ADA compliant colors - light gray background (245, 245, 245) with black text
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(pageWidth - 120, summaryBoxY, 105, summaryBoxHeight, 3, 3, 'FD');
    
    // Add summary text - black text on light background (ADA compliant)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text for maximum contrast
    doc.text(`Total Quantity: ${totalPallets} items`, pageWidth - 110, summaryBoxY + 15);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 110, summaryBoxY + 30);
    
    // Add notes if available
    if (orderData.notes) {
      const notesY = summaryBoxY + 60;
      doc.setFillColor(245, 247, 245);
      doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0); // Black for maximum contrast
      doc.text("Notes:", 25, notesY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Split long notes into multiple lines with word wrap
      const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
      doc.text(splitNotes, 25, notesY + 15);
    }
  } else {
    // Draw the summary box on the same page with ADA compliant colors
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.setDrawColor(200, 200, 200); // Darker border
    doc.roundedRect(pageWidth - 120, summaryBoxY, 105, summaryBoxHeight, 3, 3, 'FD');
    
    // Add summary text - black text on light gray background (ADA compliant)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text for maximum contrast
    doc.text(`Total Quantity: ${totalPallets} items`, pageWidth - 110, summaryBoxY + 15);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 110, summaryBoxY + 30);
    
    // Add notes if available
    if (orderData.notes) {
      const notesY = summaryBoxY + 50;
      
      // Check if there's room for notes
      if (notesY + 50 > pageHeight) {
        // Add a new page for notes
        doc.addPage();
        
        const newPageNotesY = 40;
        doc.setFillColor(245, 247, 245);
        doc.roundedRect(15, newPageNotesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0); // Black for maximum contrast
        doc.text("Notes:", 25, newPageNotesY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
        doc.text(splitNotes, 25, newPageNotesY + 15);
      } else {
        // Add notes on the same page
        doc.setFillColor(245, 247, 245);
        doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0); // Black for maximum contrast
        doc.text("Notes:", 25, notesY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        
        const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
        doc.text(splitNotes, 25, notesY + 15);
      }
    }
  }
  
  // Add footer with generation timestamp
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const footerY = pageHeight - 5;
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, footerY, { align: "center" });
  }
  
  return doc;
};

// Helper function to generate a shareable URL for the order
export const getOrderPdfUrl = async (orderData: OrderData): Promise<string> => {
  try {
    const pdfDoc = generateOrderPDF(orderData);
    const pdfBlob = pdfDoc.output('blob');
    
    // Create a downloadable URL for the PDF
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // In a real production environment, you'd upload this to cloud storage
    // For now, we'll use a client-side blob URL
    return pdfUrl;
  } catch (error) {
    console.error("Error creating shareable PDF:", error);
    throw new Error("Failed to generate shareable PDF");
  }
};

// Helper function to render PDF directly in browser for linked view
export const renderOrderPDFInIframe = (orderData: OrderData, iframeElement: HTMLIFrameElement) => {
  try {
    // Generate the PDF document
    const pdfDoc = generateOrderPDF(orderData);
    
    // Convert to binary data URL
    const pdfDataUri = pdfDoc.output('datauristring');
    
    // Set the iframe source to the data URL
    if (iframeElement) {
      iframeElement.src = pdfDataUri;
    }
    
    return true;
  } catch (error) {
    console.error("Error rendering PDF in iframe:", error);
    return false;
  }
};
