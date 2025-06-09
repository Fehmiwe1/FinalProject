import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/RequestsManagement.css";
import Cookies from "js-cookie";

function RequestsManagement() {
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState("");
  const dontShow = Cookies.get("eventDescription");

  useEffect(() => {
    fetchEmployees();
    fetchRequests();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/employeeNotifications");
      setEmployees(res.data);
    } catch (error) {
      console.error("שגיאה:", error);
      setMsg("אירעה שגיאה בטעינת ההתראות.");
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/employeeRequests");
      setRequests(res.data);
    } catch (error) {
      console.error("שגיאה בטעינת בקשות חופשה/מחלה:", error);
    }
  };

  const handleApprove = (id, date) => {
    axios
      .put("/employeeNotifications/updateStatus", {
        ID_employee: id,
        status: "approval",
      })
      .then(() => fetchEmployees())
      .catch((error) => console.error("שגיאה באישור:", error));
  };

  const handleReject = (id, date) => {
    axios
      .put("/employeeNotifications/updateStatus", {
        ID_employee: id,
        status: "rejection",
      })
      .then(() => fetchEmployees())
      .catch((error) => console.error("שגיאה בדחייה:", error));
  };

  const handleVacationStatusUpdate = (id, status) => {
    axios
      .put("/employeeRequests/updateVacationStatus", { id, status })
      .then(() => fetchRequests())
      .catch((error) => console.error("שגיאה בעדכון סטטוס חופשה:", error));
  };

  return (
    <div className="requestsManagement">
      <div className="requestsManagement-container">
        <div className="requestsNotifications-container">
          <form className="requestsNotifications-form">
            <h1>התראות</h1>
          </form>
          {msg && <div className="error-message">{msg}</div>}
          <table className="requestsNotifications-table">
            <thead>
              <tr>
                <th>שם עובד</th>
                <th>בקשה</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={`${emp.ID_employee}_${emp.event_date}`}>
                    <td>
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td>{emp.event_description}</td>
                    <td>
                      <button
                        onClick={() =>
                          handleApprove(emp.ID_employee, emp.event_date)
                        }
                        className="approve-btn"
                      >
                        אישור
                      </button>
                      <button
                        onClick={() =>
                          handleReject(emp.ID_employee, emp.event_date)
                        }
                        className="reject-btn"
                      >
                        דחייה
                      </button>
                      {dontShow !== "הרשמת עובד חדש" && (
                        <button className="view-btn">צפייה</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">לא נמצאו התראות.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* טבלת בקשות חופשה ומחלה */}
          <h2 style={{ marginTop: "40px" }}>בקשות חופשה ומחלה</h2>
          <table className="requestsNotifications-table">
            <thead>
              <tr>
                <th>שם עובד</th>
                <th>סוג בקשה</th>
                <th>תאריך בקשה</th>
                <th>מתאריך</th>
                <th>עד תאריך</th>
                <th>סטטוס</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={`${req.id}`}>
                    <td>
                      {req.firstName} {req.lastName}
                    </td>
                    <td>{req.requestType}</td>
                    <td>{req.requestDate}</td>
                    <td>{req.fromDate || "-"}</td>
                    <td>{req.toDate || "-"}</td>
                    <td>{req.requestType === "חופשה" ? req.status : ""}</td>
                    <td>
                      {req.requestType === "חופשה" &&
                        req.status === "ממתין" && (
                          <>
                            <button
                              className="approve-btn"
                              onClick={() =>
                                handleVacationStatusUpdate(req.id, "אושר")
                              }
                            >
                              אישור
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() =>
                                handleVacationStatusUpdate(req.id, "נדחה")
                              }
                            >
                              דחייה
                            </button>
                          </>
                        )}

                      {req.requestType === "מחלה" && req.filePath && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          <a
                            href={`/${req.filePath.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="view-btn"
                          >
                            צפייה בקובץ
                          </a>
                          <a
                            href={`/${req.filePath.replace(/\\/g, "/")}`}
                            download
                            className="download-btn"
                          >
                            הורדה
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">לא נמצאו בקשות.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RequestsManagement;
