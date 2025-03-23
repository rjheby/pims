import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface Schedule {
  schedule_number: string;
  schedule_date: string;
  stops: any[];
  // Other properties as needed
}

export const downloadSchedulePDF = (schedule: Schedule) => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.text(`Dispatch Schedule #${schedule.schedule_number}`, 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Date: ${schedule.schedule_date}`, 14, 32);
  
  // Add table
  const tableColumn = ["Stop", "Customer", "Address", "Items", "Notes"];
  const tableRows: any[] = [];
  
  schedule.stops.forEach(stop => {
    const customerName = stop.customer?.name || stop.customer_name || "N/A";
    const customerAddress = stop.customer?.address || stop.customer_address || "N/A";
    
    tableRows.push([
      stop.stop_number || "-", 
      customerName,
      customerAddress,
      stop.items || "-",
      stop.notes || "-"
    ]);
  });
  
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    margin: { top: 20 },
    styles: { overflow: 'linebreak' },
    columnStyles: { 
      0: { cellWidth: 15 },
      1: { cellWidth: 40 },
      2: { cellWidth: 50 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 }
    },
    headStyles: { 
      fillColor: [42, 65, 49],
      textColor: [255, 255, 255]
    }
  });
  
  // Save PDF
  doc.save(`dispatch-schedule-${schedule.schedule_number}.pdf`);
};

// Add a stub implementation of the missing generateDispatchPDF function
export const generateDispatchPDF = (data: any) => {
  return downloadSchedulePDF(data);
};
