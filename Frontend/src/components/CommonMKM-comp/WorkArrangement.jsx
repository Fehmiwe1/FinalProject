import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../../assets/styles/CommonMKM-styles/WorkArrangement.css";

function WorkArrangement() {
  const [assignments, setAssignments] = useState([]);
  const [weeks, setWeeks] = useState([[], []]);
  const [guardWeekView, setGuardWeekView] = useState(0); // 0 = שבוע ראשון, 1 = שבוע שני
  const userRole = Cookies.get("userRole");

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

    const fetchAssignments = async (role) => {
      try {
        let url = "";
        if (role === "kabat") {
          url = "/createSchedule/allKabatAssignments";
        } else if (role === "moked") {
          url = "/createSchedule/allMokedAssignments";
        } else if (role === "guard") {
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

    generateWeeks();
    fetchAssignments(userRole);
  }, [userRole]);

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

  const renderTable = (week, title) => {
    const sortedWeek = [...week].sort(
      (a, b) => new Date(a).getDay() - new Date(b).getDay()
    );

    return (
      <div className="assignment-table-wrapper">
        <h3>{title}</h3>
        <table className="assignment-table">
          <thead>
            <tr>
              <th>משמרת / תאריך</th>
              {sortedWeek.map((date, i) => {
                const d = new Date(date);
                return (
                  <th key={i}>
                    יום {dayNames[d.getDay()]}
                    <br />
                    {date}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => (
              <tr key={shift}>
                <td>{shift}</td>
                {sortedWeek.map((date) => {
                  const assigned = assignments.filter(
                    (a) => a.date === date && a.shift === shift
                  );
                  return (
                    <td key={`${date}-${shift}`}>
                      {assigned.length > 0
                        ? assigned
                            .map((a) => `${a.firstName} ${a.lastName}`)
                            .join(", ")
                        : ""}
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
                    {date}
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
    <div className="WorkArrangement-wrapper">
      <main className="WorkArrangement-body">
        <h2>סידור עבודה</h2>
        {(userRole === "kabat" || userRole === "moked") && (
          <>
            {renderTable(weeks[0], "שבוע ראשון")}
            {renderTable(weeks[1], "שבוע שני")}
          </>
        )}

        {userRole === "guard" && (
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
        )}
        {userRole !== "kabat" &&
          userRole !== "moked" &&
          userRole !== "guard" && <p>אין לך הרשאה לצפות בסידור העבודה.</p>}
      </main>
    </div>
  );
}

export default WorkArrangement;
