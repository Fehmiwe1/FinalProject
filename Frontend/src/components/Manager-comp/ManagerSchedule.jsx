import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/ManagerSchedule.css";

function ManagerSchedule() {
  const roles = ["מאבטח", "מוקד", "קבט"];
  const [selectedRole, setSelectedRole] = useState("מאבטח");
  const [constraints, setConstraints] = useState([]);
  const [allGuards, setAllGuards] = useState([]);

  const [assignments, setAssignments] = useState({});

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
        .get("/createSchedule/scheduleGuard", { withCredentials: true })
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

    if (selectedRole === "מוקד") {
      axios
        .get("/createSchedule/scheduleMoked", { withCredentials: true })
        .then((res) => {
          setConstraints(res.data);
        })
        .catch((err) => console.error("שגיאה בטעינת אילוצים:", err));

      axios
        .get("/users/moked", { withCredentials: true })
        .then((res) => {
          const uniqueMoked = res.data.reduce((acc, curr) => {
            if (!acc.find((g) => g.id === curr.id)) {
              acc.push(curr);
            }
            return acc;
          }, []);
          setAllGuards(uniqueMoked);
        })
        .catch((err) => console.error("שגיאה בטעינת מוקדנים:", err));
    }

    if (selectedRole === "קבט") {
      axios
        .get("/createSchedule/scheduleKabet", { withCredentials: true })
        .then((res) => {
          setConstraints(res.data);
        })
        .catch((err) => console.error("שגיאה בטעינת אילוצים:", err));

      axios
        .get("/users/kabat", { withCredentials: true })
        .then((res) => {
          const uniqueKabat = res.data.reduce((acc, curr) => {
            if (!acc.find((g) => g.id === curr.id)) {
              acc.push(curr);
            }
            return acc;
          }, []);
          setAllGuards(uniqueKabat);
        })
        .catch((err) => console.error("שגיאה בטעינת קבטים:", err));
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

  const renderSelect = (
    shiftType,
    position,
    dayIdx,
    dateStr,
    role = "guard"
  ) => {
    const count =
      role === "kabat" || role === "moked"
        ? 1
        : getGuardCount(shiftType, position, dayIdx);
    if (count === 0) return <div className="disabled-cell"></div>;

    const shiftObj = shifts.find((s) => s.type === shiftType);
    let label = shiftObj?.label;

    if (role === "kabat") {
      const [start, end] = label.split(" - ");
      const [h, m] = start.split(":").map(Number);
      const earlyStart = new Date(0, 0, 0, h, m - 15)
        .toTimeString()
        .slice(0, 5);
      label = `${earlyStart} - ${end}`;
    } else if (shiftObj?.positionOverrides?.[position]) {
      label = shiftObj.positionOverrides[position];
    }

    const keyBase = `${dateStr}-${shiftType}`;
    const cellKey = `${dateStr}-${shiftType}-${position}`;
    const selectedInCell = assignments[cellKey] || [];

    // שליפת כל מי שנבחר כבר במשמרת הזו (בכל העמדות)
    const allSelectedInShift = Object.entries(assignments)
      .filter(([key]) => key.startsWith(keyBase))
      .flatMap(([, val]) => val);

    const filteredGuards = allGuards
      .map((guard) => {
        const constraint = constraints.find(
          (c) =>
            c.id === guard.id && c.date === dateStr && c.shift === shiftType
        );
        let optionColor = "green-option";
        if (constraint?.availability === "לא יכול") optionColor = "red-option";
        else if (constraint?.availability === "יכול חלקית")
          optionColor = "yellow-option";

        return {
          id: guard.id,
          name: `${guard.firstName} ${guard.lastName}`,
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
      });

    return (
      <div className="multi-select">
        <div className="shift-time-label">{label}</div>
        {[...Array(count)].map((_, idx) => {
          const currentSelected = selectedInCell[idx] || "";

          // הצגת רק מאבטחים שעדיין לא נבחרו למשמרת הזו, או שכבר נבחרו כאן
          const availableGuards = filteredGuards.filter(
            (g) =>
              !allSelectedInShift.includes(g.id) ||
              selectedInCell.includes(g.id)
          );

          return (
            <select
              key={idx}
              className={`guard-select ${(() => {
                const selectedGuard = filteredGuards.find(
                  (g) => g.id === currentSelected
                );
                return selectedGuard?.className === "red-option" ? "blink" : "";
              })()}`}
              value={currentSelected}
              onChange={(e) => {
                const selectedId = parseInt(e.target.value);
                if (!selectedId) return;
                setAssignments((prev) => {
                  const updated = { ...prev };
                  updated[cellKey] = [...(updated[cellKey] || [])];
                  updated[cellKey][idx] = selectedId;
                  return updated;
                });
              }}
            >
              <option value="">בחר</option>
              {availableGuards.map((guard) => (
                <option
                  key={`${guard.id}-${shiftType}-${position}-${dayIdx}`}
                  value={guard.id}
                  className={guard.className}
                >
                  {guard.name}
                </option>
              ))}
            </select>
          );
        })}
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

  const renderMokedScheduleTable = () => {
    const weeks = [0, 1]; // שבוע ראשון, שבוע שני

    return (
      <div className="guard-schedule-grid">
        <h2 className="title">סידור עבודה - מוקד</h2>
        {weeks.map((week, wIdx) => {
          return (
            <div key={wIdx}>
              <h3>שבוע {wIdx + 1}</h3>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>יום</th>
                    {shifts.map((shift) => (
                      <th key={shift.type}>{shift.type}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, dayIdx) => {
                    const globalDayIdx = dayIdx + week * 7;
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + globalDayIdx);
                    const formattedDate = date.toISOString().split("T")[0];
                    const displayDate = date.toLocaleDateString("he-IL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    });

                    return (
                      <tr key={globalDayIdx}>
                        <td className="day-label">
                          {day} <br />
                          <span className="date-placeholder">
                            {displayDate}
                          </span>
                        </td>
                        {shifts.map((shift) => (
                          <td key={shift.type}>
                            {renderSelect(
                              shift.type,
                              "מוקד",
                              globalDayIdx,
                              formattedDate
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  const renderKabatScheduleTable = () => {
    const weeks = [0, 1];

    return (
      <div className="guard-schedule-grid">
        <h2 className="title">סידור עבודה - קב"ט</h2>
        {weeks.map((week, wIdx) => {
          return (
            <div key={wIdx}>
              <h3>שבוע {wIdx + 1}</h3>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>יום</th>
                    {shifts.map((shift) => (
                      <th key={shift.type}>{shift.type}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, dayIdx) => {
                    const globalDayIdx = dayIdx + week * 7;
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + globalDayIdx);
                    const formattedDate = date.toISOString().split("T")[0];
                    const displayDate = date.toLocaleDateString("he-IL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    });

                    return (
                      <tr key={globalDayIdx}>
                        <td className="day-label">
                          {day} <br />
                          <span className="date-placeholder">
                            {displayDate}
                          </span>
                        </td>
                        {shifts.map((shift) => (
                          <td key={shift.type}>
                            {renderSelect(
                              shift.type,
                              "קבט",
                              globalDayIdx,
                              formattedDate,
                              "kabat"
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (selectedRole) {
      case "מאבטח":
        return renderFullScheduleTable();
      case "מוקד":
        return renderMokedScheduleTable();
      case "קבט":
        return renderKabatScheduleTable();
      default:
        return null;
    }
  };

  const handleSaveSchedule = async () => {
    try {
      await axios.post(
        "/createSchedule/save",
        {
          role: selectedRole,
          assignments,
        },
        { withCredentials: true }
      );
      alert("הסידור נשמר בהצלחה!");
    } catch (err) {
      console.error("שגיאה בשמירת הסידור:", err);
      alert("שגיאה בשמירה. נסה שוב.");
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

      <main className="schedule-display">
        {renderContent()}

        <button className="save-button" onClick={handleSaveSchedule}>
          שמור סידור עבודה
        </button>
      </main>
    </div>
  );
  
}

export default ManagerSchedule;
