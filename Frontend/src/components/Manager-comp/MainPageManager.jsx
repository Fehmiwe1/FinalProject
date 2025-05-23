import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/MainPageManager.css";

function MainPageManager() {
  const [employees, setEmployees] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchEmployees();
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

  const handleApprove = (id, date) => {
    axios
      .put("/employeeNotifications/updateStatus", {
        ID_employee: id,
        status: "approval",
      })
      .then(() => {
        console.log("אושר:", id);
        fetchEmployees(); // טען מחדש את ההתראות
      })
      .catch((error) => {
        console.error("שגיאה באישור:", error);
      });
  };

  const handleReject = (id, date) => {
    axios
      .put("/employeeNotifications/updateStatus", {
        ID_employee: id,
        status: "rejection",
      })
      .then(() => {
        console.log("נדחה:", id);
        fetchEmployees(); // טען מחדש את ההתראות
      })
      .catch((error) => {
        console.error("שגיאה בדחייה:", error);
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
          <table className="notifications-table">
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
