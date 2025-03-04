
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface StopForPdf {
  sequence?: number;
  customer?: { name: string; address?: string };
  customer_id?: string;
  driver_id?: string;
  items?: string;
  notes?: string;
  status?: string;
}

interface ScheduleForPdf {
  id: string;
  schedule_number: string;
  schedule_date: string;
  notes?: string;
  status: string;
  stops: StopForPdf[];
  driverName?: string; // Optional for driver-specific PDFs
}

/**
 * Generate a PDF for a dispatch schedule
 */
export const generateSchedulePDF = (schedule: ScheduleForPdf, forDriver: boolean = false): jsPDF => {
  const doc = new jsPDF();
  const title = forDriver ? `Driver Schedule: ${schedule.driverName}` : `Dispatch Schedule #${schedule.schedule_number}`;
  const scheduleDate = schedule.schedule_date ? format(new Date(schedule.schedule_date), "MMMM d, yyyy") : "No Date";
  
  // Add header
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Date: ${scheduleDate}`, 14, 32);
  doc.text(`Status: ${schedule.status.toUpperCase()}`, 14, 39);
  
  if (schedule.notes) {
    doc.text("Notes:", 14, 46);
    doc.setFontSize(10);
    doc.text(schedule.notes, 14, 53, { maxWidth: 180 });
  }

  // Calculate starting Y position based on whether notes are present
  const startY = schedule.notes ? 65 : 50;
  
  // Create stops table
  const tableColumns = forDriver ?
    [
      { header: 'Sequence', dataKey: 'sequence' },
      { header: 'Customer', dataKey: 'customer' },
      { header: 'Address', dataKey: 'address' },
      { header: 'Items', dataKey: 'items' },
      { header: 'Notes', dataKey: 'notes' }
    ] :
    [
      { header: 'Sequence', dataKey: 'sequence' },
      { header: 'Customer', dataKey: 'customer' },
      { header: 'Driver', dataKey: 'driver' },
      { header: 'Items', dataKey: 'items' },
      { header: 'Notes', dataKey: 'notes' },
      { header: 'Status', dataKey: 'status' }
    ];
  
  const tableRows = schedule.stops.map((stop, index) => {
    const row: any = {
      sequence: stop.sequence || (index + 1),
      customer: stop.customer?.name || "Unknown",
      address: stop.customer?.address || "No address",
      items: stop.items || "-",
      notes: stop.notes || "-"
    };
    
    if (!forDriver) {
      row.driver = stop.driver_id || "Unassigned";
      row.status = stop.status || "draft";
    }
    
    return row;
  });

  autoTable(doc, {
    startY,
    head: [tableColumns.map(col => col.header)],
    body: tableRows.map(row => 
      tableColumns.map(col => row[col.dataKey as keyof typeof row])
    ),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    footStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] }
  });

  // Add footer with generation info
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${format(new Date(), "MM/dd/yyyy 'at' h:mm a")}`,
      14,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 30,
      doc.internal.pageSize.height - 10
    );
  }

  return doc;
};

/**
 * Generate and download a PDF for a dispatch schedule
 */
export const downloadSchedulePDF = (schedule: ScheduleForPdf, forDriver: boolean = false): void => {
  const doc = generateSchedulePDF(schedule, forDriver);
  const fileName = forDriver 
    ? `driver-schedule_${schedule.driverName?.replace(/\s+/g, '-')}_${schedule.schedule_date}.pdf`
    : `dispatch-schedule_${schedule.schedule_number}.pdf`;
  
  doc.save(fileName);
};

/**
 * Generate a data URL for a dispatch schedule PDF (useful for preview)
 */
export const getSchedulePdfDataUrl = (schedule: ScheduleForPdf, forDriver: boolean = false): string => {
  const doc = generateSchedulePDF(schedule, forDriver);
  return doc.output('datauristring');
};
