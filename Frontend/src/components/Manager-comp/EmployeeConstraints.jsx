import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/EmployeeConstraints.css";

function EmployeeConstraints() {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [constraints, setConstraints] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/employeeConstraints/admin/employees", {
        withCredentials: true,
      });
      setEmployees(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת עובדים:", err);
    }
  };

  const handleEmployeeSelect = (e) => {
    const name = e.target.value;
    setSearchName(name);
    const selected = employees.find(
      (emp) => `${emp.firstName} ${emp.lastName}` === name
    );
    if (selected) setSelectedId(selected.id);
  };

  const handleSearch = async () => {
    if (!selectedId || !fromDate || !toDate) {
      alert("יש לבחור עובד וטווח תאריכים");
      return;
    }

    try {
      const res = await axios.get(
        `/employeeConstraints/admin/constraints/${selectedId}?from=${fromDate}&to=${toDate}`,
        { withCredentials: true }
      );
      setConstraints(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת אילוצים:", err);
    }
  };

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="employeeManagementPage">
      <div className="employeeManagement">
        <h2>אילוצי עובדים</h2>

        <div className="search-container">
          <div className="search-name">
            <input
              type="text"
              list="employee-list"
              placeholder="חפש לפי שם..."
              value={searchName}
              onInput={handleEmployeeSelect}
            />
            <datalist id="employee-list">
              {employees.map((emp) => (
                <option
                  key={emp.id}
                  value={`${emp.firstName} ${emp.lastName}`}
                />
              ))}
            </datalist>
          </div>

          <div className="search-dates">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
            <button className="btnSearch" onClick={handleSearch}>
              חפש
            </button>
          </div>
        </div>

        {constraints.length > 0 && (
          <div className="constraint-list">
            {constraints.map((item, index) => (
              <div
                key={index}
                className={`availability-box ${
                  item.availability === "לא יכול"
                    ? "not-available"
                    : item.availability === "יכול חלקית"
                    ? "partial"
                    : "available"
                }`}
              >
                <strong>תאריך:</strong> {formatDate(item.date)} |{" "}
                <strong>משמרת:</strong> {item.shift} | <strong>זמינות:</strong>{" "}
                {item.availability}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeConstraints;
