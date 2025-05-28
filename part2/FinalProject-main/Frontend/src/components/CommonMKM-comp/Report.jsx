import React, { useState } from "react";
import "../../assets/styles/CommonMKM-styles/Report.css";

function Report() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="report-wrapper">
      <main className="report-body">
        <section className="report-section">
          <h2 className="report-title">דו"ח שעות</h2>

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
                  <th>שעות</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>—</td>
                  <td>ימים</td>
                </tr>
                <tr>
                  <td>—</td>
                  <td>שבועות</td>
                </tr>
                <tr>
                  <td>—</td>
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
                  <th>שכר</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>—</td>
                  <td>שכר</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-buttons">
            <button>הצגת דוח</button>
            <button>הורדת דוח</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Report;
