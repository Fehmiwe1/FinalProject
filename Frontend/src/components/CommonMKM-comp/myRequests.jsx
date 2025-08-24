import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/myRequests.css";

const formatDateToHebrew = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

function MyRequests() {
  // חופשות/מחלה
  const [requests, setRequests] = useState([]);

  // מסירה/החלפה
  const [shiftRequests, setShiftRequests] = useState([]);

  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();

    const fetchRequests = async () => {
      try {
        // חופשה/מחלה במקביל
        const [vacationRes, sickRes] = await Promise.all([
          axios.get("/employeeRequests/vacationRequestsShow", {
            withCredentials: true,
            signal: controller.signal,
          }),
          axios
            .get("/employeeRequests/sickLeaveRequestsShow", {
              withCredentials: true,
              signal: controller.signal,
            })
            .catch((e) => {
              console.warn("שגיאה בשליפת אישורי מחלה:", e);
              return { data: [] };
            }),
        ]);

        const vacationData = Array.isArray(vacationRes?.data)
          ? vacationRes.data
          : [];
        const sickDataRaw = Array.isArray(sickRes?.data) ? sickRes.data : [];

        // מוסיפים request_type לאישורי מחלה אם חסר
        const normalizedSick = sickDataRaw.map((s) => ({
          ...s,
          request_type: s.request_type || "אישור מחלה",
        }));

        if (!ignore) {
          // ללא מיון – משמר את סדר השרת
          setRequests([...vacationData, ...normalizedSick]);
        }
      } catch (error) {
        if (!ignore) console.error("שגיאה בשליפת בקשות חופשה/מחלה:", error);
      }

      try {
        const shiftRes = await axios.get(
          "/employeeRequests/shiftRequestsShow",
          {
            withCredentials: true,
            signal: controller.signal,
          }
        );
        if (!ignore) {
          // ללא מיון – משמר את סדר השרת
          setShiftRequests(Array.isArray(shiftRes?.data) ? shiftRes.data : []);
        }
      } catch (err) {
        if (!ignore) console.error("שגיאה בשליפת בקשות מסירה/החלפה:", err);
      }
    };

    fetchRequests();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  return (
    <div className="myRequests-wrapper">
      <main className="myRequests-body">
        <h2>הבקשות שלי</h2>

        {/* ===== טבלת חופשה/מחלה ===== */}
        <section>
          <h3 className="myRequests-body-h3">בקשות חופשה / מחלה</h3>
          {requests.length === 0 ? (
            <p>לא נמצאו בקשות.</p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>סוג בקשה</th>
                  <th>תאריך שליחה</th>
                  <th>מתאריך</th>
                  <th>עד תאריך</th>
                  <th>מס' ימים</th>
                  <th>ימי תשלום</th>
                  <th>סיבה</th>
                  <th>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={index}>
                    <td>{req.request_type}</td>
                    <td>{formatDateToHebrew(req.request_date)}</td>
                    <td>{formatDateToHebrew(req.from_date)}</td>
                    <td>{formatDateToHebrew(req.to_date)}</td>
                    <td>{req.vacation_days ?? ""}</td>
                    <td>{req.days_to_pay ?? ""}</td>
                    <td>{req.reason ?? ""}</td>
                    <td>{req.status ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ===== טבלת מסירה/החלפה ===== */}
        <section>
          <h3 className="myRequests-body-h3">בקשות מסירה / החלפה</h3>
          {shiftRequests.length === 0 ? (
            <p>לא נמצאו בקשות מסירה/החלפה.</p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>סוג</th>
                  <th>תאריך שליחה</th>
                  <th>תאריך משמרת</th>
                  <th>משמרת</th>
                  <th>עמדה</th>
                  <th>מאת</th>
                  <th>אל</th>
                  <th>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {shiftRequests.map((r) => {
                  const fromName = [r.fromFirstName, r.fromLastName]
                    .filter(Boolean)
                    .join(" ");
                  const toName = [r.toFirstName, r.toLastName]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <tr key={r.id}>
                      <td>{r.type}</td>
                      <td>{formatDateToHebrew(r.requestDate)}</td>
                      <td>{formatDateToHebrew(r.date)}</td>
                      <td>{r.shift}</td>
                      <td>{r.location ?? ""}</td>
                      <td>{fromName || r.fromEmployeeId || ""}</td>
                      <td>
                        {toName ||
                          r.toEmployeeId ||
                          (r.type === "מסירה" ? "—" : "")}
                      </td>
                      <td>{r.status ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default MyRequests;
