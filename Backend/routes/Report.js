const express = require("express");
const router = express.Router();
const dbSingleton = require("../dbSingleton");
const db = dbSingleton.getConnection();

router.get("/", (req, res) => {
  const ID_employee = req.session?.user?.id;
  const Role_employee = req.session?.user?.role;
  const { startDate, endDate } = req.query;

  if (!ID_employee || !Role_employee || !startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "חסר מידע: מזהה עובד או טווח תאריכים" });
  }

  // תעריפי שכר לפי תפקיד
  const hourlyRateMap = {
    guard: 46,
    moked: 50,
    kabat: 56,
  };

  const hourlyRate = hourlyRateMap[Role_employee];

  if (!hourlyRate) {
    return res.status(400).json({ error: "תפקיד לא תקין" });
  }

  const query = `
    SELECT 
      COUNT(DISTINCT s.Date) AS total_days,
      COUNT(*) * 8 AS total_hours,
      COUNT(*) * 8 * ? AS total_salary
    FROM employee_shift_assignment esa
    JOIN shift s ON esa.Shift_ID = s.ID
    WHERE esa.Employee_ID = ?
      AND DATE(s.Date) BETWEEN ? AND ?
  `;

  db.query(
    query,
    [hourlyRate, ID_employee, startDate, endDate],
    (err, results) => {
      if (err) {
        console.error("❌ שגיאה בשאילתה:", err);
        return res.status(500).json({ error: "שגיאה במסד הנתונים" });
      }

      const data = results[0];

      if (!data || data.total_days === 0) {
        return res
          .status(404)
          .json({ message: "לא נמצאו משמרות בטווח התאריכים" });
      }

      // חישוב שבועות וחודשים לפי ימים
      const totalDays = data.total_days;
      const totalWeeks = Math.floor(totalDays / 7);
      const totalMonths = Math.floor(totalDays / 30);

      res.json({
        total_days: totalDays,
        total_weeks: totalWeeks,
        total_months: totalMonths,
        total_hours: data.total_hours,
        total_salary: data.total_salary,
      });
    }
  );
});

module.exports = router;
