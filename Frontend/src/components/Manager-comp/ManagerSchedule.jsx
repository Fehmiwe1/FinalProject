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
      const periodIndex = Math.floor((diffDays + 1) / 14); // ✅ תיקון כאן
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

  const handleAutoAssignWeekTable = () => {
    const newAssignments = { ...assignments };
    const shiftOrder = ["בוקר", "ערב", "לילה"];

    const isBlocked = (userId, date, shift, currentAssignments) => {
      const currentIndex = shiftOrder.indexOf(shift);
      const dateObj = new Date(date);
      const prevDate = new Date(dateObj);
      prevDate.setDate(dateObj.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split("T")[0];

      return Object.entries(currentAssignments).some(([key, val]) => {
        if (val !== userId.toString()) return false;

        const parts = key.split("|");
        const [kDate, kShift] =
          parts.length === 2 ? [parts[0], parts[1]] : [parts[0], parts[2]];

        const assignedIndex = shiftOrder.indexOf(kShift);

        // באותו יום – משמרות סמוכות
        if (kDate === date && shift !== kShift) {
          return Math.abs(currentIndex - assignedIndex) < 2;
        }

        // לילה של אתמול מול בוקר של היום
        if (kDate === prevDateStr && kShift === "לילה" && shift === "בוקר") {
          return true;
        }

        return false;
      });
    };

    // רק אם התפקיד הוא מוקד או קב"ט
    if (selectedRole !== "מוקד" && selectedRole !== "קבט") {
      setMessage('שיבוץ אוטומטי אפשרי רק למוקדנים ולקב"טים');
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
      return;
    }

    // רשימת עובדים ייחודיים מתוך kabatConstraints
    const uniqueUsers = [
      ...new Map(kabatConstraints.map((user) => [user.id, user])).values(),
    ];

    // מעבר על כל תאריכים ומשמרות
    weeks.flat().forEach((date) => {
      shifts.forEach((shift) => {
        const key = `${date}|${shift}`;
        if (newAssignments[key]) return; // אל תדרוס שיבוץ קיים

        // מציאת מועמדים מתאימים
        const candidates = uniqueUsers
          .map((user) => {
            const availability =
              kabatConstraints.find(
                (c) => c.id === user.id && c.date === date && c.shift === shift
              )?.availability || "יכול";

            return { ...user, availability };
          })
          .filter(
            (user) =>
              user.availability !== "לא יכול" &&
              !isBlocked(user.id.toString(), date, shift, newAssignments)
          )
          .sort((a, b) => {
            const priority = { יכול: 0, "יכול חלקית": 1 };
            return (
              (priority[a.availability] ?? 2) - (priority[b.availability] ?? 2)
            );
          });

        // אם יש מועמד מתאים – שיבוץ
        if (candidates.length > 0) {
          newAssignments[key] = candidates[0].id.toString();
        }
      });
    });

    // עדכון assignments והודעה למשתמש
    setAssignments(newAssignments);
    setMessage("המילוי האוטומטי הושלם");
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };

  const handleAutoAssignFullGuardScheduleTable = () => {
    const newAssignments = { ...assignments };
    const shiftOrder = ["בוקר", "ערב", "לילה"];

    const isBlocked = (userId, date, shift, currentAssignments) => {
      const currentIndex = shiftOrder.indexOf(shift);
      const dateObj = new Date(date);
      const prevDate = new Date(dateObj);
      prevDate.setDate(dateObj.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split("T")[0];

      return Object.entries(currentAssignments).some(([key, val]) => {
        if (val !== userId.toString()) return false;
        const parts = key.split("|");
        const [kDate, , kShift] = parts;
        const assignedIndex = shiftOrder.indexOf(kShift);

        // באותו יום
        if (kDate === date && shift !== kShift) {
          return Math.abs(currentIndex - assignedIndex) < 2;
        }

        // לילה של אתמול + בוקר של היום
        if (kDate === prevDateStr && kShift === "לילה" && shift === "בוקר") {
          return true;
        }

        return false;
      });
    };

    const uniqueGuards = [
      ...new Map(GuardConstraints.map((g) => [g.id, g])).values(),
    ];

    // שבועיים
    weeks.flat().forEach((date, dayIndex) => {
      const dayOfWeek = new Date(date).getDay(); // עבור getGuardCount

      positions.forEach((position) => {
        Guardshifts.forEach((shiftType) => {
          const count = getGuardCount(shiftType, position, dayOfWeek);

          for (let idx = 0; idx < count; idx++) {
            const key = `${date}|${position}|${shiftType}|${idx}`;
            if (newAssignments[key]) continue; // כבר שובץ ידנית

            const candidates = uniqueGuards
              .map((user) => {
                const availability =
                  GuardConstraints.find(
                    (c) =>
                      c.id === user.id &&
                      c.date === date &&
                      c.shift === shiftType
                  )?.availability || "יכול";

                return { ...user, availability };
              })
              .filter(
                (u) =>
                  u.availability !== "לא יכול" &&
                  !Object.entries(newAssignments).some(
                    ([assignKey, assignId]) => {
                      const [assignDate, assignPos, assignShift] =
                        assignKey.split("|");
                      return (
                        assignDate === date &&
                        assignShift === shiftType &&
                        assignId === u.id.toString()
                      );
                    }
                  ) &&
                  !isBlocked(u.id.toString(), date, shiftType, newAssignments)
              )
              .sort((a, b) => {
                const priority = { יכול: 0, "יכול חלקית": 1 };
                return (
                  (priority[a.availability] ?? 2) -
                  (priority[b.availability] ?? 2)
                );
              });

            if (candidates.length > 0) {
              newAssignments[key] = candidates[0].id.toString();
            }
          }
        });
      });
    });

    setAssignments(newAssignments);
    setMessage("המילוי האוטומטי למאבטחים הושלם");
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };

  const formatDateToHebrew = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderFullGuardScheduleTable = (weekIndex) => {
    const seenGuardIds = new Set();
    const uniqueGuards = GuardConstraints.filter((g) => {
      if (seenGuardIds.has(g.id)) return false;
      seenGuardIds.add(g.id);
      return true;
    });

    const shiftOrder = ["בוקר", "ערב", "לילה"];

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
                    if (count === 0) return <td key={i}>—</td>;

                    return (
                      <td key={i}>
                        {[...Array(count)].map((_, idx) => {
                          const key = `${date}|${position}|${shiftType}|${idx}`;
                          const selectedId = assignments[key] || "";

                          const filteredGuards = [...uniqueGuards]
                            .map((user) => {
                              const currentIndex =
                                shiftOrder.indexOf(shiftType);

                              // מניעת כפילות באותה משמרת במיקומים שונים
                              const isDuplicateInSameShiftDifferentPosition =
                                Object.entries(assignments).some(
                                  ([assignKey, assignId]) => {
                                    const [assignDate, assignPos, assignShift] =
                                      assignKey.split("|");
                                    return (
                                      assignDate === date &&
                                      assignShift === shiftType &&
                                      assignId === user.id.toString() &&
                                      assignKey !== key
                                    );
                                  }
                                );

                              // מניעת שיבוץ במשמרות רצופות
                              const isBlockedByAdjacentShift = Object.entries(
                                assignments
                              ).some(([assignKey, assignId]) => {
                                const [assignDate, assignPos, assignShift] =
                                  assignKey.split("|");

                                if (assignId !== user.id.toString())
                                  return false;

                                // באותו יום
                                if (
                                  assignDate === date &&
                                  assignShift !== shiftType
                                ) {
                                  const assignedIndex =
                                    shiftOrder.indexOf(assignShift);
                                  return (
                                    Math.abs(currentIndex - assignedIndex) < 2
                                  );
                                }

                                // בדיקה ללילה קודם + בוקר נוכחי
                                const currentDateObj = new Date(date);
                                const prevDate = new Date(currentDateObj);
                                prevDate.setDate(currentDateObj.getDate() - 1);
                                const prevDateStr = prevDate
                                  .toISOString()
                                  .split("T")[0];

                                return (
                                  assignDate === prevDateStr &&
                                  assignShift === "לילה" &&
                                  shiftType === "בוקר"
                                );
                              });

                              const isBlocked =
                                (isBlockedByAdjacentShift ||
                                  isDuplicateInSameShiftDifferentPosition) &&
                                selectedId !== user.id.toString();

                              if (isBlocked) return null;

                              const availability =
                                GuardConstraints.find(
                                  (c) =>
                                    c.id === user.id &&
                                    c.date === date &&
                                    c.shift === shiftType
                                )?.availability || "יכול";

                              return {
                                ...user,
                                availability,
                              };
                            })
                            .filter(Boolean)
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
                            });

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
                              {filteredGuards.map((user) => {
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
        uniqueUsers.push({
          id: parseInt(id),
          firstName: `עובד`,
          lastName: id,
        });
      }
    });

    const shiftOrder = ["בוקר", "ערב", "לילה"];

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
                  const selectedId = assignments[`${date}|${shift}`];

                  const filteredUsers = [...uniqueUsers]
                    .map((user) => {
                      const currentIndex = shiftOrder.indexOf(shift);

                      const isBlocked = Object.entries(assignments).some(
                        ([assignKey, assignId]) => {
                          const [assignDate, assignShift] =
                            assignKey.split("|");
                          const assignedIndex = shiftOrder.indexOf(assignShift);
                          const currentIndex = shiftOrder.indexOf(shift);

                          if (assignId !== user.id.toString()) return false;

                          // חסימת אותו יום – רציפות
                          if (assignDate === date) {
                            return (
                              Math.abs(currentIndex - assignedIndex) < 2 &&
                              assignShift !== shift
                            );
                          }

                          // חסימת לילה של אתמול מול בוקר של היום
                          const dateObj = new Date(date);
                          const prevDate = new Date(dateObj);
                          prevDate.setDate(dateObj.getDate() - 1);
                          const prevDateStr = prevDate
                            .toISOString()
                            .split("T")[0];

                          return (
                            assignDate === prevDateStr &&
                            assignShift === "לילה" &&
                            shift === "בוקר"
                          );
                        }
                      );

                      if (isBlocked && selectedId !== user.id.toString()) {
                        return null;
                      }

                      const constraint = kabatConstraints.find(
                        (c) =>
                          c.id === user.id &&
                          c.date === date &&
                          c.shift === shift
                      );

                      const availability = constraint?.availability || "יכול";

                      return {
                        ...user,
                        availability,
                      };
                    })
                    .filter(Boolean)
                    .sort((a, b) => {
                      const priority = {
                        יכול: 0,
                        "יכול חלקית": 1,
                        "לא יכול": 2,
                      };
                      return (
                        priority[a.availability] - priority[b.availability]
                      );
                    });

                  return (
                    <td key={date}>
                      <select
                        className="guard-select"
                        value={selectedId || ""}
                        onChange={(e) => handleChange(date, shift, e)}
                      >
                        <option value="">בחר עובד</option>
                        {filteredUsers.map((user) => {
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
            <button
              className="auto-fill-button"
              onClick={handleAutoAssignWeekTable}
            >
              מילוי סידור אוטומטי
            </button>
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
              className="auto-fill-button"
              onClick={handleAutoAssignFullGuardScheduleTable}
            >
              מילוי סידור אוטומטי
            </button>
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
