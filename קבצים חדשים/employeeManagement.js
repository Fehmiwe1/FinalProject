const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

const db = dbSingleton.getConnection();

// שליפת כל העובדים חוץ ממנהלים
router.get("/", (req, res) => {
  const query =
    "SELECT id, username, firstName, lastName, status, role FROM users WHERE role != 'manager'";
  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת עובדים:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// עדכון סטטוס עובד (active/inactive)
router.put("/:id", (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const updateQuery = "UPDATE users SET status = ? WHERE id = ?";
  db.query(updateQuery, [status, userId], (err, result) => {
    if (err) {
      console.error("שגיאה בעדכון סטטוס:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Status updated", id: userId, status });
  });
});

// עדכון תפקיד עובד (role)
router.put("/role/:id", (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  const allowedRoles = ["employee", "manager", "kabat", "moked"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const updateQuery = "UPDATE users SET role = ? WHERE id = ?";
  db.query(updateQuery, [role, userId], (err, result) => {
    if (err) {
      console.error("שגיאה בעדכון תפקיד:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Role updated", id: userId, role });
  });
});

module.exports = router;
