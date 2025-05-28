import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/EditGuest.css";

function EditGuest() {
  const [guest, setGuest] = useState(null);
  const { id } = useParams(); // id הוא מזהה רשומה בטבלת guests
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/guests/${id}`)
      .then((res) => {
        if (res.data.length > 0) {
          setGuest(res.data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("שגיאה בשליפת נתוני האורח.");
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (
      !guest.GuestNumber ||
      !guest.CarNumber ||
      !guest.GuestName ||
      !guest.GuestPhone ||
      !guest.StartDate ||
      !guest.EndDate
    ) {
      setError("יש למלא את כל השדות.");
      return false;
    }

    if (!/^\d+$/.test(guest.GuestNumber)) {
      setError("מספר קבלן חייב להכיל רק ספרות.");
      return false;
    }

    if (!/^\d{10}$/.test(guest.GuestPhone)) {
      setError("מספר טלפון חייב להכיל בדיוק 10 ספרות.");
      return false;
    }

    if (new Date(guest.EndDate) < new Date(guest.StartDate)) {
      setError("תאריך סיום חייב להיות אחרי תאריך התחלה.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    axios
      .put(`/guests/${id}`, guest)
      .then(() => {
        setMsg("פרטי האורח עודכנו בהצלחה.");
        setTimeout(() => navigate("/guests"), 2000);
      })
      .catch(() => {
        setError("אירעה שגיאה בעדכון הנתונים.");
      });
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
        {guest && (
          <form className="edit-guest-form" onSubmit={handleSubmit}>
            <div className="edit-guest-div">
              <label>מספר קבלן:</label>
              <input
                type="text"
                name="GuestNumber"
                value={guest.GuestNumber}
                onChange={handleChange}
              />
            </div>
            <div className="edit-guest-div">
              <label>מספר רכב:</label>
              <input
                type="text"
                name="CarNumber"
                value={guest.CarNumber}
                onChange={handleChange}
              />
            </div>
            <div className="edit-guest-div">
              <label>שם אורח:</label>
              <input
                type="text"
                name="GuestName"
                value={guest.GuestName}
                onChange={handleChange}
              />
            </div>
            <div className="edit-guest-div">
              <label>טלפון:</label>
              <input
                type="text"
                name="GuestPhone"
                value={guest.GuestPhone}
                onChange={handleChange}
              />
            </div>
            <div className="edit-guest-div">
              <label>תאריך התחלה:</label>
              <input
                type="date"
                name="StartDate"
                value={guest.StartDate?.split("T")[0]}
                onChange={handleChange}
              />
            </div>
            <div className="edit-guest-div">
              <label>תאריך סיום:</label>
              <input
                type="date"
                name="EndDate"
                value={guest.EndDate?.split("T")[0]}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="edit-guest-btn">
              שמור
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditGuest;
