import React, { useState, useRef } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/SickLeavePage.css";

function SickLeavePage() {
  const [vacationForm, setVacationForm] = useState({
    leaveDays: "",
    unpaidDays: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const [sickForm, setSickForm] = useState({ file: null });

  const [vacationMsg, setVacationMsg] = useState("");
  const [vacationError, setVacationError] = useState("");

  const [sickMsg, setSickMsg] = useState("");
  const [sickError, setSickError] = useState("");

  const fileInputRef = useRef(null);

  const calculateLeaveDays = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = toDate - fromDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : "";
  };

  const handleVacationChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...vacationForm, [name]: value };

    const newFrom = name === "fromDate" ? value : vacationForm.fromDate;
    const newTo = name === "toDate" ? value : vacationForm.toDate;
    const newUnpaid =
      name === "unpaidDays" ? Number(value) : Number(vacationForm.unpaidDays);
    const newLeaveDays =
      name === "leaveDays" ? Number(value) : Number(vacationForm.leaveDays);

    if (["leaveDays", "unpaidDays"].includes(name) && Number(value) < 0) {
      setVacationError("לא ניתן להזין מספר שלילי.");
      setTimeout(() => setVacationError(""), 3500);
      return;
    }

    // בדיקה: עד תאריך ≥ מתאריך
    if (newFrom && newTo && new Date(newTo) < new Date(newFrom)) {
      setVacationError("׳עד תאריך׳ חייב להיות שווה או מאוחר מ׳מתאריך׳.");
      setVacationForm(updatedForm);
      setTimeout(() => setVacationError(""), 3500);
      return;
    }

    // חישוב ימי חופשה
    if (newFrom && newTo && new Date(newTo) >= new Date(newFrom)) {
      updatedForm.leaveDays = calculateLeaveDays(newFrom, newTo);
    }

    // בדיקה: ימים לתשלום ≤ ימי חופשה
    if (newUnpaid > newLeaveDays) {
      setVacationError('ימים לתשלום לא יכולים להיות יותר מ־סה"כ ימי חופשה.');
      setVacationForm(updatedForm);
      setTimeout(() => setVacationError(""), 3500);
      return;
    }

    setVacationForm(updatedForm);
    setVacationError("");
  };
  
  

  const handleSickChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSickForm({ file });
  };

  const handleSubmitVacation = async (e) => {
    e.preventDefault();
    const { fromDate, toDate, leaveDays, unpaidDays, reason } = vacationForm;

    if (!fromDate || !toDate) {
      setVacationError("נא לבחור תאריכים.");
      setTimeout(() => setVacationError(""), 3500);
      return;
    }

    if (new Date(toDate) < new Date(fromDate)) {
      setVacationError("תאריך סיום לא יכול להיות לפני התחלה.");
      setTimeout(() => setVacationError(""), 3500);
      return;
    }

    if (Number(unpaidDays) > Number(leaveDays)) {
      setVacationError('ימים לתשלום לא יכולים להיות יותר מ־סה"כ ימי חופשה.');
      setTimeout(() => setVacationError(""), 3500);
      return;
    }

    try {
      await axios.post(
        "/employeeRequests/vacation",
        {
          fromDate,
          toDate,
          leaveDays,
          unpaidDays,
          reason,
        },
        { withCredentials: true }
      );

      setVacationMsg("בקשת חופשה נשלחה בהצלחה!");
      setVacationForm({
        leaveDays: "",
        unpaidDays: "",
        fromDate: "",
        toDate: "",
        reason: "",
      });
      setTimeout(() => setVacationMsg(""), 3000);
    } catch (err) {
      setVacationError("שגיאה בשליחת בקשת חופשה.");
      setTimeout(() => setVacationError(""), 3000);
    }
  };

  const handleSubmitSickLeave = async () => {
    if (!sickForm.file) {
      setSickError("נא לבחור קובץ.");
      setTimeout(() => setSickError(""), 3000);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", sickForm.file);

      await axios.post("/employeeRequests/sick", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSickMsg("בקשת חופשת מחלה נשלחה בהצלחה!");
      setSickForm({ file: null });
      if (fileInputRef.current) fileInputRef.current.value = null;
      setTimeout(() => setSickMsg(""), 3000);
    } catch (err) {
      console.error("שגיאת שליחה:", err);
      setSickError("שגיאה בשליחת חופשת מחלה.");
      setTimeout(() => setSickError(""), 3000);
    }
  };

  return (
    <div className="SickLeavePage-wrapper">
      <main className="SickLeavePage-body">
        {/* טופס חופשת מחלה */}
        <section className="entry-section">
          <h2>חופשת מחלה</h2>

          {sickError && <div className="error-message">{sickError}</div>}
          {sickMsg && <div className="success-message">{sickMsg}</div>}

          <div className="upload-box">
            <label htmlFor="file-upload">העלאת קובץ</label>
            <input
              type="file"
              id="file-upload"
              name="file"
              onChange={handleSickChange}
              ref={fileInputRef}
            />
            <button className="btn-send" onClick={handleSubmitSickLeave}>
              שלח חופשת מחלה
            </button>
          </div>
        </section>
        {/* טופס חופשה */}
        <section className="entry-section">
          <h2>בקשת חופשה</h2>

          {vacationError && (
            <div className="error-message">{vacationError}</div>
          )}
          {vacationMsg && <div className="success-message">{vacationMsg}</div>}

          <form className="form-section" onSubmit={handleSubmitVacation}>
            <div className="calendar-group">
              <div className="calendar-block">
                <label>מתאריך</label>
                <input
                  type="date"
                  name="fromDate"
                  value={vacationForm.fromDate}
                  onChange={handleVacationChange}
                />
              </div>
              <div className="calendar-block">
                <label>עד תאריך</label>
                <input
                  type="date"
                  name="toDate"
                  value={vacationForm.toDate}
                  onChange={handleVacationChange}
                />
              </div>
            </div>

            <div className="form-fields">
              <label>סה"כ ימי חופשה</label>
              <input
                type="number"
                name="leaveDays"
                value={vacationForm.leaveDays}
                readOnly
              />

              <label>ימים לתשלום</label>
              <input
                type="number"
                name="unpaidDays"
                value={vacationForm.unpaidDays}
                onChange={handleVacationChange}
                min="0"
              />
              <label>סיבת החופשה</label>
              <textarea
                name="reason"
                value={vacationForm.reason}
                onChange={handleVacationChange}
                rows={3}
                placeholder="כתוב את סיבת החופשה"
              />
            </div>

            <button className="btn-send" type="submit">
              שלח בקשת חופשה
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default SickLeavePage;
