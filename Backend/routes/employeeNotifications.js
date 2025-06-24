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
      employee_notifications AS e
    JOIN 
      users AS u ON e.ID_employee = u.id
    WHERE 
      e.notification_status = 'pending'
      AND u.status != 'active'
    ORDER BY 
      e.event_date DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "שגיאה בעת שליפת ההודעות", details: err });
    }

    if (results.length > 0) {
      res.cookie("eventDescription", results[0].event_description, {
        maxAge: 3600000,
        httpOnly: false,
      });
      console.log("eventDescription:", results[0].event_description);
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

/////////////////////////////////////////////////////////////////////
// שליפת כל הקב"טים - שם פרטי + שם משפחה בלבד
router.get("/scheduleKabet", (req, res) => {
  const query = `
    SELECT DISTINCT
      u.id AS id,
      u.firstName,
      u.lastName
    FROM users u
    WHERE u.role = 'kabat'
    ORDER BY u.firstName, u.lastName;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ שגיאה בשליפת שמות קבטים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

//////////////////////////////////////////////////////////////////////////////////////
// שליפת כל המוקד - שם פרטי + שם משפחה בלבד
router.get("/scheduleMoked", (req, res) => {
  const query = `
    SELECT DISTINCT
      u.id AS id,
      u.firstName,
      u.lastName
    FROM users u
    WHERE u.role = 'moked'
    ORDER BY u.firstName, u.lastName;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ שגיאה בשליפת שמות קבטים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

///////////////////////////////////////////////////////////////////////////////
// שליפת כל המאבטחים - שם פרטי + שם משפחה בלבד
router.get("/scheduleGuards", (req, res) => {
  const query = `
    SELECT DISTINCT
      u.id AS id,
      u.firstName,
      u.lastName
    FROM users u
    WHERE u.role = 'guard'
    ORDER BY u.firstName, u.lastName;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ שגיאה בשליפת שמות קבטים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

// שליחת התראה לעובד
router.post("/sendNotification", (req, res) => {
  const { ID_employee, event_date, event_description } = req.body;

  if (!ID_employee || !event_date || !event_description) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const sql = `
    INSERT INTO employee_notifications (ID_employee, event_date, event_description, notification_status)
    VALUES (?, ?, ?, 'task')
  `;

  db.query(sql, [ID_employee, event_date, event_description], (err, result) => {
    if (err) {
      console.error("Error inserting notification:", err);
      return res.status(500).json({ message: "Failed to send notification" });
    }
    res
      .status(200)
      .json({ message: "Notification sent successfully", id: result.insertId });
  });
});

// קבלת משימות לפי מזהה עובד
router.get("/getTasks", (req, res) => {
  const employeeId = req.session.user.id || req.query.ID_employee;

  if (!employeeId) {
    return res.status(401).json({ error: "משתמש לא מחובר" });
  }

  const query = `
    SELECT event_description, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date
    FROM employee_notifications
    WHERE ID_employee = ? 
      AND notification_status = 'task'
      AND event_date >= CURDATE()
    ORDER BY event_date ASC
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("❌ שגיאה בשליפת משימות:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

// שליפת משימות לפי תאריך עתידי או היום
router.get("/tasks", (req, res) => {
  const query = `
    SELECT 
      e.ID_employee, 
      u.firstName, 
      u.lastName, 
      e.event_date, 
      e.event_description,
      e.notification_status
    FROM 
      employee_notifications AS e
    JOIN 
      users AS u ON e.ID_employee = u.id
    WHERE 
      e.notification_status = 'task'
      AND e.event_date >= CURDATE()
    ORDER BY 
      e.event_date ASC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת משימות:", err);
      return res.status(500).json({ error: "שגיאה בשליפת משימות מהמסד." });
    }
    res.json(results);
  });
});

module.exports = router;
