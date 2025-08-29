// WorkArrangement.jsx
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

  // Drawer + UI
  const [myShiftsOpen, setMyShiftsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null); // 'give' | 'swap' | null
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [swapCandidatesOpen, setSwapCandidatesOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" }); // ← הודעת טקסט במקום toast

  // מועמדים מהשרת (למסירה/החלפה)
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

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
    "מוקד",
    "קבט",
  ];
  const guardPositions = positions.filter((p) => p !== "מוקד" && p !== "קבט");

  const roleLabel = (r) =>
    r === "guard" ? "מאבטח" : r === "moked" ? "מוקד" : "קבט";
  const roleHeb = roleLabel(selectedRole);

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
        }
      } catch (e) {
        // לא קריטי
      }
    })();
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
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
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

    if (selectedRole !== "guard") return false;
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

  const getPositionOf = (a) => {
    if (!a) return null;
    if (positions.includes(a.location)) return a.location;
    if (positions.includes(a.role)) return a.role;
    return a.location || a.role || null;
  };

  const myRoleAssignments = useMemo(
    () => (assignments || []).filter(isMine),
    [assignments, me.userId, me.firstName, me.lastName, selectedRole]
  );

  // ---------- Candidates ----------
  const fetchCandidates = async (assignment, role, action) => {
    if (!assignment) {
      setCandidates([]);
      return;
    }
    try {
      setLoadingCandidates(true);

      if (role === "guard") {
        const loc = (assignment.location || assignment.role || "ראשי")
          .replace(/["׳״']/g, "")
          .replace(/\s+/g, "");
        const res = await axios.get("/employeeShiftRequests/candidates/guard", {
          params: {
            date: assignment.date,
            shift: assignment.shift,
            location: loc,
          },
          withCredentials: true,
        });
        setCandidates(Array.isArray(res.data) ? res.data : []);
      } else if (role === "moked" || role === "kabat") {
        const res = await axios.get(
          `/employeeShiftRequests/candidates/${
            role === "moked" ? "moked" : "kabat"
          }`,
          {
            params: {
              date: assignment.date,
              shift: assignment.shift,
              purpose: action === "give" ? "give" : "swap",
            },
            withCredentials: true,
          }
        );
        setCandidates(Array.isArray(res.data) ? res.data : []);
      } else {
        setCandidates([]);
      }
    } catch (e) {
      console.error("fetchCandidates error:", e);
      setCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // ---------- Actions ----------
  const openMyShifts = () => {
    setMyShiftsOpen(true);
    setSelectedAction(null);
    setSelectedAssignment(null);
    setSwapCandidatesOpen(false);
    setCandidates([]);
    setFeedback({ type: "", text: "" });
  };
  const closeMyShifts = () => {
    setMyShiftsOpen(false);
    setSelectedAction(null);
    setSelectedAssignment(null);
    setSwapCandidatesOpen(false);
    setCandidates([]);
    setFeedback({ type: "", text: "" });
  };

  const chooseAction = (assignment, action) => {
    setSelectedAssignment(assignment);
    setSelectedAction(action); // 'give' | 'swap'
    setSwapCandidatesOpen(true);
    setCandidates([]);
    setFeedback({ type: "", text: "" });
    fetchCandidates(assignment, selectedRole, action);
  };

  // פתיחת דף החלפה/מסירה מהמשבצת בטבלה (פותח Drawer בצד)
  const openSwapGiveFromSlot = (a) => {
    setMyShiftsOpen(true); // פתח מגירה צדדית
    setSelectedAssignment(a); // סמן את המשמרת שנבחרה
    setSelectedAction(null); // ממתין לבחירת פעולה
    setSwapCandidatesOpen(true); // פתח אזור הפעולות/מועמדים
    setCandidates([]); // נקה מועמדים
    setFeedback({ type: "", text: "" }); // נקה הודעות
  };

  // כשמשתנה role/assignment/action בזמן שה-drawer פתוח — רענון מועמדים
  useEffect(() => {
    if (!myShiftsOpen) return;
    if (!selectedAssignment) return;
    if (!selectedAction) return;
    fetchCandidates(selectedAssignment, selectedRole, selectedAction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, selectedAssignment, selectedAction, myShiftsOpen]);

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
          toEmployeeId:
            target.employeeId ??
            target.id ??
            target.ID ??
            target.Employee_ID ??
            null,
          toFirstName: target.firstName ?? null,
          toLastName: target.lastName ?? null,
          role: selectedRole,
          date: selectedAssignment.date,
          shift: selectedAssignment.shift,
          location:
            selectedRole === "guard"
              ? getPositionOf(selectedAssignment) || "ראשי"
              : roleHeb,
          note: "",
        },
        { withCredentials: true }
      );
      setFeedback({ type: "success", text: "בקשת מסירה נשלחה." });
      // איפוס מינימלי אך השארת המגירה פתוחה כדי לראות את ההודעה
      setSelectedAction(null);
      setSelectedAssignment(null);
      setSwapCandidatesOpen(false);
      setCandidates([]);
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", text: "שליחת בקשת מסירה נכשלה." });
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
          toFirstName: target.firstName ?? null,
          toLastName: target.lastName ?? null,
          role: selectedRole,
          date: selectedAssignment.date,
          shift: selectedAssignment.shift,
          location:
            selectedRole === "guard"
              ? getPositionOf(selectedAssignment) || "ראשי"
              : roleHeb,
          note: "",
        },
        { withCredentials: true }
      );
      setFeedback({ type: "success", text: "בקשת החלפה נשלחה." });
      setSelectedAction(null);
      setSelectedAssignment(null);
      setSwapCandidatesOpen(false);
      setCandidates([]);
    } catch (e) {
      console.error(e);
      setFeedback({ type: "error", text: "שליחת בקשת החלפה נכשלה." });
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
                      const mine = isMine(a);
                      const label =
                        (a.firstName && a.lastName
                          ? `${a.firstName} ${a.lastName}`
                          : a.employeeName) + (mine ? " (אני)" : "");
                      return (
                        <div key={idx} className={`slot ${mine ? "mine" : ""}`}>
                          {label}
                          {mine && (
                            <div className="slot-actions">
                              <button
                                className="mini-btn combined"
                                onClick={() => openSwapGiveFromSlot(a)}
                              >
                                החלפה/מסירה
                              </button>
                            </div>
                          )}
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
          {guardPositions.map((position) =>
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
                                  onClick={() => openSwapGiveFromSlot(a)}
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
    if (userRole === "moked") return true;
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
                    : "קבט"}
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
                <h3>המשמרות שלי ({roleHeb})</h3>
                <button className="close" onClick={closeMyShifts}>
                  ×
                </button>
              </header>

              <div className="drawer-body">
                {/* הודעת הצלחה/שגיאה כטקסט */}
                {feedback.text && (
                  <div className={`feedback-message ${feedback.type}`}>
                    {feedback.text}
                  </div>
                )}

                {myRoleAssignments.length === 0 ? (
                  <p>לא נמצאו משמרות עבורך בטווח הנוכחי.</p>
                ) : (
                  <table className="myshifts-table">
                    <thead>
                      <tr>
                        <th>תאריך</th>
                        <th>יום</th>
                        <th>{selectedRole === "guard" ? "עמדה" : "תפקיד"}</th>
                        <th>משמרת</th>
                        <th>פעולה</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRoleAssignments
                        .slice()
                        .sort((a, b) =>
                          a.date < b.date ? -1 : a.date > b.date ? 1 : 0
                        )
                        .map((a, i) => {
                          const d = new Date(a.date);
                          const pos =
                            selectedRole === "guard"
                              ? getPositionOf(a) || "ראשי"
                              : roleHeb;
                          const selectedRow = selectedAssignment === a;
                          return (
                            <tr
                              key={i}
                              className={selectedRow ? "selected" : ""}
                            >
                              <td>{formatDateToHebrew(a.date)}</td>
                              <td>{dayNames[d.getDay()]}</td>
                              <td>{pos}</td>
                              <td>{a.shift}</td>
                              <td className="row-actions">
                                <button
                                  className={`row-btn give ${
                                    selectedAction === "give" && selectedRow
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => chooseAction(a, "give")}
                                >
                                  מסירה
                                </button>
                                <button
                                  className={`row-btn swap ${
                                    selectedAction === "swap" && selectedRow
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

                {/* GIVE */}
                {swapCandidatesOpen &&
                  selectedAssignment &&
                  selectedAction === "give" && (
                    <div className="swap-candidates">
                      <h4>
                        עובדים שאפשר למסור אליהם (אותו יום ומשמרת
                        {selectedRole === "guard"
                          ? " ובאותה עמדה"
                          : ` ו${roleHeb}`}
                        )
                      </h4>
                      {loadingCandidates ? (
                        <p>טוען מועמדים...</p>
                      ) : candidates.length === 0 ? (
                        <p>לא נמצאו מועמדים מתאימים.</p>
                      ) : (
                        <ul className="candidates-list">
                          {candidates.map((c, idx) => (
                            <li key={idx} className="candidate">
                              <div className="candidate-main">
                                <span className="name">
                                  {c.firstName && c.lastName
                                    ? `${c.firstName} ${c.lastName}`
                                    : c.employeeName}
                                </span>
                                <span className="meta">
                                  {(selectedRole === "guard"
                                    ? getPositionOf(c)
                                    : roleHeb) || "עמדה"}{" "}
                                  · {formatDateToHebrew(c.date)} · {c.shift}
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
                    </div>
                  )}

                {/* SWAP */}
                {swapCandidatesOpen &&
                  selectedAssignment &&
                  selectedAction === "swap" && (
                    <div className="swap-candidates">
                      <h4>
                        מועמדים להחלפה (אותו יום ומשמרת
                        {selectedRole === "guard"
                          ? " ובאותה עמדה"
                          : ` ו${roleHeb}`}
                        )
                      </h4>
                      {loadingCandidates ? (
                        <p>טוען מועמדים...</p>
                      ) : candidates.length === 0 ? (
                        <p>לא נמצאו מועמדים מתאימים.</p>
                      ) : (
                        <ul className="candidates-list">
                          {candidates.map((c, idx) => (
                            <li key={idx} className="candidate">
                              <div className="candidate-main">
                                <span className="name">
                                  {c.firstName && c.lastName
                                    ? `${c.firstName} ${c.lastName}`
                                    : c.employeeName}
                                </span>
                                <span className="meta">
                                  {(selectedRole === "guard"
                                    ? getPositionOf(c)
                                    : roleHeb) || "עמדה"}{" "}
                                  · {formatDateToHebrew(c.date)} · {c.shift}
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
                    </div>
                  )}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

export default WorkArrangement;
