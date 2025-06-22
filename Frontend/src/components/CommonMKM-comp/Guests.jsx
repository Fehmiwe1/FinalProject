import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/Guests.css";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

function Guests() {
  const [guests, setGuests] = useState([]);
  const [msg, setMsg] = useState("");
  const [numberError, setNumberError] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const isManager = Cookies.get("userRole");

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = () => {
    axios
      .get("/guests")
      .then((res) => setGuests(res.data))
      .catch(() => setMsg("אירעה שגיאה בטעינת הקבלנים."));
  };

  const handleToggleAccess = (guest) => {
    const newStatus = guest.IsActive === 1 ? 0 : 1;
    const action = newStatus === 0 ? "לחסום" : "להפעיל מחדש";

    if (
      window.confirm(
        `האם אתה בטוח שברצונך ${action} את הקבלן ${guest.GuestNumber}?`
      )
    ) {
      axios
        .put(`/guests/${guest.GuestNumber}/status`, { IsActive: newStatus })
        .then(() => {
          setGuests((prev) =>
            prev.map((g) =>
              g.GuestNumber === guest.GuestNumber
                ? { ...g, IsActive: newStatus }
                : g
            )
          );
        })
        .catch(() => setMsg("אירעה שגיאה בעת עדכון הגישה של הקבלן."));
    }
  };

  const filteredGuests = guests.filter((g) =>
    g.GuestNumber?.toLowerCase().includes(searchNumber.toLowerCase())
  );

  const uniqueGuests = Object.values(
    filteredGuests.reduce((acc, guest) => {
      if (!acc[guest.GuestNumber]) acc[guest.GuestNumber] = guest;
      return acc;
    }, {})
  );

  return (
    <div className="guestsPpage">
      <div className="container-guests">
        <div className="guestsPageContainer">
          <h1 className="guests-page-title">כאן תוכל לצפות ברשימת קבלנים</h1>

          {isManager === "manager" && (
            <div className="create-guests">
              <Link to="/createGuests" className="btn">
                קבלן חדש
              </Link>
            </div>
          )}

          {msg && <div className="msg">{msg}</div>}
          {numberError && (
            <div className="guestsPpage-number-error-message">{numberError}</div>
          )}

          <div className="search-filters">
            <input
              type="text"
              placeholder="חיפוש לפי מספר קבלן"
              value={searchNumber}
              onChange={(e) => {
                const value = e.target.value;
                setSearchNumber(value);

                const num = Number(value);
                if (!isNaN(num) && num < 0) {
                  setNumberError("⚠️ מספר קבלן לא יכול להיות שלילי.");
                  setTimeout(() => setNumberError(""), 3000);
                } else {
                  setNumberError("");
                }
              }}
            />
          </div>

          <table className="guests-table">
            <thead>
              <tr>
                <th>מספר קבלן</th>
                <th>מתאריך</th>
                <th>עד תאריך</th>
                <th>סטטוס</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {uniqueGuests.length > 0 ? (
                uniqueGuests.map((guest) => (
                  <tr key={guest.id}>
                    <td>{guest.GuestNumber}</td>
                    <td>
                      {new Date(guest.StartDate).toLocaleDateString("he-IL")}
                    </td>
                    <td>
                      {new Date(guest.EndDate).toLocaleDateString("he-IL")}
                    </td>
                    <td>{guest.IsActive === 1 ? "פעיל" : "חסום"}</td>
                    <td>
                      <Link
                        to={`/guest/${guest.GuestNumber}`}
                        className="view-button"
                      >
                        צפייה
                      </Link>
                      {isManager === "manager" && (
                        <>
                          <Link
                            to={`/editGuest/${guest.GuestNumber}`}
                            className="edit-button"
                          >
                            עריכה
                          </Link>
                          <button
                            className="block-btn"
                            onClick={() => handleToggleAccess(guest)}
                          >
                            {guest.IsActive === 1 ? "חסום" : "הפעל"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">לא נמצאו קבלנים תואמים.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Guests;
