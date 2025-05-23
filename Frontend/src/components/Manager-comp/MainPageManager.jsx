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
                <th>בקשה</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={`${emp.ID_employee}_${emp.event_date}`}>
                    <td>{emp.event_description}</td>
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
