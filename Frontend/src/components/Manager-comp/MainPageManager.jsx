import React, { useEffect, useState } from "react";
import axios from "axios";
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

  const [taskRole, setTaskRole] = useState("");
  const [taskEmployees, setTaskEmployees] = useState([]);
  const [taskEmployeeId, setTaskEmployeeId] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskMsg, setTaskMsg] = useState("");
  const [errorTaskMsg, setErrorTaskMsg] = useState("");

  const [tasks, setTasks] = useState([]);

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
        const [generalRes, sickLeaveRes] = await Promise.all([
          axios.get("/employeeRequests/pendingAlerts"),
          axios.get("/employeeRequests/pendingSickLeaves"),
        ]);

        // איחוד של שתי הרשימות
        const combinedAlerts = [...generalRes.data, ...sickLeaveRes.data];

        setAlerts(combinedAlerts);
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

  useEffect(() => {
    const fetchTaskEmployees = async () => {
      if (!taskRole) return;

      let endpoint = "";
      if (taskRole === "guard")
        endpoint = "/employeeNotifications/scheduleGuards";
      else if (taskRole === "moked")
        endpoint = "/employeeNotifications/scheduleMoked";
      else if (taskRole === "kabat")
        endpoint = "/employeeNotifications/scheduleKabet";
      else return;

      try {
        const res = await axios.get(endpoint);
        setTaskEmployees(res.data);
      } catch (err) {
        console.error("שגיאה בשליפת עובדים לפי תפקיד:", err);
      }
    };
    fetchTaskEmployees();
  }, [taskRole]);

  const handleSendTask = async () => {
    if (!taskEmployeeId || !taskDate || !taskDescription) {
      setErrorTaskMsg("יש למלא את כל השדות");
      setTimeout(() => setErrorTaskMsg(""), 3000);
      return;
    }
    const selectedDate = new Date(taskDate);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setErrorTaskMsg("לא ניתן לשלוח משימה לתאריך עבר");
      setTimeout(() => setErrorTaskMsg(""), 3000);
      return;
    }
    try {
      await axios.post("/employeeNotifications/sendNotification", {
        ID_employee: taskEmployeeId,
        event_date: taskDate,
        event_description: taskDescription,
      });
      setTaskMsg("המשימה נשלחה בהצלחה");
      setTaskEmployeeId("");
      setTaskDate("");
      setTaskDescription("");
      setTaskSearch("");
    } catch (err) {
      console.error("שגיאה בשליחת משימה:", err);
      setErrorTaskMsg("אירעה שגיאה בשליחת המשימה");
    } finally {
      setTimeout(() => {
        setTaskMsg("");
        setErrorTaskMsg("");
      }, 3000);
    }
  };

  const filteredEmployees = taskEmployees.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`.includes(taskSearch)
  );

  const fetchTasks = async () => {
    try {
      const res = await axios.get("/employeeNotifications/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("שגיאה בטעינת משימות:", error);
    }
  };

  fetchTasks();

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
          {tasks.length > 0 && (
            <>
              <h2>משימות עובדים</h2>
              <table className="notifications-table">
                <thead>
                  <tr>
                    <th>שם עובד</th>
                    <th>תיאור משימה</th>
                    <th>תאריך משימה</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={index}>
                      <td>
                        {task.firstName} {task.lastName}
                      </td>
                      <td>{task.event_description}</td>
                      <td>{formatDateToHebrew(task.event_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {alerts.length > 0 && (
            <>
              <h2>בקשות חופשה/מחלה ממתינות</h2>
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

          <div className="WA-container">
            <h2>הוספת משימה</h2>
            {taskMsg && <div className="task-message">{taskMsg}</div>}
            {errorTaskMsg && (
              <div className="error-task-message">{errorTaskMsg}</div>
            )}

            <button
              className="toggle-button"
              onClick={() => setShowTaskForm(!showTaskForm)}
            >
              {showTaskForm ? "הסתר הוספת משימה" : "הצג הוספת משימה"}
            </button>
            {showTaskForm && (
              <div className="task-form-container">
                <div className="task-form-group">
                  <label>בחר תפקיד:</label>
                  <select
                    value={taskRole}
                    onChange={(e) => {
                      setTaskRole(e.target.value);
                      setTaskEmployeeId("");
                      setTaskSearch("");
                    }}
                  >
                    <option value="">-- בחר תפקיד --</option>
                    <option value="guard">מאבטח</option>
                    <option value="moked">מוקד</option>
                    <option value="kabat">קב"ט</option>
                  </select>
                </div>
                <div className="task-form-group">
                  <label>בחר עובד:</label>
                  <input
                    list="employeeOptions"
                    value={taskSearch}
                    onChange={(e) => {
                      setTaskSearch(e.target.value);
                      const match = taskEmployees.find(
                        (emp) =>
                          `${emp.firstName} ${emp.lastName}` === e.target.value
                      );
                      setTaskEmployeeId(match ? match.id : "");
                    }}
                    placeholder="בחר או הקלד שם עובד"
                    disabled={!taskRole}
                  />
                  <datalist id="employeeOptions">
                    {filteredEmployees.map((emp) => (
                      <option
                        key={emp.id}
                        value={`${emp.firstName} ${emp.lastName}`}
                      />
                    ))}
                  </datalist>
                </div>
                <div className="task-form-group">
                  <label>תאריך משימה:</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                  />
                </div>
                <div className="task-form-group">
                  <label>תיאור משימה:</label>
                  <textarea
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                  />
                </div>
                <button className="task-submit-button" onClick={handleSendTask}>
                  שלח משימה
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPageManager;
