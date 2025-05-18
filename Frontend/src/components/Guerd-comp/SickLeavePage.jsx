import React, { useState } from "react";
import logo from "../../assets/img/logo.png";
import "../../assets/styles/Guerd-styles/MainPage.css";
import "../../assets/styles/Guerd-styles/SickLeavePage.css";

function SickLeavePage() {
  const username = "משתמש";

  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    leaveDays: "",
    unpaidDays: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
  };


  return (
    <div className="main-wrapper">
      <main className="main-body">
        <section className="entry-section">
          <h2>חופשת מחלה</h2>
          <div className="upload-box">
            <label htmlFor="file-upload">העלאת קובץ</label>
            <input type="file" id="file-upload" name="file" onChange={handleChange} />
          </div>

          <form className="form-section" onSubmit={handleSubmit}>
            <h2 className="section-title">בקשת חופשה</h2>
            <div className="calendar-group">
              <div className="calendar-block">
                <label>מתאריך</label>
                <input type="date" name="fromDate" onChange={handleChange} />
              </div>
              <div className="calendar-block">
                <label>עד תאריך</label>
                <input type="date" name="toDate" onChange={handleChange} />
              </div>
            </div>

            <div className="form-fields">
              <label>שם</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} />

              <label>מספר עובד</label>
              <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange} />

              <label>סה\"כ ימי חופשה</label>
              <input type="number" name="leaveDays" value={form.leaveDays} onChange={handleChange} />

              <label>ימים לתשלום</label>
              <input type="number" name="unpaidDays" value={form.unpaidDays} onChange={handleChange} />
            </div>

            <button type="submit">שליחת בקשה</button>
          </form>
        </section>
      </main>

      <footer className="main-footer">
        כל הזכויות שמורות - מערכת ניהול שערים &copy; 2025
      </footer>
    </div>
  );
}

export default SickLeavePage;