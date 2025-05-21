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
      const response = await axios.post("/entries/check", {
        contractorNumber,
        vehicleNumber,
      });

      if (response.data.authorized) {
        setResult("רכב מורשה להיכנס");
      } else {
        setResult("אין הרשאה לכניסה");
      }
    } catch (error) {
      setResult("שגיאה בעת הבדיקה");
    }
  };

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get("/alerts");
        setAlerts(response.data);
      } catch (error) {
        console.error("Error loading alerts", error);
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

          <button onClick={handleSearch}>חיפוש</button>

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
