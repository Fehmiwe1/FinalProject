import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/Incident.css";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

function Incident() {
  const [incident, setIncident] = useState([]);
  const [msg, setMsg] = useState("");
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  const userRole = Cookies.get("userRole");
  const canEdit = userRole === "manager" || userRole === "kabat";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("/post")
      .then((res) => setIncident(res.data))
      .catch(() => setMsg("אירעה שגיאה בטעינת הדוחות."));
  };

  const handleDelete = (post) => {
    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את הדוח: ${post.Incident_Name}?`
      )
    ) {
      axios
        .delete(`/post/${post.id}`)
        .then(() => {
          setIncident((prev) => prev.filter((item) => item.id !== post.id));
          setMsg("הדוח נמחק בהצלחה.");
          setTimeout(() => setMsg(""), 2000);
        })
        .catch(() => setMsg("אירעה שגיאה בעת מחיקת הדוח."));
    }
  };

  const validateDates = (start, end) => {
    if (start && end && new Date(end) < new Date(start)) {
      setDateError("⚠️ עד תאריך לא יכול להיות קטן מ־מתאריך.");
      setTimeout(() => setDateError(""), 3000);
    } else {
      setDateError("");
    }
  };

  const filteredIncidents = incident.filter((i) => {
    const nameMatch = i.Incident_Name?.toLowerCase().includes(
      searchName.toLowerCase()
    );
    const date = new Date(i.Incident_Date);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    const dateMatch = (!from || date >= from) && (!to || date <= to);
    return nameMatch && dateMatch;
  });

  return (
    <div className="incidentPpage">
      <div className="container-Incident">
        <div className="incidentPageContainer">
          <h1 className="incident-page-title">
            כאן תוכל לצפות בדוחות אירועים חריגים
          </h1>

          {canEdit && (
            <div className="create-incident">
              <Link to="/createIncident" className="btn">
                דוח אירוע חדש
              </Link>
            </div>
          )}

          {msg && <div className="msg">{msg}</div>}
          {dateError && (
            <div className="incidentPpage-date-error-message">{dateError}</div>
          )}

          <div className="search-filters">
            <div className="date-filter-inline">
              <label htmlFor="search">חיפוש לפי שם אירוע:</label>
              <input
                id="search"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="date-filter-inline">
              <label htmlFor="from">מתאריך:</label>
              <input
                id="from"
                type="date"
                value={startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setStartDate(newStart);
                  validateDates(newStart, endDate);
                }}
              />
            </div>
            <div className="date-filter-inline">
              <label htmlFor="to">עד תאריך:</label>
              <input
                id="to"
                type="date"
                value={endDate}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  setEndDate(newEnd);
                  validateDates(startDate, newEnd);
                }}
              />
            </div>
          </div>

          <table className="requestsNotifications-table">
            <thead>
              <tr>
                <th>שם אירוע</th>
                <th>תאריך אירוע</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>{incident.Incident_Name}</td>
                    <td>
                      {new Date(incident.Incident_Date).toLocaleDateString(
                        "he-IL",
                        {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }
                      )}
                    </td>
                    <td>
                      <Link to={`/post/${incident.id}`} className="view-button">
                        צפייה
                      </Link>
                      {canEdit && (
                        <>
                          <Link
                            to={`/editincident/${incident.id}`}
                            className="edit-button"
                          >
                            עריכה
                          </Link>
                          <button
                            className="delete-btn-incident"
                            onClick={() => handleDelete(incident)}
                          >
                            מחיקה
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">לא נמצאו תוצאות מתאימות.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Incident;
