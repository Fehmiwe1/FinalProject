import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/Constraints.css";

function Constraints() {
  const [weeks, setWeeks] = useState([]);
  const [selections, setSelections] = useState({});
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const generatedWeeks = generateWeeks();
      setWeeks(generatedWeeks);
      await fetchExistingConstraints();
    };
    init();
  }, []);

  const generateWeeks = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((8 - currentDay) % 7));

    const generateWeek = (startDate) => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        days.push(date.toISOString().split("T")[0]);
      }
      return days;
    };

    const week1 = generateWeek(nextMonday);
    const week2Start = new Date(nextMonday);
    week2Start.setDate(week2Start.getDate() + 7);
    const week2 = generateWeek(week2Start);

    return [week1, week2];
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

  const renderTable = (weekDates) => (
    <div className="week-block">
      <table className="constraints-table">
        <thead>
          <tr>
            <th>יום/משמרת</th>
            {weekDates.map((date, i) => {
              const isDayAllDisabled = ["בוקר", "ערב", "לילה"].every(
                (shift) => selections[`${date}|${shift}`] === "לא יכול"
              );

              return (
                <th key={i}>
                  <div className="date-header">
                    <button
                      className={`day-toggle-button ${
                        isDayAllDisabled ? "active" : ""
                      }`}
                      onClick={() => toggleDay(date)}
                      title="סמן את כל היום כ'לא יכול'"
                      aria-label={`הפוך את ${date} ליום שאינו זמין`}
                    >
                      ❌
                    </button>
                    <div>תאריך</div>
                    <div>{date}</div>
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
    <div className="main-wrapper">
      <main className="main-body">
        <section className="entry-section full-width">
          <h2>אילוצים</h2>
          <div className="success-message">{msg}</div>
          {error && <p className="error-message">{error}</p>}
          {weeks.length > 0 && renderTable(weeks[0])}
          {weeks.length > 1 && renderTable(weeks[1])}

          <div className="legend">
            <p>
              <strong>שיטת מילוי</strong>
            </p>
            <p>לא יכול - "לא יכול"</p>
            <p>יכול חלקית - "חלקית"</p>
            <p>יכול (ברירת מחדל) - "יכול"</p>
          </div>

          <button className="submit-button" onClick={handleSubmit}>
            שליחת בקשה
          </button>
        </section>
      </main>
    </div>
  );
}

export default Constraints;
