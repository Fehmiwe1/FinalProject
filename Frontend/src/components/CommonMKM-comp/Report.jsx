import React, { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../assets/styles/CommonMKM-styles/Report.css";
import logo from "../../assets/img/logo.png";

function Report() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("יש לבחור טווח תאריכים");
      return;
    }

    try {
      const res = await axios.get("/report/", {
        params: { startDate, endDate },
        withCredentials: true,
      });
      setReportData(res.data);
      setError("");
    } catch (err) {
      console.error("שגיאה בקבלת הדוח:", err);
      setError("שגיאה בטעינת הדוח");
    }
  };

  const downloadPDF = () => {
    if (!reportData) {
      setError("Please display the report before downloading.");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });


    doc.setFont("helvetica");

    // Logo in top-right corner
    const imgWidth = 25;
    const imgHeight = 25;
    doc.addImage(logo, "PNG", 160, 10, imgWidth, imgHeight);

    // Main Title
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 100);
    doc.text("Security Unit", 105, 30, { align: "center" });

    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text("Work Hours Report", 105, 40, { align: "center" });

    // Date Range
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 105, 48, {
      align: "center",
    });

    // Table 1: Time breakdown
    autoTable(doc, {
      startY: 60,
      head: [["Unit", "Amount"]],
      body: [
        ["Days", reportData.total_days],
        ["Weeks", reportData.total_weeks],
        ["Months", reportData.total_months],
      ],
      styles: {
        halign: "center",
        fontSize: 11,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: [240, 248, 255],
      },
    });

    // Table 2: Totals
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Total Work Hours", "Salary (₪)"]],
      body: [[reportData.total_hours, reportData.total_salary]],
      styles: {
        halign: "center",
        fontSize: 12,
      },
      headStyles: {
        fillColor: [39, 174, 96],
        textColor: 255,
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: [235, 255, 235],
      },
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Generated by the Security Management System", 105, 285, {
      align: "center",
    });

    // Save PDF
    doc.save(`Security_Report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="report-wrapper">
      <main className="report-body">
        <section className="report-section">
          <h2 className="report-title">דו"ח שעות</h2>
          {error && <p className="report-error">{error}</p>}
          <div className="report-date-pickers">
            <label>מתאריך</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label>עד תאריך</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="report-card">
            <table>
              <thead>
                <tr>
                  <th>כמות</th>
                  <th>יחידה</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reportData ? reportData.total_days : "—"}</td>
                  <td>ימים</td>
                </tr>
                <tr>
                  <td>{reportData ? reportData.total_weeks : "—"}</td>
                  <td>שבועות</td>
                </tr>
                <tr>
                  <td>{reportData ? reportData.total_months : "—"}</td>
                  <td>חודשים</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-summary">
            <table>
              <thead>
                <tr>
                  <th>סה"כ שעות עבודה</th>
                  <th>שכר (ש"ח)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reportData ? reportData.total_hours : "—"}</td>
                  <td>{reportData ? reportData.total_salary : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-buttons">
            <button onClick={fetchReport}>הצגת דוח</button>
            <button onClick={downloadPDF} disabled={!reportData}>
              הורדת דוח
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Report;
