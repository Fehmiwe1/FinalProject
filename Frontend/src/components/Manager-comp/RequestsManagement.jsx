import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/RequestsManagement.css";
import Cookies from "js-cookie";

function RequestsManagement() {
  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState("");
  const [showHistory, setShowHistory] = useState(false);

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
      .then(() => {
        setRequests((prev) =>
          prev.filter((req) => !(req.id === id && req.requestType === "חופשה"))
        );
      })
      .catch((error) => console.error("שגיאה בעדכון סטטוס חופשה:", error));
  };

  const downloadPDFFile = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("שגיאה בהורדת הקובץ:", error);
    }
  };

  const formatDateToHebrew = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const vacationRequests = requests
    .filter((req) => req.requestType === "חופשה" && req.status === "ממתין")
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    const sickRequests = requests
      .filter((req) => {
        if (req.requestType !== "מחלה") return false;

        const requestDate = new Date(req.requestDate);
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        return requestDate >= oneMonthAgo && requestDate <= today;
      })
      .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
  
  return (
    <div className="requestsManagement">
      <div className="requestsManagement-container">
        <div className="requestsNotifications-container">
          <form className="requestsNotifications-form">
            <h1 className="titleH1">התראות</h1>
          </form>
          {msg && <div className="error-message">{msg}</div>}

          <h2 className="titleH2">בקשות חופשה</h2>
          <button
            className="history-toggle-btn"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "הסתר היסטוריה" : "הצג היסטוריה"}
          </button>

          <table className="requestsNotifications-table">
            <thead>
              <tr>
                <th>שם עובד</th>
                <th>תאריך בקשה</th>
                <th>מתאריך</th>
                <th>עד תאריך</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {vacationRequests.length > 0 ? (
                vacationRequests.map((req) => (
                  <tr key={`${req.id}`}>
                    <td>
                      {req.firstName} {req.lastName}
                    </td>
                    <td>{formatDateToHebrew(req.requestDate)}</td>
                    <td>{formatDateToHebrew(req.fromDate)}</td>
                    <td>{formatDateToHebrew(req.toDate)}</td>

                    <td>
                      {req.status === "ממתין" && (
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
                              handleVacationStatusUpdate(req.id, "סורב")
                            }
                          >
                            דחייה
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">לא נמצאו בקשות חופשה.</td>
                </tr>
              )}
            </tbody>
          </table>
          {showHistory && (
            <>
              <h3 className="titleH3">היסטוריית בקשות חופשה</h3>
              <table className="requestsNotifications-table">
                <thead>
                  <tr>
                    <th>שם עובד</th>
                    <th>תאריך בקשה</th>
                    <th>מתאריך</th>
                    <th>עד תאריך</th>
                    <th>סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {requests
                    .filter(
                      (req) =>
                        req.requestType === "חופשה" && req.status !== "ממתין"
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.requestDate) - new Date(a.requestDate)
                    )
                    .map((req) => (
                      <tr key={`history-${req.id}`}>
                        <td>
                          {req.firstName} {req.lastName}
                        </td>
                        <td>{formatDateToHebrew(req.requestDate)}</td>
                        <td>{formatDateToHebrew(req.fromDate)}</td>
                        <td>{formatDateToHebrew(req.toDate)}</td>
                        <td>{req.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </>
          )}

          <h2 className="titleH2">בקשות מחלה</h2>
          <table className="requestsNotifications-table">
            <thead>
              <tr>
                <th>שם עובד</th>
                <th>תאריך בקשה</th>
                <th>קובץ</th>
              </tr>
            </thead>
            <tbody>
              {sickRequests.length > 0 ? (
                sickRequests.map((req) => (
                  <tr key={`${req.id}`}>
                    <td>
                      {req.firstName} {req.lastName}
                    </td>
                    <td>{formatDateToHebrew(req.requestDate)}</td>

                    <td>
                      {req.filePath && (
                        <div className="file-actions">
                          <button
                            className="download-btn"
                            onClick={() =>
                              downloadPDFFile(
                                `/uploads/${req.filePath
                                  .replace(/\\/g, "/")
                                  .split("uploads/")
                                  .pop()}`,
                                `אישור_מחלה_${req.firstName}_${req.lastName}.pdf`
                              )
                            }
                          >
                            הורדה
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">לא נמצאו בקשות מחלה.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h2 className="titleH2">עובדים חדשים</h2>
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
                    <td>{formatDateToHebrew(emp.event_date)}</td>
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
        </div>
      </div>
    </div>
  );
}

export default RequestsManagement;
