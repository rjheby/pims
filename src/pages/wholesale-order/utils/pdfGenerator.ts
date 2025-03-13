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

// Define ADA-compliant color constants
const ADA_COLORS = {
  woodbourneGreen: [42, 65, 49],    // Dark green - requires white text
  white: [255, 255, 255],           // White - requires dark text
  lightGray: [245, 245, 245],       // Light gray - requires dark text
  veryLightGray: [224, 224, 224],   // Very light gray (#e0e0e0) - requires dark text
  black: [0, 0, 0],                 // Black text
  darkGray: [60, 60, 60],           // Dark gray text
  // Status colors with better contrast
  draft: [100, 100, 100],
  submitted: [25, 80, 170],
  processing: [180, 95, 6],
  completed: [16, 124, 86],
  cancelled: [180, 30, 30]
};

// Helper function to calculate pallets from boxes (60 boxes = 1 pallet)
const calculatePalletsFromBoxes = (boxes: number) => Math.ceil(boxes / 60);

export const generateOrderPDF = (orderData: OrderData) => {
  // Create PDF document
  const doc = new jsPDF('p', 'mm', 'a4') as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Create header
  doc.setFillColor(...ADA_COLORS.white);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add logo
  try {
    const logoUrl = '/lovable-uploads/21d56fd9-ffa2-4b0c-9d82-b10f7d03a546.png';
    doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 35, 8, 70, 18, undefined, 'FAST');
  } catch (error) {
    console.error("Error adding logo to PDF:", error);
    doc.setTextColor(...ADA_COLORS.woodbourneGreen);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("Order Summary", pageWidth / 2, 20, { align: "center" });
  }
  
  // Add separator line
  doc.setDrawColor(...ADA_COLORS.woodbourneGreen);
  doc.setLineWidth(0.5);
  doc.line(15, 32, pageWidth - 15, 32);
  
  // Reset text color
  doc.setTextColor(...ADA_COLORS.black);
  
  // Add title with status
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order #${orderData.order_number}`, 15, 45);
  
  // Add status if available
  if (orderData.status) {
    const statusX = pageWidth - 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    // Select status color
    let statusColor;
    switch (orderData.status.toLowerCase()) {
      case 'draft': statusColor = ADA_COLORS.draft; break;
      case 'submitted': statusColor = ADA_COLORS.submitted; break;
      case 'processing': statusColor = ADA_COLORS.processing; break;
      case 'completed': statusColor = ADA_COLORS.completed; break;
      case 'cancelled': statusColor = ADA_COLORS.cancelled; break;
      default: statusColor = ADA_COLORS.draft;
    }
    
    doc.setFillColor(...statusColor);
    doc.roundedRect(statusX - 5, 38, 50, 14, 3, 3, 'F');
    doc.setTextColor(...ADA_COLORS.white);
    doc.text(orderData.status.toUpperCase(), statusX + 20, 46, { align: "center" });
    doc.setTextColor(...ADA_COLORS.black);
  }
  
  // Add order details
  doc.setFontSize(12);
  let yPos = 60;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Order Date: ${new Date(orderData.order_date).toLocaleDateString()}`, 15, yPos);
  yPos += 8;
  
  if (orderData.delivery_date) {
    doc.text(`Delivery Date: ${new Date(orderData.delivery_date).toLocaleDateString()}`, 15, yPos);
    yPos += 8;
  }
  
  if (orderData.customer) {
    doc.text(`Customer: ${orderData.customer}`, 15, yPos);
    yPos += 8;
  }

  // Calculate totals - boxes and pallets
  // Note: In the data model, item.pallets actually represents box counts
  const totalBoxes = orderData.items.reduce((sum, item) => sum + safeNumber(item.pallets), 0);
  const totalPallets = calculatePalletsFromBoxes(totalBoxes);
  
  const totalValue = orderData.totalValue || 
    orderData.items.reduce((sum, item) => sum + (safeNumber(item.pallets) * safeNumber(item.unitCost)), 0);
  
  // Format items data for table
  const tableData = orderData.items.map(item => {
    const name = [
      item.species, 
      item.length, 
      item.bundleType, 
      item.thickness,
      item.packaging
    ].filter(Boolean).join(' - ');
    
    const itemUnitCost = safeNumber(item.unitCost);
    const itemBoxes = safeNumber(item.pallets); // This is boxes, not pallets
    const itemTotal = itemBoxes * itemUnitCost;
    
    return [
      itemBoxes.toString(),
      name,
      `$${itemUnitCost.toFixed(2)}`,
      `$${itemTotal.toFixed(2)}`
    ];
  });
  
  // Define column alignments
  const colAlignments: HAlignType[] = ['center', 'left', 'center', 'center'];
  
  // Add items table
  autoTable(doc, {
    head: [['Boxes', 'Product Description', 'Unit Price', 'Total']],
    body: tableData,
    startY: yPos + 2,
    styles: { 
      fontSize: 11,
      cellPadding: 6,
      halign: 'center',
      valign: 'middle',
      textColor: [0, 0, 0]
    },
    headStyles: { 
      fillColor: ADA_COLORS.woodbourneGreen,
      textColor: ADA_COLORS.white,
      fontStyle: 'bold',
      fontSize: 12,
      halign: 'center'
    },
    columnStyles: {
      0: { halign: colAlignments[0], cellWidth: 35 },
      1: { halign: colAlignments[1], cellWidth: 'auto' },
      2: { halign: colAlignments[2], cellWidth: 30 },
      3: { halign: colAlignments[3], cellWidth: 30 }
    },
    alternateRowStyles: { 
      fillColor: ADA_COLORS.veryLightGray
    },
    margin: { top: 10, right: 15, bottom: 20, left: 15 },
    showHead: 'everyPage',
    didDrawPage: function(data) {
      // Add page number on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...ADA_COLORS.darkGray);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      }
      
      // Add header to continuations
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
  
  // Add summary box
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
    
    // Draw the summary box
    doc.setFillColor(...ADA_COLORS.lightGray);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(pageWidth - 120, summaryBoxY, 105, summaryBoxHeight, 3, 3, 'FD');
    
    // Add summary text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ADA_COLORS.black);
    doc.text(`Total Boxes: ${totalBoxes}`, pageWidth - 110, summaryBoxY + 10);
    doc.text(`Total Pallets: ${totalPallets}*`, pageWidth - 110, summaryBoxY + 22);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 110, summaryBoxY + 34);
    
    // Add pallet calculation footnote
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("* 60 boxes = 1 pallet", pageWidth - 110, summaryBoxY + 44);
    
    // Add notes if available
    if (orderData.notes) {
      const notesY = summaryBoxY + 60;
      doc.setFillColor(...ADA_COLORS.veryLightGray);
      doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...ADA_COLORS.black);
      doc.text("Notes:", 25, notesY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
      doc.text(splitNotes, 25, notesY + 15);
    }
  } else {
    // Draw the summary box on the same page
    doc.setFillColor(...ADA_COLORS.lightGray);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(pageWidth - 120, summaryBoxY, 105, summaryBoxHeight, 3, 3, 'FD');
    
    // Add summary text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ADA_COLORS.black);
    doc.text(`Total Boxes: ${totalBoxes}`, pageWidth - 110, summaryBoxY + 10);
    doc.text(`Total Pallets: ${totalPallets}*`, pageWidth - 110, summaryBoxY + 22);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 110, summaryBoxY + 34);
    
    // Add pallet calculation footnote
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
        doc.setFillColor(...ADA_COLORS.veryLightGray);
        doc.roundedRect(15, newPageNotesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ADA_COLORS.black);
        doc.text("Notes:", 25, newPageNotesY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
        doc.text(splitNotes, 25, newPageNotesY + 15);
      } else {
        // Add notes on the same page
        doc.setFillColor(...ADA_COLORS.veryLightGray);
        doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...ADA_COLORS.black);
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
    doc.setTextColor(...ADA_COLORS.darkGray);
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
    const pdfUrl = URL.createObjectURL(pdfBlob);
    return pdfUrl;
  } catch (error) {
    console.error("Error creating shareable PDF:", error);
    throw new Error("Failed to generate shareable PDF");
  }
};

// Helper function to render PDF directly in browser for linked view
export const renderOrderPDFInIframe = (orderData: OrderData, iframeElement: HTMLIFrameElement) => {
  try {
    const pdfDoc = generateOrderPDF(orderData);
    const pdfDataUri = pdfDoc.output('datauristring');
    
    if (iframeElement) {
      iframeElement.src = pdfDataUri;
    }
    
    return true;
  } catch (error) {
    console.error("Error rendering PDF in iframe:", error);
    return false;
  }
};
