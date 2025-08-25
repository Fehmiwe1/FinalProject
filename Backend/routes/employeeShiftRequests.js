const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

/**
 * עוזר: מציאת userId בצורה חסינה (Session -> Cookie -> Body)
 */
function resolveUserId(req) {
  const fromSession = req.session?.user?.id;
  const fromCookie =
    req.cookies?.userId || req.cookies?.ID || req.cookies?.id || null;
  const fromBody = req.body?.fromEmployeeId;
  return [fromSession, fromCookie, fromBody].find(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  );
}

/* ===========================
   בקשות מסירה / החלפה
   =========================== */

// --- בקשת מסירה ---
router.post("/requestGive", (req, res) => {
  const fromEmployeeId =
    (req.session && req.session.user && req.session.user.id) ||
    req.body?.fromEmployeeId ||
    req.cookies?.userId ||
    null;

  const {
    date,
    shift,
    location = null,
    note = "",
    toEmployeeId = null,
  } = req.body || {};

  console.log("🔔 /requestGive called");
  console.log("session.user:", req.session?.user);
  console.log("cookies.userId:", req.cookies?.userId);
  console.log("body:", req.body);

  if (!fromEmployeeId) {
    return res
      .status(401)
      .json({ message: "לא מחובר (חסר מזהה עובד)", fromEmployeeId });
  }
  if (!date || !shift) {
    return res.status(400).json({ message: "date ו-shift נדרשים" });
  }

  const hasTarget = !!toEmployeeId;

  const sql = hasTarget
    ? `
      INSERT INTO employee_requests
        (ID_employee, to_employee_id, request_type, request_date, shift_date, shift_type, location, reason, status)
      VALUES (?, ?, 'מסירה', CURDATE(), ?, ?, ?, ?, 'ממתין')
    `
    : `
      INSERT INTO employee_requests
        (ID_employee, request_type, request_date, shift_date, shift_type, location, reason, status)
      VALUES (?, 'מסירה', CURDATE(), ?, ?, ?, ?, 'ממתין')
    `;

  const params = hasTarget
    ? [fromEmployeeId, toEmployeeId, date, shift, location, note]
    : [fromEmployeeId, date, shift, location, note];

  console.log("📤 בקשת מסירה:", {
    fromEmployeeId,
    toEmployeeId: hasTarget ? toEmployeeId : null,
    date,
    shift,
    location,
    note,
  });

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("❌ DB error /requestGive:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }
    console.log("✅ בקשת מסירה נשמרה. insertId:", result.insertId);
    res.json({ message: "בקשת מסירה נשלחה", id: result.insertId });
  });
});

// --- בקשת החלפה ---
router.post("/requestSwap", (req, res) => {
  const fromEmployeeId = resolveUserId(req);
  const {
    date,
    shift,
    location = null,
    toEmployeeId,
    note = "",
  } = req.body || {};

  console.log("🔔 /requestSwap called");
  console.log("session.user:", req.session?.user);
  console.log("cookies.userId:", req.cookies?.userId);
  console.log("body:", req.body);

  if (!fromEmployeeId)
    return res.status(401).json({ message: "לא מחובר (חסר מזהה עובד)" });
  if (!date || !shift)
    return res.status(400).json({ message: "date ו-shift נדרשים" });

  const targetEmployeeId =
    toEmployeeId ??
    req.body?.targetEmployeeId ??
    req.body?.targetId ??
    req.body?.employeeId ??
    req.body?.id ??
    null;

  if (!targetEmployeeId)
    return res.status(400).json({ message: "toEmployeeId נדרש להחלפה" });

  if (String(targetEmployeeId) === String(fromEmployeeId))
    return res.status(400).json({ message: "לא ניתן להחליף עם עצמך" });

  console.log("🔄 בקשת החלפת משמרת:", {
    fromEmployeeId,
    toEmployeeId: targetEmployeeId,
    date,
    shift,
    location,
    note,
  });

  const sql = `
    INSERT INTO employee_requests
      (ID_employee, to_employee_id, request_type, request_date, shift_date, shift_type, location, reason, status)
    VALUES (?, ?, 'החלפה', CURDATE(), ?, ?, ?, ?, 'ממתין')
  `;
  db.query(
    sql,
    [fromEmployeeId, targetEmployeeId, date, shift, location, note],
    (err, result) => {
      if (err) {
        console.error("❌ DB error /requestSwap:", err);
        return res.status(500).json({ message: "DB error", error: err });
      }
      console.log("✅ בקשת החלפה נשמרה. insertId:", result.insertId);
      res.json({ message: "בקשת החלפה נשלחה", id: result.insertId });
    }
  );
});

/* ===========================
   אישור/דחייה
   =========================== */

router.put("/requests/:id/approve", (req, res) => {
  const { id } = req.params;
  db.query(
    `UPDATE employee_requests SET status='אישור' WHERE id=?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "הבקשה אושרה" });
    }
  );
});

router.put("/requests/:id/decline", (req, res) => {
  const { id } = req.params;
  db.query(
    `UPDATE employee_requests SET status='דחיה' WHERE id=?`,
    [id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      res.json({ message: "הבקשה נדחתה" });
    }
  );
});

/* ===========================
   "אני" + כל המשמרות שלי
   =========================== */

router.get("/me", async (req, res) => {
  const sessUser = req.session?.user;
  if (!sessUser || !sessUser.id) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const [rows] = await db.promise().query(
      `
      SELECT 
        DATE_FORMAT(s.Date, '%Y-%m-%d') AS date,
        s.ShiftType AS shift,
        CASE
          WHEN esa.Role IN ('סייר רכוב','סייר א','סייר ב','סייר ג','הפסקות','מוקד','קבט') THEN esa.Role
          ELSE s.Location
        END AS location,
        esa.Role AS role,
        u.id AS employeeId,
        u.firstName,
        u.lastName
      FROM employee_shift_assignment esa
      JOIN shift s ON s.ID = esa.Shift_ID
      JOIN users u ON u.id = esa.Employee_ID
      WHERE esa.Employee_ID = ?
      ORDER BY s.Date, s.ShiftType
      `,
      [sessUser.id]
    );

    return res.json({
      userId: sessUser.id,
      firstName: sessUser.firstName,
      lastName: sessUser.lastName,
      role: sessUser.role,
      assignments: rows,
    });
  } catch (err) {
    console.error("❌ שגיאה בשליפת המשמרות שלי:", err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});

/* ===========================
   מועמדים להחלפה/מסירה — לפי תפקיד
   =========================== */

/**
 * מועמדים למאבטח (Guard)
 * query: date=YYYY-MM-DD, shift=בוקר|ערב|לילה, location=עמדה/סיור (חובה)
 */
router.get("/candidates/guard", async (req, res) => {
  try {
    const meId =
      resolveUserId(req) ||
      req.session?.user?.id ||
      req.cookies?.userId ||
      null;
    if (!meId) return res.status(401).json({ message: "Not logged in" });

    const date = (req.query.date || "").trim();
    const shift = (req.query.shift || "").trim();
    const rawLocation = (req.query.location || "").trim();
    const clientLoc = rawLocation.replace(/["׳״']/g, "").replace(/\s+/g, "");

    if (!date || !shift || !clientLoc) {
      return res.status(400).json({ message: "date, shift, location נדרשים" });
    }

    const [rows] = await db.promise().query(
      `
      SELECT 
        u.id AS employeeId,
        u.firstName, u.lastName,
        DATE_FORMAT(s.Date, '%Y-%m-%d') AS date,
        s.ShiftType AS shift,
        CASE
          WHEN esa.Role IN ('סייר רכוב','סייר א','סייר ב','סייר ג','הפסקות') THEN esa.Role
          ELSE s.Location
        END AS location,
        REPLACE(REPLACE(REPLACE(
          CASE
            WHEN esa.Role IN ('סייר רכוב','סייר א','סייר ב','סייר ג','הפסקות') THEN esa.Role
            ELSE s.Location
          END
        ,'"',''), '״',''), '׳','') AS loc_no_quotes,
        REPLACE(REPLACE(REPLACE(REPLACE(
          REGEXP_REPLACE(
            CASE
              WHEN esa.Role IN ('סייר רכוב','סייר א','סייר ב','סייר ג','הפסקות') THEN esa.Role
              ELSE s.Location
            END
          ,'\\s+','')
        ,'"',''),'״',''),'׳',''),' ','') AS loc_cmp
      FROM employee_shift_assignment esa
      JOIN shift s ON s.ID = esa.Shift_ID
      JOIN users u ON u.id = esa.Employee_ID
      WHERE s.Date = ?
        AND s.ShiftType = ?
        AND u.id <> ?
        AND esa.Role IN ('מאבטח','סייר רכוב','סייר א','סייר ב','סייר ג','הפסקות')
      HAVING 
         loc_cmp = ?
         OR INSTR(loc_cmp, ?) > 0
         OR INSTR(?, loc_cmp) > 0
      ORDER BY u.lastName, u.firstName
      `,
      [date, shift, meId, clientLoc, clientLoc, clientLoc]
    );

    res.json(rows || []);
  } catch (err) {
    console.error("❌ /candidates/guard error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

/**
 * מועמדים למוקד (Moked)
 * query: date=YYYY-MM-DD, shift=בוקר|ערב|לילה, purpose=swap|give
 * swap  -> מי שכבר משובץ "מוקד" באותו יום/משמרת (להחלפה)
 * give  -> כל עובדי "מוקד" שלא משובצים באותו יום/משמרת (יכולים לקחת)
 */
router.get("/candidates/moked", async (req, res) => {
  try {
    const meId =
      resolveUserId(req) ||
      req.session?.user?.id ||
      req.cookies?.userId ||
      null;
    if (!meId) return res.status(401).json({ message: "Not logged in" });

    const date = (req.query.date || "").trim();
    const shift = (req.query.shift || "").trim();
    const purpose = (req.query.purpose || "swap").trim().toLowerCase();

    if (!date || !shift) {
      return res.status(400).json({ message: "date ו‑shift נדרשים" });
    }

    if (purpose === "give") {
      // עובדים בתפקיד מוקד שאינם משובצים באותו יום/משמרת
      const [rows] = await db.promise().query(
        `
        SELECT 
          u.id AS employeeId,
          u.firstName, u.lastName,
          ? AS date,
          ? AS shift,
          'מוקד' AS role
        FROM users u
        WHERE u.role = 'moked'
          AND u.id <> ?
          AND u.id NOT IN (
            SELECT esa.Employee_ID
            FROM employee_shift_assignment esa
            JOIN shift s ON s.ID = esa.Shift_ID
            WHERE s.Date = ? AND s.ShiftType = ? AND esa.Role = 'מוקד'
          )
        ORDER BY u.lastName, u.firstName
        `,
        [date, shift, meId, date, shift]
      );
      return res.json(rows || []);
    }

    // purpose = swap -> גם משובצים וגם לא משובצים (איחוד)
    const [rows] = await db.promise().query(
      `
      (
        SELECT 
          u.id AS employeeId,
          u.firstName, u.lastName,
          DATE_FORMAT(s.Date, '%Y-%m-%d') AS date,
          s.ShiftType AS shift,
          'מוקד' AS role
        FROM employee_shift_assignment esa
        JOIN shift s ON s.ID = esa.Shift_ID
        JOIN users u ON u.id = esa.Employee_ID
        WHERE s.Date = ?
          AND s.ShiftType = ?
          AND esa.Role = 'מוקד'
          AND u.id <> ?
      )
      UNION
      (
        SELECT 
          u.id AS employeeId,
          u.firstName, u.lastName,
          ? AS date,
          ? AS shift,
          'מוקד' AS role
        FROM users u
        WHERE u.role = 'moked'
          AND u.id <> ?
          AND u.id NOT IN (
            SELECT esa.Employee_ID
            FROM employee_shift_assignment esa
            JOIN shift s ON s.ID = esa.Shift_ID
            WHERE s.Date = ? AND s.ShiftType = ? AND esa.Role = 'מוקד'
          )
      )
      ORDER BY lastName, firstName
      `,
      [date, shift, meId, date, shift, meId, date, shift]
    );

    res.json(rows || []);
  } catch (err) {
    console.error("❌ /candidates/moked error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

/**
 * מועמדים לקבט (Kabat)
 * query: date=YYYY-MM-DD, shift=בוקר|ערב|לילה, purpose=swap|give
 * swap  -> מי שכבר משובץ "קבט" באותו יום/משמרת (להחלפה)
 * give  -> כל עובדי "קבט" שלא משובצים באותו יום/משמרת (יכולים לקחת)
 */
router.get("/candidates/kabat", async (req, res) => {
  try {
    const meId =
      resolveUserId(req) ||
      req.session?.user?.id ||
      req.cookies?.userId ||
      null;
    if (!meId) return res.status(401).json({ message: "Not logged in" });

    const date = (req.query.date || "").trim();
    const shift = (req.query.shift || "").trim();
    const purpose = (req.query.purpose || "swap").trim().toLowerCase();

    if (!date || !shift) {
      return res.status(400).json({ message: "date ו‑shift נדרשים" });
    }

    if (purpose === "give") {
      // עובדים בתפקיד קבט שאינם משובצים באותו יום/משמרת
      const [rows] = await db.promise().query(
        `
        SELECT 
          u.id AS employeeId,
          u.firstName, u.lastName,
          ? AS date,
          ? AS shift,
          'קבט' AS role
        FROM users u
        WHERE u.role = 'kabat'
          AND u.id <> ?
          AND u.id NOT IN (
            SELECT esa.Employee_ID
            FROM employee_shift_assignment esa
            JOIN shift s ON s.ID = esa.Shift_ID
            WHERE s.Date = ? AND s.ShiftType = ? AND esa.Role = 'קבט'
          )
        ORDER BY u.lastName, u.firstName
        `,
        [date, shift, meId, date, shift]
      );
      return res.json(rows || []);
    }

    // purpose = swap -> גם משובצים וגם לא משובצים (איחוד)
    const [rows] = await db.promise().query(
      `
      (
        SELECT 
          u.id AS employeeId,
          u.firstName, u.lastName,
          DATE_FORMAT(s.Date, '%Y-%m-%d') AS date,
          s.ShiftType AS shift,
          'קבט' AS role
        FROM employee_shift_assignment esa
        JOIN shift s ON s.ID = esa.Shift_ID
        JOIN users u ON u.id = esa.Employee_ID
        WHERE s.Date = ?
          AND s.ShiftType = ?
          AND esa.Role = 'קבט'
          AND u.id <> ?
      )
      UNION
      (
        SELECT 
          u.id AS employeeId,
          u.firstName, u.lastName,
          ? AS date,
          ? AS shift,
          'קבט' AS role
        FROM users u
        WHERE u.role = 'kabat'
          AND u.id <> ?
          AND u.id NOT IN (
            SELECT esa.Employee_ID
            FROM employee_shift_assignment esa
            JOIN shift s ON s.ID = esa.Shift_ID
            WHERE s.Date = ? AND s.ShiftType = ? AND esa.Role = 'קבט'
          )
      )
      ORDER BY lastName, firstName
      `,
      [date, shift, meId, date, shift, meId, date, shift]
    );

    res.json(rows || []);
  } catch (err) {
    console.error("❌ /candidates/kabat error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

module.exports = router;
