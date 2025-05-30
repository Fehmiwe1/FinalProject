import React, { useState, useEffect } from "react";
import axios from "axios";

import "../../assets/styles/Guerd-styles/MainPageGuerd.css";

function MainPageGuerd() {
  const [contractorNumber, setContractorNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [result, setResult] = useState("");
  const [alerts, setAlerts] = useState([]);

  const handleSearch = async () => {
    try {
      const response = await axios.post("/guests/check", {
        contractorNumber,
        vehicleNumber,
      });

      const { status, message } = response.data;

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
    <div className="mainPageGuerd-wrapper">
      <main className="mainPageGuerd-body">
        <section className="alerts-section">
          <h3>התראות</h3>
          <table>
            <thead>
              <tr>
                <th>תאריך</th>
                <th>הודעה</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={index}>
                  <td>{alert.date}</td>
                  <td>{alert.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="entry-section">
          <h2>אישור כניסה</h2>

          <label>מספר קבלן</label>
          <input
            type="text"
            value={contractorNumber}
            onChange={(e) => setContractorNumber(e.target.value)}
          />

          <label>מספר רכב</label>
          <input
            type="text"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />

          <button className="btn-search" onClick={handleSearch}>
            חיפוש
          </button>

          <div className="result-container">
            <label>תוצאה</label>
            <div className="result-box">
              <p>{result}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MainPageGuerd;
