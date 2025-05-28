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

// עדכון קבלן לפי מספר קבלן
router.put("/:GuestNumber", (req, res) => {
  const guestNumber = req.params.GuestNumber;
  const { CarNumber, GuestName, GuestPhone, StartDate, EndDate } = req.body;

  if (!CarNumber || !GuestName || !GuestPhone || !StartDate || !EndDate) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const parsedStartDate = new Date(StartDate).toISOString();
  const parsedEndDate = new Date(EndDate).toISOString();

  const query = `
    UPDATE guests
    SET CarNumber = ?, GuestName = ?, GuestPhone = ?, StartDate = ?, EndDate = ?
    WHERE GuestNumber = ?
  `;

  db.query(
    query,
    [
      CarNumber,
      GuestName,
      GuestPhone,
      parsedStartDate,
      parsedEndDate,
      guestNumber,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Guest not found!" });
      }

      res.json({ message: "Guest updated successfully!" });
    }
  );
});

// חסימת/הצגת קבלן לפי מספר קבלן
router.put("/:GuestNumber/status", (req, res) => {
  const guestNumber = req.params.GuestNumber;
  const { IsActive } = req.body;

  if (typeof IsActive !== "number" || ![0, 1].includes(IsActive)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const query = "UPDATE guests SET IsActive = ? WHERE GuestNumber = ?";
  db.query(query, [IsActive, guestNumber], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Database error", error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Guest not found" });
    }
    res.json({ message: "Guest status updated successfully" });
  });
});


module.exports = router;
