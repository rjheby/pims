import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

export interface DispatchScheduleData {
  schedule_number: string;
  schedule_date: string;
  notes?: string;
  status: string;
  stops?: any[];
}

export const generateDispatchPDF = (data: DispatchScheduleData): jsPDF => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Add title
  doc.setFontSize(20);
  doc.text("Dispatch Schedule", centerX, 20, { align: "center" });

  // Add schedule details
  doc.setFontSize(12);
  doc.text(`Schedule #: ${data.schedule_number}`, 14, 35);
  doc.text(`Date: ${format(new Date(data.schedule_date), "MMMM d, yyyy")}`, 14, 42);
  doc.text(`Status: ${data.status}`, 14, 49);

  // Add notes if available
  if (data.notes) {
    doc.text("Notes:", 14, 60);
    doc.setFontSize(10);
    
    // Split long notes into multiple lines
    const splitNotes = doc.splitTextToSize(data.notes, 180);
    doc.text(splitNotes, 14, 67);
  }

  // Add stops table if available
  if (data.stops && data.stops.length > 0) {
    const yPosition = data.notes ? 80 + (data.notes.length / 50) * 5 : 80;
    
    doc.setFontSize(14);
    doc.text("Delivery Stops", 14, yPosition);
    
    const tableHeaders = [
      "Stop #", 
      "Customer", 
      "Address", 
      "Driver", 
      "Items"
    ];

    const tableData = data.stops.map((stop, index) => [
      stop.stop_number || index + 1,
      stop.customer_name || "N/A",
      stop.customer_address || "N/A",
      stop.driver_name || "Unassigned",
      stop.items || "N/A"
    ]);

    (doc as any).autoTable({
      startY: yPosition + 5,
      head: [tableHeaders],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [42, 65, 49], textColor: [255, 255, 255] }
    });
  }

  // Add footer
  const footerText = `Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`;
  doc.setFontSize(8);
  doc.text(footerText, centerX, 285, { align: "center" });

  return doc;
};
