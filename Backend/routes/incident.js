const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// ✅ קבלת כל הדוחות
router.get("/", (req, res) => {
  const query = "SELECT * FROM incident ORDER BY Incident_Date DESC";
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ✅ קבלת דוח לפי מזהה
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM incident WHERE id = ?";
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// ✅ הוספת דוח חדש
router.post("/", (req, res) => {
  const {
    Incident_Name,
    Incident_Date,
    Kabat_Name,
    Dispatcher_Name,
    Patrol_Name,
    Other_Participants,
    Description,
  } = req.body;

  // בדיקת שדות חובה
  if (!Incident_Name || !Incident_Date || !Description || !Kabat_Name) {
    return res
      .status(400)
      .json({
        message: 'יש למלא את כל השדות החיוניים (שם אירוע, תאריך, קב"ט, תיאור).',
      });
  }

  const parsedDate = new Date(Incident_Date).toISOString();

  const query = `
    INSERT INTO incident 
    (Incident_Name, Incident_Date, Kabat_Name, Dispatcher_Name, Patrol_Name, Other_Participants, Description) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    Incident_Name,
    parsedDate,
    Kabat_Name,
    Dispatcher_Name,
    Patrol_Name,
    Other_Participants,
    Description,
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res
        .status(500)
        .json({ message: "שגיאה במסד הנתונים", error: err });
    }

    res.json({
      message: "הדוח נוסף בהצלחה!",
      id: results.insertId,
      report: {
        Incident_Name,
        Incident_Date: parsedDate,
        Kabat_Name,
        Dispatcher_Name,
        Patrol_Name,
        Other_Participants,
        Description,
      },
    });
  });
});


// ✅ עדכון דוח קיים
router.put("/:id", (req, res) => {
  const {
    Incident_Name,
    Incident_Date,
    Dispatcher_Name,
    Patrol_Name,
    Other_Participants,
    Description,
  } = req.body;

  const user = req.session.user;
  const Kabat_Name = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";

  if (!Incident_Name || !Incident_Date || !Description) {
    return res
      .status(400)
      .json({ message: "All required fields must be filled." });
  }

  const parsedDate = new Date(Incident_Date).toISOString();

  const query = `
    UPDATE incident 
    SET Incident_Name = ?, Incident_Date = ?, Kabat_Name = ?, Dispatcher_Name = ?, Patrol_Name = ?, Other_Participants = ?, Description = ?
    WHERE id = ?`;

  const values = [
    Incident_Name,
    parsedDate,
    Kabat_Name,
    Dispatcher_Name,
    Patrol_Name,
    Other_Participants,
    Description,
    req.params.id,
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("❌ DB Error (update):", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Incident not found!" });
    }

    res.json({ message: "Incident updated successfully!" });
  });
});

// ✅ מחיקת דוח לפי מזהה
router.delete("/:id", (req, res) => {
  const query = "DELETE FROM incident WHERE id = ?";
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Incident not found!" });
    }

    res.json({ message: "Incident deleted!" });
  });
});

module.exports = router;
