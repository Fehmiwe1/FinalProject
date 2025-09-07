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

/* ===== Helpers ===== */
const formatDateToHebrew = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getGuardCount = (shiftType, position, dayIdx) => {
  const dayName = DAY_NAMES_HE[dayIdx];
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

const useWeeks = () =>
  useMemo(() => {
    const base = new Date("2025-06-01");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - base) / (1000 * 60 * 60 * 24));
    const periodIndex = Math.floor((diffDays + 1) / 14);
    const startOfPeriod = new Date(base);
    startOfPeriod.setDate(base.getDate() + periodIndex * 14);

    const w1 = [],
      w2 = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(startOfPeriod);
      d.setDate(startOfPeriod.getDate() + i);
      (i < 7 ? w1 : w2).push(d.toISOString().split("T")[0]);
    }
    return [w1, w2];
  }, []);

/* שמירה על בחירה קיימת בראש הרשימה אם איננה ברשימת המועמדים */
const ensureSelectedFirst = (list, selectedId, lookupById) => {
  if (!selectedId) return list;
  const exists = list.some((u) => u.id.toString() === selectedId.toString());
  if (exists) return list;
  const sel = lookupById(selectedId);
  if (!sel) return list;
  return [sel, ...list];
};

const hashInt = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
};

const normalizeAssignments = (role, raw) => {
  const next = { ...raw };

  // שלב 1: כפילויות באותה תאריך+משמרת
  const seenBaseUser = new Set(); // `${date}|${shift}|${uid}`
  const keys1 = Object.keys(next).sort();
  for (const k of keys1) {
    const uid = next[k];
    if (!uid) continue;
    const p = k.split("|");
    const [date, shift] = role === "מאבטח" ? [p[0], p[2]] : [p[0], p[1]];
    const mark = `${date}|${shift}|${uid}`;
    if (seenBaseUser.has(mark)) {
      delete next[k];
      continue;
    }
    seenBaseUser.add(mark);
  }

  // שלב 2: שתי משמרות ביום – שמור המוקדמת
  const byDay = new Map(); // `${date}|${uid}` -> {key, shift}
  const keys2 = Object.keys(next).sort();
  for (const k of keys2) {
    const uid = next[k];
    if (!uid) continue;
    const p = k.split("|");
    const [date, shift] = role === "מאבטח" ? [p[0], p[2]] : [p[0], p[1]];
    const dkey = `${date}|${uid}`;
    if (!byDay.has(dkey)) {
      byDay.set(dkey, { key: k, shift });
    } else {
      const prev = byDay.get(dkey);
      const iPrev = SHIFT_ORDER.indexOf(prev.shift);
      const iCurr = SHIFT_ORDER.indexOf(shift);
      if (iCurr > iPrev) {
        delete next[k];
      } else {
        delete next[prev.key];
        byDay.set(dkey, { key: k, shift });
      }
    }
  }

  return next;
};

function ManagerSchedule() {
  const [selectedRole, setSelectedRole] = useState("מאבטח");
  const [kabatConstraints, setKabatConstraints] = useState([]);
  const [GuardConstraints, setGuardConstraints] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [guardWeekView, setGuardWeekView] = useState(0);

  // התראה על חוסרים
  const [gaps, setGaps] = useState([]);
  const [showGaps, setShowGaps] = useState(false);

  const weeks = useWeeks();

  /* ===== Fetch ===== */
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
          const temp = {};
          for (const row of assignmentsRes.data || [])
            temp[`${row.date}|${row.shift}`] = row.id?.toString();
          setAssignments(normalizeAssignments("קבט", temp));
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
          const temp = {};
          for (const row of assignmentsRes.data || [])
            temp[`${row.date}|${row.shift}`] = row.id?.toString();
          setAssignments(normalizeAssignments("מוקד", temp));
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
          const counters = new Map();
          const temp = {};
          for (const row of assignmentsRes.data || []) {
            const base = `${row.date}|${row.location}|${row.shift}`;
            const idx = counters.get(base) ?? 0;
            counters.set(base, idx + 1);
            temp[`${base}|${idx}`] = row.id?.toString();
          }
          setAssignments(normalizeAssignments("מאבטח", temp));
        }
      } catch (err) {
        console.error("שגיאה בטעינת נתונים:", err);
      }
    };
    setAssignments({});
    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [selectedRole]);

  /* ===== Availability maps ===== */
  const guardAvailabilityMap = useMemo(() => {
    const m = new Map();
    for (const c of GuardConstraints)
      m.set(`${c.id}|${c.date}|${c.shift}`, c.availability || "יכול");
    return m;
  }, [GuardConstraints]);

  const kabatAvailabilityMap = useMemo(() => {
    const m = new Map();
    for (const c of kabatConstraints)
      m.set(`${c.id}|${c.date}|${c.shift}`, c.availability || "יכול");
    return m;
  }, [kabatConstraints]);

  /* ===== Unique users + lookup maps (מגיעים מה־API אחרי סינון status=active) ===== */
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

  const guardsById = useMemo(() => {
    const m = new Map();
    for (const u of uniqueGuards) m.set(u.id.toString(), u);
    return m;
  }, [uniqueGuards]);

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

  const kabatById = useMemo(() => {
    const m = new Map();
    for (const u of uniqueKabatUsers) m.set(u.id.toString(), u);
    return m;
  }, [uniqueKabatUsers]);

  /* ===== Duplicate protection per date|shift ===== */
  const assignedByDateShift = useMemo(() => {
    const m = new Map();
    for (const [key, uid] of Object.entries(assignments)) {
      if (!uid) continue;
      const parts = key.split("|");
      const base =
        parts.length === 4
          ? `${parts[0]}|${parts[2]}`
          : `${parts[0]}|${parts[1]}`;
      if (!m.has(base)) m.set(base, new Set());
      m.get(base).add(uid.toString());
    }
    return m;
  }, [assignments]);

  /* ===== Per-user per-day assignments (for block rules) ===== */
  const userAssignmentsByDate = useMemo(() => {
    const m = new Map();
    for (const [key, uid] of Object.entries(assignments)) {
      if (!uid) continue;
      const p = key.split("|");
      const [date, shift] = p.length === 4 ? [p[0], p[2]] : [p[0], p[1]];
      if (!m.has(uid)) m.set(uid, new Map());
      if (!m.get(uid).has(date)) m.get(uid).set(date, new Set());
      m.get(uid).get(date).add(shift);
    }
    return m;
  }, [assignments]);

  const isBlocked = useCallback(
    (userId, date, shift) => {
      const sameDay = userAssignmentsByDate.get(userId)?.get(date);
      if (sameDay && !(sameDay.size === 1 && sameDay.has(shift))) return true; // רק משמרת אחת ביום
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      const prev = d.toISOString().split("T")[0];
      const prevSet = userAssignmentsByDate.get(userId)?.get(prev);
      if (prevSet && prevSet.has("לילה") && shift === "בוקר") return true;
      return false;
    },
    [userAssignmentsByDate]
  );

  const getAvailability = useCallback(
    (id, date, shift) => {
      return (
        (selectedRole === "מאבטח"
          ? guardAvailabilityMap.get(`${id}|${date}|${shift}`)
          : kabatAvailabilityMap.get(`${id}|${date}|${shift}`)) || "יכול"
      );
    },
    [selectedRole, guardAvailabilityMap, kabatAvailabilityMap]
  );

  /* ===== אכיפת ייחודיות בבחירה ידנית ===== */
  const setUniqueAssignment = useCallback((targetKey, userId) => {
    setAssignments((prev) => {
      const next = { ...prev };
      const t = targetKey.split("|");
      const tDate = t[0];
      const tShift = t.length === 4 ? t[2] : t[1];
      const uid = (userId ?? "").toString();

      // הסר כל מופע אחר של אותו uid באותה תאריך+משמרת
      for (const [k, v] of Object.entries(prev)) {
        if (!v || k === targetKey) continue;
        const p = k.split("|");
        const [kDate, kShift] = p.length === 4 ? [p[0], p[2]] : [p[0], p[1]];
        if (v.toString() === uid && kDate === tDate && kShift === tShift)
          delete next[k];
      }
      // הסר משמרות אחרות באותו יום לאותו uid
      for (const [k, v] of Object.entries(prev)) {
        if (!v || k === targetKey) continue;
        const p = k.split("|");
        const [kDate, kShift] = p.length === 4 ? [p[0], p[2]] : [p[0], p[1]];
        if (v.toString() === uid && kDate === tDate && kShift !== tShift)
          delete next[k];
      }

      next[targetKey] = uid || "";
      return next;
    });
  }, []);

  const handleChangeCustom = useCallback(
    (key, userId) => setUniqueAssignment(key, userId),
    [setUniqueAssignment]
  );
  const handleChange = useCallback(
    (date, shift, e) => setUniqueAssignment(`${date}|${shift}`, e.target.value),
    [setUniqueAssignment]
  );

  const flashMessage = useCallback((txt, type = "success") => {
    setMessage(txt);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2200);
  }, []);

  /* ===== שמירה ===== */
  const handleSaveSchedule = useCallback(async () => {
    if (gaps.length > 0) {
      flashMessage(`שימו לב: יש ${gaps.length} חוסרים בסידור.`, "error");
    }
    const seen = new Set(),
      toSend = [];
    for (const [key, userId] of Object.entries(assignments)) {
      const [date, shift] = key.split("|");
      const uniq = `${date}|${shift}`;
      if (seen.has(uniq)) continue;
      seen.add(uniq);
      if (userId)
        toSend.push({
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
      await axios.post(endpoint, toSend, { withCredentials: true });
      flashMessage("סידור העבודה נשמר בהצלחה");
    } catch {
      flashMessage("אירעה שגיאה בשמירת הסידור", "error");
    }
  }, [assignments, selectedRole, flashMessage, gaps.length]);

  const handleSaveScheduleForGuard = useCallback(async () => {
    if (gaps.length > 0) {
      flashMessage(
        `שימו לב: יש ${gaps.length} חוסרים בסידור המאבטחים.`,
        "error"
      );
    }
    const mapRole = {
      ראשי: "מאבטח",
      נשר: "מאבטח",
      "סייר רכוב": "סייר רכוב",
      "סייר א": "סייר א",
      "סייר ב": "סייר ב",
      "סייר ג": "סייר ג",
      הפסקות: "הפסקות",
    };
    const toSend = Object.entries(assignments).map(([key, userId]) => {
      const [date, position, shiftType, index] = key.split("|");
      return {
        date,
        shift: shiftType,
        userId,
        role: mapRole[position] || "מאבטח",
        location: position,
        index: parseInt(index, 10),
      };
    });
    try {
      await axios.post("/createSchedule/saveShiftsGuard", toSend, {
        withCredentials: true,
      });
      flashMessage("סידור העבודה למאבטחים נשמר בהצלחה");
    } catch {
      flashMessage("אירעה שגיאה בשמירת סידור המאבטחים", "error");
    }
  }, [assignments, flashMessage, gaps.length]);

  /* ===== Usage count ===== */
  const usageCountFromAssignments = useMemo(() => {
    const m = new Map();
    for (const uid of Object.values(assignments))
      if (uid) m.set(uid.toString(), (m.get(uid.toString()) ?? 0) + 1);
    return m;
  }, [assignments]);

  /* ===== Auto-fill (מוקד/קבט) ===== */
  const handleAutoAssignWeekTable = useCallback(() => {
    if (selectedRole !== "מוקד" && selectedRole !== "קבט") {
      flashMessage('שיבוץ אוטומטי אפשרי רק למוקדנים ולקב"טים', "error");
      return;
    }
    const priority = { יכול: 0, "יכול חלקית": 1 };
    const temp = { ...assignments };
    const used = new Map(usageCountFromAssignments);
    const assignedDS = new Map(assignedByDateShift);
    const ds = (date, shift) => {
      const k = `${date}|${shift}`;
      if (!assignedDS.has(k)) assignedDS.set(k, new Set());
      return assignedDS.get(k);
    };

    const activeUsers = uniqueKabatUsers; // כבר פעילים מהשרת
    const totalSlots = weeks.flat().length * SHIFTS.length;
    const N = Math.max(1, activeUsers.length);
    const quota = Math.ceil(totalSlots / N);

    weeks.flat().forEach((date) => {
      SHIFTS.forEach((shift) => {
        const key = `${date}|${shift}`;
        if (temp[key]) {
          const uid = temp[key].toString();
          used.set(uid, (used.get(uid) ?? 0) + 1);
          ds(date, shift).add(uid);
          return;
        }
        const pick = (enforce) => {
          const cand = activeUsers
            .map((u) => ({
              ...u,
              availability: getAvailability(u.id, date, shift),
            }))
            .filter((u) => {
              if (u.availability === "לא יכול") return false;
              if (ds(date, shift).has(u.id.toString())) return false;
              if (isBlocked(u.id.toString(), date, shift)) return false;
              if (enforce && (used.get(u.id.toString()) ?? 0) >= quota)
                return false;
              return true;
            })
            .sort((a, b) => {
              const ua = used.get(a.id.toString()) ?? 0,
                ub = used.get(b.id.toString()) ?? 0;
              if (ua !== ub) return ua - ub;
              const pa = priority[a.availability] ?? 2,
                pb = priority[b.availability] ?? 2;
              if (pa !== pb) return pa - pb;
              const base = `${date}|${shift}`;
              return hashInt(`${base}|${a.id}`) - hashInt(`${base}|${b.id}`);
            });
          return cand[0] || null;
        };
        let chosen = pick(true);
        if (!chosen) chosen = pick(false);
        if (chosen) {
          const uid = chosen.id.toString();
          temp[key] = uid;
          used.set(uid, (used.get(uid) ?? 0) + 1);
          ds(date, shift).add(uid);
        }
      });
    });

    setAssignments(normalizeAssignments(selectedRole, temp));
    flashMessage("המילוי האוטומטי הושלם");
  }, [
    assignments,
    selectedRole,
    weeks,
    uniqueKabatUsers,
    getAvailability,
    isBlocked,
    flashMessage,
    usageCountFromAssignments,
    assignedByDateShift,
  ]);

  /* ===== Auto-fill (מאבטחים) ===== */
  const handleAutoAssignFullGuardScheduleTable = useCallback(() => {
    const priority = { יכול: 0, "יכול חלקית": 1 };
    const temp = { ...assignments };

    const used = new Map(usageCountFromAssignments);
    const assignedDS = new Map(assignedByDateShift);
    const ds = (date, shift) => {
      const k = `${date}|${shift}`;
      if (!assignedDS.has(k)) assignedDS.set(k, new Set());
      return assignedDS.get(k);
    };

    // uid -> Map(date -> Set(shifts))  (Runtime)
    const usedByDate = new Map();
    for (const [key, uid] of Object.entries(assignments)) {
      if (!uid) continue;
      const p = key.split("|");
      if (p.length !== 4) continue; // רק מאבטחים
      const date = p[0],
        shift = p[2],
        u = uid.toString();
      if (!usedByDate.has(u)) usedByDate.set(u, new Map());
      if (!usedByDate.get(u).has(date)) usedByDate.get(u).set(date, new Set());
      usedByDate.get(u).get(date).add(shift);
    }

    const hasBlockRuntime = (uid, date, shift) => {
      const u = uid.toString();
      const byDate = usedByDate.get(u);

      if (byDate && byDate.get(date)) {
        const set = byDate.get(date);
        if (set.size > 0 && !set.has(shift)) return true;
      }

      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      const prev = d.toISOString().split("T")[0];
      if (
        byDate &&
        byDate.get(prev) &&
        byDate.get(prev).has("לילה") &&
        shift === "בוקר"
      )
        return true;

      return false;
    };

    const markRuntime = (uid, date, shift) => {
      const u = uid.toString();
      if (!usedByDate.has(u)) usedByDate.set(u, new Map());
      if (!usedByDate.get(u).has(date)) usedByDate.get(u).set(date, new Set());
      usedByDate.get(u).get(date).add(shift);
    };

    const totalSlots = weeks.flat().reduce((acc, date, dayIdx) => {
      return (
        acc +
        POSITIONS.reduce(
          (s, pos) =>
            s +
            GUARD_SHIFTS.reduce(
              (t, sh) => t + getGuardCount(sh, pos, dayIdx % 7),
              0
            ),
          0
        )
      );
    }, 0);
    const N = Math.max(1, uniqueGuards.length);
    const quota = Math.ceil(totalSlots / N);

    weeks.flat().forEach((date, dayIdx) => {
      POSITIONS.forEach((position) => {
        GUARD_SHIFTS.forEach((shiftType) => {
          const need = getGuardCount(shiftType, position, dayIdx % 7);
          for (let idx = 0; idx < need; idx++) {
            const key = `${date}|${position}|${shiftType}|${idx}`;
            if (temp[key]) {
              const uid = temp[key].toString();
              used.set(uid, (used.get(uid) ?? 0) + 1);
              ds(date, shiftType).add(uid);
              markRuntime(uid, date, shiftType);
              continue;
            }

            const pick = (enforceQuota) => {
              const candidates = uniqueGuards
                .map((u) => ({
                  ...u,
                  availability: getAvailability(u.id, date, shiftType),
                }))
                .filter((u) => {
                  const uid = u.id.toString();
                  if (u.availability === "לא יכול") return false;
                  if (ds(date, shiftType).has(uid)) return false;
                  if (hasBlockRuntime(uid, date, shiftType)) return false;
                  if (enforceQuota && (used.get(uid) ?? 0) >= quota)
                    return false;
                  return true;
                })
                .sort((a, b) => {
                  const ua = used.get(a.id.toString()) ?? 0;
                  const ub = used.get(b.id.toString()) ?? 0;
                  if (ua !== ub) return ua - ub;
                  const pa = priority[a.availability] ?? 2;
                  const pb = priority[b.availability] ?? 2;
                  if (pa !== pb) return pa - pb;
                  const base = `${date}|${shiftType}`;
                  const ha = hashInt(`${base}|${a.id}`),
                    hb = hashInt(`${base}|${b.id}`);
                  return ha - hb;
                });
              return candidates[0] || null;
            };

            let chosen = pick(true);
            if (!chosen) chosen = pick(false);

            if (chosen) {
              const uid = chosen.id.toString();
              temp[key] = uid;
              used.set(uid, (used.get(uid) ?? 0) + 1);
              ds(date, shiftType).add(uid);
              markRuntime(uid, date, shiftType);
            }
          }
        });
      });
    });

    setAssignments(normalizeAssignments("מאבטח", temp));
    flashMessage(
      "המילוי האוטומטי למאבטחים הושלם (ללא כפילויות וללא לילה→בוקר)"
    );
  }, [
    assignments,
    weeks,
    uniqueGuards,
    getAvailability,
    flashMessage,
    assignedByDateShift,
    usageCountFromAssignments,
  ]);

  /* ======= חישוב חוסרים לסידור והצגת התראה ======= */
  const computeGaps = useCallback(() => {
    const allDates = weeks.flat();
    const out = [];

    if (selectedRole === "מוקד" || selectedRole === "קבט") {
      // תא אחד לכל תאריך×משמרת
      allDates.forEach((date) => {
        SHIFTS.forEach((shift) => {
          const key = `${date}|${shift}`;
          if (!assignments[key]) {
            out.push({ type: "single", date, shift });
          }
        });
      });
    } else if (selectedRole === "מאבטח") {
      allDates.forEach((date, dayIdx) => {
        POSITIONS.forEach((pos) => {
          SHIFTS.forEach((shift) => {
            const need = getGuardCount(shift, pos, dayIdx % 7);
            if (need === 0) return;
            let have = 0;
            for (let i = 0; i < need; i++) {
              const k = `${date}|${pos}|${shift}|${i}`;
              if (assignments[k]) have++;
            }
            const missing = need - have;
            if (missing > 0)
              out.push({ type: "multi", date, position: pos, shift, missing });
          });
        });
      });
    }
    return out;
  }, [assignments, selectedRole, weeks]);

  useEffect(() => {
    const gs = computeGaps();
    setGaps(gs);
  }, [assignments, selectedRole, weeks, computeGaps]);

  /* ===== Render: Kabat/Moked ===== */
  const renderWeekTable = useCallback(
    (week, title) => {
      const users = [...uniqueKabatUsers]; // פעילים בלבד
      const userMap = {};
      users.forEach(
        (u) => (userMap[u.id.toString()] = `${u.firstName} ${u.lastName}`)
      );
      const lookupById = (id) =>
        kabatById.get(id.toString()) || {
          id: parseInt(id, 10),
          firstName: "עובד",
          lastName: id.toString(),
        };

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
                    let candidates = users
                      .map((u) => {
                        const availability = getAvailability(u.id, date, shift);
                        const base = `${date}|${shift}`;
                        const dup = assignedByDateShift
                          .get(base)
                          ?.has(u.id.toString());
                        if (
                          availability === "לא יכול" &&
                          selectedId !== u.id.toString()
                        )
                          return null;
                        if (dup && selectedId !== u.id.toString()) return null;
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
                      });
                    candidates = ensureSelectedFirst(
                      candidates.slice(0, 50),
                      selectedId,
                      lookupById
                    );

                    const selectedIsInactive =
                      selectedId &&
                      !users.find(
                        (u) => u.id.toString() === selectedId.toString()
                      );

                    const missingCell = !selectedId; // עבור התראה ו־highlight אפשרי

                    return (
                      <td
                        key={colIdx}
                        className={missingCell ? "missing-cell" : ""}
                      >
                        <select
                          className="guard-select"
                          value={selectedId}
                          onChange={(e) => handleChange(date, shift, e)}
                        >
                          <option value="">בחר עובד</option>
                          {candidates.map((u) => {
                            const cls =
                              u.availability === "לא יכול"
                                ? "red-option"
                                : u.availability === "יכול חלקית"
                                ? "yellow-option"
                                : "green-option";
                            const label =
                              userMap[u.id.toString()] ||
                              `${u.firstName} ${u.lastName}`;
                            return (
                              <option
                                key={u.id}
                                value={u.id.toString()}
                                className={cls}
                              >
                                {label}
                              </option>
                            );
                          })}
                          {selectedIsInactive && (
                            <option
                              value={selectedId}
                              className="inactive-option"
                            >
                              עובד {selectedId} (לא פעיל)
                            </option>
                          )}
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
    [
      assignments,
      uniqueKabatUsers,
      getAvailability,
      isBlocked,
      handleChange,
      assignedByDateShift,
      kabatById,
    ]
  );

  /* ===== Render: Guards ===== */
  const renderFullGuardScheduleTable = useCallback(
    (weekIndex) => {
      const week = weeks[weekIndex];
      const lookupById = (id) => guardsById.get(id.toString()) || null;

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
                      const need = getGuardCount(shiftType, position, i);
                      if (!need) return <td key={i}>—</td>;
                      // כמה חסרים למשבצת לצורך highlight
                      let have = 0;
                      for (let idx = 0; idx < need; idx++) {
                        const k = `${date}|${position}|${shiftType}|${idx}`;
                        if (assignments[k]) have++;
                      }
                      const missing = need - have;

                      return (
                        <td
                          key={i}
                          className={missing > 0 ? "missing-cell" : ""}
                        >
                          {Array.from({ length: need }).map((_, idx) => {
                            const key = `${date}|${position}|${shiftType}|${idx}`;
                            const selectedId = assignments[key] || "";
                            let candidates = uniqueGuards
                              .map((u) => {
                                const availability = getAvailability(
                                  u.id,
                                  date,
                                  shiftType
                                );
                                const base = `${date}|${shiftType}`;
                                const dup = assignedByDateShift
                                  .get(base)
                                  ?.has(u.id.toString());
                                if (dup && selectedId !== u.id.toString())
                                  return null;
                                if (
                                  availability === "לא יכול" &&
                                  selectedId !== u.id.toString()
                                )
                                  return null;
                                if (
                                  isBlocked(u.id.toString(), date, shiftType) &&
                                  selectedId !== u.id.toString()
                                )
                                  return null;
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
                              });
                            candidates = ensureSelectedFirst(
                              candidates.slice(0, 50),
                              selectedId,
                              lookupById
                            );

                            const selectedIsInactive =
                              selectedId &&
                              !uniqueGuards.find(
                                (u) => u.id.toString() === selectedId.toString()
                              );

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
                                {candidates.map((u) => {
                                  const cls =
                                    u.availability === "לא יכול"
                                      ? "red-option"
                                      : u.availability === "יכול חלקית"
                                      ? "yellow-option"
                                      : "green-option";
                                  return (
                                    <option
                                      key={u.id}
                                      value={u.id.toString()}
                                      className={cls}
                                    >
                                      {u.firstName} {u.lastName}
                                    </option>
                                  );
                                })}
                                {selectedIsInactive && (
                                  <option
                                    value={selectedId}
                                    className="inactive-option"
                                  >
                                    עובד {selectedId} (לא פעיל)
                                  </option>
                                )}
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
      assignedByDateShift,
      guardsById,
    ]
  );

  /* ===== UI ===== */
  const gapsCount = gaps.length;

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

        {/* התראת חוסרים */}
        {gapsCount > 0 && (
          <div className="gap-warning">
            <strong>התראה:</strong> הסידור אינו מלא — נמצאו {gapsCount} חוסרים.
            <button className="linklike" onClick={() => setShowGaps((s) => !s)}>
              {showGaps ? "הסתר פירוט" : "הצג פירוט"}
            </button>
            {showGaps && (
              <ul className="gaps-list">
                {gaps.slice(0, 12).map((g, idx) =>
                  g.type === "single" ? (
                    <li key={idx}>
                      {formatDateToHebrew(g.date)} — משמרת {g.shift}: חסר עובד
                    </li>
                  ) : (
                    <li key={idx}>
                      {formatDateToHebrew(g.date)} — {g.position}, {g.shift}:
                      חסרים {g.missing}
                    </li>
                  )
                )}
                {gaps.length > 12 && <li>…ועוד {gaps.length - 12} חוסרים</li>}
              </ul>
            )}
          </div>
        )}

        {message && <div className={`message ${messageType}`}>{message}</div>}

        {(selectedRole === "קבט" || selectedRole === "מוקד") && (
          <>
            {renderWeekTable(weeks[0], "שבוע ראשון")}
            {renderWeekTable(weeks[1], "שבוע שני")}
            <div className="actions-row">
              <button
                className="auto-fill-button"
                onClick={handleAutoAssignWeekTable}
              >
                מילוי סידור אוטומטי
              </button>

              <button className="save-button" onClick={handleSaveSchedule}>
                שמור סידור עבודה
              </button>
            </div>
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

            <div className="actions-row">
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ManagerSchedule;
