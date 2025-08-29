// EntryConfirmation.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Kabat-styles/EntryConfirmation.css";

function EntryConfirmation() {
  const [contractorNumber, setContractorNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [result, setResult] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

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

    // ✅ בדיקה שמספר הרכב בין 7 ל-8 ספרות
    if (!/^\d{7,8}$/.test(vehicleNumber)) {
      setErrorMessage("⚠️ מספר רכב חייב להיות בין 7 ל-8 ספרות.");
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
    <div className="entryConfirmation-wrapper">
      <main className="entryConfirmation-body">
        <section className="entryConfirmation-entry-section">
          <h2>אישור כניסה</h2>
          {errorMessage && (
            <div className="entryConfirmation-error-message">
              {errorMessage}
            </div>
          )}
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
