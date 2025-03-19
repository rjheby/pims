
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface Schedule {
  id?: string;
  schedule_number: string;
  schedule_date: string;
  status?: string;
  notes?: string;
  stops: ScheduleStop[];
}

interface ScheduleStop {
  id?: string;
  customer_id: string;
  driver_id?: string | null;
  notes?: string | null;
  items?: string | null;
  customer?: CustomerInfo;
  customers?: CustomerInfo;
  sequence?: number;
  stop_number?: number;
  price?: number;
  customer_phone?: string;
}

interface CustomerInfo {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
}

interface DriverInfo {
  id: string;
  name: string;
}

// Mock driver data
const driverNames: Record<string, string> = {
  "driver-1": "John Smith",
  "driver-2": "Maria Garcia",
  "driver-3": "Robert Johnson",
  "driver-4": "Sarah Lee",
};

export function downloadSchedulePDF(schedule: Schedule) {
  try {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text(schedule.schedule_number, 14, 22);
    
    // Date and status
    doc.setFontSize(12);
    const scheduleDate = new Date(schedule.schedule_date);
    const formattedDate = format(scheduleDate, "MMMM d, yyyy");
    doc.text(`Date: ${formattedDate}`, 14, 32);
    
    if (schedule.status) {
      doc.text(`Status: ${schedule.status.toUpperCase()}`, 14, 38);
    }
    
    if (schedule.notes) {
      doc.text(`Notes: ${schedule.notes}`, 14, 44);
    }
    
    // Create the stops table
    const tableData = schedule.stops.map((stop, index) => {
      // Handle potential undefined customer object
      const customer = stop.customer || stop.customers || { name: "Unknown", address: "No address" };
      
      const driverName = stop.driver_id ? driverNames[stop.driver_id] || "Unknown" : "Not Assigned";
      const stopNumber = stop.stop_number || index + 1;
      
      // Safely handle phone property which might not exist
      const phone = stop.customer_phone || 
                    (typeof customer === 'object' && 'phone' in customer ? customer.phone : "—");
      
      const price = stop.price ? `$${stop.price.toFixed(2)}` : "—";
      
      return [
        stopNumber.toString(),
        customer.name || "Unnamed Customer",
        customer.address || "No address",
        phone,
        driverName,
        stop.items || "—",
        price,
        stop.notes || "—"
      ];
    });
    
    autoTable(doc, {
      startY: 50,
      head: [['#', 'Customer', 'Address', 'Phone', 'Driver', 'Items', 'Price', 'Notes']],
      body: tableData,
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { cellWidth: 30 }
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 3,
      },
      didDrawPage: (data) => {
        // Add page number at the bottom
        doc.setFontSize(8);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });
    
    // Add summary at the end
    const finalY = (doc as any).lastAutoTable.finalY || 50;
    
    doc.setFontSize(12);
    doc.text(`Total Stops: ${schedule.stops.length}`, 14, finalY + 10);
    
    // Group stops by driver
    const stopsByDriver: Record<string, number> = {};
    schedule.stops.forEach(stop => {
      const driverId = stop.driver_id || 'unassigned';
      stopsByDriver[driverId] = (stopsByDriver[driverId] || 0) + 1;
    });
    
    // Calculate inventory item totals
    const inventoryTotals: Record<string, number> = {};
    schedule.stops.forEach(stop => {
      if (!stop.items) return;
      
      const stopItems = stop.items.split(',').map(item => item.trim());
      stopItems.forEach(item => {
        if (!item) return;
        inventoryTotals[item] = (inventoryTotals[item] || 0) + 1;
      });
    });
    
    // Add stops per driver
    let yPos = finalY + 16;
    Object.entries(stopsByDriver).forEach(([driverId, count]) => {
      const driverName = driverId === 'unassigned' 
        ? 'Unassigned' 
        : driverNames[driverId] || driverId;
        
      doc.text(`${driverName}: ${count} stops`, 14, yPos);
      yPos += 6;
    });
    
    // Add inventory items summary if we have items
    if (Object.keys(inventoryTotals).length > 0) {
      yPos += 6; // Add extra space
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Inventory Items Summary:', 14, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
      
      // Table for inventory items
      const inventoryTableData = Object.entries(inventoryTotals).map(([item, count]) => [
        item, count.toString()
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Quantity']],
        body: inventoryTableData,
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10
        },
        theme: 'grid'
      });
    }
    
    // Calculate total price
    const totalPrice = schedule.stops.reduce((sum, stop) => {
      return sum + (stop.price || 0);
    }, 0);
    
    // Add total price if we have any prices
    if (totalPrice > 0) {
      yPos = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Price: $${totalPrice.toFixed(2)}`, 14, yPos);
      doc.setFont('helvetica', 'normal');
    }
    
    // Download the PDF
    doc.save(`${schedule.schedule_number.replace(/\s+/g, '_')}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
}
