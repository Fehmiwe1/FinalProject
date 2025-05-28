import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/CreateIncident.css";

function CreateIncident() {
  const [msg, setMsg] = useState(""); // הודעת הצלחה
  const [error, setError] = useState(""); // הודעת שגיאה
  const [newReport, setNewReport] = useState({
    Incident_Name: "", // שם האירוע
    Incident_Date: "", // תאריך האירוע
    ID_Employee: "", // תעודת זהות של העובד
    Description: "", // תיאור
  });

  const navigate = useNavigate();

  // פונקציה שמעדכנת את השדות לפי הקלט של המשתמש
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prevReport) => ({
      ...prevReport,
      [name]: value,
    }));
  };

  // פונקציה לניקוי מחרוזות מרווחים מיותרים
  const cleanString = (str) => {
    return str.trim().replace(/\s+/g, " ");
  };

  // פונקציה ליצירת הדוח ושליחתו לשרת
  const createReport = async (reportToSend) => {
    try {
      const res = await axios.post("/post/", reportToSend, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("הדכוח נוצר:", res.data);
      setMsg("הדוח נוצר בהצלחה");
      setTimeout(() => {
        setMsg("");
        navigate("/Incident");
      }, 2500);
    } catch (error) {
      console.error("שגיאה:", error);
      setError("יצירת הדוח נכשלה. נסה שוב.");
    }
  };

  // פונקציה שמטפלת בשליחת הטופס
  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date().toISOString().slice(0, 16); // תאריך נוכחי

    const cleanedReport = {
      Incident_Name: cleanString(newReport.Incident_Name),
      Incident_Date: newReport.Incident_Date,
      ID_Employee: newReport.ID_Employee.trim(),
      Description: cleanString(newReport.Description),
    };

    // בדיקות תקינות
    if (
      !cleanedReport.Incident_Name ||
      !cleanedReport.Incident_Date ||
      !cleanedReport.ID_Employee ||
      !cleanedReport.Description
    ) {
      setError("אנא מלא את כל השדות הדרושים.");
      return;
    }

    if (cleanedReport.Incident_Name.length < 5) {
      setError("שם האירוע חייב להכיל לפחות 5 תווים.");
      return;
    }

    if (!cleanedReport.Incident_Date || cleanedReport.Incident_Date > now) {
      setError("תאריך האירוע חייב להיות היום או מוקדם יותר.");
      return;
    }

    if (isNaN(cleanedReport.ID_Employee) || cleanedReport.ID_Employee <= 0) {
      setError("מספר תעודת זהות חייב להיות מספר חיובי.");
      return;
    }

    if (cleanedReport.Description.length < 11) {
      setError("התיאור חייב להכיל לפחות 11 תווים.");
      return;
    }

    setError("");
    createReport(cleanedReport);
  };

  return (
    <div className="main">
      <div className="create-report">
        <button className="close-button" onClick={() => navigate("/Incident")}>
          ✕
        </button>
        <h2>יצירת דוח אירוע חדש</h2>
        <div className="success-msg">{msg}</div>
        {error && <p className="error-message">{error}</p>}
        <form className="create-Report-form" onSubmit={handleSubmit}>
          <div className="create-Report-div">
            <label className="create-Report-label">שם האירוע:</label>
            <input
              type="text"
              name="Incident_Name"
              value={newReport.Incident_Name}
              onChange={handleChange}
              required
              className="create-Report-input"
            />
          </div>
          <div className="create-Report-div">
            <label className="create-Report-label">תאריך האירוע:</label>
            <input
              type="datetime-local"
              name="Incident_Date"
              value={newReport.Incident_Date}
              onChange={handleChange}
              required
              className="create-Report-input"
            />
          </div>
          <div className="create-Report-div">
            <label className="create-Report-label">תעודת זהות של העובד:</label>
            <input
              type="number"
              name="ID_Employee"
              value={newReport.ID_Employee}
              onChange={handleChange}
              required
              className="create-Report-input"
            />
          </div>
          <div className="create-Report-div">
            <label className="create-Report-label">תיאור:</label>
            <textarea
              name="Description"
              value={newReport.Description}
              onChange={handleChange}
              required
              className="create-Report-textarea"
            />
          </div>
          <button className="create-Report-button" type="submit">
            צור דוח אירוע
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateIncident;
