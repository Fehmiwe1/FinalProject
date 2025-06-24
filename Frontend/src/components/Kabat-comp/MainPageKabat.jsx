import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Kabat-styles/MainPageKabat.css";
import Incident from "../CommonMKM-comp/Incident.jsx";

function MainPageKabat() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [tasks, setTasks] = useState([]);

  const formatDateToHebrew = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get("/employeeRequests/pendingRequests");
        setPendingRequests(response.data);
      } catch (error) {
        console.error("Error loading pending requests", error);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await axios.get("/employeeNotifications/getTasks");
        setTasks(res.data);
      } catch (error) {
        console.error("Error loading tasks", error);
      }
    };

    fetchPendingRequests();
    fetchTasks();
  }, []);

  return (
    <div className="mainPageKabat-wrapper">
      <main className="mainPageKabat-body">
        <section className="mainPageKabat-alerts-section">
          <h3>התראות/בקשות</h3>
          <table>
            <thead>
              <tr>
                <th>סוג בקשה</th>
                <th>תאריך שליחה</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req, index) => (
                <tr key={index}>
                  <td>{req.request_type}</td>
                  <td>{formatDateToHebrew(req.request_date)}</td>
                  <td>{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>משימות</h3>
          <table>
            <thead>
              <tr>
                <th>תיאור משימה</th>
                <th>תאריך משימה</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.event_description}</td>
                  <td>{formatDateToHebrew(task.event_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="mainPageKabat-incident-section">
          <Incident />
        </section>
      </main>
    </div>
  );
}

export default MainPageKabat;
