const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const bcrypt = require("bcrypt");

// התחברות למסד הנתונים
const db = dbSingleton.getConnection();

// שליפת כל המאבטחים
router.get("/guards", (req, res) => {
  const query = `
    SELECT id, firstName, lastName
    FROM users
    WHERE role = 'guard'
    ORDER BY firstName, lastName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת מאבטחים:", err);
      return res.status(500).json({ error: "שגיאה בשליפת מאבטחים מהמסד." });
    }
    res.json(results);
  });
});

// שליפת כל המוקדניות
router.get("/moked", (req, res) => {
  const query = `
    SELECT id, firstName, lastName
    FROM users
    WHERE role = 'moked'
    ORDER BY firstName, lastName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת מאבטחים:", err);
      return res.status(500).json({ error: "שגיאה בשליפת מאבטחים מהמסד." });
    }
    res.json(results);
  });
});

// שליפת כל הקבטים
router.get("/kabat", (req, res) => {
  const query = `
    SELECT id, firstName, lastName
    FROM users
    WHERE role = 'kabat'
    ORDER BY firstName, lastName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת קבטים:", err);
      return res.status(500).json({ error: "שגיאה בשליפת קבטים מהמסד." });
    }
    res.json(results);
  });
});

// רישום משתמש חדש
router.post("/register", async (req, res) => {
  const {
    username,
    firstName,
    lastName,
    birthDate,
    password,
    email,
    phone,
    street,
    city,
    postalCode,
  } = req.body;

  const checkQuery = "SELECT COUNT(*) AS count FROM users WHERE username = ?";
  db.query(checkQuery, [username], async (error, results) => {
    if (error) {
      return res.status(500).json({ error });
    }
    if (results[0].count > 0) {
      return res.status(409).json({ error: "User already exists." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users
          (username, firstName, lastName, birthDate, password, email, phone, street, city, postalCode, registration_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
      `;

      const params = [
        username,
        firstName,
        lastName,
        birthDate,
        hashedPassword,
        email,
        phone,
        street,
        city,
        postalCode,
      ];

      db.query(insertQuery, params, (insertErr, insertRes) => {
        if (insertErr) {
          return res.status(500).json({ error: insertErr });
        }

        // הוספת התראה בטבלת employee_notifications
        const notificationQuery = `
          INSERT INTO employee_notifications (ID_employee, event_date, event_description)
          VALUES (?, CURRENT_DATE, ?)
        `;
        const notificationParams = [
          insertRes.insertId, // ID של המשתמש שנוסף
          "הרשמת עובד חדש",
        ];

        db.query(notificationQuery, notificationParams, (notifyErr) => {
          if (notifyErr) {
            return res.status(500).json({ error: notifyErr });
          }

          res.json({ message: "User added and notification created!" });
        });
      });
    } catch (hashErr) {
      res.status(500).json({ error: "Server error" });
    }
  });
});

// התחברות משתמש
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // בדיקה שכל השדות סופקו
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // שליפת המשתמש מבסיס הנתונים
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], async (error, results) => {
    if (error) {
      return res.status(500).send(error);
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = results[0];

    try {
      // בדיקת סיסמה
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      // כמה ימים עברו מאז ההרשמה
      const daysQ = `
        SELECT DATEDIFF(CURDATE(), registration_date) AS days_since_reg
        FROM users
        WHERE id = ?
        LIMIT 1
      `;
      db.query(daysQ, [user.id], (ddErr, ddRows) => {
        if (ddErr) {
          return res.status(500).json({ error: "Server error" });
        }

        const daysSinceRegistration = ddRows?.[0]?.days_since_reg ?? 0;
        const mustChangePassword = daysSinceRegistration >= 365 && user.role !== "manager";

        // אם צריך – ניצור התראת "החלפת סיסמה" (Task) לעובד (לא למנהל)
        // נזהר לא ליצור כפילויות באותו היום:
        const maybeInsertNotification = (cb) => {
          if (!mustChangePassword) return cb(); // לא צריך התראה

          const insertSql = `
            INSERT INTO employee_notifications (ID_employee, event_date, event_description, notification_status)
            SELECT ?, CURDATE(), 'נדרשת החלפת סיסמה (עברו 12 חודשים מההרשמה)', 'task'
            FROM DUAL
            WHERE NOT EXISTS (
              SELECT 1
              FROM employee_notifications
              WHERE ID_employee = ?
                AND notification_status = 'task'
                AND event_description LIKE 'נדרשת החלפת סיסמה%'
                AND event_date >= CURDATE()
            )
          `;
          db.query(insertSql, [user.id, user.id], (insErr) => {
            if (insErr) {
              // לא חוסם התחברות — רק מדווח שגיאה לוגית
              console.error("Failed to insert password-renewal task:", insErr);
            }
            cb();
          });
        };

        // שמירת המשתמש ב-session + cookies ואז מחזירים תשובה
        const finalizeLogin = () => {
          req.session.user = {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
          };

          console.log("User logged in, ID:", user.id);
          console.log("User logged in, role:", user.role);
          console.log("User logged in, status:", user.status);
          console.log("User logged in, username:", user.username);
          console.log("User logged in, firstName:", user.firstName);
          console.log("User logged in, lastName:", user.lastName);

          res.cookie("userId", user.id, { maxAge: 3600000, httpOnly: false });
          res.cookie("userFirstName", user.firstName, { maxAge: 3600000, httpOnly: false });
          res.cookie("userLastName", user.lastName, { maxAge: 3600000, httpOnly: false });
          res.cookie("userUsername", user.username, { maxAge: 3600000, httpOnly: false });
          res.cookie("userRole", user.role, { maxAge: 3600000, httpOnly: false });
          res.cookie("userStatus", user.status, { maxAge: 3600000, httpOnly: false });

          // בנוסף לדגל ההצלחה, נחזיר גם אינדיקציה ל-FE אם יש צורך בהחלפת סיסמה
          return res.json({
            message: "Logged in successfully.",
            mustChangePassword,
            daysSinceRegistration,
          });
        };

        // זרימה: אם צריך — ננסה להוסיף התראה ואז נסיים התחברות
        maybeInsertNotification(finalizeLogin);
      });
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////

// עדכון סיסמה חדשה
router.post("/forgotPassword", async (req, res) => {
  const { username, firstName, lastName, email, newPassword } = req.body;

  if (!username || !firstName || !lastName || !email || !newPassword) {
    return res.status(400).json({ error: "One of the data is required." });
  }

  const query =
    "SELECT * FROM users WHERE username = ? AND firstName = ? AND lastName = ? AND email = ?";

  db.query(query, [username, firstName, lastName, email], async (err, rows) => {
    if (err) {
      console.error("Error in query: ", err);
      return res.status(500).json({ error: "Database error." });
    }

    if (rows.length === 0) {
      console.log("User not found.");
      return res.status(404).json({ message: "User not found." });
    }

    const user = rows[0]; // נצטרך את ה-ID לעדכון ההתראה

    try {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 1) עדכון סיסמה + תאריך הרשמה להיום
      const updateUserQuery = `
        UPDATE users
        SET password = ?, registration_date = CURRENT_DATE
        WHERE username = ?
      `;
      db.query(updateUserQuery, [hashedNewPassword, username], (updateErr) => {
        if (updateErr) {
          console.error("Update user error:", updateErr);
          return res.status(500).json({ error: updateErr });
        }

        // 2) שינוי ה-notification הספציפית ל-approval (רק המשימה עם הטקסט הזה)
        const closeTaskQuery = `
          UPDATE employee_notifications
          SET notification_status = 'approval'
          WHERE ID_employee = ?
            AND notification_status = 'task'
            AND event_description = 'נדרשת החלפת סיסמה (עברו 12 חודשים מההרשמה)'
        `;
        db.query(closeTaskQuery, [user.id], (closeErr, closeRes) => {
          if (closeErr) {
            console.error("Update notification error:", closeErr);
            // לא נחסום את התשובה למשתמש אם הסיסמה עודכנה בהצלחה
            return res.status(200).json({
              message: "Password updated! (notification update failed)",
            });
          }

          console.log("Password updated for:", username);
          return res.json({
            message: "Password updated!",
            notificationsUpdated: closeRes.affectedRows || 0,
          });
        });
      });
    } catch (hashErr) {
      console.error("Hash error:", hashErr);
      return res.status(500).json({ error: "Server error" });
    }
  });
});




////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// בדיקת זמינות שם משתמש
router.get("/checkUsername", (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "username is required" });

  const q = "SELECT 1 FROM users WHERE username = ? LIMIT 1";
  db.query(q, [username], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error." });
    const available = rows.length === 0;
    res.json({ available });
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// התנתקות משתמש
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Error terminating session." });
    }
    console.log("User logged out.");
    res.clearCookie("connect.sid"); // ניקוי העוגייה של ה-session
    res.json({ message: "Session ended successfully." });
  });
});

///////////////////////////////////////////////////////////



module.exports = router;
