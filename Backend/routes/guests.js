const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
// התחברות למסד הנתונים
const db = dbSingleton.getConnection();

// קבלת כל אורחים עם עדכון חסומים שפג תוקפם
router.get("/", (req, res) => {
  // חסימת קבלנים שפג תוקפם
  const blockExpiredQuery = `
    UPDATE guests
    SET IsActive = 0
    WHERE EndDate < CURDATE() AND IsActive = 1
  `;

  db.query(blockExpiredQuery, (blockErr) => {
    if (blockErr) {
      return res
        .status(500)
        .json({ message: "Database error", error: blockErr });
    }

    // לאחר עדכון, שליפת כל האורחים
    const selectQuery = `
      SELECT 
        GuestID,
        GuestNumber,
        CarNumber,
        GuestName,
        GuestPhone,
        DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
        DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
        IsActive
      FROM guests
    `;

    db.query(selectQuery, (selectErr, results) => {
      if (selectErr) {
        return res
          .status(500)
          .json({ message: "Database error", error: selectErr });
      }

      res.json(results);
    });
  });
});


// קבלת דוח לפי מזהה (מספר קבלן)
router.get("/:GuestNumber", (req, res) => {
  const guestNumber = req.params.GuestNumber;

  const query = `
    SELECT 
      GuestID,
      GuestNumber,
      CarNumber,
      GuestName,
      GuestPhone,
      DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
      DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
      IsActive
    FROM guests
    WHERE GuestNumber = ?
  `;

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

  const parsedStartDate = new Date(StartDate).toISOString();
  const parsedEndDate = new Date(EndDate).toISOString();
  const now = new Date();

  // חישוב isActive לפי תאריך סיום
  const IsActive = new Date(EndDate) >= now ? 1 : 0;

  const query =
    "INSERT INTO guests (GuestNumber, CarNumber, GuestName, GuestPhone, StartDate, EndDate, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      GuestNumber,
      CarNumber,
      GuestName,
      GuestPhone,
      parsedStartDate,
      parsedEndDate,
      IsActive,
    ],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.json({
        message: "Guest added successfully!",
        id: results.insertId,
        guest: {
          GuestNumber,
          CarNumber,
          GuestName,
          GuestPhone,
          StartDate: parsedStartDate,
          EndDate: parsedEndDate,
          IsActive,
        },
      });
    }
  );
});


// עדכון רכב לפי מזהה ייחודי
router.put("/vehicle/:GuestID", (req, res) => {
  const guestId = req.params.GuestID;
  const { CarNumber, GuestName, GuestPhone, StartDate, EndDate } = req.body;

  if (!CarNumber || !GuestName || !GuestPhone || !StartDate || !EndDate) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const parsedStartDate = new Date(StartDate);
  const parsedEndDate = new Date(EndDate);
  const now = new Date();

  const formattedStartDate = parsedStartDate.toISOString().split("T")[0];
  const formattedEndDate = parsedEndDate.toISOString().split("T")[0];

  // חישוב האם תוקף הפעולה עדיין קיים
  const isActive = parsedEndDate >= now ? 1 : 0;

  const updateQuery = `
    UPDATE guests
    SET CarNumber = ?, GuestName = ?, GuestPhone = ?, 
        StartDate = ?, EndDate = ?, IsActive = ?
    WHERE GuestID = ?
  `;

  db.query(
    updateQuery,
    [
      CarNumber,
      GuestName,
      GuestPhone,
      formattedStartDate,
      formattedEndDate,
      isActive,
      guestId,
    ],
    (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Vehicle not found!" });
      }

      const selectQuery = `
        SELECT 
          GuestID,
          GuestNumber,
          CarNumber,
          GuestName,
          GuestPhone,
          DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
          DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
          IsActive
        FROM guests
        WHERE GuestID = ?
      `;

      db.query(selectQuery, [guestId], (selectErr, rows) => {
        if (selectErr) {
          console.error("DB error on SELECT:", selectErr);
          return res
            .status(500)
            .json({ message: "Database error", error: selectErr });
        }

        res.json({
          message: "Vehicle updated successfully!",
          guest: rows[0],
        });
      });
    }
  );
});


// מחיקת רכב ממספר קבלן לפי GuestID
router.delete("/delete/:GuestID", (req, res) => {
  const guestId = req.params.GuestID;

  if (!guestId) {
    return res.status(400).json({ message: "GuestID is required" });
  }

  const query = `
    DELETE FROM guests
    WHERE GuestID = ?
  `;

  db.query(query, [guestId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Vehicle not found or already deleted" });
    }

    res.json({ message: "Vehicle deleted successfully" });
  });
});

// הוספת רכב חדש לקבלן קיים
// הוספת רכב חדש
router.post("/addVehicle", (req, res) => {
  const { GuestNumber, CarNumber, GuestName, GuestPhone, StartDate, EndDate } =
    req.body;

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

  const parsedStartDate = new Date(StartDate).toISOString();
  const parsedEndDate = new Date(EndDate).toISOString();

  const insertQuery = `
    INSERT INTO guests (GuestNumber, CarNumber, GuestName, GuestPhone, StartDate, EndDate, IsActive)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `;

  db.query(
    insertQuery,
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
        message: "Vehicle added successfully!",
        id: results.insertId,
      });
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

  // שליפה של כל השורות של הקבלן
  const contractorQuery = `
    SELECT * FROM guests
    WHERE GuestNumber = ?
  `;

  db.query(contractorQuery, [contractorNumber], (err, guests) => {
    if (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Database error", error: err });
    }

    if (guests.length === 0) {
      return res.json({
        status: "contractor_not_found",
        message: "Contractor not found.",
      });
    }

    const matching = guests.find((g) => {
      return String(g.CarNumber) === String(vehicleNumber) && g.IsActive === 1;
    });

    if (!matching) {
      return res.json({
        status: "vehicle_not_found",
        message: "Vehicle not associated with contractor or not active.",
      });
    }

    return res.json({ status: "authorized", message: "Access granted." });
  });
});

module.exports = router;
