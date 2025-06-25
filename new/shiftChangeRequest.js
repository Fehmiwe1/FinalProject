const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// שליחת בקשה למסירה/החלפה
router.post("/sendRequest", (req, res) => {
  const { shiftId, requestType, targetEmployeeId, targetShiftId } = req.body;
  const employeeId = req.session?.user?.id;

   // 💥 בדיקת session
  console.log("----- בדיקת Session -----");
  console.log("session:", req.session);
  console.log("נתונים מה-Frontend:", req.body);

  // 💥 אם אין session - השרת יעצור כאן
  if (!employeeId) {
    return res.status(401).json({ message: "לא מחובר" });
  }

  // 💥 בדיקת שדות חובה
  if (!shiftId || !requestType) {
    console.log("חסר שדה חובה - shiftId או requestType");
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO shift_change_requests (Employee_ID, Shift_ID, Request_Type, Target_Employee_ID, Target_Shift_ID)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [employeeId, shiftId, requestType, targetEmployeeId || null, targetShiftId || null],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }
      res.json({ message: "הבקשה נשלחה בהצלחה" });
    }
  );
});

// שליפת הבקשות של העובד המחובר
router.get("/myRequests", (req, res) => {
  const employeeId = req.session?.user?.id;

  if (!employeeId) {
    return res.status(401).json({ message: "לא מחובר" });
  }

  const query = `
    SELECT 
      r.Request_ID,
      s.Date,
      s.Type_Of_Shift,
      s.Role_In_Shift,
      r.Request_Type,
      r.Request_Status,
      r.Request_Date
    FROM shift_change_requests r
    JOIN shift s ON r.Shift_ID = s.id
    WHERE r.Employee_ID = ?
    ORDER BY r.Request_Date DESC
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת הבקשות:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json(results);
  });
});

module.exports = router;
