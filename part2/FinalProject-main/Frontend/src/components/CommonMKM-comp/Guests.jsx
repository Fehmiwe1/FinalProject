import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/Guests.css";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";

function Guests() {
  const [guests, setGuests] = useState([]);
  const [msg, setMsg] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isManager = Cookies.get("userRole");

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = () => {
    axios
      .get("/guests")
      .then((res) => setGuests(res.data))
      .catch(() => setMsg("אירוע שגיאה בטעינת הקבלנים."));
  };

  const handleDelete = (guest) => {
    if (
      window.confirm(`האם אתה בטוח שברצונך למחוק את הקבלן: ${guest.GuestName}?`)
    ) {
      axios
        .delete(`/guests/${guest.id}`)
        .then(() => {
          setGuests((prev) => prev.filter((item) => item.id !== guest.id));
          setMsg("הקבלן נמחק בהצלחה.");
          setTimeout(() => setMsg(""), 2000);
        })
        .catch(() => setMsg("אירוע שגיאה בעת מחיקת הקבלן."));
    }
  };

  const filteredGuests = guests.filter((g) => {
    const numberMatch = g.GuestNumber?.toLowerCase().includes(
      searchNumber.toLowerCase()
    );
    const date = new Date(g.StartDate);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    const dateMatch = (!from || date >= from) && (!to || date <= to);
    return numberMatch && dateMatch;
  });

  // שמירת רק מופע אחד לכל GuestNumber
  const uniqueGuestsByNumber = Object.values(
    filteredGuests.reduce((acc, guest) => {
      if (!acc[guest.GuestNumber]) {
        acc[guest.GuestNumber] = guest;
      }
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

          <div className="search-filters">
            <input
              type="text"
              placeholder="חיפוש לפי מספר קבלן"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
            />
          </div>

          <div className="guests-containers">
            {uniqueGuestsByNumber.length > 0 ? (
              uniqueGuestsByNumber.map((guest) => (
                <div key={guest.id} className="guests-wrapper">
                  <div className="guests-card">
                    <h2>מספר קבלן</h2>
                    <h2>{guest.GuestNumber}</h2>
                    <p>
                      {new Date(guest.StartDate).toLocaleDateString("he-IL")} -{" "}
                      {new Date(guest.EndDate).toLocaleDateString("he-IL")}
                    </p>
                  </div>

                  <div className="btns-actions-guests">
                    <Link
                      to={`/guest/${guest.GuestNumber}`}
                      className="view-button-guests"
                    >
                      צפייה
                    </Link>

                    {isManager === "manager" && (
                      <>
                        <Link
                          to={`/editGuest/${guest.id}`}
                          className="edit-button-guests"
                        >
                          עריכה
                        </Link>
                        <button
                          className="delete-btn-guests"
                          onClick={() => handleDelete(guest)}
                        >
                          מחיקה
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>לא נמצאו קבלנים תואמים.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Guests;
