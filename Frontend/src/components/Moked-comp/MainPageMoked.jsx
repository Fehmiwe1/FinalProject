import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Moked-styles/MainPageMoked.css";

function MainPageMoked() {
  const [contractorNumber, setContractorNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [result, setResult] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const formatDateToHebrew = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get("/employeeRequests/pendingRequests");
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Error loading pending requests", error);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await axios.get("/employeeNotifications/getTasks");
        setTasks(res.data);
      } catch (error) {
        console.error("Error loading tasks", error);
      }
    };

    fetchPendingRequests();
    fetchTasks();
  }, []);

  const handleSearch = async () => {
    setErrorMessage("");
    setResult("");

    const contractorNum = Number(contractorNumber);
    const vehicleNum = Number(vehicleNumber);

    if (isNaN(contractorNum) || isNaN(vehicleNum)) {
      setErrorMessage("⚠️ יש להזין מספרים חוקיים בלבד.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (contractorNum < 0 || vehicleNum < 0) {
      setErrorMessage("⚠️ מספר קבלן ומספר רכב לא יכולים להיות שליליים.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    try {
      const response = await axios.post("/guests/check", {
        contractorNumber: contractorNum,
        vehicleNumber: vehicleNum,
      });

      const { status } = response.data;

      if (status === "authorized") {
        setResult("✅ רכב מורשה להיכנס");
      } else if (status === "contractor_not_found") {
        setResult("❌ קבלן לא קיים במערכת");
      } else if (status === "vehicle_not_found") {
        setResult("❌ מספר הרכב לא משויך לקבלן");
      } else {
        setResult("❌ אין הרשאה לכניסה");
      }
    } catch (error) {
      setResult("⚠️ שגיאה בעת הבדיקה");
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("/guests");
        setAlerts(response.data);
      } catch (error) {
        console.error("Error loading guests", error);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <div className="mainPageMoked-wrapper">
      <main className="mainPageMoked-body">
        <section className="mainPageMoked-alerts-section">
          <h3>התראות/בקשות</h3>
          <table>
            <thead>
              <tr>
                <th>סוג בקשה</th>
                <th>תאריך שליחה</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req, index) => (
                <tr key={index}>
                  <td>{req.request_type}</td>
                  <td>{formatDateToHebrew(req.request_date)}</td>
                  <td>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>משימות</h3>
          <table>
            <thead>
              <tr>
                <th>תיאור משימה</th>
                <th>תאריך משימה</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.event_description}</td>
                  <td>{formatDateToHebrew(task.event_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mainPageMoked-entry-section">
          <h2>אישור כניסה</h2>
          {errorMessage && (
            <div className="mainPageMoked-error-message">{errorMessage}</div>
          )}
          <div className="mainPageMoked-fields-row">
            <div className="mainPageMoked-field-group">
              <label>מספר קבלן</label>
              <input
                type="text"
                value={contractorNumber}
                onChange={(e) => setContractorNumber(e.target.value)}
              />
            </div>

            <div className="mainPageMoked-field-group">
              <label>מספר רכב</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>
          </div>
          <button className="mainPageMoked-btn-search" onClick={handleSearch}>
            חיפוש
          </button>

          <div className="mainPageMoked-result-container">
            <label>תוצאה</label>
            <div className="mainPageMoked-result-box">
              <p>{result}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainPageMoked;
