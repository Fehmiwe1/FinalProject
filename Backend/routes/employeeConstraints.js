const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// שליפת אילוצים לפי המשתמש המחובר
router.get("/", (req, res) => {
  const ID_employee = req.session?.user?.id;

  if (!ID_employee) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const query = `
    SELECT id, ID_employee, DATE_FORMAT(date, '%Y-%m-%d') AS date, shift, availability
    FROM employee_constraints
    WHERE ID_employee = ?
  `;

  db.query(query, [ID_employee], (err, results) => {
    if (err) {
      console.error("Database error on GET:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.json(results);
  });
});

// יצירת או עדכון אילוץ
router.post("/", (req, res) => {
  const ID_employee = req.session?.user?.id;
  const { date, shift, availability } = req.body;

  if (!ID_employee || !date || !shift || !availability) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  const formattedDate = parsedDate.toISOString().split("T")[0];

  const query = `
    INSERT INTO employee_constraints (ID_employee, date, shift, availability)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE availability = VALUES(availability)
  `;

  db.query(
    query,
    [ID_employee, formattedDate, shift, availability],
    (err, results) => {
      if (err) {
        console.error("Database error on POST:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.json({
        message: "Constraint saved successfully",
        report: {
          ID_employee,
          date: formattedDate,
          shift,
          availability,
        },
      });
    }
  );
});

//////////////////////////////////////////////////////////////////////////////////////////////////

// קבל שמות כל העובדים (לא כולל מנהלים)
router.get("/admin/employees", (req, res) => {
  const query = `
    SELECT id, firstName, lastName
    FROM users
    WHERE role != 'manager'
    ORDER BY firstName, lastName
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת עובדים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }
    res.json(results);
  });
});

// קבל אילוצים לפי ID של עובד
router.get("/admin/constraints/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;

  const query = `
    SELECT date, shift, availability
    FROM employee_constraints
    WHERE ID_employee = ?
    ORDER BY date, FIELD(shift, 'בוקר', 'ערב', 'לילה')
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת אילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }
    res.json(results);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
