import React, { useState, useEffect } from "react";
import "../../assets/styles/Guerd-styles/Constraints.css";
function Constraints() {
  const [weeks, setWeeks] = useState([]);
  const [selections, setSelections] = useState({});

  useEffect(() => {
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
          days.push(date.toLocaleDateString("he-IL"));
        }
        return days;
      };

      const week1 = generateWeek(nextMonday);
      const week2Start = new Date(nextMonday);
      week2Start.setDate(week2Start.getDate() + 7);
      const week2 = generateWeek(week2Start);

      setWeeks([week1, week2]);
    };

    generateWeeks();
  }, []);

  const handleSelectChange = (date, shift, value) => {
    setSelections((prev) => ({
      ...prev,
      [`${date}-${shift}`]: value,
    }));
  };

  const toggleDay = (date) => {
    const isAllOne = ["בוקר", "ערב", "לילה"].every(
      (shift) => selections[`${date}-${shift}`] === "1"
    );
    const newValue = isAllOne ? "3" : "1";

    const newSelections = { ...selections };
    ["בוקר", "ערב", "לילה"].forEach((shift) => {
      newSelections[`${date}-${shift}`] = newValue;
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
                (shift) => selections[`${date}-${shift}`] === "1"
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
          {["בוקר", "ערב", "לילה"].map((shift, shiftIndex) => (
            <tr key={shiftIndex}>
              <td>{shift}</td>
              {weekDates.map((date, i) => (
                <td key={i}>
                  <select
                    onChange={(e) =>
                      handleSelectChange(date, shift, e.target.value)
                    }
                    value={selections[`${date}-${shift}`] || "3"}
                  >
                    <option value="1">לא יכול</option>
                    <option value="2">יכול חלקית</option>
                    <option value="3">יכול</option>
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleSubmit = () => {
    console.log("נשלח עם הערכים:", selections);
    alert("הבקשה נשלחה בהצלחה");
  };

  return (
    <div className="main-wrapper">
      <main className="main-body">
        <section className="entry-section full-width">
          <h2>אילוצים</h2>
          {weeks.length > 0 && renderTable(weeks[0])}
          {weeks.length > 1 && renderTable(weeks[1])}

          <div className="legend">
            <p>
              <strong>שיטת מילוי</strong>
            </p>
            <p>1 - לא יכול</p>
            <p>2 - יכול חלקית</p>
            <p>3 - יכול (ברירת מחדל)</p>
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
