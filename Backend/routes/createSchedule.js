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
      DATE_FORMAT(COALESCE(ec.date, s.Date), '%Y-%m-%d') AS date,
      COALESCE(ec.shift, s.ShiftType) AS shift,
      ec.availability,
      esa.Employee_ID AS assignment
    FROM users u
    LEFT JOIN employee_constraints ec 
      ON u.id = ec.ID_employee
    LEFT JOIN shift s 
      ON (ec.date = s.Date OR ec.date IS NULL)
     AND (ec.shift = s.ShiftType OR ec.shift IS NULL)
     AND s.Location = 'אחר'
    LEFT JOIN employee_shift_assignment esa 
      ON esa.Shift_ID = s.ID AND esa.Role = 'קבט' AND esa.Employee_ID = u.id
    WHERE u.role = 'kabat'
    ORDER BY date, shift, u.id;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ שגיאה בשליפת האילוצים והשיבוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }

    res.json(results);
  });
});

// שמירת סידור עבודה שנוצר לקבט
router.post("/saveShiftsKabat", (req, res) => {
  const assignments = req.body;

  const shiftCounts = {};
  const shiftInserts = [];

  assignments.forEach(({ date, shift, location, userId }) => {
    const key = `${date}|${shift}|${location}`;
    shiftCounts[key] = (shiftCounts[key] || 0) + 1;
    shiftInserts.push({ date, shift, location, userId });
  });

  const insertAndAssignPromises = Object.entries(shiftCounts).map(
    ([key, numKabat]) => {
      const [date, shiftType, location] = key.split("|");

      return new Promise((resolve, reject) => {
        const insertShiftQuery = `
          INSERT INTO shift (Date, Location, ShiftType, Num_Guards, Num_Moked, Num_Kabat)
          VALUES (?, ?, ?, 0, 0, ?)
          ON DUPLICATE KEY UPDATE Num_Kabat = VALUES(Num_Kabat)
        `;

        db.query(
          insertShiftQuery,
          [date, location, shiftType, numKabat],
          (err) => {
            if (err) {
              console.error("❌ שגיאה בשמירת shift:", err);
              return reject(err);
            }

            const selectShiftIdQuery = `
            SELECT ID FROM shift WHERE Date = ? AND Location = ? AND ShiftType = ?
          `;

            db.query(
              selectShiftIdQuery,
              [date, location, shiftType],
              (err2, rows) => {
                if (err2 || !rows.length) {
                  console.error(
                    `❌ לא נמצא Shift_ID עבור: ${date} ${shiftType} ${location}`
                  );
                  return reject(err2 || new Error("Shift ID not found"));
                }

                const shiftId = rows[0].ID;

                const insertsForThisShift = shiftInserts.filter(
                  (a) =>
                    a.date === date &&
                    a.shift === shiftType &&
                    a.location === location
                );

                const insertPromises = insertsForThisShift.map((a) => {
                  return new Promise((resInner, rejInner) => {
                    const checkExistingAssignment = `
                  SELECT * FROM employee_shift_assignment
                  WHERE Shift_ID = ? AND Role = ?
                `;

                    db.query(
                      checkExistingAssignment,
                      [shiftId, "קבט"],
                      (errCheck, results) => {
                        if (errCheck) return rejInner(errCheck);

                        if (results.length > 0) {
                          const existing = results[0];

                          // אם אותו עובד כבר משובץ, לא נדרש עדכון
                          if (existing.Employee_ID === parseInt(a.userId)) {
                            return resInner();
                          }

                          // עדכון מזהה העובד במשמרת קיימת
                          const updateQuery = `
                      UPDATE employee_shift_assignment
                      SET Employee_ID = ?
                      WHERE Shift_ID = ? AND Role = ?
                    `;

                          db.query(
                            updateQuery,
                            [a.userId, shiftId, "קבט"],
                            (errUpdate) => {
                              if (errUpdate) return rejInner(errUpdate);
                              resInner();
                            }
                          );
                        } else {
                          // אין כלל שיבוץ למשמרת הזו – הכנס חדש
                          const insertAssign = `
                      INSERT INTO employee_shift_assignment (Employee_ID, Shift_ID, Role)
                      VALUES (?, ?, ?)
                    `;

                          db.query(
                            insertAssign,
                            [a.userId, shiftId, "קבט"],
                            (errInsert) => {
                              if (errInsert) return rejInner(errInsert);
                              resInner();
                            }
                          );
                        }
                      }
                    );
                  });
                });

                Promise.all(insertPromises).then(resolve).catch(reject);
              }
            );
          }
        );
      });
    }
  );

  Promise.all(insertAndAssignPromises)
    .then(() => {
      console.log("✅ כל השיבוצים נשמרו או עודכנו בהצלחה");
      res.status(200).send("השיבוצים נשמרו בהצלחה");
    })
    .catch((err) => {
      console.error("❌ שגיאה כללית:", err);
      res.status(500).send("שגיאה בשמירה למסד הנתונים");
    });
});

// שליפת סידור עבודה של העובד קבט
router.get("/allKabatAssignments", (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(s.Date, '%Y-%m-%d') AS date,
      s.ShiftType AS shift,
      u.firstName,
      u.lastName,
      esa.Role
    FROM employee_shift_assignment esa
    JOIN shift s ON esa.Shift_ID = s.ID
    JOIN users u ON esa.Employee_ID = u.id
    WHERE esa.Role = 'קבט'
    ORDER BY s.Date, s.ShiftType, u.lastName;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ שגיאה בשליפת שיבוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }
    res.json(results);
  });
});

/////////////////////////////////////////////////////////////////////////////////////////////
// שמירת סידור עבודה שנוצר למוקד
router.post("/saveShiftsMoked", (req, res) => {
  const assignments = req.body;

  const shiftCounts = {};
  const shiftInserts = [];

  assignments.forEach(({ date, shift, location, userId }) => {
    const key = `${date}|${shift}|${location}`;
    shiftCounts[key] = (shiftCounts[key] || 0) + 1;
    shiftInserts.push({ date, shift, location, userId });
  });

  const insertAndAssignPromises = Object.entries(shiftCounts).map(
    ([key, numMoked]) => {
      const [date, shiftType, location] = key.split("|");

      return new Promise((resolve, reject) => {
        const insertShiftQuery = `
          INSERT INTO shift (Date, Location, ShiftType, Num_Guards, Num_Moked, Num_Kabat)
          VALUES (?, ?, ?, 0, ?, 0)
          ON DUPLICATE KEY UPDATE Num_Moked = VALUES(Num_Moked)
        `;

        db.query(
          insertShiftQuery,
          [date, location, shiftType, numMoked],
          (err) => {
            if (err) {
              console.error("❌ שגיאה בשמירת shift:", err);
              return reject(err);
            }

            const selectShiftIdQuery = `
              SELECT ID FROM shift WHERE Date = ? AND Location = ? AND ShiftType = ?
            `;

            db.query(
              selectShiftIdQuery,
              [date, location, shiftType],
              (err2, rows) => {
                if (err2 || !rows.length) {
                  console.error(
                    `❌ לא נמצא Shift_ID עבור: ${date} ${shiftType} ${location}`
                  );
                  return reject(err2 || new Error("Shift ID not found"));
                }

                const shiftId = rows[0].ID;

                const insertsForThisShift = shiftInserts.filter(
                  (a) =>
                    a.date === date &&
                    a.shift === shiftType &&
                    a.location === location
                );

                const insertPromises = insertsForThisShift.map((a) => {
                  return new Promise((resInner, rejInner) => {
                    const checkExistingAssignment = `
                      SELECT * FROM employee_shift_assignment
                      WHERE Shift_ID = ? AND Role = ?
                    `;

                    db.query(
                      checkExistingAssignment,
                      [shiftId, "מוקד"],
                      (errCheck, results) => {
                        if (errCheck) return rejInner(errCheck);

                        if (results.length > 0) {
                          const existing = results[0];

                          if (existing.Employee_ID === parseInt(a.userId)) {
                            return resInner();
                          }

                          const updateQuery = `
                            UPDATE employee_shift_assignment
                            SET Employee_ID = ?
                            WHERE Shift_ID = ? AND Role = ?
                          `;

                          db.query(
                            updateQuery,
                            [a.userId, shiftId, "מוקד"],
                            (errUpdate) => {
                              if (errUpdate) return rejInner(errUpdate);
                              resInner();
                            }
                          );
                        } else {
                          const insertAssign = `
                            INSERT INTO employee_shift_assignment (Employee_ID, Shift_ID, Role)
                            VALUES (?, ?, ?)
                          `;

                          db.query(
                            insertAssign,
                            [a.userId, shiftId, "מוקד"],
                            (errInsert) => {
                              if (errInsert) return rejInner(errInsert);
                              resInner();
                            }
                          );
                        }
                      }
                    );
                  });
                });

                Promise.all(insertPromises).then(resolve).catch(reject);
              }
            );
          }
        );
      });
    }
  );

  Promise.all(insertAndAssignPromises)
    .then(() => {
      console.log("✅ כל שיבוצי המוקדנים נשמרו בהצלחה");
      res.status(200).send("השיבוצים נשמרו בהצלחה");
    })
    .catch((err) => {
      console.error("❌ שגיאה כללית:", err);
      res.status(500).send("שגיאה בשמירה למסד הנתונים");
    });
});


// שליפת סידור עבודה של העובד מוקד
router.get("/allMokedAssignments", (req, res) => {
  const query = `
    SELECT 
      DATE_FORMAT(s.Date, '%Y-%m-%d') AS date,
      s.ShiftType AS shift,
      u.firstName,
      u.lastName,
      esa.Role
    FROM employee_shift_assignment esa
    JOIN shift s ON esa.Shift_ID = s.ID
    JOIN users u ON esa.Employee_ID = u.id
    WHERE esa.Role = 'מוקד'
    ORDER BY s.Date, s.ShiftType, u.lastName;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ שגיאה בשליפת שיבוצים:", err);
      return res.status(500).json({ error: "שגיאה במסד הנתונים" });
    }
    res.json(results);
  });
});

module.exports = router;
