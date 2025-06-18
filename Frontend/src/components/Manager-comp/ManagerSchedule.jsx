import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/ManagerSchedule.css";

function ManagerSchedule() {
  const roles = ["מאבטח", "מוקד", "קבט"];
  const [selectedRole, setSelectedRole] = useState("מאבטח");
  const [kabatConstraints, setKabatConstraints] = useState([]);
  const [GuardConstraints, setGuardConstraints] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [weeks, setWeeks] = useState([[], []]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [guardWeekView, setGuardWeekView] = useState(0); // 0 = שבוע ראשון, 1 = שבוע שני

  const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const positions = [
    "ראשי",
    "נשר",
    "סייר רכוב",
    "סייר א",
    "סייר ב",
    "סייר ג",
    "הפסקות",
  ];

  const Guardshifts = ["בוקר", "ערב", "לילה"];
  const shifts = ["בוקר", "ערב", "לילה"];

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

    const fetchData = async () => {
      try {
        let constraintsRes, assignmentsRes;

        if (selectedRole === "קבט") {
          setGuardConstraints([]);
          constraintsRes = await axios.get("/createSchedule/scheduleKabet", {
            withCredentials: true,
          });
          setKabatConstraints(constraintsRes.data);
          assignmentsRes = await axios.get(
            "/createSchedule/allKabatAssignments",
            { withCredentials: true }
          );
        } else if (selectedRole === "מוקד") {
          setGuardConstraints([]);
          constraintsRes = await axios.get("/createSchedule/scheduleMoked", {
            withCredentials: true,
          });
          setKabatConstraints(constraintsRes.data);
          assignmentsRes = await axios.get(
            "/createSchedule/allMokedAssignments",
            { withCredentials: true }
          );
        } else if (selectedRole === "מאבטח") {
          setKabatConstraints([]);
          constraintsRes = await axios.get("/createSchedule/scheduleGuard", {
            withCredentials: true,
          });
          setGuardConstraints(constraintsRes.data);
          assignmentsRes = await axios.get(
            "/createSchedule/allGuardAssignments",
            { withCredentials: true }
          );
        } else return;

        const newAssignments = {};
        assignmentsRes.data.forEach((row) => {
          if (selectedRole === "מאבטח") {
            // ספירת כמה שיבוצים כבר יש למפתח הזה (לצורך index)
            const existingKeys = Object.keys(newAssignments).filter((key) =>
              key.startsWith(`${row.date}|${row.location}|${row.shift}`)
            );
            const index = existingKeys.length;

            const key = `${row.date}|${row.location}|${row.shift}|${index}`;
            newAssignments[key] = row.id?.toString();
          } else {
            newAssignments[`${row.date}|${row.shift}`] = row.id?.toString();
          }
        });
        setAssignments(newAssignments);
      } catch (err) {
        console.error("שגיאה בטעינת נתונים:", err);
      }
    };

    generateWeeks();
    setAssignments({});
    fetchData();
  }, [selectedRole]);

  const getGuardCount = (shiftType, position, dayIdx) => {
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

  const handleChangeCustom = (key, userId) => {
    setAssignments((prev) => ({ ...prev, [key]: userId }));
  };

  const handleChange = (date, shift, e) => {
    const value = e.target.value;
    setAssignments((prev) => ({ ...prev, [`${date}|${shift}`]: value }));
  };

  const handleSaveSchedule = async () => {
    const seen = new Set();
    const assignmentsToSend = [];

    for (const [key, userId] of Object.entries(assignments)) {
      const [date, shift] = key.split("|");
      const uniqueKey = `${date}|${shift}`;

      if (seen.has(uniqueKey)) continue; // מונע כפילויות
      seen.add(uniqueKey);

      if (userId) {
        assignmentsToSend.push({
          date,
          shift,
          userId,
          role: selectedRole,
          location: "אחר",
        });
      }
    }

    const endpoint =
      selectedRole === "קבט"
        ? "/createSchedule/saveShiftsKabat"
        : selectedRole === "מוקד"
        ? "/createSchedule/saveShiftsMoked"
        : null;

    if (!endpoint) return;

    try {
      await axios.post(endpoint, assignmentsToSend, { withCredentials: true });
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

  const handleSaveScheduleForGuard = async () => {
    const assignmentsToSend = Object.entries(assignments).map(
      ([key, userId]) => {
        const [date, position, shiftType, index] = key.split("|");

        // קביעת תפקיד לפי מיקום
        const positionToRoleMap = {
          ראשי: "מאבטח",
          נשר: "מאבטח",
          "סייר רכוב": "סייר רכוב",
          "סייר א": "סייר א",
          "סייר ב": "סייר ב",
          "סייר ג": "סייר ג",
          הפסקות: "הפסקות",
        };
        const role = positionToRoleMap[position] || "מאבטח";

        return {
          date,
          shift: shiftType,
          userId,
          role,
          location: position,
          index: parseInt(index),
        };
      }
    );

    try {
      await axios.post("/createSchedule/saveShiftsGuard", assignmentsToSend, {
        withCredentials: true,
      });
      setMessage("סידור העבודה למאבטחים נשמר בהצלחה");
      setMessageType("success");
    } catch (err) {
      console.error("שגיאה בשליחת סידור המאבטחים:", err);
      setMessage("אירעה שגיאה בשמירת סידור המאבטחים");
      setMessageType("error");
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };

  const renderFullGuardScheduleTable = (weekIndex) => {
    const seenGuardIds = new Set();
    const uniqueGuards = GuardConstraints.filter((g) => {
      if (seenGuardIds.has(g.id)) return false;
      seenGuardIds.add(g.id);
      return true;
    });

    return (
      <div className="guard-schedule-grid">
        <h3 className="title">
          {weekIndex === 0 ? "שבוע ראשון" : "שבוע שני"} - מאבטחים
        </h3>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>עמדה / תאריך</th>
              {[...weeks[weekIndex]]
                .sort((a, b) => new Date(a).getDay() - new Date(b).getDay())
                .map((date, i) => {
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
                    if (count === 0) return <td key={i}>—</td>;
                    return (
                      <td key={i}>
                        {[...Array(count)].map((_, idx) => {
                          const key = `${date}|${position}|${shiftType}|${idx}`;
                          const selectedId = assignments[key] || "";
                          return (
                            <select
                              key={idx}
                              className="guard-select"
                              value={selectedId}
                              onChange={(e) =>
                                handleChangeCustom(key, e.target.value)
                              }
                            >
                              <option value="">בחר עובד</option>
                              {[...uniqueGuards]
                                .map((user) => {
                                  const availability =
                                    GuardConstraints.find(
                                      (c) =>
                                        c.id === user.id &&
                                        c.date === date &&
                                        c.shift === shiftType
                                    )?.availability || "יכול"; // ברירת מחדל

                                  return {
                                    ...user,
                                    availability,
                                  };
                                })
                                .sort((a, b) => {
                                  const priority = {
                                    יכול: 0,
                                    "יכול חלקית": 1,
                                    "לא יכול": 2,
                                  };
                                  return (
                                    priority[a.availability] -
                                    priority[b.availability]
                                  );
                                })
                                .map((user) => {
                                  const optionClass =
                                    user.availability === "לא יכול"
                                      ? "red-option"
                                      : user.availability === "יכול חלקית"
                                      ? "yellow-option"
                                      : "green-option";

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
              {[...week]
                .sort((a, b) => new Date(a).getDay() - new Date(b).getDay())
                .map((date, i) => {
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
                        {[...uniqueUsers]
                          .map((user) => {
                            const availability =
                              kabatConstraints.find(
                                (c) =>
                                  c.id === user.id &&
                                  c.date === date &&
                                  c.shift === shift
                              )?.availability || "יכול";

                            return {
                              ...user,
                              availability,
                            };
                          })
                          .sort((a, b) => {
                            const priority = {
                              יכול: 0,
                              "יכול חלקית": 1,
                              "לא יכול": 2,
                            };
                            return (
                              priority[a.availability] -
                              priority[b.availability]
                            );
                          })
                          .map((user) => {
                            const optionClass =
                              user.availability === "לא יכול"
                                ? "red-option"
                                : user.availability === "יכול חלקית"
                                ? "yellow-option"
                                : "green-option";

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
        <h1 className="titleH1">סידור עבודה</h1>
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
        {selectedRole === "מאבטח" && (
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
            {renderFullGuardScheduleTable(guardWeekView)}
            <button
              className="save-button"
              onClick={handleSaveScheduleForGuard}
            >
              שמור סידור עבודה
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default ManagerSchedule;
