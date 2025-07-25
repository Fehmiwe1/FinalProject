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

router.get("/allConstraints", (req, res) => {
  const { from, to, role } = req.query;

  let query = `
    SELECT 
      u.firstName,
      u.lastName,
      DATE_FORMAT(ec.date, '%Y-%m-%d') AS date,
      ec.shift,
      ec.availability
    FROM 
      employee_constraints ec
    JOIN 
      users u ON ec.ID_employee = u.id
    WHERE 
      ec.date BETWEEN ? AND ?
  `;

  const params = [from, to];

  if (role) {
    query += ` AND u.role = ?`;
    params.push(role);
  }

  query += `
    ORDER BY 
      ec.date, FIELD(ec.shift, 'בוקר', 'ערב', 'לילה'), u.firstName;
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת אילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }
    res.json(results);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = router;
