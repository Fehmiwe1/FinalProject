import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/Guerd-styles/MainPage.css";

function MainPage() {
  const navigate = useNavigate();
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
    <div className="main-wrapper">
    

      <main className="main-body">

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
            <h3 className="result-title">תוצאה</h3>
            <div className="result-box">
              <p>{result}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        כל הזכויות שמורות - מערכת ניהול שערים © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default MainPage;