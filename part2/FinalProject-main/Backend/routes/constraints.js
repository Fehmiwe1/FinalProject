const express = require("express");
const router = express.Router();
const db = require("../dbSingleton");

router.post("/constraints", async (req, res) => {
  try {
    const connection = db.getConnection(); // קח את החיבור
    const constraints = req.body;

    for (const item of constraints) {
      const { ID_employee, date, shift, availability } = item;

      await connection
        .promise()
        .query(
          "INSERT INTO employee_constraints (ID_employee, date, shift, availability) VALUES (?, ?, ?, ?)",
          [ID_employee, date, shift, availability]
        );
    }

    res.status(200).json({ message: "הנתונים נשמרו בהצלחה" });
  } catch (err) {
    console.error("שגיאה בהוספת אילוצים:", err);
    res.status(500).json({ error: "שגיאה בשמירת הנתונים" });
  }
});

module.exports = router;