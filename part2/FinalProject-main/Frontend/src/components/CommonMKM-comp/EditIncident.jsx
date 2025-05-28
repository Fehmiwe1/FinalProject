import React, { useState, useEffect } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/EditIncident.css";

function EditIncident() {
  const [post, setPost] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const [editReport, setEditReport] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
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
  };

  const updateReport = (reportToSend) => {
    axios
      .put(`/post/${id}`, reportToSend)
      .then((res) => {
        console.log("אירוע עודכן:", res.data);
        setMsg("האירוע עודכן בהצלחה.");
        setTimeout(() => {
          setMsg("");
          navigate("/Incident");
        }, 2000);
      })
      .catch((error) => {
        console.error("שגיאה:", error);
        setError("עדכון האירוע נכשל.");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditReport((prevPost) => ({
      ...prevPost,
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
      ID_Employee: editReport.ID_Employee,
      Description: cleanString(editReport.Description),
    };

    if (
      !cleanedReport.Incident_Name ||
      !cleanedReport.Incident_Date ||
      !cleanedReport.ID_Employee ||
      !cleanedReport.Description
    ) {
      setError("יש למלא את כל השדות החיוניים.");
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

    if (isNaN(cleanedReport.ID_Employee) || cleanedReport.ID_Employee <= 0) {
      setError("מספר עובד חייב להיות מספר חיובי.");
      return;
    }

    if (cleanedReport.Description.length < 11) {
      setError("התיאור חייב להכיל לפחות 11 תווים.");
      return;
    }

    setError("");
    updateReport(cleanedReport);
  };

  if (loading) {
    return <div>טוען נתוני אירוע...</div>;
  }

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
                required
                className="edit-Report-input"
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">תאריך האירוע:</label>
              <input
                type="datetime-local"
                name="Incident_Date"
                value={editReport.Incident_Date}
                onChange={handleChange}
                required
                className="edit-Report-input"
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">מספר עובד:</label>
              <input
                type="number"
                name="ID_Employee"
                value={editReport.ID_Employee}
                onChange={handleChange}
                required
                className="edit-Report-input"
              />
            </div>
            <div className="edit-Report-div">
              <label className="edit-Report-label">תיאור האירוע:</label>
              <textarea
                name="Description"
                value={editReport.Description}
                onChange={handleChange}
                required
                className="edit-Report-textarea"
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
