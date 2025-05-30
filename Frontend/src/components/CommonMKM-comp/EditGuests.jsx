import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/EditGuest.css";

function EditGuest() {
  const [vehicles, setVehicles] = useState([]);
  const { id } = useParams(); // id הוא GuestNumber
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const isHebrewText = (text) => /^[֐-׿\s]+$/.test(text);

  useEffect(() => {
    axios
      .get(`/guests/${id}`)
      .then((res) => {
        if (res.data.length > 0) {
          setVehicles(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("שגיאה בשליפת נתוני האורח.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    if ((name === "CarNumber" || name === "GuestPhone") && Number(value) < 0)
      return;

    setVehicles((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const validate = () => {
    if (
      !vehicles[0]?.GuestNumber ||
      !vehicles[0]?.StartDate ||
      !vehicles[0]?.EndDate
    ) {
      setError("יש למלא מספר קבלן ותאריכים.");
      setTimeout(() => setError(""), 3000);
      return false;
    }

    for (let v of vehicles) {
      if (!v.CarNumber || !v.GuestName || !v.GuestPhone) {
        setError("יש למלא את כל שדות הרכב.");
        return false;
      }
      if (!/^[0-9]{1,10}$/.test(v.CarNumber)) {
        setError("מספר רכב חייב להכיל 1-10 ספרות.");
        return false;
      }
      if (!/^[0-9]{10}$/.test(v.GuestPhone)) {
        setError("מספר טלפון חייב להכיל בדיוק 10 ספרות.");
        return false;
      }
      if (!isHebrewText(v.GuestName)) {
        setError("שם האורח חייב להכיל אותיות בעברית בלבד.");
        return false;
      }
    }

    if (new Date(vehicles[0].EndDate) < new Date(vehicles[0].StartDate)) {
      setError("תאריך סיום חייב להיות אחרי תאריך התחלה.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const promises = vehicles.map((v) =>
        axios.put(`/guests/${v.GuestNumber}`, v)
      );
      await Promise.all(promises);
      setMsg("פרטי האורח עודכנו בהצלחה.");
      setTimeout(() => navigate("/guests"), 2000);
    } catch {
      setError("אירעה שגיאה בעדכון הנתונים.");
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) return <div>טוען נתונים...</div>;

  return (
    <div className="main">
      <div className="edit-guest">
        <button className="close-button" onClick={() => navigate("/guests")}>
          ✕
        </button>
        <h2>עריכת פרטי אורח</h2>
        {error && <p className="error-message">{error}</p>}
        {msg && <p className="success-msg">{msg}</p>}
        <form className="edit-guest-form" onSubmit={handleSubmit}>
          {vehicles.map((vehicle, index) => (
            <div className="edit-guest-div" key={vehicle.id}>
              <h4>רכב {index + 1}</h4>
              <label>מספר קבלן:</label>
              <input
                type="text"
                name="GuestNumber"
                value={vehicle.GuestNumber}
                readOnly
              />
              <label>מספר רכב:</label>
              <input
                type="number"
                min="0"
                name="CarNumber"
                value={vehicle.CarNumber}
                onChange={(e) => handleChange(index, e)}
              />
              <label>שם אורח:</label>
              <input
                type="text"
                name="GuestName"
                value={vehicle.GuestName}
                onChange={(e) => handleChange(index, e)}
              />
              <label>טלפון:</label>
              <input
                type="text"
                name="GuestPhone"
                value={vehicle.GuestPhone}
                onChange={(e) => handleChange(index, e)}
              />
              <label>תאריך התחלה:</label>
              <input
                type="date"
                name="StartDate"
                value={vehicle.StartDate?.split("T")[0]}
                onChange={(e) => handleChange(index, e)}
              />
              <label>תאריך סיום:</label>
              <input
                type="date"
                name="EndDate"
                value={vehicle.EndDate?.split("T")[0]}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
          ))}
          <button type="submit" className="edit-guest-btn">
            שמור
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditGuest;
