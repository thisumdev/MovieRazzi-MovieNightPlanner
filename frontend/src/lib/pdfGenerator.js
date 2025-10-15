import jsPDF from "jspdf";
import { format } from "date-fns";

export const generateSchedulePDF = (scheduleData, userPreferences) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let y = 30;

  // ───────────────────────────────
  // Header
  // ───────────────────────────────
  pdf.setFillColor(229, 9, 20); // MovieRazzi red
  pdf.rect(0, 0, pageWidth, 40, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text("MovieRazzi", margin, 25);
  pdf.setFontSize(10);
  pdf.text("Your AI Movie Night Planner", pageWidth - 90, 25);

  // ───────────────────────────────
  // Title
  // ───────────────────────────────
  y = 55;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Your Personalized Movie Schedule", margin, y);
  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on: ${format(new Date(), "MMMM dd, yyyy")}`, margin, y);
  y += 12;

  pdf.setDrawColor(229, 9, 20);
  pdf.setLineWidth(1);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 12;

  // ───────────────────────────────
  // User Preferences
  // ───────────────────────────────
  if (userPreferences) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(229, 9, 20);
    pdf.text("User Preferences", margin, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    const prefLines = pdf.splitTextToSize(
      `${userPreferences}`,
      pageWidth - 2 * margin
    );
    pdf.text(prefLines, margin, y);
    y += prefLines.length * 6 + 8;
  }

  // ───────────────────────────────
  // Schedule Section
  // ───────────────────────────────
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(229, 9, 20);
  pdf.text("AI-Generated Schedule", margin, y);
  y += 10;

  const schedule = scheduleData?.schedule || [];

  schedule.forEach((slot, idx) => {
    if (y > pageHeight - 60) {
      pdf.addPage();
      y = 30;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${slot.day} — Free Time: ${slot.slot_duration} min`, margin, y);
    y += 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(90, 90, 90);
    pdf.text(slot.reason || "", margin, y);
    y += 6;

    const movies = slot.movies || [];
    if (movies.length) {
      movies.forEach((m, i) => {
        const title = m.title || "Untitled Movie";
        const runtime = m.runtime ? `${m.runtime} min` : "N/A";
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${i + 1}. ${title} (${runtime})`, margin + 6, y);
        y += 6;
      });
    } else {
      pdf.setTextColor(150, 150, 150);
      pdf.text("No movies scheduled for this slot.", margin + 6, y);
      y += 6;
    }

    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 10;
  });

  // ───────────────────────────────
  // Summary
  // ───────────────────────────────
  const summary = scheduleData?.summary || {};
  if (y > pageHeight - 60) {
    pdf.addPage();
    y = 30;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(229, 9, 20);
  pdf.text("Schedule Summary", margin, y);
  y += 8;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Total Slots: ${summary.total_slots || 0}`, margin, y);
  y += 6;
  pdf.text(`Total Movies: ${summary.total_movies || 0}`, margin, y);
  y += 6;
  pdf.text(
    `Total Watch Time: ${summary.total_watch_time || "0 min"}`,
    margin,
    y
  );
  y += 10;

  // ───────────────────────────────
  // Footer
  // ───────────────────────────────
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFillColor(40, 40, 40);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text("MovieRazzi - AI Movie Night Planner", margin, pageHeight - 8);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 8);
  }

  // ───────────────────────────────
  // Save file
  // ───────────────────────────────
  const fileName = `MovieRazzi-Schedule-${format(
    new Date(),
    "yyyy-MM-dd"
  )}.pdf`;
  pdf.save(fileName);
};