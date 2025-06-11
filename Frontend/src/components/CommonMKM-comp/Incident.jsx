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
  const isManager = Cookies.get("userRole");

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

          {isManager === "manager" && (
            <div className="create-incident">
              <Link to="/createIncident" className="btn">
                דוח אירוע חדש
              </Link>
            </div>
          )}

          {msg && <div className="msg">{msg}</div>}

          <div className="search-filters">
            <input
              type="text"
              placeholder="חיפוש לפי שם אירוע"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <div className="date-filter-inline">
              <label>מתאריך- </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-filter-inline">
              <label>עד תאריך- </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
                        "he-IL"
                      )}
                    </td>
                    <td>
                      <Link to={`/post/${incident.id}`} className="view-button">
                        צפייה
                      </Link>
                      {isManager === "manager" && (
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
