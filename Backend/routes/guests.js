const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
// התחברות למסד הנתונים
const db = dbSingleton.getConnection();

// קבלת כל אורחים
router.get("/", (req, res) => {
  const query = "SELECT * FROM guests";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// קבלת דוח לפי מזהה
router.get("/:GuestNumber", (req, res) => {
  const guestNumber = req.params.GuestNumber;
  const query = "SELECT * FROM guests WHERE GuestNumber = ?";
  db.query(query, [guestNumber], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// הוספת אורח חדש
router.post("/", (req, res) => {
  const { GuestNumber, CarNumber, GuestName, GuestPhone, StartDate, EndDate } =
    req.body;

  // בדיקה שכל השדות הנדרשים סופקו
  if (
    !GuestNumber ||
    !CarNumber ||
    !GuestName ||
    !GuestPhone ||
    !StartDate ||
    !EndDate
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // המרת תאריך לפורמט מתאים (אם יש צורך)
  const parsedStartDate = new Date(StartDate).toISOString();
  const parsedEndDate = new Date(EndDate).toISOString();

  const query =
    "INSERT INTO guests (GuestNumber, CarNumber, GuestName, GuestPhone, StartDate, EndDate) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      GuestNumber,
      CarNumber,
      GuestName,
      GuestPhone,
      parsedStartDate,
      parsedEndDate,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.json({
        message: "Report added successfully!",
        id: results.insertId,
        report: {
          GuestNumber,
          CarNumber,
          GuestName,
          GuestPhone,
          StartDate: parsedStartDate,
          EndDate: parsedEndDate,
        },
      });
    }
  );
});

module.exports = router;
