const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// שליפת כל המאבטחים עם האילוצים שלהם
router.get("/scheduleGuard", (req, res) => {
  const query = `
    SELECT 
      u.id AS id,
      u.firstName,
      u.lastName,
      DATE_FORMAT(ec.date, '%Y-%m-%d') AS date,
      ec.shift,
      ec.availability
    FROM users u
    LEFT JOIN employee_constraints ec 
      ON u.id = ec.ID_employee
    WHERE u.role = 'guard'
    ORDER BY u.id, ec.date, ec.shift;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת האילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

// שליפת כל המוקדניות עם האילוצים שלהן
router.get("/scheduleMoked", (req, res) => {
  const query = `
    SELECT 
      u.id AS id,
      u.firstName,
      u.lastName,
      DATE_FORMAT(ec.date, '%Y-%m-%d') AS date,
      ec.shift,
      ec.availability
    FROM users u
    LEFT JOIN employee_constraints ec 
      ON u.id = ec.ID_employee
    WHERE u.role = 'moked'
    ORDER BY u.id, ec.date, ec.shift;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת האילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

// שליפ כל הקבטים עם האילוצים שלהם
router.get("/scheduleKabet", (req, res) => {
  const query = `
    SELECT 
      u.id AS id,
      u.firstName,
      u.lastName,
      DATE_FORMAT(ec.date, '%Y-%m-%d') AS date,
      ec.shift,
      ec.availability
    FROM users u
    LEFT JOIN employee_constraints ec 
      ON u.id = ec.ID_employee
    WHERE u.role = 'kabat'
    ORDER BY u.id, ec.date, ec.shift;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת האילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});
module.exports = router;
