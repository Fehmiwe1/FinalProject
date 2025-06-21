import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/Constraints.css";

function Constraints() {
  const [weeks, setWeeks] = useState([[], []]);
  const [selections, setSelections] = useState({});
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [canSubmit, setCanSubmit] = useState(true);

  useEffect(() => {
    const init = async () => {
      const [week1, week2] = generateTwoWeekRange();
      setWeeks([week1, week2]);
      checkSubmissionDeadline(week1);
      await fetchExistingConstraints();
    };
    init();
  }, []);

  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  const generateTwoWeekRange = () => {
    const today = new Date();
    const baseDate = new Date("2025-06-01");
    const diffDays = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
    const currentCycleStart = new Date(baseDate);
    currentCycleStart.setDate(
      baseDate.getDate() + Math.floor(diffDays / 14) * 14
    );

    const week1 = [];
    const week2 = [];

    for (let i = 0; i < 14; i++) {
      const date = new Date(currentCycleStart);
      date.setDate(currentCycleStart.getDate() + i);
      const isoDate = date.toISOString().split("T")[0];
      if (i < 7) {
        week1.push(isoDate);
      } else {
        week2.push(isoDate);
      }
    }

    return [week1, week2];
  };

  const checkSubmissionDeadline = (week1) => {
    if (week1.length < 3) return;
    const deadline = new Date(week1[2]); // יום שלישי
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today > deadline) {
      setCanSubmit(false);
    }
  };

  const fetchExistingConstraints = async () => {
    try {
      const res = await axios.get("/employeeConstraints", {
        withCredentials: true,
      });

      const updatedSelections = {};
      res.data.forEach(({ date, shift, availability }) => {
        updatedSelections[`${date}|${shift}`] = availability;
      });

      setSelections(updatedSelections);
    } catch (err) {
      console.error("שגיאה בטעינת האילוצים:", err);
    }
  };

  const handleSelectChange = (date, shift, value) => {
    setSelections((prev) => ({
      ...prev,
      [`${date}|${shift}`]: value,
    }));
  };

  const toggleDay = (date) => {
    const isAllOne = ["בוקר", "ערב", "לילה"].every(
      (shift) => selections[`${date}|${shift}`] === "לא יכול"
    );
    const newValue = isAllOne ? "יכול" : "לא יכול";

    const newSelections = { ...selections };
    ["בוקר", "ערב", "לילה"].forEach((shift) => {
      newSelections[`${date}|${shift}`] = newValue;
    });
    setSelections(newSelections);
  };

  const formatDateToHebrew = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  

  const renderTable = (weekDates, title) => (
    <div className="week-block">
      <h3>{title}</h3>
      <table className="constraints-table">
        <thead>
          <tr>
            <th>יום/משמרת</th>
            {weekDates.map((dateStr, i) => {
              const date = new Date(dateStr);
              const dayName = dayNames[date.getDay()];
              const isDayAllDisabled = ["בוקר", "ערב", "לילה"].every(
                (shift) => selections[`${dateStr}|${shift}`] === "לא יכול"
              );

              return (
                <th key={i}>
                  <div className="date-header">
                    <button
                      className={`day-toggle-button ${
                        isDayAllDisabled ? "active" : ""
                      }`}
                      onClick={() => toggleDay(dateStr)}
                      title="סמן את כל היום כ'לא יכול'"
                    >
                      ❌
                    </button>
                    <div>{`יום ${dayName}`}</div>
                    <div>{formatDateToHebrew(dateStr)}</div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {["בוקר", "ערב", "לילה"].map((shift) => (
            <tr key={shift}>
              <td>{shift}</td>
              {weekDates.map((date) => (
                <td key={date}>
                  <select
                    onChange={(e) =>
                      handleSelectChange(date, shift, e.target.value)
                    }
                    value={selections[`${date}|${shift}`] || "יכול"}
                  >
                    <option value="לא יכול">לא יכול</option>
                    <option value="יכול חלקית">יכול חלקית</option>
                    <option value="יכול">יכול</option>
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const createConstraints = async (constraintsToSend) => {
    try {
      for (const constraint of constraintsToSend) {
        await axios.post("/employeeConstraints", constraint, {
          withCredentials: true,
        });
      }

      await fetchExistingConstraints();
      setMsg("האילוצים נשמרו בהצלחה");
      setTimeout(() => setMsg(""), 2500);
    } catch (error) {
      console.error("שגיאה:", error);
      setError("שליחת האילוצים נכשלה. נסה שוב.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allConstraints = Object.entries(selections).map(
      ([key, availability]) => {
        const [date, shift] = key.split("|");
        return { date, shift, availability };
      }
    );

    if (allConstraints.length === 0) {
      setError("לא נבחרו אילוצים לשליחה.");
      return;
    }

    setError("");
    createConstraints(allConstraints);
  };

  return (
    <div className="ConstraintsPage">
      <main className="ConstraintsPage-body">
        <h2>אילוצים</h2>
        <section>
          {msg && <div className="success-message">{msg}</div>}
          {error && <p className="error-message">{error}</p>}
          {renderTable(weeks[0], "שבוע ראשון")}
          {renderTable(weeks[1], "שבוע שני")}

          <div className="legend">
            <p>
              <strong>שיטת מילוי</strong>
            </p>
            <p>❌ לא יכול – אי זמינות מלאה</p>
            <p>✔️ יכול חלקית – זמינות חלקית</p>
            <p>✅ יכול – זמינות מלאה (ברירת מחדל)</p>
          </div>

          {/* {canSubmit ? (
            <button className="submit-button" onClick={handleSubmit}>
              שליחת בקשה
            </button>
          ) : (
            <p className="error-message">עבר המועד – לא ניתן לשלוח אילוצים.</p>
          )} */}
          <button className="submit-button" onClick={handleSubmit}>
            שליחת בקשה
          </button>
        </section>
      </main>
    </div>
  );
}
export default Constraints;
