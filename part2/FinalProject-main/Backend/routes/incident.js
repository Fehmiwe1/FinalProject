const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
// התחברות למסד הנתונים
const db = dbSingleton.getConnection();

// קבלת כל הדוחות
router.get("/", (req, res) => {
  const query = "SELECT * FROM incident";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// הוספת דוח חדש
router.post("/", (req, res) => {
  const { Incident_Name, Incident_Date, ID_Employee, Description } = req.body;

  // בדיקה שכל השדות הנדרשים סופקו
  if (!Incident_Name || !Incident_Date || !ID_Employee || !Description) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // המרת תאריך לפורמט מתאים (אם יש צורך)
  const parsedDate = new Date(Incident_Date).toISOString();

  const query =
    "INSERT INTO incident (Incident_Name, Incident_Date, ID_Employee, Description) VALUES (?, ?, ?, ?)";

  db.query(
    query,
    [Incident_Name, parsedDate, ID_Employee, Description],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      res.json({
        message: "Report added successfully!",
        id: results.insertId,
        report: {
          Incident_Name,
          Incident_Date: parsedDate,
          ID_Employee,
          Description,
        },
      });
    }
  );
});

// קבלת דוח לפי מזהה
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM incident WHERE id = ? ";
  db.query(query, id, (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json(results);
  });
});

// עדכון דוח קיים
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { Incident_Name, Incident_Date, ID_Employee, Description } = req.body;

  // בדיקה שכל השדות הנדרשים סופקו
  if (!Incident_Name || !Incident_Date || !ID_Employee || !Description) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const query =
    "UPDATE incident SET Incident_Name = ?, Incident_Date = ?, ID_Employee = ?, Description = ? WHERE id = ?";

  db.query(
    query,
    [Incident_Name, Incident_Date, ID_Employee, Description, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Incident not found!" });
      }

      res.json({ message: "Incident updated successfully!" });
    }
  );
});

// מחיקת דוח לפי מזהה (רק למנהל)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM incident WHERE id = ?";
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Incident not found!" });
    }

    res.json({ message: "Incident deleted!" });
  });
});

module.exports = router;
