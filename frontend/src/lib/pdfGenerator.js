import jsPDF from "jspdf";
import { format } from "date-fns";

export const generateSchedulePDF = (scheduleData, userPreferences) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  let yPosition = 30;

  // Header with branding
  pdf.setFillColor(229, 9, 20); // MovieRazzi red
  pdf.rect(0, 0, pageWidth, 40, "F");

  // Logo area (simulated with text since we can't embed images easily)
  pdf.setFontSize(28);
  pdf.setTextColor(255, 255, 255);
  pdf.text("🎬", margin, 25);

  // Brand name
  pdf.setFontSize(24);
  pdf.setTextColor(255, 255, 255);
  pdf.text("MovieRazzi", margin + 15, 25);

  // Tagline
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text("Your Personal Movie Schedule", pageWidth - 80, 25);

  yPosition = 55;

  // Main title
  pdf.setFontSize(20);
  pdf.setTextColor(0, 0, 0);
  pdf.text("🎭 Your Personalized Movie Schedule", margin, yPosition);

  yPosition += 15;

  // Date generated
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Generated on: ${format(new Date(), "MMMM dd, yyyy")}`,
    margin,
    yPosition
  );

  yPosition += 10;

  // Add a decorative line
  pdf.setDrawColor(229, 9, 20);
  pdf.setLineWidth(2);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);

  yPosition += 15;

  // User preferences
  if (userPreferences) {
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("🎯 Your Movie Preferences:", margin, yPosition);
    yPosition += 8;

    // Preference box background
    pdf.setFillColor(245, 245, 245);
    const prefLines = pdf.splitTextToSize(
      `"${userPreferences}"`,
      pageWidth - 2 * margin - 10
    );
    const boxHeight = prefLines.length * 6 + 8;
    pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, boxHeight, "F");

    pdf.setFontSize(11);
    pdf.setTextColor(60, 60, 60);
    pdf.text(prefLines, margin + 5, yPosition + 4);
    yPosition += prefLines.length * 6 + 10;
  }

  // Schedule header
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text("📅 Your Movie Schedule", margin, yPosition);
  yPosition += 15;

  // Schedule items
  scheduleData.schedule.forEach((item, index) => {
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      // Add header to new page
      pdf.setFillColor(229, 9, 20);
      pdf.rect(0, 0, pageWidth, 25, "F");
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text("🎬 MovieRazzi Schedule (continued)", margin, 17);
      yPosition = 40;
    }

    // Movie item background (alternating colors)
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, "F");
    }

    // Day and time
    pdf.setFontSize(14);
    pdf.setTextColor(229, 9, 20);
    pdf.text(`${item.day} - ${item.timeSlot}`, margin, yPosition);
    yPosition += 8;

    // Movie title
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`🎥 ${item.movie}`, margin + 5, yPosition);
    yPosition += 6;

    // Duration
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`⏱️ Duration: ${item.duration}`, margin + 5, yPosition);
    yPosition += 6;

    // Reason
    if (item.reason) {
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const reasonLines = pdf.splitTextToSize(
        `💡 ${item.reason}`,
        pageWidth - 2 * margin - 10
      );
      pdf.text(reasonLines, margin + 5, yPosition);
      yPosition += reasonLines.length * 5;
    }

    yPosition += 10;
  });

  // Summary section
  if (scheduleData.summary) {
    if (yPosition > pageHeight - 100) {
      pdf.addPage();
      // Add header to new page
      pdf.setFillColor(229, 9, 20);
      pdf.rect(0, 0, pageWidth, 25, "F");
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text("🎬 MovieRazzi Schedule (continued)", margin, 17);
      yPosition = 40;
    }

    yPosition += 10;

    // Summary box
    pdf.setFillColor(229, 9, 20);
    pdf.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 8, "F");

    pdf.setFontSize(16);
    pdf.setTextColor(255, 255, 255);
    pdf.text("📊 Schedule Summary", margin, yPosition);
    yPosition += 15;

    // Summary content background
    const summaryHeight =
      60 + (scheduleData.summary.recommendations?.length || 0) * 8;
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, summaryHeight, "F");

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(
      `🎬 Total Movies: ${scheduleData.summary.totalMovies}`,
      margin + 5,
      yPosition
    );
    yPosition += 8;
    pdf.text(
      `⏰ Total Watch Time: ${scheduleData.summary.totalWatchTime}`,
      margin + 5,
      yPosition
    );
    yPosition += 8;

    if (scheduleData.summary.efficiency) {
      pdf.text(
        `📈 Time Efficiency: ${scheduleData.summary.efficiency}`,
        margin + 5,
        yPosition
      );
      yPosition += 8;
    }

    yPosition += 15;

    if (scheduleData.summary.recommendations?.length > 0) {
      pdf.setFontSize(14);
      pdf.text("💡 AI Recommendations:", margin + 5, yPosition);
      yPosition += 10;

      scheduleData.summary.recommendations.forEach((rec, index) => {
        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 60);
        const recLines = pdf.splitTextToSize(
          `• ${rec}`,
          pageWidth - 2 * margin - 15
        );
        pdf.text(recLines, margin + 10, yPosition);
        yPosition += recLines.length * 6 + 3;
      });
    }
  }

  // Add branded footer to all pages
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);

    // Footer background
    pdf.setFillColor(40, 40, 40);
    pdf.rect(0, pageHeight - 20, pageWidth, 20, "F");

    // Footer content
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text(
      "🎬 MovieRazzi - Your Personal Movie Companion",
      margin,
      pageHeight - 8
    );

    pdf.setTextColor(200, 200, 200);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 8);

    // Website/contact info
    pdf.setFontSize(7);
    pdf.text(
      "movierazzi.com | Unlimited movies, TV shows and more.",
      margin,
      pageHeight - 3
    );
  }

  // Save the PDF
  const fileName = `MovieRazzi-Schedule-${format(
    new Date(),
    "yyyy-MM-dd"
  )}.pdf`;
  pdf.save(fileName);
};
