const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// קבלת כל האילוצים
router.get("/", (req, res) => {
  const query = "SELECT * FROM employee_constraints";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// יצירת אילוצים חדשים
router.post("/", (req, res) => {
  console.log("Session:", req.session);
  const ID_employee = req.session?.user?.id;

  const { date, shift, availability } = req.body;

  console.log("ID_employee:", ID_employee);

  if (!ID_employee || !date || !shift || !availability) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const query =
    "INSERT INTO employee_constraints (ID_employee, date, shift, availability) VALUES (?, ?, ?, ?)";
  const parsedDate = new Date(date).toISOString().split("T")[0];

  db.query(
    query,
    [ID_employee, parsedDate, shift, availability],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.json({
        message: "Constraint added successfully!",
        id: results.insertId,
        report: {
          ID_employee,
          date: parsedDate,
          shift,
          availability,
        },
      });
    }
  );
});

module.exports = router;
