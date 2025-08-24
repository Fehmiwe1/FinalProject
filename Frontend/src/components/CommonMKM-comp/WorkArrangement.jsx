import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../../assets/styles/CommonMKM-styles/WorkArrangement.css";
import { useNavigate } from "react-router-dom";

function WorkArrangement() {
  // ---------- State ----------
  const [assignments, setAssignments] = useState([]);
  const [weeks, setWeeks] = useState([[], []]);
  const [guardWeekView, setGuardWeekView] = useState(0);
  const [permissions, setPermissions] = useState(null);
  const [me, setMe] = useState({
    userId: null,
    firstName: null,
    lastName: null,
    role: null,
  });
  const [myAssignments, setMyAssignments] = useState([]); // <<< המשמרות שלי ישירות מהשרת

  // UI: "המשמרות שלי" — צד ימין (drawer)
  const [myShiftsOpen, setMyShiftsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'give' | 'swap' | null
  const [selectedAssignment, setSelectedAssignment] = useState(null); // השורה שנבחרה לפעולה
  const [swapCandidatesOpen, setSwapCandidatesOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const userRole = Cookies.get("userRole");
  const roles = ["guard", "moked", "kabat"];
  const [selectedRole, setSelectedRole] = useState(userRole || "guard");

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

  // ---------- Dates generator (bi-weekly windows) ----------
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

  // ---------- Permissions ----------
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/role/getPermissions");
        const roleData = res.data.find((r) => r.Role_Name === userRole);
        if (roleData) setPermissions(roleData.permissions);
      } catch (err) {
        console.error("שגיאה בטעינת ההרשאות:", err);
      }
    };
    fetchPermissions();
  }, [userRole]);

  // ---------- Current user ("me") ----------
  useEffect(() => {
    const fromCookies = {
      userId:
        Cookies.get("userId") || Cookies.get("ID") || Cookies.get("id") || null,
      firstName:
        Cookies.get("firstName") || Cookies.get("userFirstName") || null,
      lastName: Cookies.get("lastName") || Cookies.get("userLastName") || null,
      role: Cookies.get("userRole") || null,
    };
    setMe(fromCookies);

    // אם חסר משהו — נביא מהשרת את המשתמש + המשמרות שלו
    if (
      !fromCookies.userId ||
      !fromCookies.firstName ||
      !fromCookies.lastName
    ) {
      (async () => {
        try {
          const r = await axios.get("/employeeShiftRequests/me", {
            withCredentials: true,
          });
          if (r?.data) {
            setMe((prev) => ({
              ...prev,
              userId: r.data.userId ?? prev.userId,
              firstName: r.data.firstName ?? prev.firstName,
              lastName: r.data.lastName ?? prev.lastName,
              role: r.data.role ?? prev.role,
            }));
            setMyAssignments(r.data.assignments || []);
          }
        } catch (e) {
          // לא קריטי – נ fallback לשמות בקבצי המשימות
        }
      })();
    } else {
      // גם אם יש קוקיז, נשלים משמרות שלי מהשרת כדי להיות מדויקים
      (async () => {
        try {
          const r = await axios.get("/employeeShiftRequests/me", {
            withCredentials: true,
          });
          if (r?.data?.assignments) setMyAssignments(r.data.assignments);
        } catch (e) {
          // שקט
        }
      })();
    }
  }, []);

  // ---------- Assignments ----------
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
        setAssignments(res.data || []);
      } catch (err) {
        console.error("שגיאה בטעינת הסידור:", err);
      }
    };
    fetchAssignments();
  }, [selectedRole]);

  // ---------- Helpers ----------
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

  // האם השורה היא של המשתמש
  const isMine = (a) => {
    if (!a) return false;

    const myId = me.userId ? String(me.userId).trim() : null;
    const candIds = [
      a.employeeId,
      a.Employee_ID,
      a.employee_id,
      a.ID_employee,
      a.userId,
      a.userID,
      a.id,
      a.ID,
    ]
      .filter((v) => v !== undefined && v !== null)
      .map((v) => String(v).trim());

    if (myId && candIds.some((id) => id === myId)) return true;

    // fallback לפי שמות
    const norm = (s) =>
      String(s || "")
        .trim()
        .toLowerCase();
    if (me.firstName && me.lastName && a.firstName && a.lastName) {
      return (
        norm(a.firstName) === norm(me.firstName) &&
        norm(a.lastName) === norm(me.lastName)
      );
    }
    return false;
  };

  // המשמרות של המשתמש (Guard בלבד) — קודם כל מהשרת, ואם אין נפלטר מקומי
  const myGuardAssignments = useMemo(() => {
    if (selectedRole !== "guard") return [];
    if (myAssignments && myAssignments.length > 0) return myAssignments;
    return (assignments || []).filter(isMine);
  }, [
    myAssignments,
    assignments,
    selectedRole,
    me.userId,
    me.firstName,
    me.lastName,
  ]);

  // מועמדים להחלפה — שומרים אחרים באותו יום+משמרת (לא כולל אותי)
  const swapCandidates = useMemo(() => {
    if (!selectedAssignment) return [];
    return (assignments || []).filter(
      (a) =>
        a.date === selectedAssignment.date &&
        a.shift === selectedAssignment.shift &&
        !isMine(a)
    );
  }, [assignments, selectedAssignment]);

  // ---------- Actions ----------
  const openMyShifts = () => {
    setMyShiftsOpen(true);
    setSelectedAction(null);
    setSelectedAssignment(null);
    setSwapCandidatesOpen(false);
  };
  const closeMyShifts = () => {
    setMyShiftsOpen(false);
    setSelectedAction(null);
    setSelectedAssignment(null);
    setSwapCandidatesOpen(false);
  };

  const chooseAction = (assignment, action) => {
    setSelectedAssignment(assignment);
    setSelectedAction(action); // 'give' | 'swap'
    if (action === "swap" || action === "give") {
      setSwapCandidatesOpen(true);
    } else {
      setSwapCandidatesOpen(false);
    }
  };

  const sendGiveRequest = async (target) => {
    if (!selectedAssignment || !target) return;
    try {
      setSending(true);
      await axios.post(
        "/employeeShiftRequests/requestGive",
        {
          fromEmployeeId: me.userId ?? null,
          fromFirstName: me.firstName ?? null,
          fromLastName: me.lastName ?? null,
          // יעד (אופציונלי – השרת יכול להתעלם אם לא תומך)
          toEmployeeId:
            target.employeeId ??
            target.id ??
            target.ID ??
            target.Employee_ID ??
            null,
          toFirstName: target.firstName ?? null,
          toLastName: target.lastName ?? null,

          role: "guard",
          date: selectedAssignment.date,
          shift: selectedAssignment.shift,
          location:
            selectedAssignment.location ?? selectedAssignment.role ?? "ראשי",
          note: "",
        },
        { withCredentials: true }
      );
      setToast({ type: "success", text: "בקשת מסירה נשלחה." });
      setSelectedAction(null);
      setSelectedAssignment(null);
      setSwapCandidatesOpen(false);
    } catch (e) {
      console.error(e);
      setToast({ type: "error", text: "שליחת בקשת מסירה נכשלה." });
    } finally {
      setSending(false);
    }
  };

  const sendSwapRequest = async (target) => {
    if (!selectedAssignment || !target) return;
    try {
      setSending(true);
      await axios.post(
        "/employeeShiftRequests/requestSwap",
        {
          fromEmployeeId: me.userId ?? null,
          toEmployeeId:
            target.employeeId ??
            target.id ??
            target.ID ??
            target.Employee_ID ??
            null,
          toFirstName: target.firstName ?? null, // נשמור שמות לפולבאק בשרת
          toLastName: target.lastName ?? null,
          role: "guard",
          date: selectedAssignment.date,
          shift: selectedAssignment.shift,
          location:
            selectedAssignment.location ?? selectedAssignment.role ?? "ראשי",
          note: "",
        },
        { withCredentials: true }
      );
      setToast({ type: "success", text: "בקשת החלפה נשלחה." });
      setSelectedAction(null);
      setSelectedAssignment(null);
      setSwapCandidatesOpen(false);
    } catch (e) {
      console.error(e);
      setToast({ type: "error", text: "שליחת בקשת החלפה נכשלה." });
    } finally {
      setSending(false);
    }
  };

  // ---------- Renderers ----------
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
                    {assigned.map((a, idx) => {
                      const meMark = isMine(a) ? " (אני)" : "";
                      return (
                        <div key={idx}>
                          {(a.firstName && a.lastName
                            ? `${a.firstName} ${a.lastName}`
                            : a.employeeName) + meMark}
                        </div>
                      );
                    })}
                    {assigned.length === 0 && "—"}
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
                        const label =
                          a &&
                          (a.firstName && a.lastName
                            ? `${a.firstName} ${a.lastName}`
                            : a?.employeeName || "—");

                        const mine = a && isMine(a);

                        return (
                          <div
                            key={idx}
                            className={`slot ${mine ? "mine" : ""}`}
                          >
                            {label}
                            {mine && (
                              <div className="slot-actions">
                                <button
                                  className="mini-btn combined"
                                  onClick={() => {
                                    setMyShiftsOpen(true);
                                    setSelectedAssignment(a);
                                  }}
                                >
                                  החלפה/מסירה
                                </button>
                              </div>
                            )}
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

        <button className="myShiftsButton" onClick={openMyShifts}>
          המשמרות שלי
        </button>

        {/* Drawer - My Shifts */}
        {myShiftsOpen && (
          <div className="drawer-backdrop" onClick={closeMyShifts}>
            <aside className="drawer" onClick={(e) => e.stopPropagation()}>
              <header className="drawer-header">
                <h3>המשמרות שלי (מאבטח)</h3>
                <button className="close" onClick={closeMyShifts}>
                  ×
                </button>
              </header>

              <div className="drawer-body">
                {myGuardAssignments.length === 0 ? (
                  <p>לא נמצאו משמרות עבורך בטווח הנוכחי.</p>
                ) : (
                  <table className="myshifts-table">
                    <thead>
                      <tr>
                        <th>תאריך</th>
                        <th>יום</th>
                        <th>עמדה</th>
                        <th>משמרת</th>
                        <th>פעולה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myGuardAssignments
                        .sort((a, b) =>
                          a.date < b.date ? -1 : a.date > b.date ? 1 : 0
                        )
                        .map((a, i) => {
                          const d = new Date(a.date);
                          return (
                            <tr
                              key={i}
                              className={
                                selectedAssignment === a ? "selected" : ""
                              }
                            >
                              <td>{formatDateToHebrew(a.date)}</td>
                              <td>{dayNames[d.getDay()]}</td>
                              <td>{a.location || a.role || "ראשי"}</td>
                              <td>{a.shift}</td>
                              <td className="row-actions">
                                <button
                                  className={`row-btn give ${
                                    selectedAction === "give" &&
                                    selectedAssignment === a
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => chooseAction(a, "give")}
                                >
                                  מסירה
                                </button>
                                <button
                                  className={`row-btn swap ${
                                    selectedAction === "swap" &&
                                    selectedAssignment === a
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => chooseAction(a, "swap")}
                                >
                                  החלפה
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}

                {/* GIVE: רשימת עובדים שניתן למסור אליהם */}
                {selectedAction === "give" && selectedAssignment && (
                  <div className="swap-candidates">
                    <h4>עובדים שאפשר למסור אליהם (אותו יום ומשמרת)</h4>
                    {swapCandidatesOpen && (
                      <>
                        {swapCandidates.length === 0 ? (
                          <p>לא נמצאו מועמדים מתאימים.</p>
                        ) : (
                          <ul className="candidates-list">
                            {swapCandidates.map((c, idx) => (
                              <li key={idx} className="candidate">
                                <div className="candidate-main">
                                  <span className="name">
                                    {c.firstName && c.lastName
                                      ? `${c.firstName} ${c.lastName}`
                                      : c.employeeName}
                                  </span>
                                  <span className="meta">
                                    {c.location || c.role || "עמדה"} ·{" "}
                                    {formatDateToHebrew(c.date)} · {c.shift}
                                  </span>
                                </div>
                                <div className="candidate-actions">
                                  <button
                                    className="primary"
                                    disabled={sending}
                                    onClick={() => sendGiveRequest(c)}
                                  >
                                    בקשת מסירה
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}

                {selectedAction === "swap" && selectedAssignment && (
                  <div className="swap-candidates">
                    <h4>מועמדים להחלפה (אותו יום ומשמרת)</h4>
                    {swapCandidatesOpen && (
                      <>
                        {swapCandidates.length === 0 ? (
                          <p>לא נמצאו מועמדים מתאימים.</p>
                        ) : (
                          <ul className="candidates-list">
                            {swapCandidates.map((c, idx) => (
                              <li key={idx} className="candidate">
                                <div className="candidate-main">
                                  <span className="name">
                                    {c.firstName && c.lastName
                                      ? `${c.firstName} ${c.lastName}`
                                      : c.employeeName}
                                  </span>
                                  <span className="meta">
                                    {c.location || c.role || "עמדה"} ·{" "}
                                    {formatDateToHebrew(c.date)} · {c.shift}
                                  </span>
                                </div>
                                <div className="candidate-actions">
                                  <button
                                    className="primary"
                                    disabled={sending}
                                    onClick={() => sendSwapRequest(c)}
                                  >
                                    בקש החלפה
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {toast.text && (
                <div
                  className={`toast ${toast.type}`}
                  onAnimationEnd={() => setToast({ type: "", text: "" })}
                >
                  {toast.text}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default WorkArrangement;
