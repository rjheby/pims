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

// Define ADA-compliant color constants for better consistency
const ADA_COLORS = {
  // Background colors
  woodbourneGreen: [42, 65, 49],    // Dark green - requires white text
  lightGray: [245, 245, 245],       // Light gray - requires dark text
  white: [255, 255, 255],           // White - requires dark text
  darkGreenTint: [42, 65, 49],      // Dark green (almost black) - requires white text

  // Text colors
  black: [0, 0, 0],                 // Black - high contrast on light backgrounds
  white: [255, 255, 255],           // White - high contrast on dark backgrounds
  darkGray: [60, 60, 60],           // Dark gray - good for secondary text on light backgrounds
  midGray: [100, 100, 100],         // Mid gray - only for non-essential text

  // Status colors - with ADA compliant alternatives
  draft: [100, 100, 100],           // Darker gray for better contrast
  submitted: [25, 80, 170],         // Darker blue for better contrast
  processing: [180, 95, 6],         // Darker amber for better contrast
  completed: [16, 124, 86],         // Darker green for better contrast
  cancelled: [180, 30, 30]          // Darker red for better contrast
};

export const generateOrderPDF = (orderData: OrderData) => {
  // Create PDF document with autotable plugin
  const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Create white background for the header
  doc.setFillColor(...ADA_COLORS.white);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo with improved positioning
  try {
    const logoUrl = '/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png';
    doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 35, 8, 70, 18, undefined, 'FAST');
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    // Fallback if image loading fails
    doc.setTextColor(...ADA_COLORS.woodbourneGreen); // Woodbourne Green text on white background
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("Order Summary", pageWidth / 2, 20, { align: "center" });
  }
  
  // Add a separator line under the header
  doc.setDrawColor(...ADA_COLORS.woodbourneGreen);
  doc.setLineWidth(0.5);
  doc.line(15, 32, pageWidth - 15, 32);
  
  // Reset text color for the rest of the document
  doc.setTextColor(...ADA_COLORS.black); // Black text for maximum contrast
  
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
        statusColor = ADA_COLORS.draft;
        break;
      case 'submitted':
        statusColor = ADA_COLORS.submitted;
        break;
      case 'processing':
        statusColor = ADA_COLORS.processing;
        break;
      case 'completed':
        statusColor = ADA_COLORS.completed;
        break;
      case 'cancelled':
        statusColor = ADA_COLORS.cancelled;
        break;
      default:
        statusColor = ADA_COLORS.draft;
    }
    
    doc.setFillColor(...statusColor);
    doc.roundedRect(statusX - 5, 38, 50, 14, 3, 3, 'F');
    doc.setTextColor(...ADA_COLORS.white); // Always use white text on color backgrounds for contrast
    doc.text(orderData.status.toUpperCase(), statusX + 20, 46, { align: "center" });
    doc.setTextColor(...ADA_COLORS.black); // Reset to black text
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
  // Use the formula: 60 boxes (12x10") = 1 pallet
  // First calculate boxes
  const calculatePalletsFromBoxes = (boxes: number) => Math.ceil(boxes / 60);
  
  const totalBoxes = orderData.items.reduce((sum, item) => sum + safeNumber(item.pallets), 0);
  // Convert boxes to pallets using the universal formula (60 boxes = 1 pallet)
  const totalPallets = orderData.totalPallets || calculatePalletsFromBoxes(totalBoxes);
  
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
    const itemBoxes = safeNumber(item.pallets); // This is actually boxes in the data
    // Calculate pallets for display (60 boxes = 1 pallet)
    const boxesPerPallet = 60;
    const itemPallets = Math.ceil(itemBoxes / boxesPerPallet);
    const itemTotal = itemBoxes * itemUnitCost;
    
    return [
      itemBoxes.toString(),                           // Qty (Boxes)
      name,                                           // Name
      `${itemUnitCost.toFixed(2)}`,                  // Unit Cost
      `${itemTotal.toFixed(2)}`                      // Total Cost
    ];
  });
  
  // Define consistent column alignment with correct HAlignType values
  const colAlignments: HAlignType[] = ['center', 'left', 'center', 'center'];
  
  // Add items table with improved ADA-compliant formatting
  autoTable(doc, {
    head: [['Boxes', 'Product Description', 'Unit Price', 'Total']],
    body: tableData,
    startY: yPos + 2,
    styles: { 
      fontSize: 11, // Increased font size for better readability
      cellPadding: 6,
      halign: 'center', // Default alignment for all cells
      valign: 'middle',
      textColor: [0, 0, 0] // Ensure black text in main table body
    },
    headStyles: { 
      fillColor: ADA_COLORS.woodbourneGreen,  // Woodbourne Green 
      textColor: ADA_COLORS.white, // White text on dark background
      fontStyle: 'bold',
      fontSize: 12, // Slightly increased for better readability
      halign: 'center'
    },
    columnStyles: {
      0: { halign: colAlignments[0], cellWidth: 35 }, // Increased width for quantity field
      1: { halign: colAlignments[1], cellWidth: 'auto' },
      2: { halign: colAlignments[2], cellWidth: 30 },
      3: { halign: colAlignments[3], cellWidth: 30 }
    },
    alternateRowStyles: { 
      fillColor: ADA_COLORS.darkGreenTint, // Dark green (almost black) for alternate rows
      textColor: ADA_COLORS.white // White text on dark backgrounds
    },
    margin: { top: 10, right: 15, bottom: 20, left: 15 },
    showHead: 'everyPage',
    didDrawPage: function(data) {
      // Add page number on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...ADA_COLORS.darkGray); // Darker gray for better contrast
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }
      
      // Add header to every page after the first
      if (data.pageNumber > 1) {
        doc.setFillColor(...ADA_COLORS.white);
        doc.rect(0, 0, pageWidth, 20, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ADA_COLORS.woodbourneGreen);
        doc.text(`Order #${orderData.order_number} - Continued`, pageWidth / 2, 15, { align: "center" });
      }
    }
  });
  
  // Get final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Add summary box with ADA compliant colors
      const summaryBoxHeight = 50;
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
    doc.setTextColor(...ADA_COLORS.woodbourneGreen);
    doc.text(`Order #${orderData.order_number} - Summary`, pageWidth / 2, 15, { align: "center" });
    
    // Add explanation for pallet calculation
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...ADA_COLORS.darkGray);
    doc.text("* Pallets calculated at 60 boxes per pallet", pageWidth / 2, 25, { align: "center" });
    
    // Draw the summary box with ADA compliant colors
    doc.setFillColor(...ADA_COLORS.lightGray);
    doc.setDrawColor(180, 180, 180); // Slightly darker border for definition
    doc.roundedRect(pageWidth - 120, summaryBoxY, 105, summaryBoxHeight, 3, 3, 'FD');
    
          // Add summary text - black text on light background (ADA compliant)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ADA_COLORS.black); // Black text for maximum contrast
    doc.text(`Total Boxes: ${totalBoxes}`, pageWidth - 110, summaryBoxY + 10);
    doc.text(`Total Pallets: ${totalPallets}*`, pageWidth - 110, summaryBoxY + 22);
    doc.text(`Total Value: ${totalValue.toFixed(2)}`, pageWidth - 110, summaryBoxY + 34);
    
    // Add notes if available
    if (orderData.notes) {
      const notesY = summaryBoxY + 60;
      doc.setFillColor(...ADA_COLORS.darkGreenTint);
      doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...ADA_COLORS.white); // White for maximum contrast on dark background
      doc.text("Notes:", 25, notesY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Split long notes into multiple lines with word wrap
      const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
      doc.text(splitNotes, 25, notesY + 15);
    }
  } else {
    // Draw the summary box on the same page with ADA compliant colors
    doc.setFillColor(...ADA_COLORS.lightGray);
    doc.setDrawColor(180, 180, 180); // Slightly darker border for definition
    doc.roundedRect(pageWidth - 120, summaryBoxY, 105, summaryBoxHeight, 3, 3, 'FD');
    
    // Add summary text - black text on light gray background (ADA compliant)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ADA_COLORS.black); // Black text for maximum contrast
    doc.text(`Total Boxes: ${totalBoxes}`, pageWidth - 110, summaryBoxY + 10);
    doc.text(`Total Pallets: ${totalPallets}*`, pageWidth - 110, summaryBoxY + 22);
    doc.text(`Total Value: ${totalValue.toFixed(2)}`, pageWidth - 110, summaryBoxY + 34);
    
    // Add footnote about pallet calculation
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("* 60 boxes = 1 pallet", pageWidth - 110, summaryBoxY + 44);
    
    // Add notes if available
    if (orderData.notes) {
      const notesY = summaryBoxY + 50;
      
      // Check if there's room for notes
      if (notesY + 50 > pageHeight) {
        // Add a new page for notes
        doc.addPage();
        
        const newPageNotesY = 40;
        doc.setFillColor(...ADA_COLORS.lightGreenTint);
        doc.roundedRect(15, newPageNotesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ADA_COLORS.black); // Black for maximum contrast
        doc.text("Notes:", 25, newPageNotesY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
        doc.text(splitNotes, 25, newPageNotesY + 15);
      } else {
        // Add notes on the same page
        doc.setFillColor(...ADA_COLORS.lightGreenTint);
        doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ADA_COLORS.black); // Black for maximum contrast
        doc.text("Notes:", 25, notesY + 5);
        doc.setFont('helvetica', 'normal');
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
    doc.setTextColor(...ADA_COLORS.darkGray); // Darker gray for better contrast
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
