import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../../assets/styles/CommonMKM-styles/WorkArrangement.css";

function WorkArrangement() {
  const [assignments, setAssignments] = useState([]);
  const [weeks, setWeeks] = useState([[], []]);
  const userRole = Cookies.get("userRole");
  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const shifts = ["בוקר", "ערב", "לילה"];

  useEffect(() => {
    if (userRole === "kabat") {
      const generateWeeks = () => {
        const base = new Date("2025-06-01");
        const dates = [[], []];
        for (let i = 0; i < 14; i++) {
          const d = new Date(base);
          d.setDate(base.getDate() + i);
          dates[i < 7 ? 0 : 1].push(d.toISOString().split("T")[0]);
        }
        setWeeks(dates);
      };

      const fetchAssignments = async () => {
        try {
          const res = await axios.get("/createSchedule/allKabatAssignments", {
            withCredentials: true,
          });
          setAssignments(res.data);
        } catch (err) {
          console.error("שגיאה בטעינת הסידור:", err);
        }
      };

      generateWeeks();
      fetchAssignments();
    }
  }, [userRole]);

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

  return (
    <div className="WorkArrangement-wrapper">
      <main className="WorkArrangement-body">
        <h2>סידור עבודה</h2>
        {userRole === "kabat" ? (
          <>
            {renderTable(weeks[0], "שבוע ראשון")}
            {renderTable(weeks[1], "שבוע שני")}
          </>
        ) : (
          <p>אין לך הרשאה לצפות בסידור העבודה.</p>
        )}
      </main>
    </div>
  );
}

export default WorkArrangement;
