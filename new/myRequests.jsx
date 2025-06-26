import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/styles/CommonMKM-styles/myRequests.css';

const formatDateToHebrew = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

function MyRequests() {
  const [vacationRequests, setVacationRequests] = useState([]);
  const [shiftRequests, setShiftRequests] = useState([]);

  const [vacationSortBy, setVacationSortBy] = useState('request_type');
  const [shiftSortBy, setShiftSortBy] = useState('request_type');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const vacationRes = await axios.get('http://localhost:8801/employeeRequests/vacationRequestsShow', { withCredentials: true });
        let sickRes = { data: [] };
        let shiftChangeRes = { data: [] };

        try {
          sickRes = await axios.get('http://localhost:8801/employeeRequests/sickLeaveRequestsShow', { withCredentials: true });
        } catch (sickError) {
          console.warn('שגיאה בשליפת אישורי מחלה:', sickError);
        }

        try {
          shiftChangeRes = await axios.get('http://localhost:8801/shiftChangeRequest/myRequests', { withCredentials: true });
        } catch (shiftError) {
          console.warn('שגיאה בשליפת בקשות שיבוץ:', shiftError);
        }

        // עיבוד בקשות חופשה
        const normalizedVacations = vacationRes.data.map(req => ({
          ...req,
          request_type: 'חופשה',
        }));

        // עיבוד בקשות מחלה
        const normalizedSick = sickRes.data.map(sick => ({
          ...sick,
          request_type: 'אישור מחלה',
        }));

        // עיבוד בקשות מסירה/החלפה
        const normalizedShiftRequests = shiftChangeRes.data.map(req => ({
          request_type: req.Request_Type === 'מסירה' ? 'מסירת משמרת' : 'החלפת משמרת',
          request_date: req.Request_Date,
          from_date: req.Date,
          to_date: req.Date,
          vacation_days: '',
          days_to_pay: '',
          reason: `${req.Type_Of_Shift} - ${req.Role_In_Shift}`,
          status: req.Request_Status,
        }));

        // שמירה נפרדת
        setVacationRequests([...normalizedVacations, ...normalizedSick]);
        setShiftRequests(normalizedShiftRequests);
      } catch (error) {
        console.error('שגיאה בשליפת בקשות:', error);
      }
    };

    fetchRequests();
  }, []);

  const getSortedVacationRequests = () => {
    return [...vacationRequests].sort((a, b) => {
      const valA = a[vacationSortBy];
      const valB = b[vacationSortBy];
      if (typeof valA === 'string') return valA.localeCompare(valB);
      return 0;
    });
  };

  const getSortedShiftRequests = () => {
    return [...shiftRequests].sort((a, b) => {
      const valA = a[shiftSortBy];
      const valB = b[shiftSortBy];
      if (typeof valA === 'string') return valA.localeCompare(valB);
      return 0;
    });
  };

  return (
    <div className="myRequests-wrapper">
      <main className="myRequests-body">

        {/* 🔥 טבלת מסירה/החלפה - ראשונה */}
        <h2>הבקשות שלי - מסירת/החלפת משמרת</h2>

        <div className="sort-controls">
          <label htmlFor="shift-sort-select">מיון לפי:</label>
          <select
            id="shift-sort-select"
            value={shiftSortBy}
            onChange={(e) => setShiftSortBy(e.target.value)}
          >
            <option value="request_type">סוג בקשה</option>
            <option value="request_date">תאריך שליחה</option>
            <option value="status">סטטוס</option>
          </select>
        </div>

        <section>
          {shiftRequests.length === 0 ? (
            <p>לא נמצאו בקשות מסירת/החלפת משמרת.</p>
          ) : (
            <table className="requests-table">
              <thead>
                <tr>
                  <th>סוג בקשה</th>
                  <th>תאריך שליחה</th>
                  <th>תאריך משמרת</th>
                  <th>פרטי משמרת</th>
                  <th>סטטוס</th>
                </tr>
              </thead>
              <tbody>
                {getSortedShiftRequests().map((req, index) => (
                  <tr key={index}>
                    <td>{req.request_type}</td>
                    <td>{formatDateToHebrew(req.request_date)}</td>
                    <td>{formatDateToHebrew(req.from_date)}</td>
                    <td>{req.reason ?? ""}</td>
                    <td>{req.status ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* 🔥 טבלת חופשה/מחלה - שנייה */}
        <h2>הבקשות שלי - חופשות ומחלה</h2>

        <div className="sort-controls">
          <label htmlFor="vacation-sort-select">מיון לפי:</label>
          <select
            id="vacation-sort-select"
            value={vacationSortBy}
            onChange={(e) => setVacationSortBy(e.target.value)}
          >
            <option value="request_type">סוג בקשה</option>
            <option value="request_date">תאריך שליחה</option>
            <option value="status">סטטוס</option>
          </select>
        </div>

        <section>
          {vacationRequests.length === 0 ? (
            <p>לא נמצאו בקשות חופשה/מחלה.</p>
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
                {getSortedVacationRequests().map((req, index) => (
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

      </main>
    </div>
  );
}

export default MyRequests;
