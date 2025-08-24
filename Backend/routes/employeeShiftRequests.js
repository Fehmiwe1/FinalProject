const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// עוזר: מציאת userId בצורה חסינה (Session -> Cookie -> Body)
function resolveUserId(req) {
  const fromSession = req.session?.user?.id;
  const fromCookie =
    req.cookies?.userId || req.cookies?.ID || req.cookies?.id || null;
  const fromBody = req.body?.fromEmployeeId;
  return [fromSession, fromCookie, fromBody].find(
    (v) => v !== undefined && v !== null && String(v).trim() !== ""
  );
}

// --- בקשת מסירה ---
router.post("/requestGive", (req, res) => {
  // אם יש לך פונקציית עזר resolveUserId – השתמש בה; אחרת קרא מה-session
  const fromEmployeeId =
    (req.session && req.session.user && req.session.user.id) ||
    req.body?.fromEmployeeId ||
    req.cookies?.userId ||
    null;

  const { date, shift, location = null, note = "", toEmployeeId = null } =
    req.body || {};

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

  // אם נבחר עובד יעד למסירה – נכניס עמודה to_employee_id, אחרת בלי
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

  // לוגים לדיבוג
  console.log("🔔 /requestSwap called");
  console.log("session.user:", req.session?.user);
  console.log("cookies.userId:", req.cookies?.userId);
  console.log("body:", req.body);

  if (!fromEmployeeId)
    return res.status(401).json({ message: "לא מחובר (חסר מזהה עובד)" });
  if (!date || !shift)
    return res.status(400).json({ message: "date ו-shift נדרשים" });

  // וידוא מזהה עובד היעד – ננסה לאסוף מאופנים שונים שנפוצים ב-FE
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

// אישור/דחיית בקשה (מסירה/החלפה) — מעדכן סטטוס בטבלה לפי ENUM שלך: 'אישור'/'דחיה'
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

// שליפת פרטי המשתמש + כל המשמרות שלו לפי ה-ID שב-sessions
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
        -- אם ה-Role הוא אחד התפקידים המיוחדים, נציג אותו כעמדה; אחרת מיקום המשמרת
        CASE
          WHEN esa.Role IN ('סייר רכוב','סייר א','סייר ב','סייר ג','הפסקות') THEN esa.Role
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
      assignments: rows, // <<< כל המשמרות של המשתמש
    });
  } catch (err) {
    console.error("❌ שגיאה בשליפת המשמרות שלי:", err);
    return res.status(500).json({ message: "Database error", error: err });
  }
});

module.exports = router;
