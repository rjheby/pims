
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { OrderItem, safeNumber } from "../types";
import { getPackagingConversion, PACKAGING_CONVERSIONS } from "../hooks/orderTable/useOrderCalculations";

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

// Helper function to calculate detailed item summary
const calculateDetailedItemSummary = (items: OrderItem[]) => {
  const detailedSummary: Record<string, number> = {};
  
  items.forEach(item => {
    // Format the key to be more readable
    const key = [
      item.species || 'Unspecified',
      item.bundleType || 'Unspecified', 
      item.length || 'Unspecified',
      item.thickness || 'Unspecified'
    ].filter(Boolean).join(' - ');
    
    // If packaging is not standard pallets, include it in the description
    const displayKey = (item.packaging && item.packaging !== 'Pallets') 
      ? `${key} - ${item.packaging}`
      : key;
    
    if (detailedSummary[displayKey]) {
      detailedSummary[displayKey] += safeNumber(item.pallets);
    } else {
      detailedSummary[displayKey] = safeNumber(item.pallets);
    }
  });
  
  return detailedSummary;
};

// Helper function to summarize by packaging type
const calculatePackagingSummary = (items: OrderItem[]) => {
  const packagingSummary: Record<string, number> = {};
  
  items.forEach(item => {
    const packaging = item.packaging || 'Pallets';
    const quantity = safeNumber(item.pallets);
    
    if (packagingSummary[packaging]) {
      packagingSummary[packaging] += quantity;
    } else {
      packagingSummary[packaging] = quantity;
    }
  });
  
  return packagingSummary;
};

// Generate a compact summary string (e.g., "20 Pallets, 180 16x12\" Boxes")
const generateCompactSummary = (items: OrderItem[]): string => {
  const packagingSummary = calculatePackagingSummary(items);
  
  return Object.entries(packagingSummary)
    .map(([packaging, count]) => `${count} ${packaging}`)
    .join(', ');
};

// Calculate total pallet equivalents based on packaging type
const calculateTotalPalletEquivalents = (items: OrderItem[]): number => {
  return items.reduce((total, item) => {
    const packaging = item.packaging || 'Pallets';
    const quantity = safeNumber(item.pallets);
    const conversion = getPackagingConversion(packaging);
    
    return total + (quantity * conversion.palletEquivalent);
  }, 0);
};

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
  doc.text(`Purchase Order #${orderData.order_number}`, 15, 45);
  
  if (orderData.status) {
    // Add status indicator
    const statusX = pageWidth - 60;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    
    let statusColor;
    switch (orderData.status.toLowerCase()) {
      case 'draft':
        statusColor = [100, 100, 100]; // Darker gray for better contrast
        break;
      case 'submitted':
        statusColor = [25, 80, 170]; // Darker blue for better contrast
        break;
      case 'processing':
        statusColor = [180, 95, 6]; // Darker amber for better contrast
        break;
      case 'completed':
        statusColor = [16, 124, 86]; // Darker green for better contrast
        break;
      case 'cancelled':
        statusColor = [180, 30, 30]; // Darker red for better contrast
        break;
      default:
        statusColor = [100, 100, 100]; // Default darker gray
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

  // Calculate totals using packaging conversion ratios
  const parsedItems = orderData.items || [];
  
  let totalPhysicalItems = 0;
  let totalPalletEquivalents = 0;
  let packagingCounts = {};
  
  parsedItems.forEach(item => {
    const quantity = safeNumber(item.pallets);
    const packagingType = item.packaging || 'Pallets';
    
    // Track physical counts by packaging type
    if (!packagingCounts[packagingType]) {
      packagingCounts[packagingType] = 0;
    }
    packagingCounts[packagingType] += quantity;
    totalPhysicalItems += quantity;
    
    // Calculate pallet equivalents for capacity
    const conversion = getPackagingConversion(packagingType);
    totalPalletEquivalents += quantity * conversion.palletEquivalent;
  });
  
  // Generate the compact summary (e.g., "20 Pallets, 180 16x12" Boxes")
  const compactSummary = generateCompactSummary(parsedItems);
  
  // Add the compact summary to the PDF
  doc.setFont('helvetica', 'bold');
  doc.text("Order Contents:", 15, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(compactSummary, 15, yPos);
  yPos += 12;
  
  // Calculate total value
  const totalValue = orderData.totalValue || 
    parsedItems.reduce((sum, item) => sum + (safeNumber(item.pallets) * safeNumber(item.unitCost)), 0);
  
  // Format items data for table with packaging type information
  const tableData = parsedItems.map(item => {
    // Create concatenated name field with packaging type included
    const name = [
      item.species, 
      item.length, 
      item.bundleType, 
      item.thickness,
      item.packaging // Added packaging to the description
    ].filter(Boolean).join(' - ');
    
    const itemUnitCost = safeNumber(item.unitCost);
    const itemQuantity = safeNumber(item.pallets);
    const itemTotal = itemQuantity * itemUnitCost;
    
    return [
      itemQuantity.toString(),                        // Quantity
      name,                                           // Name
      `$${itemUnitCost.toFixed(2)}`,                  // Unit Cost
      `$${itemTotal.toFixed(2)}`                      // Total Cost
    ];
  });
  
  // Define consistent column alignment with correct HAlignType values
  const colAlignments: HAlignType[] = ['center', 'left', 'center', 'center'];
  
  // Add items table with improved formatting
  autoTable(doc, {
    head: [['Quantity', 'Product Description', 'Unit Price', 'Total']],
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
      fillColor: [42, 65, 49],  // Woodbourne Green 
      textColor: [255, 255, 255],
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
      fillColor: [224, 224, 224] // Very light gray (#e0e0e0)
    },
    margin: { top: 10, right: 15, bottom: 20, left: 15 },
    showHead: 'everyPage',
    didDrawPage: function(data) {
      // Add page number on each page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
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
  
  // Calculate the detailed item summary for the PDF
  const detailedItemSummary = calculateDetailedItemSummary(parsedItems);
  
  // Prepare to add both the summary box and detailed item summary
  const summaryBoxHeight = 50;
  const detailedSummaryHeight = Object.keys(detailedItemSummary).length * 8 + 20; // Estimate height
  const totalSummaryHeight = summaryBoxHeight + detailedSummaryHeight + 20;
  
  // Check if there's enough space for the summary sections
  const isEnoughSpace = finalY + totalSummaryHeight < pageHeight - 20;
  
  if (!isEnoughSpace) {
    // Add a new page if there's not enough space
    doc.addPage();
    
    // Add the detailed item summary first
    let itemSummaryY = 40;
    
    // Add a detailed breakdown of items
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Items Summary:", 15, itemSummaryY);
    itemSummaryY += 10;
    
    // Add each item group with its count
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    Object.entries(detailedItemSummary).forEach(([key, count], index) => {
      const yPosition = itemSummaryY + (index * 7);
      doc.text(key + ":", 20, yPosition);
      doc.text(count.toString(), 160, yPosition, { align: "right" });
    });
    
    // Update Y position for the summary box
    const summaryBoxY = itemSummaryY + detailedSummaryHeight + 10;
    
    // Draw the summary box with light gray background
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(15, summaryBoxY, pageWidth - 30, summaryBoxHeight, 3, 3, 'FD');
    
    // Add summary text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black text for maximum contrast
    
    // Show truck capacity details
    doc.text(`Truck Capacity: ${(totalPalletEquivalents / 24 * 100).toFixed(1)}%`, 25, summaryBoxY + 15);
    doc.text(`Total Units: ${totalPhysicalItems}`, 25, summaryBoxY + 30);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 25, summaryBoxY + 15, { align: "right" });
    doc.text(`Items: ${compactSummary}`, pageWidth - 25, summaryBoxY + 30, { align: "right" });
    
    // Add small footnote about capacity calculation
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("* Based on pallet-equivalent calculations", 25, summaryBoxY + 45);
    
    // Add notes if available
    if (orderData.notes) {
      const notesY = summaryBoxY + 60;
      doc.setFillColor(224, 224, 224); // Very light gray
      doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Notes:", 25, notesY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Split long notes into multiple lines with word wrap
      const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
      doc.text(splitNotes, 25, notesY + 15);
    }
  } else {
    // Add the detailed item summary first
    let itemSummaryY = finalY + 10;
    
    // Add a detailed breakdown of items
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Items Summary:", 15, itemSummaryY);
    itemSummaryY += 10;
    
    // Add each item group with its count
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    Object.entries(detailedItemSummary).forEach(([key, count], index) => {
      const yPosition = itemSummaryY + (index * 7);
      doc.text(key + ":", 20, yPosition);
      doc.text(count.toString(), 160, yPosition, { align: "right" });
    });
    
    // Update Y position for the summary box
    const summaryBoxY = itemSummaryY + detailedSummaryHeight + 10;
    
    // Draw the summary box on the same page
    doc.setFillColor(245, 245, 245); // Light gray background
    doc.setDrawColor(180, 180, 180);
    doc.roundedRect(15, summaryBoxY, pageWidth - 30, summaryBoxHeight, 3, 3, 'FD');
    
    // Add summary text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    // Show truck capacity details
    doc.text(`Truck Capacity: ${(totalPalletEquivalents / 24 * 100).toFixed(1)}%`, 25, summaryBoxY + 15);
    doc.text(`Total Units: ${totalPhysicalItems}`, 25, summaryBoxY + 30);
    doc.text(`Total Value: $${totalValue.toFixed(2)}`, pageWidth - 25, summaryBoxY + 15, { align: "right" });
    doc.text(`Items: ${compactSummary}`, pageWidth - 25, summaryBoxY + 30, { align: "right" });
    
    // Add small footnote about capacity calculation
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text("* Based on pallet-equivalent calculations", 25, summaryBoxY + 45);
    
    // Add notes if available
    if (orderData.notes) {
      const notesY = summaryBoxY + 60;
      
      // Check if there's room for notes
      if (notesY + 50 > pageHeight) {
        // Add a new page for notes
        doc.addPage();
        
        const newPageNotesY = 40;
        doc.setFillColor(224, 224, 224); // Very light gray
        doc.roundedRect(15, newPageNotesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text("Notes:", 25, newPageNotesY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        const splitNotes = doc.splitTextToSize(orderData.notes, pageWidth - 60);
        doc.text(splitNotes, 25, newPageNotesY + 15);
      } else {
        // Add notes on the same page
        doc.setFillColor(224, 224, 224); // Very light gray
        doc.roundedRect(15, notesY - 5, pageWidth - 30, 40, 3, 3, 'F');
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
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
    doc.setTextColor(60, 60, 60);
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
