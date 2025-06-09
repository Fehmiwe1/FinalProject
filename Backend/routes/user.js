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
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // שליפת המשתמש מבסיס הנתונים
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], async (error, results) => {
    if (error) {
      res.status(500).send(error);
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ error: "Invalid username or password." });
      return;
    }

    const user = results[0];

    // בדיקת סיסמה
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ error: "Invalid username or password." });
        return;
      }

      // שמירת המשתמש ב-session
      req.session.user = {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role, // שמירה של תפקיד המשתמש ב-session
        status: user.status,
      };

      // הדפסת המידע על המשתמש ב-session
      console.log("User logged in, ID:", user.id); // הדפסת ה-ID ב-console
      console.log("User logged in, role:", user.role); // הדפסת ה-role ב-console
      console.log("User logged in, status:", user.status); // הדפסת ה-status ב-console
      console.log("User logged in, username:", user.username); // הדפסת ה-username ב-console
      console.log("User logged in, firstName:", user.firstName); // הדפסת ה-firstName ב-console
      console.log("User logged in, lastName:", user.lastName); // הדפסת ה-lastName ב-console

      res.cookie("userId", user.id, { maxAge: 3600000, httpOnly: false }); // הגדרת ה-ID בעוגיה
      res.cookie("userFirstName", user.firstName, {
        maxAge: 3600000,
        httpOnly: false,
      }); // הגדרת ה-firstName בעוגיה
      res.cookie("userLastName", user.lastName, {
        maxAge: 3600000,
        httpOnly: false,
      }); // הגדרת ה-lastName בעוגיה
      res.cookie("userUsername", user.username, {
        maxAge: 3600000,
        httpOnly: false,
      }); // הגדרת ה-username בעוגיה
      res.cookie("userRole", user.role, { maxAge: 3600000, httpOnly: false }); // הגדרת ה-role בעוגיה
      res.cookie("userStatus", user.status, {
        maxAge: 3600000,
        httpOnly: false,
      }); // הגדרת ה-status בעוגיה
      res.json({ message: "Logged in successfully." });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
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

    try {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const updateQuery = `UPDATE users SET password = ? WHERE username = ?`;
      const params = [hashedNewPassword, username];

      db.query(updateQuery, params, (updateErr, updateRes) => {
        if (updateErr) {
          return res.status(500).json({ error: updateErr });
        }
        console.log("New password updated for:", username);
        res.json({ message: "Password updated!" });
      });
    } catch (hashErr) {
      res.status(500).json({ error: "Server error" });
    }
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
