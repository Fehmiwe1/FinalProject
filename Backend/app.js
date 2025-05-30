const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const userRoutes = require("./routes/user");
const incidentRoutes = require("./routes/incident");
const employeeManagementRoutes = require("./routes/employeeManagement");
const employeeNotificationsRoutes = require("./routes/employeeNotifications");
const employeeConstraintsRoutes = require("./routes/employeeConstraints");
const guestsRoutes = require("./routes/guests");

const port = 8801;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // חובה כדי להעביר session עם cookie
  })
);

// הגדרת session לניהול התחברויות
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // שים true רק אם אתה עובד עם HTTPS
      httpOnly: true,
      sameSite: "lax", // עדיף מ-"none" בלי HTTPS
      maxAge: 3600000,
    },
  })
);

// הגדרת JSON parsing
app.use(express.json());

app.use("/users", userRoutes);
app.use("/post", incidentRoutes);
app.use("/employeeManagement", employeeManagementRoutes);
app.use("/employeeNotifications", employeeNotificationsRoutes);
app.use("/guests", guestsRoutes);
app.use("/employeeConstraints", employeeConstraintsRoutes);

// טיפול בשגיאות
app.use((err, req, res, next) => {
  console.error(err); // Log error
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
