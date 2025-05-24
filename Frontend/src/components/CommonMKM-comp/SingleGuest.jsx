import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/SingleGuest.css";

function SingleGuest() {
  const [vehicles, setVehicles] = useState([]);
  const { id } = useParams(); // GuestNumber
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/guests/${id}`)
      .then((res) => {
        setVehicles(res.data);
      })
      .catch((error) => {
        console.error("שגיאה:", error);
      });
  }, []);

  return (
    <section className="guest main">
      <div className="container">
        <div className="single-guest">
          <button className="close-button" onClick={() => navigate("/guests")}>
            ✕
          </button>
          <h1 className="guest-title">פרטי קבלן</h1>
          {vehicles.length > 0 ? (
            <>
              <p className="guest-p">מספר קבלן: {vehicles[0].GuestNumber}</p>
              <p className="guest-p">
                תוקף:{" "}
                {new Date(vehicles[0].StartDate).toLocaleDateString("he-IL")} -{" "}
                {new Date(vehicles[0].EndDate).toLocaleDateString("he-IL")}
              </p>
              <h3>
                רכבים משויכים:
              </h3>
              {vehicles.map((v, index) => (
                <div key={index} className="guest-details">
                  <p className="guest-p">רכב: {v.CarNumber}</p>
                  <p className="guest-p">אורח: {v.GuestName}</p>
                  <p className="guest-p">טלפון: {v.GuestPhone}</p>
                  <hr />
                </div>
              ))}
            </>
          ) : (
            <p>לא נמצאו רכבים לקבלן זה</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default SingleGuest;
