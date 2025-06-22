import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/EditIncident.css";

function EditIncident() {
  const [editReport, setEditReport] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/post/${id}`)
      .then((res) => {
        if (res.data.length > 0) {
          const reportData = res.data[0];
          if (reportData.Incident_Date) {
            const dateObj = new Date(reportData.Incident_Date);
            reportData.Incident_Date = dateObj.toISOString().slice(0, 16);
          }
          setEditReport(reportData);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("שגיאה בשליפת נתוני האירוע:", error);
        setError("שגיאה בשליפת הנתונים.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditReport((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cleanString = (str) => str.trim().replace(/\s+/g, " ");

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date().toISOString().slice(0, 16);

    if (!editReport) return;

    const cleanedReport = {
      Incident_Name: cleanString(editReport.Incident_Name),
      Incident_Date: editReport.Incident_Date,
      Kabat_Name: cleanString(editReport.Kabat_Name),
      Dispatcher_Name: cleanString(editReport.Dispatcher_Name),
      Patrol_Name: cleanString(editReport.Patrol_Name),
      Other_Participants: cleanString(editReport.Other_Participants),
      Description: cleanString(editReport.Description),
    };

    // בדיקות
    if (
      !cleanedReport.Incident_Name ||
      !cleanedReport.Incident_Date ||
      !cleanedReport.Kabat_Name ||
      !cleanedReport.Description
    ) {
      setError("אנא מלא את כל השדות החיוניים.");
      return;
    }

    if (cleanedReport.Incident_Name.length < 5) {
      setError("שם האירוע חייב להכיל לפחות 5 תווים.");
      return;
    }

    if (!cleanedReport.Incident_Date || cleanedReport.Incident_Date > now) {
      setError("תאריך האירוע חייב להיות היום או בעבר.");
      return;
    }

    if (cleanedReport.Description.length < 11) {
      setError("התיאור חייב להכיל לפחות 11 תווים.");
      return;
    }

    setError("");
    axios
      .put(`/post/${id}`, cleanedReport)
      .then((res) => {
        console.log("🎉 עודכן:", res.data);
        setMsg("האירוע עודכן בהצלחה.");
        setTimeout(() => {
          setMsg("");
          navigate("/Incident");
        }, 2000);
      })
      .catch((error) => {
        console.error("שגיאה בעדכון:", error);
        setError("עדכון האירוע נכשל.");
      });
  };

  if (loading) return <div>טוען נתונים...</div>;

  return (
    <div className="main">
      <div className="edit-report">
        <button className="close-button" onClick={() => navigate("/Incident")}>
          ✕
        </button>
        <h2>עריכת דיווח אירוע</h2>
        {error && <p className="error-message">{error}</p>}
        {msg && <p className="success-msg">{msg}</p>}
        {editReport && (
          <form className="edit-Report-form" onSubmit={handleSubmit}>
            <div className="edit-Report-div">
              <label className="edit-Report-label">שם האירוע:</label>
              <input
                type="text"
                name="Incident_Name"
                value={editReport.Incident_Name}
                onChange={handleChange}
                className="edit-Report-input"
                required
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">תאריך האירוע:</label>
              <input
                type="datetime-local"
                name="Incident_Date"
                value={editReport.Incident_Date}
                onChange={handleChange}
                className="edit-Report-input"
                required
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">שם קב"ט:</label>
              <input
                type="text"
                name="Kabat_Name"
                value={editReport.Kabat_Name}
                onChange={handleChange}
                className="edit-Report-input"
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">שם מוקדנית:</label>
              <input
                type="text"
                name="Dispatcher_Name"
                value={editReport.Dispatcher_Name}
                onChange={handleChange}
                className="edit-Report-input"
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">שם סייר רכוב:</label>
              <input
                type="text"
                name="Patrol_Name"
                value={editReport.Patrol_Name}
                onChange={handleChange}
                className="edit-Report-input"
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">משתתפים נוספים:</label>
              <input
                type="text"
                name="Other_Participants"
                value={editReport.Other_Participants}
                onChange={handleChange}
                className="edit-Report-input"
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">תיאור האירוע:</label>
              <textarea
                name="Description"
                value={editReport.Description}
                onChange={handleChange}
                className="edit-Report-textarea"
                required
              />
            </div>
            <button className="edit-Report-btn" type="submit">
              שמור
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditIncident;
