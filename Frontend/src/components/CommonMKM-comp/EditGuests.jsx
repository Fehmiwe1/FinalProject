// EditGuest.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/EditGuest.css";

function EditGuest() {
  const [vehicles, setVehicles] = useState([]);
  const { id } = useParams(); // GuestNumber
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
      .catch(() => {
        setError("שגיאה בשליפת נתוני האורח.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    // מניעת קלט לא חוקי בזמן ההקלדה
    if (name === "GuestPhone" && !/^\d{0,10}$/.test(value)) return; // עד 10 ספרות
    if (name === "CarNumber" && !/^\d{0,8}$/.test(value)) return; // עד 8 ספרות (ולא יותר)

    // לא לאפשר ערכים שליליים במספרים
    if ((name === "CarNumber" || name === "GuestPhone") && Number(value) < 0)
      return;

    setVehicles((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        [name]: value,
      }))
    );
  };

  const handleDelete = async (guestId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק את הרכב הזה?")) return;

    try {
      await axios.delete(`/guests/delete/${guestId}`);
      setVehicles((prev) => prev.filter((v) => v.GuestID !== guestId));
      setMsg("הרכב נמחק בהצלחה.");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setError("שגיאה במחיקת הרכב.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCancelAddVehicle = (index) => {
    setVehicles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVehicle = () => {
    if (vehicles.length === 0) return;

    const base = vehicles[0];
    const newVehicle = {
      GuestNumber: base.GuestNumber,
      CarNumber: "",
      GuestName: "",
      GuestPhone: "",
      StartDate: base.StartDate,
      EndDate: base.EndDate,
      isNew: true, // סימון כרכב חדש
    };

    setVehicles((prev) => [...prev, newVehicle]);
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
      // ✅ מספר רכב: רק ספרות, 7–8 ספרות
      if (!/^\d{7,8}$/.test(v.CarNumber)) {
        setError("מספר רכב חייב להיות בין 7 ל-8 ספרות (ספרות בלבד).");
        return false;
      }
      // ✅ טלפון: בדיוק 10 ספרות
      if (!/^\d{10}$/.test(v.GuestPhone)) {
        setError("מספר טלפון חייב להכיל בדיוק 10 ספרות.");
        return false;
      }
      // ✅ שם בעברית בלבד
      if (!isHebrewText(v.GuestName)) {
        setError("שם האורח חייב להכיל אותיות בעברית בלבד.");
        return false;
      }
      // ✅ טווח תאריכים לכל רכב
      if (new Date(v.EndDate) < new Date(v.StartDate)) {
        setError(
          `קבלן מספר ${v.GuestNumber} – תאריך סיום לא יכול להיות לפני תאריך התחלה.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const promises = vehicles.map((v) => {
        if (v.GuestID) {
          return axios.put(`/guests/vehicle/${v.GuestID}`, v);
        } else {
          return axios.post(`/guests/addVehicle`, v);
        }
      });

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
          <div className="edit-guest-div">
            <h4>פרטים כלליים</h4>
            <label>מספר קבלן:</label>
            <input
              type="text"
              name="GuestNumber"
              value={vehicles[0]?.GuestNumber || ""}
              readOnly
            />
            <label>תאריך התחלה:</label>
            <input
              type="date"
              name="StartDate"
              value={vehicles[0]?.StartDate?.split("T")[0] || ""}
              onChange={handleGeneralChange}
            />
            <label>תאריך סיום:</label>
            <input
              type="date"
              name="EndDate"
              value={vehicles[0]?.EndDate?.split("T")[0] || ""}
              onChange={handleGeneralChange}
            />
          </div>

          {vehicles.map((vehicle, index) => (
            <div className="edit-guest-div" key={index}>
              <h4>רכב {index + 1}</h4>
              <label>מספר רכב:</label>
              <input
                type="text" // טקסט כדי לשלוט על קלט ספרות
                name="CarNumber"
                value={vehicle.CarNumber}
                onChange={(e) => handleChange(index, e)}
                maxLength="8"
                pattern="\d{7,8}"
                title="מספר רכב חייב להיות בין 7 ל-8 ספרות"
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
                maxLength="10"
                pattern="\d{10}"
                title="יש להזין בדיוק 10 ספרות"
              />

              {vehicle.GuestID ? (
                <button
                  type="button"
                  className="delete-vehicle-btn"
                  onClick={() => handleDelete(vehicle.GuestID)}
                >
                  מחק רכב
                </button>
              ) : (
                <button
                  type="button"
                  className="delete-vehicle-btn"
                  onClick={() => handleCancelAddVehicle(index)}
                >
                  בטל הוספה
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="add-guest-button"
            onClick={handleAddVehicle}
          >
            הוסף רכב
          </button>

          <button type="submit" className="edit-guest-btn">
            שמור
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditGuest;
