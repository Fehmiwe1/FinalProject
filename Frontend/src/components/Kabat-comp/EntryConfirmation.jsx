import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Kabat-styles/EntryConfirmation.css";

function EntryConfirmation() {
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
    <div className="entryConfirmation-wrapper">
      <main className="entryConfirmation-body">
        <section className="entryConfirmation-entry-section">
          <h2>אישור כניסה</h2>

          <div className="entryConfirmation-fields-row">
            <div className="entryConfirmation-field-group">
              <label>מספר קבלן</label>
              <input
                type="text"
                value={contractorNumber}
                onChange={(e) => setContractorNumber(e.target.value)}
              />
            </div>

            <div className="entryConfirmation-field-group">
              <label>מספר רכב</label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </div>
          </div>

          <button
            className="entryConfirmation-btn-search"
            onClick={handleSearch}
          >
            חיפוש
          </button>

          <div className="entryConfirmation-result-container">
            <label>תוצאה</label>
            <div className="entryConfirmation-result-box">
              <p>{result}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default EntryConfirmation;
