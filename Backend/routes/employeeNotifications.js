const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

// שליפת התראות עובדים עם שם ושם משפחה
router.get("/", (req, res) => {
  const query = `
    SELECT 
      e.ID_employee, 
      u.firstName, 
      u.lastName, 
      e.event_date, 
      e.event_description,
      e.notification_status
    FROM 
      employee_notifications AS e, users  as u 
    where e.ID_employee = u.id and
        e.notification_status = 'pending'
    ORDER BY 
      e.event_date DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "שגיאה בעת שליפת ההודעות", details: err });
    }
    res.json(results);
  });
});

//עדכון סטטוס התראה
router.put("/updateStatus", (req, res) => {
  const { ID_employee, status } = req.body;

  const updateNotificationQuery = `
    UPDATE employee_notifications
    SET notification_status = ?
    WHERE ID_employee = ?
  `;

  db.query(updateNotificationQuery, [status, ID_employee], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "שגיאה בעדכון הסטטוס", details: err });
    }

    // אם אושר - עדכן גם את המשתמש
    if (status === "approval") {
      const updateUserStatusQuery = `
        UPDATE users
        SET status = 'active'
        WHERE id = ?
      `;
      db.query(updateUserStatusQuery, [ID_employee], (userErr) => {
        if (userErr) {
          return res
            .status(500)
            .json({ error: "שגיאה בעדכון סטטוס המשתמש", details: userErr });
        }
        return res.json({ message: "הסטטוס עודכן בהצלחה" });
      });
    } else {
      return res.json({ message: "הסטטוס עודכן בהצלחה" });
    }
  });
});


module.exports = router;
