import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/CreateIncident.css";

function CreateIncident() {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [newReport, setNewReport] = useState({
    Incident_Name: "",
    Incident_Date: "",
    Kabat_Name: "",
    Dispatcher_Name: "",
    Patrol_Name: "",
    Other_Participants: "",
    Description: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prevReport) => ({
      ...prevReport,
      [name]: value,
    }));
  };

  const cleanString = (str) => str.trim().replace(/\s+/g, " ");

  const createReport = async (reportToSend) => {
    try {
      const res = await axios.post("/post/", reportToSend, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      console.log('✅ הדו"ח נוצר:', res.data);
      setMsg("הדוח נוצר בהצלחה");
      setTimeout(() => {
        setMsg("");
        navigate("/Incident");
      }, 2500);
    } catch (error) {
      console.error("❌ שגיאה:", error.response?.data || error.message);
      setError(error.response?.data?.message || "יצירת הדוח נכשלה. נסה שוב.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedReport = {
      Incident_Name: cleanString(newReport.Incident_Name),
      Incident_Date: newReport.Incident_Date,
      Kabat_Name: cleanString(newReport.Kabat_Name),
      Dispatcher_Name: cleanString(newReport.Dispatcher_Name),
      Patrol_Name: cleanString(newReport.Patrol_Name),
      Other_Participants: cleanString(newReport.Other_Participants),
      Description: cleanString(newReport.Description),
    };

    if (
      !cleanedReport.Incident_Name ||
      !cleanedReport.Incident_Date ||
      !cleanedReport.Description
    ) {
      setError("אנא מלא את כל השדות הדרושים.");
      return;
    }

    if (cleanedReport.Incident_Name.length < 5) {
      setError("שם האירוע חייב להכיל לפחות 5 תווים.");
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
        <button
          className="close-button"
          onClick={() => navigate("/Incident")}
        >
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
            <label className="create-Report-label">שם קב"ט:</label>
            <input
              type="text"
              name="Kabat_Name"
              value={newReport.Kabat_Name}
              onChange={handleChange}
              className="create-Report-input"
            />
          </div>

          <div className="create-Report-div">
            <label className="create-Report-label">שם מוקדנית:</label>
            <input
              type="text"
              name="Dispatcher_Name"
              value={newReport.Dispatcher_Name}
              onChange={handleChange}
              className="create-Report-input"
            />
          </div>

          <div className="create-Report-div">
            <label className="create-Report-label">שם סייר רכוב:</label>
            <input
              type="text"
              name="Patrol_Name"
              value={newReport.Patrol_Name}
              onChange={handleChange}
              className="create-Report-input"
            />
          </div>

          <div className="create-Report-div">
            <label className="create-Report-label">משתתפים נוספים:</label>
            <input
              type="text"
              name="Other_Participants"
              value={newReport.Other_Participants}
              onChange={handleChange}
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
