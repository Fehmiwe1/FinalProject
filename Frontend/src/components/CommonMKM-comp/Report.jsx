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
      setError("יש להציג את הדוח לפני ההורדה");
      return;
    }

    const doc = new jsPDF();

    // Add logo
    const imgWidth = 30;
    const imgHeight = 30;
    doc.addImage(logo, "PNG", 15, 10, imgWidth, imgHeight);

    doc.setFont("helvetica");
    doc.setFontSize(18);
    doc.text("Work Hours Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 105, 30, {
      align: "center",
    });

    // Table 1: Days, Weeks, Months
    autoTable(doc, {
      startY: 40,
      head: [["Amount", "Unit"]],
      body: [
        [reportData.total_days, "Days"],
        [reportData.total_weeks, "Weeks"],
        [reportData.total_months, "Months"],
      ],
      styles: { halign: "center" },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Table 2: Total Hours and Salary
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Total Work Hours", "Salary (₪)"]],
      body: [[reportData.total_hours, reportData.total_salary]],
      styles: { halign: "center" },
      headStyles: { fillColor: [39, 174, 96] },
    });

    doc.save(`Work_Report_${startDate}_to_${endDate}.pdf`);
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
