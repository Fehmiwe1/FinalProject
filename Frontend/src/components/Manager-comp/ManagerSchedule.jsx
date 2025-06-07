import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/ManagerSchedule.css";

function ManagerSchedule() {
  const roles = ["מאבטח", "מוקד", "קבט"];
  const [selectedRole, setSelectedRole] = useState("מאבטח");
  const [constraints, setConstraints] = useState([]);
  const [allGuards, setAllGuards] = useState([]);

  const startDate = new Date("2025-06-01");
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const positions = [
    "ראשי",
    "נשר",
    "סייר רכוב",
    "סיור א",
    "סיור ב",
    "סיור ג",
    "הפסקות",
  ];
  const shifts = [
    {
      type: "בוקר",
      label: "06:45 - 15:15",
      positionOverrides: { נשר: "06:00 - 14:00" },
    },
    {
      type: "ערב",
      label: "15:00 - 22:45",
      positionOverrides: { נשר: "13:45 - 22:00" },
    },
    { type: "לילה", label: "22:30 - 07:00" },
  ];

  useEffect(() => {
    if (selectedRole === "מאבטח") {
      axios
        .get("/createSchedule/schedule", { withCredentials: true })
        .then((res) => {
          setConstraints(res.data);
        })
        .catch((err) => console.error("שגיאה בטעינת אילוצים:", err));

      axios
        .get("/users/guards", { withCredentials: true })
        .then((res) => {
          const uniqueGuards = res.data.reduce((acc, curr) => {
            if (!acc.find((g) => g.id === curr.id)) {
              acc.push(curr);
            }
            return acc;
          }, []);
          setAllGuards(uniqueGuards);
        })
        .catch((err) => console.error("שגיאה בטעינת מאבטחים:", err));
    }
  }, [selectedRole]);

  const getGuardCount = (shiftType, position, dayIdx) => {
    const dayName = days[dayIdx];

    if (position === "ראשי") {
      if (shiftType === "בוקר") return dayName === "שבת" ? 3 : 4;
      if (shiftType === "ערב")
        return dayName === "שישי" || dayName === "שבת" ? 3 : 4;
      if (shiftType === "לילה") return 2;
    }

    if (position === "נשר") {
      if (dayName === "שישי" && (shiftType === "ערב" || shiftType === "לילה"))
        return 0;
      if (dayName === "שבת") return 0;
      if (shiftType === "בוקר") return 3;
      if (shiftType === "ערב") return 2;
      if (shiftType === "לילה") return 0;
    }

    if (position === "הפסקות") {
      if (shiftType !== "ערב" || dayName === "שישי" || dayName === "שבת")
        return 0;
      return 1;
    }

    return 1;
  };

  const renderSelect = (shiftType, position, dayIdx, dateStr) => {
    const count = getGuardCount(shiftType, position, dayIdx);
    if (count === 0) return <div className="disabled-cell"></div>;

    const shiftObj = shifts.find((s) => s.type === shiftType);
    const label = shiftObj?.positionOverrides?.[position] || shiftObj?.label;

    return (
      <div className="multi-select">
        <div className="shift-time-label">{label}</div>
        {[...Array(count)].map((_, idx) => (
          <select key={idx} className="guard-select">
            <option value="">בחר מאבטח</option>
            {allGuards
              .map((guard) => {
                const constraint = constraints.find(
                  (c) =>
                    c.id === guard.id &&
                    c.date === dateStr &&
                    c.shift === shiftType
                );
                let optionColor = "green-option";
                if (constraint?.availability === "לא יכול")
                  optionColor = "red-option";
                else if (constraint?.availability === "יכול חלקית")
                  optionColor = "yellow-option";

                return {
                  id: guard.id,
                  firstName: guard.firstName,
                  lastName: guard.lastName,
                  className: optionColor,
                };
              })
              .sort((a, b) => {
                const priority = {
                  "green-option": 0,
                  "yellow-option": 1,
                  "red-option": 2,
                };
                return priority[a.className] - priority[b.className];
              })
              .map((guard) => (
                <option
                  key={`${guard.id}-${idx}`}
                  value={guard.id}
                  className={guard.className}
                >
                  {guard.firstName} {guard.lastName}
                </option>
              ))}
          </select>
        ))}
      </div>
    );
  };

  const renderFullScheduleTable = () => (
    <div className="guard-schedule-grid">
      <h2 className="title">סידור עבודה</h2>
      <table className="schedule-table">
        <thead>
          <tr>
            <th>יום</th>
            {positions.map((pos, i) => (
              <th key={i}>{pos}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIdx) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + dayIdx);
            const formattedDate = date.toISOString().split("T")[0];
            const displayDate = date.toLocaleDateString("he-IL", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            });

            return (
              <tr key={dayIdx}>
                <td className="day-label">
                  {day} <br />
                  <span className="date-placeholder">{displayDate}</span>
                </td>
                {positions.map((pos, i) => (
                  <td key={i}>
                    {shifts.map((shift) => (
                      <div key={shift.type} className="shift-block">
                        {renderSelect(shift.type, pos, dayIdx, formattedDate)}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (selectedRole) {
      case "מאבטח":
        return renderFullScheduleTable();
      case "מוקד":
        return <div className="role-view">תצוגת סידור עבודה למוקד</div>;
      case "קבט":
        return <div className="role-view">תצוגת סידור עבודה לקב\"ט</div>;
      default:
        return null;
    }
  };

  return (
    <div className="managerSchedulePage">
      <aside className="role-selector">
        {roles.map((role) => (
          <button
            key={role}
            className={selectedRole === role ? "active" : ""}
            onClick={() => setSelectedRole(role)}
          >
            {role}
          </button>
        ))}
      </aside>
      <main className="schedule-display">{renderContent()}</main>
    </div>
  );
}

export default ManagerSchedule;
