import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/EmployeeConstraints.css";

function EmployeeConstraints() {
  const [constraints, setConstraints] = useState([]);
  const [weeks, setWeeks] = useState([[], []]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showTable, setShowTable] = useState(false);

  const fetchAllConstraints = async (from, to) => {
    try {
      const res = await axios.get(
        `/employeeConstraints/allConstraints?from=${from}&to=${to}`,
        { withCredentials: true }
      );
      setConstraints(res.data);
      setWeeks(generateWeeksFromRange(from, to));
      setShowTable(true);
    } catch (err) {
      console.error("שגיאה בטעינת אילוצים:", err);
    }
  };

  const generateWeeksFromRange = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);
    const allDates = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d).toISOString().split("T")[0]);
    }

    const week1 = allDates.slice(0, 7);
    const week2 = allDates.slice(7, 14);
    return [week1, week2];
  };

  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  const handleSearch = () => {
    if (!fromDate || !toDate) {
      alert("יש לבחור תאריכים.");
      return;
    }
    fetchAllConstraints(fromDate, toDate);
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
              return (
                <th key={i}>
                  <div className="date-header">
                    <div>{`יום ${dayNames[date.getDay()]}`}</div>
                    <div>{dateStr}</div>
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
              {weekDates.map((dateStr) => {
                const filtered = constraints.filter(
                  (item) => item.date === dateStr && item.shift === shift
                );
                const red = filtered.filter(
                  (x) => x.availability === "לא יכול"
                );
                const yellow = filtered.filter(
                  (x) => x.availability === "יכול חלקית"
                );

                return (
                  <td key={`${dateStr}|${shift}`}>
                    <select className="combo-box" value="">
                      <option value="" disabled>
                        צפייה באילוצים
                      </option>

                      {red.length > 0 && (
                        <optgroup label="❌ לא יכולים" className="red-group">
                          {red.map((emp, idx) => (
                            <option
                              key={`r${idx}`}
                              className="red-option"
                              disabled
                            >
                              {emp.firstName} {emp.lastName}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {yellow.length > 0 && (
                        <optgroup
                          label="⚠️ יכולים חלקית"
                          className="yellow-group"
                        >
                          {yellow.map((emp, idx) => (
                            <option
                              key={`y${idx}`}
                              className="yellow-option"
                              disabled
                            >
                              {emp.firstName} {emp.lastName}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      {red.length === 0 && yellow.length === 0 && (
                        <option disabled>אין אילוצים</option>
                      )}
                    </select>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="employeeManagementPage">
      <div className="employeeManagement">
        <h2>אילוצי עובדים</h2>

        <div className="search-dates">
          <label>מתאריך:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <label>עד תאריך:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button className="btnSearch" onClick={handleSearch}>
            חפש
          </button>
        </div>

        {showTable && (
          <>
            {renderTable(weeks[0], "שבוע ראשון")}
            {weeks[1].length > 0 && renderTable(weeks[1], "שבוע שני")}
          </>
        )}
      </div>
    </div>
  );
}

export default EmployeeConstraints;
