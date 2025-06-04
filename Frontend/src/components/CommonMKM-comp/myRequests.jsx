import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/myRequests.css";

function MyRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          "/employeeRequests/vacationRequestsShow"
        ); // שנה לפי ה־API שלך
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="myRequests-wrapper">
      <main className="myRequests-body">
        <h2>הבקשות שלי</h2>
        <section>
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
                    <td>{new Date(req.request_date).toLocaleDateString()}</td>
                    <td>{new Date(req.from_date).toLocaleDateString()}</td>
                    <td>{new Date(req.to_date).toLocaleDateString()}</td>
                    <td>{req.vacation_days}</td>
                    <td>{req.days_to_pay}</td>
                    <td>{req.reason}</td>
                    <td>{req.status}</td>
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
