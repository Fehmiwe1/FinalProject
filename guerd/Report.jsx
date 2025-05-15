// Report.jsx
import React, { useState } from "react";
import "../../assets/styles/Main-styles/Report.css";
import logo from "../../assets/img/logo.png";

function Report() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="main-wrapper">
      <header className="main-header-bar">
        <div className="header-left">
          <img src={logo} alt="Logo" className="header-logo" />
          <span className="welcome-text">Welcome משתמש</span>
          <button className="logout-btn" onClick={() => window.location.reload()}>
            התנתקות
          </button>
        </div>
        <nav className="header-nav">
          <a href="/">ראשי</a>
          <a href="/report">דו"ח שעות</a>
          <a href="/constraints">אילוצים</a>
          <a href="/schedule">סידור עבודה</a>
          <a href="/sick-leave">מחלה/חופשה</a>
        </nav>
      </header>

      <main className="main-body">
        <section className="report-section">
          <h2 className="report-title">דו"ח שעות</h2>

          <div className="report-grid">
            <div className="report-card">
              <table>
                <thead>
                  <tr><th>כמות</th><th>שעות</th></tr>
                </thead>
                <tbody>
                  <tr><td>—</td><td>ימים</td></tr>
                  <tr><td>—</td><td>שבועות</td></tr>
                  <tr><td>—</td><td>חודשים</td></tr>
                </tbody>
              </table>
            </div>

            <div className="report-date-pickers">
              <label>מתאריך</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <label>עד תאריך</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="report-summary">
              <table>
                <thead>
                  <tr><th>סה"כ שעות עבודה</th><th>שכר</th></tr>
                </thead>
                <tbody>
                  <tr><td>—</td><td>שכר</td></tr>
                </tbody>
              </table>
            </div>

            <div className="report-buttons">
              <button>הצגת דוח</button>
              <button>הורדת דוח</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        כל הזכויות שמורות - מערכת ניהול שערים &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default Report;