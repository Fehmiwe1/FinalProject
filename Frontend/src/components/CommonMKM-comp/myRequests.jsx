import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../assets/styles/CommonMKM-styles/myRequests.css';

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [sortBy, setSortBy] = useState('request_type');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const vacationRes = await axios.get(
          '/employeeRequests/vacationRequestsShow',
        );
        let sickRes = { data: [] };

        try {
          sickRes = await axios.get('/employeeRequests/sickLeaveRequestsShow');
        } catch (sickError) {
          console.warn('שגיאה בשליפת אישורי מחלה:', sickError);
        }
        

        // מוסיפים request_type אחיד לאישורי מחלה אם חסר
        const normalizedSick = sickRes.data.map(sick => ({
          ...sick,
          request_type: sick.request_type || 'אישור מחלה',
        }));

        const allRequests = [...vacationRes.data, ...normalizedSick];
        setRequests(allRequests);
      } catch (error) {
        console.error('שגיאה בשליפת בקשות:', error);
      }
    };

    fetchRequests();
  }, []);

  const getSortedRequests = () => {
    return [...requests].sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      if (typeof valA === 'string') return valA.localeCompare(valB);
      return 0;
    });
  };

  return (
    <div className='myRequests-wrapper'>
      <main className='myRequests-body'>
        <h2>הבקשות שלי</h2>

        <div className='sort-controls'>
          <label htmlFor='sort-select'>מיון לפי:</label>
          <select
            id='sort-select'
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value='request_type'>סוג בקשה</option>
            <option value='request_date'>תאריך שליחה</option>
            <option value='status'>סטטוס</option>
          </select>
        </div>

        <section>
          {requests.length === 0 ? (
            <p>לא נמצאו בקשות.</p>
          ) : (
            <table className='requests-table'>
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
                {getSortedRequests().map((req, index) => (
                  <tr key={index}>
                    <td>{req.request_type}</td>
                    <td>
                      {req.request_date
                        ? new Date(req.request_date).toLocaleDateString()
                        : ''}
                    </td>
                    <td>
                      {req.from_date
                        ? new Date(req.from_date).toLocaleDateString()
                        : ''}
                    </td>
                    <td>
                      {req.to_date
                        ? new Date(req.to_date).toLocaleDateString()
                        : ''}
                    </td>
                    <td>{req.vacation_days ?? ''}</td>
                    <td>{req.days_to_pay ?? ''}</td>
                    <td>{req.reason ?? ''}</td>
                    <td>{req.status ?? ''}</td>
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
