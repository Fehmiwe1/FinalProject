import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/MainPageManager.css";

function MainPageManager() {
  const [employees, setEmployees] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchAlerts();
  }, []);

  const fetchEmployees = async () => {
    axios
      .get("/employeeNotifications")
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((error) => {
        console.error("שגיאה:", error);
        setMsg("אירעה שגיאה בטעינת ההתראות.");
      });
  };

  const fetchAlerts = async () => {
    axios
      .get("/employeeRequests/pendingAlerts")
      .then((res) => {
        setAlerts(res.data);
      })
      .catch((error) => {
        console.error("שגיאה בטעינת בקשות:", error);
      });
  };

  return (
    <div className="mainPageManager">
      <div className="mainPageManager-container">
        <div className="notifications-container">
          <form className="notifications-form">
            <h1>התראות</h1>
          </form>

          {msg && <div className="error-message">{msg}</div>}

          {!msg && employees.length === 0 && alerts.length === 0 && (
            <div className="no-notifications-message">אין התראות להצגה.</div>
          )}

          {/* התראות רגילות */}
          <table className="notifications-table">
            <tbody>
              {employees.length > 0 &&
                employees.map((emp) => (
                  <tr key={`${emp.ID_employee}_${emp.event_date}`}>
                    <td>{emp.event_description}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* התראות בקשות חופשה/מחלה */}
          {alerts.length > 0 && (
            <>
              <h2 style={{ marginTop: "20px" }}>בקשות חופשה/מחלה ממתינות</h2>
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th>שם עובד</th>
                    <th>סוג בקשה</th>
                    <th>תאריך בקשה</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>
                        {alert.firstName} {alert.lastName}
                      </td>
                      <td>{alert.type}</td>
                      <td>{alert.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <div className="WorkArrangement-container">
          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - מאבטחים</h1>
            </form>
            <p>dsfdsf sf sf s</p>
          </div>
          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - מוקד</h1>
            </form>
            <p>dsfdsf sf sf s</p>
          </div>
          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - קבט"ים</h1>
            </form>
            <p>dsfdsf sf sf s</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPageManager;
