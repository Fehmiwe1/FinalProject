const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// ודא שתיקיית uploads קיימת
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// הגדרת אחסון קבצים
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = "sick-" + Date.now() + ext;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// שליחת בקשת חופשת מחלה
router.post("/sick", upload.single("file"), (req, res) => {
  const ID_employee = req.session?.user?.id;
  const filePath = req.file?.path;
  const requestDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (!ID_employee || !filePath) {
    return res.status(400).json({ message: "נתונים חסרים לשליחה" });
  }

  const query = `
    INSERT INTO employee_requests (ID_employee, request_type, request_date, file_path)
    VALUES (?, 'מחלה', ?, ?)
  `;

  db.query(query, [ID_employee, requestDate, filePath], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "בקשת מחלה נשמרה", id: result.insertId });
  });
});

// שליחת בקשת חופשה רגילה
router.post("/vacation", (req, res) => {
  const ID_employee = req.session?.user?.id;
  const { fromDate, toDate, leaveDays, unpaidDays, reason } = req.body;
  const requestDate = new Date().toISOString().slice(0, 10);

  if (
    !ID_employee ||
    !fromDate ||
    !toDate ||
    leaveDays === undefined ||
    unpaidDays === undefined ||
    !reason
  ) {
    return res.status(400).json({ message: "כל השדות נדרשים" });
  }

  const query = `
    INSERT INTO employee_requests 
    (ID_employee, request_type, request_date, from_date, to_date, vacation_days, days_to_pay, reason, status) 
    VALUES (?, 'חופשה', ?, ?, ?, ?, ?, ?, 'ממתין')
  `;

  db.query(
    query,
    [ID_employee, requestDate, fromDate, toDate, leaveDays, unpaidDays, reason],
    (err, result) => {
      if (err) {
        console.error("שגיאה בבקשת חופשה:", err);ז
        return res
          .status(500)
          .json({ message: "שגיאה בבקשת חופשה", error: err });
      }
      res.json({ message: "בקשת חופשה נשמרה", id: result.insertId });
    }
  );
});


// קבלת בקשות ממתינות של העובד המחובר בלבד
router.get("/pendingRequests", (req, res) => {
  const employeeId = req.session?.user?.id;

  if (!employeeId) {
    return res.status(401).json({ message: "לא מחובר" });
  }

  const query = `
    SELECT request_type, request_date, status
    FROM employee_requests
    WHERE status = 'ממתין' AND ID_employee = ?
    ORDER BY request_date DESC
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});

// בקשות חופשה לפי המשתמש המחובר
router.get("/vacationRequestsShow", (req, res) => {
  const employeeId = req.session?.user?.id;

  if (!employeeId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const query = `
    SELECT 
      request_type,
      request_date,
      from_date,
      to_date,
      vacation_days,
      days_to_pay,
      reason,
      status
    FROM employee_requests
    WHERE ID_employee = ? AND request_type = 'חופשה'
    ORDER BY request_date DESC
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json(results);
  });
});

// קבלת את כל הבקשות
router.get("/", (req, res) => {
  const query = `
    SELECT 
      er.id,
      er.ID_employee,
      u.firstName,
      u.lastName,
      er.request_type AS requestType,
      DATE_FORMAT(er.request_date, '%Y-%m-%d') AS requestDate,
      CASE 
        WHEN er.from_date IS NULL OR er.from_date = '0000-00-00' THEN NULL 
        ELSE DATE_FORMAT(er.from_date, '%Y-%m-%d') 
      END AS fromDate,
      CASE 
        WHEN er.to_date IS NULL OR er.to_date = '0000-00-00' THEN NULL 
        ELSE DATE_FORMAT(er.to_date, '%Y-%m-%d') 
      END AS toDate,
      er.vacation_days AS vacationDays,
      er.days_to_pay AS daysToPay,
      er.reason,
      er.file_path AS filePath,
      COALESCE(er.status, 'ממתין') AS status
    FROM employee_requests er
    JOIN users u ON er.ID_employee = u.ID
    ORDER BY er.request_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת בקשות:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});


// עדכון סטטוס של בקשת חופשה
router.put("/updateVacationStatus", (req, res) => {
  const { id, status } = req.body;

  if (!id || !["אושר", "סורב"].includes(status)) {
    return res.status(400).json({ message: "פרטים לא תקינים" });
  }

  const query = `UPDATE employee_requests SET status = ? WHERE id = ? AND request_type = 'חופשה'`;

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("שגיאה בעדכון סטטוס:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json({ message: "הסטטוס עודכן בהצלחה" });
  });
});


// GET /employeeRequests/pendingAlerts
router.get("/pendingAlerts", (req, res) => {
  const query = `
    SELECT 
      er.id,
      u.firstName,
      u.lastName,
      er.request_type AS type,
      DATE_FORMAT(er.request_date, '%Y-%m-%d') AS date
    FROM employee_requests er
    JOIN users u ON er.ID_employee = u.ID
    WHERE er.status = 'ממתין'
    ORDER BY er.request_date DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error", err });
    res.json(results);
  });
});


module.exports = router;
