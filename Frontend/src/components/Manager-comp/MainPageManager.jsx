import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/Manager-styles/MainPageManager.css";

function MainPageManager() {
  const [employees, setEmployees] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [msg, setMsg] = useState("");

  const [showGuards, setShowGuards] = useState(false);
  const [showMoked, setShowMoked] = useState(false);
  const [showKabat, setShowKabat] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [weeks, setWeeks] = useState([[], []]);
  const [guardWeekView, setGuardWeekView] = useState(0); // 0 = שבוע ראשון, 1 = שבוע שני
  const userRole = Cookies.get("userRole");

  const navigate = useNavigate();

  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const shifts = ["בוקר", "ערב", "לילה"];
  const Guardshifts = ["בוקר", "ערב", "לילה"];
  const positions = [
    "ראשי",
    "נשר",
    "סייר רכוב",
    "סייר א",
    "סייר ב",
    "סייר ג",
    "הפסקות",
  ];

  useEffect(() => {
    const generateWeeks = () => {
      const base = new Date("2025-06-01");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - base) / (1000 * 60 * 60 * 24));
      const periodIndex = Math.floor(diffDays / 14);
      const startOfPeriod = new Date(base);
      startOfPeriod.setDate(base.getDate() + periodIndex * 14);

      const dates = [[], []];
      for (let i = 0; i < 14; i++) {
        const d = new Date(startOfPeriod);
        d.setDate(startOfPeriod.getDate() + i);
        dates[i < 7 ? 0 : 1].push(d.toISOString().split("T")[0]);
      }
      setWeeks(dates);
    };

    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/employeeNotifications");
        setEmployees(res.data);
      } catch (error) {
        console.error("שגיאה:", error);
        setMsg("אירעה שגיאה בטעינת ההתראות.");
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await axios.get("/employeeRequests/pendingAlerts");
        setAlerts(res.data);
      } catch (error) {
        console.error("שגיאה בטעינת בקשות:", error);
      }
    };

    fetchEmployees();
    fetchAlerts();
    generateWeeks();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!showGuards && !showMoked && !showKabat) return;
      try {
        let url = "";
        if (showKabat) {
          url = "/createSchedule/allKabatAssignments";
        } else if (showMoked) {
          url = "/createSchedule/allMokedAssignments";
        } else if (showGuards) {
          url = "/createSchedule/allGuardAssignments";
        } else {
          return;
        }

        const res = await axios.get(url, { withCredentials: true });
        setAssignments(res.data);
      } catch (err) {
        console.error("שגיאה בטעינת הסידור:", err);
      }
    };

    fetchAssignments();
  }, [showGuards, showMoked, showKabat]);

  const getGuardCount = (shiftType, position, dayIdx) => {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const dayName = days[dayIdx];

    if (position === "ראשי") {
      if (shiftType === "בוקר") return dayName === "שבת" ? 3 : 4;
      if (shiftType === "ערב")
        return dayName === "שישי" || dayName === "שבת" ? 3 : 4;
      if (shiftType === "לילה") return 2;
    }
    if (position === "נשר") {
      if (dayName === "שישי" && (shiftType === "ערב" || shiftType === "לילה"))
        return 0;
      if (dayName === "שבת") return 0;
      if (shiftType === "בוקר") return 3;
      if (shiftType === "ערב") return 2;
      if (shiftType === "לילה") return 0;
    }
    if (position === "הפסקות") {
      if (shiftType !== "ערב" || dayName === "שישי" || dayName === "שבת")
        return 0;
      return 1;
    }
    return 1;
  };
  const formatDateToHebrew = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderTable = (week, title) => {
    return (
      <div className="assignment-table-wrapper">
        <h3>{title}</h3>
        <table className="assignment-table">
          <thead>
            <tr>
              <th>משמרת / תאריך</th>
              {week.map((date, i) => {
                const d = new Date(date);
                return (
                  <th key={i}>
                    יום {dayNames[d.getDay()]}
                    <br />
                    {formatDateToHebrew(date)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift}>
                <td>{shift}</td>
                {week.map((date) => {
                  const assigned = assignments.filter(
                    (a) => a.date === date && a.shift === shift
                  );
                  return (
                    <td key={`${date}-${shift}`}>
                      {assigned.length > 0
                        ? assigned
                            .map((a) => `${a.firstName} ${a.lastName}`)
                            .join(", ")
                        : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGuardView = (weekIndex) => {
    const guardsMap = {};
    assignments.forEach((g) => {
      guardsMap[g.id] = `${g.firstName} ${g.lastName}`;
    });

    return (
      <div className="guard-schedule-grid">
        <h3 className="title">
          צפייה בשיבוצים - {weekIndex === 0 ? "שבוע ראשון" : "שבוע שני"}
        </h3>
        <div className="week-toggle">
          <button
            className={guardWeekView === 0 ? "active" : ""}
            onClick={() => setGuardWeekView(0)}
          >
            שבוע ראשון
          </button>
          <button
            className={guardWeekView === 1 ? "active" : ""}
            onClick={() => setGuardWeekView(1)}
          >
            שבוע שני
          </button>
        </div>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>עמדה / תאריך</th>
              {weeks[weekIndex].map((date, i) => {
                const d = new Date(date);
                return (
                  <th key={i}>
                    יום {dayNames[d.getDay()]}
                    <br />
                    {formatDateToHebrew(date)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {positions.map((position) =>
              Guardshifts.map((shiftType) => (
                <tr key={`${position}-${shiftType}`}>
                  <td>
                    {position} - {shiftType}
                  </td>
                  {weeks[weekIndex].map((date, i) => {
                    const count = getGuardCount(shiftType, position, i);
                    const assigned = assignments.filter(
                      (a) =>
                        a.date === date &&
                        a.shift === shiftType &&
                        (a.location === position || a.role === position)
                    );

                    return (
                      <td key={`${date}-${position}-${shiftType}`}>
                        {[...Array(count)].map((_, idx) => {
                          const a = assigned[idx];
                          return (
                            <div key={idx}>
                              {a ? `${a.firstName} ${a.lastName}` : "—"}
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="mainPageManager">
      <div className="mainPageManager-container">
        <div className="notifications-container">
          <form className="notifications-form">
            <h1>התראות</h1>
          </form>

          {msg && <div className="error-message">{msg}</div>}

          {!msg && employees.length === 0 && alerts.length === 0 && (
            <div className="no-notifications-message">אין התראות להצגה.</div>
          )}

          <table className="notifications-table">
            <tbody>
              {employees.map((emp) => (
                <tr key={`${emp.ID_employee}_${emp.event_date}`}>
                  <td>{emp.event_description}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {alerts.length > 0 && (
            <>
              <h2 style={{ marginTop: "20px" }}>בקשות חופשה/מחלה ממתינות</h2>
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th>שם עובד</th>
                    <th>סוג בקשה</th>
                    <th>תאריך בקשה</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>
                        {alert.firstName} {alert.lastName}
                      </td>
                      <td>{alert.type}</td>
                      <td>{formatDateToHebrew(alert.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          <button
            className="requests-nav-button"
            onClick={() => navigate("/RequestsManagement")}
          >
            מעבר לניהול הבקשות
          </button>
        </div>

        <div className="WorkArrangement-container">
          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - מאבטחים</h1>
            </form>
            <button
              className="toggle-button"
              onClick={() => setShowGuards(!showGuards)}
            >
              {showGuards ? "הסתר סידור" : "הצג סידור"}
            </button>
            {showGuards && renderGuardView(guardWeekView)}
          </div>

          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - מוקד</h1>
            </form>
            <button
              className="toggle-button"
              onClick={() => setShowMoked(!showMoked)}
            >
              {showMoked ? "הסתר סידור" : "הצג סידור"}
            </button>
            {showMoked && (
              <>
                {renderTable(weeks[0], "שבוע ראשון")}
                {renderTable(weeks[1], "שבוע שני")}
              </>
            )}
          </div>

          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - קב"טים</h1>
            </form>
            <button
              className="toggle-button"
              onClick={() => setShowKabat(!showKabat)}
            >
              {showKabat ? "הסתר סידור" : "הצג סידור"}
            </button>
            {showKabat && (
              <>
                {renderTable(weeks[0], "שבוע ראשון")}
                {renderTable(weeks[1], "שבוע שני")}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPageManager;
