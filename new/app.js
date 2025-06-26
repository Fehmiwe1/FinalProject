const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const userRoutes = require("./routes/user");
const incidentRoutes = require("./routes/incident");
const employeeManagementRoutes = require("./routes/employeeManagement");
const employeeNotificationsRoutes = require("./routes/employeeNotifications");
const employeeConstraintsRoutes = require("./routes/employeeConstraints");
const guestsRoutes = require("./routes/guests");
const employeeRequestsRoutes = require("./routes/employeeRequests");
const createScheduleRoutes = require("./routes/createSchedule");
const roleRoutes = require("./routes/role");
const reportRoutes = require("./routes/report");
const shiftChangeRequestRoutes = require("./routes/shiftChangeRequest");

const port = 8801;

// הגדרת CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// הגדרת session
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 3600000,
    },
  })
);

// הגדרת JSON parsing
app.use(express.json());

// ✅ חשיפת תיקיית הקבצים לצפייה מהדפדפן
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ראוטים
app.use("/users", userRoutes);
app.use("/post", incidentRoutes);
app.use("/employeeManagement", employeeManagementRoutes);
app.use("/employeeNotifications", employeeNotificationsRoutes);
app.use("/guests", guestsRoutes);
app.use("/employeeConstraints", employeeConstraintsRoutes);
app.use("/employeeRequests", employeeRequestsRoutes);
app.use("/createSchedule", createScheduleRoutes);
app.use("/role", roleRoutes);
app.use("/report", reportRoutes);
app.use("/shiftChangeRequest", shiftChangeRequestRoutes);

// טיפול בשגיאות
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
