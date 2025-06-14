import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/ManagerSchedule.css";

function ManagerSchedule() {
  const roles = ["מאבטח", "מוקד", "קבט"];
  const [selectedRole, setSelectedRole] = useState("מאבטח");
  const [kabatConstraints, setKabatConstraints] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [weeks, setWeeks] = useState([[], []]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" או "error"

  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const shifts = ["בוקר", "ערב", "לילה"];

  useEffect(() => {
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

    const fetchData = async () => {
      try {
        let constraintsRes, assignmentsRes;
        if (selectedRole === "קבט") {
          constraintsRes = await axios.get("/createSchedule/scheduleKabet", {
            withCredentials: true,
          });
          assignmentsRes = await axios.get(
            "/createSchedule/allKabatAssignments",
            { withCredentials: true }
          );
        } else if (selectedRole === "מוקד") {
          constraintsRes = await axios.get("/createSchedule/scheduleMoked", {
            withCredentials: true,
          });
          assignmentsRes = await axios.get(
            "/createSchedule/allMokedAssignments",
            { withCredentials: true }
          );
        } else {
          return;
        }

        setKabatConstraints(constraintsRes.data);

        const newAssignments = {};
        assignmentsRes.data.forEach((row) => {
          newAssignments[`${row.date}|${row.shift}`] = row.id?.toString();
        });
        setAssignments(newAssignments);
      } catch (err) {
        console.error("שגיאה בטעינת נתונים:", err);
      }
    };

    generateWeeks();
    if (selectedRole === "קבט" || selectedRole === "מוקד") {
      fetchData();
    }
  }, [selectedRole]);

  const handleChange = (date, shift, e) => {
    const value = e.target.value;
    setAssignments((prev) => ({
      ...prev,
      [`${date}|${shift}`]: value,
    }));
  };

  const handleSaveSchedule = async () => {
    const assignmentsToSend = Object.entries(assignments).map(
      ([key, userId]) => {
        const [date, shift] = key.split("|");
        return {
          date,
          shift,
          userId,
          role: selectedRole, // קבט או מוקד לפי הבחירה
          location: "אחר",
        };
      }
    );

    const endpoint =
      selectedRole === "קבט"
        ? "/createSchedule/saveShiftsKabat"
        : selectedRole === "מוקד"
        ? "/createSchedule/saveShiftsMoked"
        : null;

    if (!endpoint) return;

    try {
      await axios.post(endpoint, assignmentsToSend, {
        withCredentials: true,
      });
      setMessage("סידור העבודה נשמר בהצלחה");
      setMessageType("success");
    } catch (err) {
      console.error("שגיאה בשליחת הסידור:", err);
      setMessage("אירעה שגיאה בשמירת הסידור");
      setMessageType("error");
    }
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };

  const renderWeekTable = (week, title) => {
    const uniqueUsers = [];
    const seenIds = new Set();
    const userMap = {};

    for (const row of kabatConstraints) {
      if (!seenIds.has(row.id)) {
        uniqueUsers.push({
          id: row.id,
          firstName: row.firstName,
          lastName: row.lastName,
        });
        seenIds.add(row.id);
        userMap[row.id.toString()] = `${row.firstName} ${row.lastName}`;
      }
    }

    // ודא שגם העובדים שכבר משובצים ולא קיימים ב־kabatConstraints נמצאים ברשימה
    Object.values(assignments).forEach((id) => {
      if (!userMap[id]) {
        userMap[id] = `עובד ${id}`;
        uniqueUsers.push({ id: parseInt(id), firstName: `עובד`, lastName: id });
      }
    });

    return (
      <div className="guard-schedule-grid">
        <h3 className="title">{title}</h3>
        <table className="schedule-table">
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
                  const selectedId = assignments[`${date}|${shift}`];
                  return (
                    <td key={date}>
                      <select
                        className="guard-select"
                        value={selectedId || ""}
                        onChange={(e) => handleChange(date, shift, e)}
                      >
                        <option value="">בחר עובד</option>
                        {uniqueUsers.map((user) => {
                          const availability = kabatConstraints.find(
                            (c) =>
                              c.id === user.id &&
                              c.date === date &&
                              c.shift === shift
                          )?.availability;

                          let optionClass = "green-option";
                          if (availability === "לא יכול")
                            optionClass = "red-option";
                          else if (availability === "יכול חלקית")
                            optionClass = "yellow-option";

                          return (
                            <option
                              key={user.id}
                              value={user.id.toString()}
                              className={optionClass}
                            >
                              {user.firstName} {user.lastName}
                            </option>
                          );
                        })}
                      </select>
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
    <div className="managerSchedulePage">
      <aside className="role-selector">
        {roles.map((role) => (
          <button
            key={role}
            className={selectedRole === role ? "active" : ""}
            onClick={() => setSelectedRole(role)}
          >
            {role}
          </button>
        ))}
      </aside>

      <main className="schedule-display">
        <h1 className="titleH1">סידור עבדוה</h1>
        {message && <div className={`message ${messageType}`}>{message}</div>}
        {(selectedRole === "קבט" || selectedRole === "מוקד") && (
          <>
            {renderWeekTable(weeks[0], "שבוע ראשון")}
            {renderWeekTable(weeks[1], "שבוע שני")}
            <button className="save-button" onClick={handleSaveSchedule}>
              שמור סידור עבודה
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default ManagerSchedule;
