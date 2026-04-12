import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ExportData {
  totalPosts: number;
  topTemplate: string;
  templatesUsed: number;
  scheduledCount: number;
  templateData: { name: string; count: number }[];
  formatData: { name: string; value: number }[];
  trendData: { date: string; count: number }[];
}

export default function AnalyticsExport({ data }: { data: ExportData }) {
  const exportCSV = () => {
    const lines: string[] = [
      "PostAI Analytics Report",
      "",
      "Summary",
      `Total Posts,${data.totalPosts}`,
      `Top Template,${data.topTemplate}`,
      `Templates Used,${data.templatesUsed}`,
      `Scheduled,${data.scheduledCount}`,
      "",
      "Template Usage",
      "Template,Count",
      ...data.templateData.map((t) => `${t.name},${t.count}`),
      "",
      "Format Distribution",
      "Format,Count",
      ...data.formatData.map((f) => `${f.name},${f.value}`),
      "",
      "Daily Trend (Last 30 Days)",
      "Date,Posts",
      ...data.trendData.map((t) => `${t.date},${t.count}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "postai-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const lh = 7;

    doc.setFontSize(18);
    doc.text("PostAI Analytics Report", 14, y);
    y += 12;

    doc.setFontSize(12);
    doc.text(`Total Posts: ${data.totalPosts}`, 14, y); y += lh;
    doc.text(`Top Template: ${data.topTemplate}`, 14, y); y += lh;
    doc.text(`Templates Used: ${data.templatesUsed}`, 14, y); y += lh;
    doc.text(`Scheduled: ${data.scheduledCount}`, 14, y); y += lh * 2;

    doc.setFontSize(14);
    doc.text("Template Usage", 14, y); y += lh;
    doc.setFontSize(10);
    data.templateData.forEach((t) => {
      doc.text(`${t.name}: ${t.count}`, 18, y); y += 6;
    });
    y += 4;

    doc.setFontSize(14);
    doc.text("Format Distribution", 14, y); y += lh;
    doc.setFontSize(10);
    data.formatData.forEach((f) => {
      doc.text(`${f.name}: ${f.value}`, 18, y); y += 6;
    });
    y += 4;

    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.text("Daily Trend (Last 30 Days)", 14, y); y += lh;
    doc.setFontSize(9);
    data.trendData.filter((t) => t.count > 0).forEach((t) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(`${t.date}: ${t.count} posts`, 18, y); y += 5;
    });

    doc.save("postai-analytics.pdf");
    toast.success("PDF downloaded!");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
        <Download className="h-3.5 w-3.5" /> CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF} className="gap-1.5">
        <Download className="h-3.5 w-3.5" /> PDF
      </Button>
    </div>
  );
}
