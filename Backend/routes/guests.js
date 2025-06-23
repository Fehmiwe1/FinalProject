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

// בדיקת כניסה לפי מספר קבלן ורכב
router.post("/check", (req, res) => {
  const { contractorNumber, vehicleNumber } = req.body;

  if (!contractorNumber || !vehicleNumber) {
    return res.status(400).json({
      status: "missing_fields",
      message: "Both contractor number and vehicle number are required.",
    });
  }

  // שלב 1: עדכון אורחים שפג תוקפם
  const deactivateExpiredQuery = `
    UPDATE guests
    SET IsActive = 0
    WHERE EndDate < CURDATE() AND IsActive != 0
  `;

  db.query(deactivateExpiredQuery, (deactivateErr) => {
    if (deactivateErr) {
      return res.status(500).json({
        status: "error",
        message: "Database error during deactivation",
        error: deactivateErr,
      });
    }

    // שלב 2: שליפה של כל השורות של הקבלן
    const contractorQuery = `
      SELECT * FROM guests
      WHERE GuestNumber = ?
    `;

    db.query(contractorQuery, [contractorNumber], (err, guests) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "error", message: "Database error" });
      }

      if (guests.length === 0) {
        return res.json({
          status: "contractor_not_found",
          message: "Contractor not found.",
        });
      }

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const matching = guests.find((g) => {
        const start = new Date(g.StartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(g.EndDate);
        end.setHours(0, 0, 0, 0);
        return (
          String(g.CarNumber) === String(vehicleNumber) &&
          g.IsActive === 1 &&
          now >= start &&
          now <= end
        );
      });

      if (!matching) {
        return res.json({
          status: "vehicle_not_found",
          message:
            "Vehicle not associated with contractor or not active/valid.",
        });
      }

      return res.json({ status: "authorized", message: "Access granted." });
    });
  });
});


module.exports = router;
