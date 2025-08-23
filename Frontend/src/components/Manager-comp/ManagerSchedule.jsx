import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/ManagerSchedule.css";

const SHIFT_ORDER = ["בוקר", "ערב", "לילה"];
const DAY_NAMES_HE = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const POSITIONS = [
  "ראשי",
  "נשר",
  "סייר רכוב",
  "סייר א",
  "סייר ב",
  "סייר ג",
  "הפסקות",
];
const ROLES = ["מאבטח", "מוקד", "קבט"];
const SHIFTS = ["בוקר", "ערב", "לילה"];
const GUARD_SHIFTS = SHIFTS;

/** פונקציית עזר קבועה */
const formatDateToHebrew = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/** כמה מאבטחים נדרשים לכל תא (לפי עמדה/יום/משמרת) */
const getGuardCount = (shiftType, position, dayIdx) => {
  const dayName = DAY_NAMES_HE[dayIdx]; // 0..6 תואם לראשון..שבת
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

/** חישוב שבועיים פעילים לפי base=2025-06-01 והיום */
const useWeeks = () => {
  return useMemo(() => {
    const base = new Date("2025-06-01");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - base) / (1000 * 60 * 60 * 24));
    const periodIndex = Math.floor((diffDays + 1) / 14); // כמו בקוד שלך
    const startOfPeriod = new Date(base);
    startOfPeriod.setDate(base.getDate() + periodIndex * 14);

    const w1 = [];
    const w2 = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(startOfPeriod);
      d.setDate(startOfPeriod.getDate() + i);
      (i < 7 ? w1 : w2).push(d.toISOString().split("T")[0]);
    }
    return [w1, w2];
  }, []);
};

function ManagerSchedule() {
  const [selectedRole, setSelectedRole] = useState("מאבטח");
  const [kabatConstraints, setKabatConstraints] = useState([]); // גם מוקד משתמש בזה
  const [GuardConstraints, setGuardConstraints] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [guardWeekView, setGuardWeekView] = useState(0); // 0 = שבוע ראשון, 1 = שבוע שני

  const weeks = useWeeks(); // [[], []]

  /** טעינת נתונים במקביל לפי תפקיד */
  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      try {
        if (selectedRole === "קבט") {
          setGuardConstraints([]);
          const [constraintsRes, assignmentsRes] = await Promise.all([
            axios.get("/createSchedule/scheduleKabet", {
              withCredentials: true,
            }),
            axios.get("/createSchedule/allKabatAssignments", {
              withCredentials: true,
            }),
          ]);
          if (isCancelled) return;
          setKabatConstraints(constraintsRes.data || []);

          const newAssignments = {};
          for (const row of assignmentsRes.data || []) {
            // מפתח: date|shift -> id
            newAssignments[`${row.date}|${row.shift}`] = row.id?.toString();
          }
          setAssignments(newAssignments);
        } else if (selectedRole === "מוקד") {
          setGuardConstraints([]);
          const [constraintsRes, assignmentsRes] = await Promise.all([
            axios.get("/createSchedule/scheduleMoked", {
              withCredentials: true,
            }),
            axios.get("/createSchedule/allMokedAssignments", {
              withCredentials: true,
            }),
          ]);
          if (isCancelled) return;
          setKabatConstraints(constraintsRes.data || []);

          const newAssignments = {};
          for (const row of assignmentsRes.data || []) {
            newAssignments[`${row.date}|${row.shift}`] = row.id?.toString();
          }
          setAssignments(newAssignments);
        } else if (selectedRole === "מאבטח") {
          setKabatConstraints([]);
          const [constraintsRes, assignmentsRes] = await Promise.all([
            axios.get("/createSchedule/scheduleGuard", {
              withCredentials: true,
            }),
            axios.get("/createSchedule/allGuardAssignments", {
              withCredentials: true,
            }),
          ]);
          if (isCancelled) return;
          setGuardConstraints(constraintsRes.data || []);

          // בניית אינדקס יעיל לפי baseKey: date|location|shift -> רץ
          const counters = new Map();
          const newAssignments = {};
          for (const row of assignmentsRes.data || []) {
            const base = `${row.date}|${row.location}|${row.shift}`;
            const idx = counters.get(base) ?? 0;
            counters.set(base, idx + 1);
            newAssignments[`${base}|${idx}`] = row.id?.toString();
          }
          setAssignments(newAssignments);
        }
      } catch (err) {
        console.error("שגיאה בטעינת נתונים:", err);
      }
    };
    setAssignments({}); // לנקות לפני טעינה חדשה
    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [selectedRole]);

  /** מיפוי זמינות O(1) */
  const guardAvailabilityMap = useMemo(() => {
    const m = new Map();
    for (const c of GuardConstraints) {
      m.set(`${c.id}|${c.date}|${c.shift}`, c.availability || "יכול");
    }
    return m;
  }, [GuardConstraints]);

  const kabatAvailabilityMap = useMemo(() => {
    const m = new Map();
    for (const c of kabatConstraints) {
      m.set(`${c.id}|${c.date}|${c.shift}`, c.availability || "יכול");
    }
    return m;
  }, [kabatConstraints]);

  /** יוזרים ייחודיים */
  const uniqueGuards = useMemo(() => {
    const seen = new Set();
    const arr = [];
    for (const g of GuardConstraints) {
      if (seen.has(g.id)) continue;
      seen.add(g.id);
      arr.push({ id: g.id, firstName: g.firstName, lastName: g.lastName });
    }
    return arr;
  }, [GuardConstraints]);

  const uniqueKabatUsers = useMemo(() => {
    const seen = new Set();
    const arr = [];
    for (const k of kabatConstraints) {
      if (seen.has(k.id)) continue;
      seen.add(k.id);
      arr.push({ id: k.id, firstName: k.firstName, lastName: k.lastName });
    }
    return arr;
  }, [kabatConstraints]);

  /** שיבוצי משתמשים לפי יום (לבלימת רצף משמרות) */
  const userAssignmentsByDate = useMemo(() => {
    // userId -> date -> Set(shifts)
    const m = new Map();
    for (const [key, uid] of Object.entries(assignments)) {
      if (!uid) continue;
      const parts = key.split("|");
      const [date, shift] =
        selectedRole === "מאבטח" ? [parts[0], parts[2]] : [parts[0], parts[1]];
      if (!m.has(uid)) m.set(uid, new Map());
      if (!m.get(uid).has(date)) m.get(uid).set(date, new Set());
      m.get(uid).get(date).add(shift);
    }
    return m;
  }, [assignments, selectedRole]);

  /** בדיקת חסימת משמרת רצופה / לילה לפני בוקר */
  const isBlocked = useCallback(
    (userId, date, shift) => {
      const idx = SHIFT_ORDER.indexOf(shift);
      const sameDay = userAssignmentsByDate.get(userId)?.get(date);
      if (sameDay) {
        for (const s of sameDay) {
          if (s === shift) continue;
          const j = SHIFT_ORDER.indexOf(s);
          if (Math.abs(idx - j) < 2) return true; // משמרות סמוכות באותו יום
        }
      }
      // לילה של אתמול מול בוקר של היום
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      const prev = d.toISOString().split("T")[0];
      const prevSet = userAssignmentsByDate.get(userId)?.get(prev);
      if (prevSet && prevSet.has("לילה") && shift === "בוקר") return true;
      return false;
    },
    [userAssignmentsByDate]
  );

  /** זמינות לפי מפות */
  const getAvailability = useCallback(
    (id, date, shift) => {
      if (selectedRole === "מאבטח") {
        return guardAvailabilityMap.get(`${id}|${date}|${shift}`) || "יכול";
      }
      return kabatAvailabilityMap.get(`${id}|${date}|${shift}`) || "יכול";
    },
    [selectedRole, guardAvailabilityMap, kabatAvailabilityMap]
  );

  /** Handlers */
  const handleChangeCustom = useCallback((key, userId) => {
    setAssignments((prev) =>
      prev[key] === userId ? prev : { ...prev, [key]: userId }
    );
  }, []);

  const handleChange = useCallback((date, shift, e) => {
    const value = e.target.value;
    const key = `${date}|${shift}`;
    setAssignments((prev) =>
      prev[key] === value ? prev : { ...prev, [key]: value }
    );
  }, []);

  const flashMessage = useCallback((txt, type = "success") => {
    setMessage(txt);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  }, []);

  const handleSaveSchedule = useCallback(async () => {
    // קב"ט/מוקד: date|shift
    const seen = new Set();
    const assignmentsToSend = [];

    for (const [key, userId] of Object.entries(assignments)) {
      const [date, shift] = key.split("|");
      const uniqueKey = `${date}|${shift}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);
      if (userId)
        assignmentsToSend.push({
          date,
          shift,
          userId,
          role: selectedRole,
          location: "אחר",
        });
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
      flashMessage("סידור העבודה נשמר בהצלחה", "success");
    } catch (err) {
      console.error("שגיאה בשליחת הסידור:", err);
      flashMessage("אירעה שגיאה בשמירת הסידור", "error");
    }
  }, [assignments, selectedRole, flashMessage]);

  const handleSaveScheduleForGuard = useCallback(async () => {
    // מאבטחים: date|position|shift|index
    const positionToRoleMap = {
      ראשי: "מאבטח",
      נשר: "מאבטח",
      "סייר רכוב": "סייר רכוב",
      "סייר א": "סייר א",
      "סייר ב": "סייר ב",
      "סייר ג": "סייר ג",
      הפסקות: "הפסקות",
    };

    const assignmentsToSend = Object.entries(assignments).map(
      ([key, userId]) => {
        const [date, position, shiftType, index] = key.split("|");
        const role = positionToRoleMap[position] || "מאבטח";
        return {
          date,
          shift: shiftType,
          userId,
          role,
          location: position,
          index: parseInt(index, 10),
        };
      }
    );

    try {
      await axios.post("/createSchedule/saveShiftsGuard", assignmentsToSend, {
        withCredentials: true,
      });
      flashMessage("סידור העבודה למאבטחים נשמר בהצלחה", "success");
    } catch (err) {
      console.error("שגיאה בשליחת סידור המאבטחים:", err);
      flashMessage("אירעה שגיאה בשמירת סידור המאבטחים", "error");
    }
  }, [assignments, flashMessage]);

  const handleAutoAssignWeekTable = useCallback(() => {
    if (selectedRole !== "מוקד" && selectedRole !== "קבט") {
      flashMessage('שיבוץ אוטומטי אפשרי רק למוקדנים ולקב"טים', "error");
      return;
    }
    const priority = { יכול: 0, "יכול חלקית": 1 };
    const newAssignments = { ...assignments };

    const users = uniqueKabatUsers;

    weeks.flat().forEach((date) => {
      SHIFTS.forEach((shift) => {
        const key = `${date}|${shift}`;
        if (newAssignments[key]) return; // אל תדרוס קיים

        // רשימת מועמדים
        const candidates = users
          .map((u) => {
            const availability = getAvailability(u.id, date, shift);
            return { ...u, availability };
          })
          .filter(
            (u) =>
              u.availability !== "לא יכול" &&
              !isBlocked(u.id.toString(), date, shift)
          )
          .sort(
            (a, b) =>
              (priority[a.availability] ?? 2) - (priority[b.availability] ?? 2)
          );

        if (candidates.length > 0) {
          newAssignments[key] = candidates[0].id.toString();
        }
      });
    });

    setAssignments(newAssignments);
    flashMessage("המילוי האוטומטי הושלם", "success");
  }, [
    assignments,
    selectedRole,
    weeks,
    uniqueKabatUsers,
    getAvailability,
    isBlocked,
    flashMessage,
  ]);

  const handleAutoAssignFullGuardScheduleTable = useCallback(() => {
    const priority = { יכול: 0, "יכול חלקית": 1 };
    const newAssignments = { ...assignments };

    weeks.flat().forEach((date, dayIdx) => {
      POSITIONS.forEach((position) => {
        GUARD_SHIFTS.forEach((shiftType) => {
          const count = getGuardCount(shiftType, position, dayIdx % 7);
          for (let idx = 0; idx < count; idx++) {
            const key = `${date}|${position}|${shiftType}|${idx}`;
            if (newAssignments[key]) continue; // קיים ידנית

            const candidates = uniqueGuards
              .map((u) => {
                const availability = getAvailability(u.id, date, shiftType);
                return { ...u, availability };
              })
              .filter((u) => {
                if (u.availability === "לא יכול") return false;
                // אין אותו משתמש באותה משמרת בתאריך הזה (בעמדה אחרת)
                const duplicateSameShift = Object.entries(newAssignments).some(
                  ([k, v]) => {
                    if (v !== u.id.toString()) return false;
                    const [kDate, , kShift] = k.split("|");
                    return kDate === date && kShift === shiftType;
                  }
                );
                if (duplicateSameShift) return false;
                // חסימת רצפים
                return !isBlocked(u.id.toString(), date, shiftType);
              })
              .sort(
                (a, b) =>
                  (priority[a.availability] ?? 2) -
                  (priority[b.availability] ?? 2)
              );

            if (candidates.length > 0) {
              newAssignments[key] = candidates[0].id.toString();
            }
          }
        });
      });
    });

    setAssignments(newAssignments);
    flashMessage("המילוי האוטומטי למאבטחים הושלם", "success");
  }, [
    assignments,
    weeks,
    uniqueGuards,
    getAvailability,
    flashMessage,
    isBlocked,
  ]);

  /** טבלת שבוע למוקד/קב"ט */
  const renderWeekTable = useCallback(
    (week, title) => {
      // מיפוי id->שם כדי לתמוך גם ב־assignments שלא מופיעים ב־constraints
      const userMap = {};
      const users = [...uniqueKabatUsers];

      // הוספת כל מי שמופיע ב־assignments בלי להיות ברשימת users (למניעת "עובד X")
      Object.values(assignments).forEach((id) => {
        if (!id) return;
        if (!users.find((u) => u.id.toString() === id.toString())) {
          users.push({
            id: parseInt(id, 10),
            firstName: "עובד",
            lastName: id.toString(),
          });
        }
      });

      users.forEach((u) => {
        userMap[u.id.toString()] = `${u.firstName} ${u.lastName}`;
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
                      יום {DAY_NAMES_HE[d.getDay()]}
                      <br />
                      {formatDateToHebrew(date)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {SHIFTS.map((shift) => (
                <tr key={shift}>
                  <td>{shift}</td>
                  {week.map((date, colIdx) => {
                    const key = `${date}|${shift}`;
                    const selectedId = assignments[key] || "";

                    // לבנות רשימת מועמדים מהירה
                    const filteredUsers = users
                      .map((u) => {
                        const availability = getAvailability(u.id, date, shift);
                        if (
                          availability === "לא יכול" &&
                          selectedId !== u.id.toString()
                        )
                          return null;
                        if (
                          isBlocked(u.id.toString(), date, shift) &&
                          selectedId !== u.id.toString()
                        )
                          return null;
                        return { ...u, availability };
                      })
                      .filter(Boolean)
                      .sort((a, b) => {
                        const pr = { יכול: 0, "יכול חלקית": 1, "לא יכול": 2 };
                        return (
                          (pr[a.availability] ?? 2) - (pr[b.availability] ?? 2)
                        );
                      })
                      .slice(0, 50); // להפחתת עומס DOM

                    return (
                      <td key={colIdx}>
                        <select
                          className="guard-select"
                          value={selectedId}
                          onChange={(e) => handleChange(date, shift, e)}
                        >
                          <option value="">בחר עובד</option>
                          {filteredUsers.map((u) => {
                            const optionClass =
                              u.availability === "לא יכול"
                                ? "red-option"
                                : u.availability === "יכול חלקית"
                                ? "yellow-option"
                                : "green-option";
                            return (
                              <option
                                key={u.id}
                                value={u.id.toString()}
                                className={optionClass}
                              >
                                {userMap[u.id.toString()] ||
                                  `${u.firstName} ${u.lastName}`}
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
    },
    [assignments, uniqueKabatUsers, getAvailability, isBlocked, handleChange]
  );

  /** טבלת שבוע למאבטחים (עמדה×משמרת) */
  const renderFullGuardScheduleTable = useCallback(
    (weekIndex) => {
      const week = weeks[weekIndex];

      return (
        <div className="guard-schedule-grid">
          <h3 className="title">
            {weekIndex === 0 ? "שבוע ראשון" : "שבוע שני"} - מאבטחים
          </h3>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>עמדה / תאריך</th>
                {week.map((date, i) => {
                  const d = new Date(date);
                  return (
                    <th key={i}>
                      יום {DAY_NAMES_HE[d.getDay()]}
                      <br />
                      {formatDateToHebrew(date)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {POSITIONS.map((position) =>
                GUARD_SHIFTS.map((shiftType) => (
                  <tr key={`${position}-${shiftType}`}>
                    <td>
                      {position} - {shiftType}
                    </td>
                    {week.map((date, i) => {
                      const count = getGuardCount(shiftType, position, i);
                      if (count === 0) return <td key={i}>—</td>;

                      return (
                        <td key={i}>
                          {Array.from({ length: count }).map((_, idx) => {
                            const key = `${date}|${position}|${shiftType}|${idx}`;
                            const selectedId = assignments[key] || "";

                            const filteredGuards = uniqueGuards
                              .map((u) => {
                                // לא לאפשר אותו עובד באותה משמרת בתאריך זה בעמדה אחרת (אלא אם זה הנבחר כאן)
                                const alreadyInSameShift = Object.entries(
                                  assignments
                                ).some(([k, v]) => {
                                  if (v !== u.id.toString()) return false;
                                  const [kDate, , kShift] = k.split("|");
                                  if (k === key) return false; // זה התא שלנו עצמו
                                  return kDate === date && kShift === shiftType;
                                });
                                if (
                                  alreadyInSameShift &&
                                  selectedId !== u.id.toString()
                                )
                                  return null;

                                const availability = getAvailability(
                                  u.id,
                                  date,
                                  shiftType
                                );
                                if (
                                  availability === "לא יכול" &&
                                  selectedId !== u.id.toString()
                                )
                                  return null;

                                if (
                                  isBlocked(u.id.toString(), date, shiftType) &&
                                  selectedId !== u.id.toString()
                                ) {
                                  return null;
                                }

                                return { ...u, availability };
                              })
                              .filter(Boolean)
                              .sort((a, b) => {
                                const pr = {
                                  יכול: 0,
                                  "יכול חלקית": 1,
                                  "לא יכול": 2,
                                };
                                return (
                                  (pr[a.availability] ?? 2) -
                                  (pr[b.availability] ?? 2)
                                );
                              })
                              .slice(0, 50); // להפחתת עומס DOM

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
                                {filteredGuards.map((u) => {
                                  const optionClass =
                                    u.availability === "לא יכול"
                                      ? "red-option"
                                      : u.availability === "יכול חלקית"
                                      ? "yellow-option"
                                      : "green-option";
                                  return (
                                    <option
                                      key={u.id}
                                      value={u.id.toString()}
                                      className={optionClass}
                                    >
                                      {u.firstName} {u.lastName}
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
    },
    [
      weeks,
      assignments,
      uniqueGuards,
      getAvailability,
      isBlocked,
      handleChangeCustom,
    ]
  );

  return (
    <div className="managerSchedulePage">
      <aside className="role-selector">
        {ROLES.map((role) => (
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
