import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { schedule } from "@/types";

export const exportTimetableToPDF = (
  schedule: schedule[],
  days: string[],
  title: string,
  subtitle: string
) => {
  const doc = new jsPDF("l", "mm", "a4");

  // Add School Logo/Title placeholder
  doc.setFontSize(22);
  doc.setTextColor(62, 207, 142); // #3ecf8e
  doc.text("Firstborn Technologies", 14, 20);

  // Add Page Title
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 30);

  // Add Subtitle (Class/Year)
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(subtitle, 14, 37);

  // Get unique time slots and sort them
  const times = new Set<string>();
  schedule.forEach((day) => {
    day.periods.forEach((period) => {
      times.add(period.startTime);
    });
  });
  const sortedTimes = Array.from(times).sort();

  const getRowLabel = (startTime: string) => {
    for (const day of schedule) {
      const found = day.periods.find((p) => p.startTime === startTime);
      if (found) {
        return `${found.startTime} - ${found.endTime}`;
      }
    }
    return startTime;
  };

  // Prepare table data
  const head = [["Time", ...days]];
  const body = sortedTimes.map((time) => {
    const row = [getRowLabel(time)];
    days.forEach((day) => {
      const dayData = schedule.find((d) => d.day === day);
      const period = dayData?.periods.find((p) => p.startTime === time);
      
      if (period && period.subject && period.teacher) {
        row.push(
          `${period.subject.name}\n${period.teacher.name}${period.room ? `\nRoom: ${period.room}` : ""}`
        );
      } else {
        row.push("Free Period");
      }
    });
    return row;
  });

  autoTable(doc, {
    startY: 45,
    head: head,
    body: body,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      valign: "middle",
      halign: "center",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [62, 207, 142], // #3ecf8e
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { 
        fillColor: [240, 240, 240], 
        fontStyle: "bold", 
        cellWidth: 35,
        halign: "center" 
      },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.cell.text[0] === 'Free Period') {
        data.cell.styles.textColor = [150, 150, 150];
        data.cell.styles.fontStyle = 'italic';
      }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Generated on ${format(new Date(), "PPP")} - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const fileName = `Timetable_${title.replace(/\s+/g, "_")}_${format(new Date(), "yyyyMMdd")}.pdf`;
  doc.save(fileName);
};
