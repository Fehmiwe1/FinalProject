import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../../assets/styles/CommonMKM-styles/WorkArrangement.css";

function WorkArrangement() {
  const [assignments, setAssignments] = useState([]);
  const [weeks, setWeeks] = useState([[], []]);
  const [guardWeekView, setGuardWeekView] = useState(0);
  const [permissions, setPermissions] = useState(null);

  const userRole = Cookies.get("userRole");
  const roles = ["guard", "moked", "kabat"];
  const [selectedRole, setSelectedRole] = useState(userRole);

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

    generateWeeks();
  }, []);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/role/getPermissions");
        const roleData = res.data.find((r) => r.Role_Name === userRole);
        if (roleData) {
          setPermissions(roleData.permissions);
        }
      } catch (err) {
        console.error("שגיאה בטעינת ההרשאות:", err);
      }
    };

    fetchPermissions();
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      let url = "";
      if (selectedRole === "kabat") url = "/createSchedule/allKabatAssignments";
      else if (selectedRole === "moked")
        url = "/createSchedule/allMokedAssignments";
      else if (selectedRole === "guard")
        url = "/createSchedule/allGuardAssignments";
      else return;

      try {
        const res = await axios.get(url, { withCredentials: true });
        setAssignments(res.data);
      } catch (err) {
        console.error("שגיאה בטעינת הסידור:", err);
      }
    };

    fetchAssignments();
  }, [selectedRole]);

  const formatDateToHebrew = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const getGuardCount = (shiftType, position, dayIdx) => {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const dayName = days[dayIdx];

    if (position === "ראשי") {
      if (shiftType === "בוקר") return dayName === "שבת" ? 3 : 4;
      if (shiftType === "ערב") return ["שישי", "שבת"].includes(dayName) ? 3 : 4;
      if (shiftType === "לילה") return 2;
    }
    if (position === "נשר") {
      if (
        dayName === "שבת" ||
        (dayName === "שישי" && ["ערב", "לילה"].includes(shiftType))
      )
        return 0;
      if (shiftType === "בוקר") return 3;
      if (shiftType === "ערב") return 2;
    }
    if (position === "הפסקות") {
      if (shiftType !== "ערב" || ["שישי", "שבת"].includes(dayName)) return 0;
      return 1;
    }
    return 1;
  };

  const renderTable = (week, title) => (
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
                  יום {dayNames[d.getDay()]} <br />
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
                    {assigned
                      .map((a) => `${a.firstName} ${a.lastName}`)
                      .join(", ") || "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGuardView = (weekIndex) => (
    <div className="guard-schedule-grid">
      <h3 className="title">
        צפייה בשיבוצים - {weekIndex === 0 ? "שבוע ראשון" : "שבוע שני"}
      </h3>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>עמדה / תאריך</th>
            {weeks[weekIndex].map((date, i) => {
              const d = new Date(date);
              return (
                <th key={i}>
                  יום {dayNames[d.getDay()]} <br />
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

  const canViewRole = (role) => {
    if (userRole === "moked") return true; // מוקדן רואה הכל
    if (userRole === "kabat") return role === "kabat" || role === "guard";
    if (userRole === "guard") return role === "guard";
    return false;
  };

  if (!permissions) {
    return <div className="loading">טוען הרשאות...</div>;
  }

  return (
    <div className="WorkArrangement-wrapper">
      <main className="WorkArrangement-body">
        <h2>סידור עבודה</h2>

        {(userRole === "moked" || userRole === "kabat") && (
          <aside className="WorkArrangement-role-selector">
            {roles
              .filter((r) => canViewRole(r))
              .map((role) => (
                <button
                  key={role}
                  className={selectedRole === role ? "active" : ""}
                  onClick={() => setSelectedRole(role)}
                >
                  {role === "guard"
                    ? "מאבטח"
                    : role === "moked"
                    ? "מוקד"
                    : 'קב"ט'}
                </button>
              ))}
          </aside>
        )}

        {selectedRole === "guard" ? (
          <>
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
            {renderGuardView(guardWeekView)}
          </>
        ) : (
          <>
            {renderTable(weeks[0], "שבוע ראשון")}
            {renderTable(weeks[1], "שבוע שני")}
          </>
        )}
      </main>
    </div>
  );
}

export default WorkArrangement;
