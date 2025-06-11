const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

// שליפת כל המאבטחים עם האילוצים שלהם
router.get("/scheduleGuard", (req, res) => {
  const query = `
    SELECT 
      u.id AS id,
      u.firstName,
      u.lastName,
      DATE_FORMAT(ec.date, '%Y-%m-%d') AS date,
      ec.shift,
      ec.availability
    FROM users u
    LEFT JOIN employee_constraints ec 
      ON u.id = ec.ID_employee
    WHERE u.role = 'guard'
    ORDER BY u.id, ec.date, ec.shift;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת האילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

// שליפת כל המוקדניות עם האילוצים שלהן
router.get("/scheduleMoked", (req, res) => {
  const query = `
    SELECT 
      u.id AS id,
      u.firstName,
      u.lastName,
      DATE_FORMAT(ec.date, '%Y-%m-%d') AS date,
      ec.shift,
      ec.availability
    FROM users u
    LEFT JOIN employee_constraints ec 
      ON u.id = ec.ID_employee
    WHERE u.role = 'moked'
    ORDER BY u.id, ec.date, ec.shift;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת האילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

// שליפ כל הקבטים עם האילוצים שלהם
router.get("/scheduleKabet", (req, res) => {
  const query = `
    SELECT 
      u.id AS id,
      u.firstName,
      u.lastName,
      DATE_FORMAT(ec.date, '%Y-%m-%d') AS date,
      ec.shift,
      ec.availability
    FROM users u
    LEFT JOIN employee_constraints ec 
      ON u.id = ec.ID_employee
    WHERE u.role = 'kabat'
    ORDER BY u.id, ec.date, ec.shift;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("שגיאה בשליפת האילוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});



router.post("/save", (req, res) => {
  const { role, assignments } = req.body;

  if (!role || !assignments) {
    return res.status(400).json({ message: "Missing role or assignments" });
  }

  const valuesToInsert = [];
  const shiftsToEnsure = new Set();
  const roleCountPerShift = {}; // נוסיף כאן ספירת עובדים לפי משמרת

  for (const [key, employeeIds] of Object.entries(assignments)) {
    const [date, shiftType, location] = key.split("-");
    const shiftKey = `${date}|${location}|${shiftType}`;
    shiftsToEnsure.add(shiftKey);

    // שמירה לספירה לפי תפקיד
    if (!roleCountPerShift[shiftKey]) {
      roleCountPerShift[shiftKey] = 0;
    }
    roleCountPerShift[shiftKey] += employeeIds.length;

    for (const employeeId of employeeIds) {
      valuesToInsert.push([employeeId, date, shiftType, location, role]);
    }
  }

  const ensureShifts = Array.from(shiftsToEnsure).map((s) => {
    const [date, location, shiftType] = s.split("|");
    return new Promise((resolve, reject) => {
      const insertShift = `
        INSERT INTO shift (Date, Location, ShiftType)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE ID = ID
      `;
      db.query(insertShift, [date, location, shiftType], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  Promise.all(ensureShifts)
    .then(() => {
      const selectShiftIds = `
        SELECT ID, Date, Location, ShiftType FROM shift
        WHERE (${Array.from(shiftsToEnsure)
          .map(() => `(Date=? AND Location=? AND ShiftType=?)`)
          .join(" OR ")})
      `;
      const shiftParams = Array.from(shiftsToEnsure).flatMap((s) =>
        s.split("|")
      );

      db.query(selectShiftIds, shiftParams, (err, shiftRows) => {
        if (err) return res.status(500).json({ error: "DB read error" });

        const shiftMap = {};
        for (const row of shiftRows) {
          const key = `${row.Date}-${row.ShiftType}-${row.Location}`;
          shiftMap[key] = row.ID;
        }

        const finalInserts = valuesToInsert.map(
          ([employeeId, date, shiftType, location, role]) => {
            const shiftKey = `${date}-${shiftType}-${location}`;
            const shiftId = shiftMap[shiftKey];
            return [employeeId, shiftId, role];
          }
        );

        const affectedShiftIds = [
          ...new Set(finalInserts.map((row) => row[1])),
        ];
        const deleteOld = `
          DELETE FROM employee_shift_assignment
          WHERE Shift_ID IN (${affectedShiftIds.map(() => "?").join(",")})
        `;

        db.query(deleteOld, affectedShiftIds, (err2) => {
          if (err2) {
            console.error("Error deleting old assignments:", err2);
            return res.status(500).json({ error: "Delete failed" });
          }

          const insertAssignments = `
            INSERT INTO employee_shift_assignment (Employee_ID, Shift_ID, Role)
            VALUES ?
          `;
          db.query(insertAssignments, [finalInserts], (err3) => {
            if (err3) {
              console.error("Error inserting assignments:", err3);
              return res.status(500).json({ error: "Insert failed" });
            }

            // שלב אחרון: עדכון ספירת עובדים לפי תפקיד
            const updates = Object.entries(roleCountPerShift).map(
              ([key, count]) => {
                const [date, location, shiftType] = key.split("|");
                let col =
                  role === "מאבטח"
                    ? "Num_Guards"
                    : role === "מוקד"
                    ? "Num_Moked"
                    : "Num_Kabat";
                return new Promise((resolve, reject) => {
                  const update = `UPDATE shift SET ${col} = ? WHERE Date = ? AND Location = ? AND ShiftType = ?`;
                  db.query(
                    update,
                    [count, date, location, shiftType],
                    (err4) => {
                      if (err4) reject(err4);
                      else resolve();
                    }
                  );
                });
              }
            );

            Promise.all(updates)
              .then(() => {
                res.json({
                  message: "Schedule saved and updated successfully",
                });
              })
              .catch((err5) => {
                console.error("Error updating shift counts:", err5);
                res.status(500).json({ error: "Update shift count failed" });
              });
          });
        });
      });
    })
    .catch((e) => {
      console.error("Error ensuring shifts:", e);
      res.status(500).json({ error: "Shift insert failed" });
    });
});




module.exports = router;
