import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/CreateGuests.css";

function CreateGuests() {
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [GuestNumber, setGuestNumber] = useState("");
  const [StartDate, setStartDate] = useState("");
  const [EndDate, setEndDate] = useState("");
  const [vehicles, setVehicles] = useState([
    { CarNumber: "", GuestName: "", GuestPhone: "" },
  ]);

  const navigate = useNavigate();

  const handleVehicleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVehicles = [...vehicles];

    if (name === "GuestPhone" && !/^\d{0,10}$/.test(value)) return;

    updatedVehicles[index][name] = value;
    setVehicles(updatedVehicles);
  };

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      { CarNumber: "", GuestName: "", GuestPhone: "" },
    ]);
  };

  const removeVehicle = (index) => {
    const updated = [...vehicles];
    updated.splice(index, 1);
    setVehicles(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!GuestNumber || !StartDate || !EndDate) {
      setError("יש למלא מספר קבלן ותאריכים.");
      setTimeout(() => setError(""), 1000 * 60 * 60 * 24 * 730);
      return;
    }

    if (!/^\d+$/.test(GuestNumber)) {
      setError("מספר קבלן חייב להכיל ספרות בלבד.");
      setTimeout(() => setError(""), 1000 * 60 * 60 * 24 * 730);
      return;
    }

    for (let v of vehicles) {
      if (!v.CarNumber || !v.GuestName || !v.GuestPhone) {
        setError("יש למלא את כל שדות הרכב.");
        setTimeout(() => setError(""), 1000 * 60 * 60 * 24 * 730);
        return;
      }
      if (!/^\d{10}$/.test(v.GuestPhone)) {
        setError("מספר טלפון חייב להכיל בדיוק 10 ספרות.");
        setTimeout(() => setError(""), 1000 * 60 * 60 * 24 * 730);
        return;
      }
    }

    try {
      const promises = vehicles.map((v) =>
        axios.post("/guests", {
          GuestNumber,
          StartDate,
          EndDate,
          ...v,
        })
      );
      await Promise.all(promises);
      setMsg("קבלן נוספו בהצלחה!");
      setTimeout(() => {
        setMsg("");
        navigate("/guests");
      }, 2500);
    } catch (err) {
      console.error(err);
      setError("התרחשה שגיאה בהוספת קבלן.");
      setTimeout(() => setError(""), 1000 * 60 * 60 * 24 * 730);
    }
  };

  return (
    <div className="main">
      <div className="create-guest">
        <button className="close-button" onClick={() => navigate("/guests")}>
          ✕
        </button>
        <h2>הוספת קבלן</h2>
        {msg && <div className="success-msg">{msg}</div>}
        {error && <p className="error-message">{error}</p>}
        <form className="create-guest-form" onSubmit={handleSubmit}>
          <div className="create-guest-div">
            <label className="create-guest-label">מספר קבלן:</label>
            <input
              type="text"
              className="create-guest-input"
              value={GuestNumber}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  setGuestNumber(e.target.value);
                }
              }}
              required
            />
          </div>
          <div className="create-guest-div">
            <label className="create-guest-label">תאריך התחלה:</label>
            <input
              type="date"
              className="create-guest-input"
              value={StartDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="create-guest-div">
            <label className="create-guest-label">תאריך סיום:</label>
            <input
              type="date"
              className="create-guest-input"
              value={EndDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {vehicles.map((vehicle, index) => (
            <div className="create-guest-div" key={index}>
              <hr />
              <label className="create-guest-label">רכב {index + 1}:</label>
              <label className="create-guest-label">מספר רכב:</label>
              <input
                type="text"
                name="CarNumber"
                value={vehicle.CarNumber}
                onChange={(e) => handleVehicleChange(index, e)}
                className="create-guest-input"
                required
              />
              <label className="create-guest-label">שם קבלן:</label>
              <input
                type="text"
                name="GuestName"
                value={vehicle.GuestName}
                onChange={(e) => handleVehicleChange(index, e)}
                className="create-guest-input"
                required
              />
              <label className="create-guest-label">טלפון:</label>
              <input
                type="tel"
                name="GuestPhone"
                value={vehicle.GuestPhone}
                onChange={(e) => handleVehicleChange(index, e)}
                className="create-guest-input"
                required
                maxLength="10"
                pattern="\d{10}"
                title="יש להזין בדיוק 10 ספרות"
              />
              {vehicles.length > 1 && (
                <button
                  type="button"
                  className="remove-vehicle-btn"
                  onClick={() => removeVehicle(index)}
                >
                  הסר רכב
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="add-guest-button"
            onClick={addVehicle}
          >
            הוסף רכב נוסף
          </button>

          <button type="submit" className="create-guest-button">
            שלח
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateGuests;
