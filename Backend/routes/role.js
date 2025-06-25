const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");

// התחברות למסד הנתונים
const db = dbSingleton.getConnection();

// 🔹 שליפת נתוני ההרשאות
router.get("/", (req, res) => {
  const query = `
    SELECT 
      ID_Role,
      Role_Name,
      Create_Work_Schedule,
      Update_Work_Schedule,
      Watch_Work_Schedule,
      Watch_Incident,
      Create_Incident,
      Updating_Incident,
      Create_Guest_List,
      Update_Guest_List
    FROM role
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת נתוני הרשאות:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
  });
});

// 🔹 עדכון שדה הרשאה עבור תפקיד
router.put("/updatePermission", (req, res) => {
  const { roleName, permissionField, newValue } = req.body;

  // רק שדות שמותר לעדכן
  const allowedFields = [
    "Create_Work_Schedule",
    "Update_Work_Schedule",
    "Watch_Work_Schedule",
    "Watch_Incident",
    "Create_Incident",
    "Updating_Incident",
    "Create_Guest_List",
    "Update_Guest_List",
  ];

  if (!allowedFields.includes(permissionField)) {
    return res.status(400).json({ error: "Permission field not allowed" });
  }

  // בדיקה שערך ההרשאה תקין
  if (newValue !== "able" && newValue !== "unable") {
    return res.status(400).json({ error: "Invalid permission value" });
  }

  const query = `UPDATE role SET \`${permissionField}\` = ? WHERE Role_Name = ?`;

  db.query(query, [newValue, roleName], (err, result) => {
    if (err) {
      console.error("שגיאה בעדכון ההרשאה:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ success: true });
  });
});

// 🔹 שליפת הרשאות כולל עיבוד
router.get("/getPermissions", (req, res) => {
  const query = `
    SELECT 
      ID_Role,
      Role_Name,
      Create_Work_Schedule,
      Update_Work_Schedule,
      Watch_Work_Schedule,
      Watch_Incident,
      Create_Incident,
      Updating_Incident,
      Create_Guest_List,
      Update_Guest_List
    FROM role
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת נתוני הרשאות:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // עיבוד הרשאות
    const processed = results.map((role) => {
      const permissions = {};
      const able = [];
      const unable = [];

      Object.entries(role).forEach(([key, value]) => {
        if (["ID_Role", "Role_Name"].includes(key)) return;
        permissions[key] = value;
        (value === "able" ? able : unable).push(key);
      });

      return {
        ID_Role: role.ID_Role,
        Role_Name: role.Role_Name,
        permissions,
        can: able,
        cannot: unable,
      };
    });

    res.json(processed);
  });
});

module.exports = router;
