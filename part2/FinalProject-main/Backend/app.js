const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const userRoutes = require("./routes/user");
const incidentRoutes = require("./routes/incident");
const employeeManagementRoutes = require("./routes/employeeManagement");
const employeeNotificationsRoutes = require("./routes/employeeNotifications");
const guestsRoutes = require("./routes/guests");
const constraintsRoutes = require("./routes/constraints");
const port = 8801;

// הגדרת session לניהול התחברויות
app.use(
  session({
    secret: "your_secret_key", // מפתח סודי להצפנת session
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // רק אם יש HTTPS
      httpOnly: true,
      sameSite: "none", // נדרש כאשר משתמשים ב־cookies בין דומיינים
      maxAge: 3600000,
    },
    // 1 שעה
  })
);

// הגדרת cors
app.use(
  cors({
    origin: "http://localhost:3000", // או כל דומיין של ה-Client
    credentials: true,
  })
);

// הגדרת JSON parsing
app.use(express.json());

app.use("/users", userRoutes);
app.use("/post", incidentRoutes);
app.use("/employeeManagement", employeeManagementRoutes);
app.use("/employeeNotifications", employeeNotificationsRoutes);
app.use("/guests", guestsRoutes);
app.use("/api", constraintsRoutes);

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
