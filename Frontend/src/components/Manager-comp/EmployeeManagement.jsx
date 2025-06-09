import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/EmployeeManagement.css";

function MainPageManager() {
  const [employees, setEmployees] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    axios
      .get("/employeeManagement")
      .then((res) => {
        setEmployees(res.data);
      })
      .catch((error) => {
        console.error("שגיאה:", error);
        setMsg("אירעה שגיאה בטעינת העובדים.");
      });
  };

  const toggleStatus = async (id, currentStatus) => {
    axios
      .put(`/employeeManagement/${id}`, {
        status: currentStatus === "active" ? "inactive" : "active",
      })
      .then((res) => {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === id ? { ...emp, status: res.data.status } : emp
          )
        );
      })
      .catch((error) => {
        console.error("שגיאה בעדכון הסטטוס:", error);
        setMsg("אירעה שגיאה בעדכון הסטטוס.");
      });
  };

  const changeRole = async (id, newRole) => {
    axios
      .put(`/employeeManagement/role/${id}`, { role: newRole })
      .then(() => {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === id ? { ...emp, role: newRole } : emp))
        );
      })
      .catch((error) => {
        console.error("שגיאה בעדכון התפקיד:", error);
        setMsg("אירעה שגיאה בעדכון התפקיד.");
      });
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName =
      `${emp.firstName} ${emp.lastName} ${emp.username}`.toLowerCase();
    return fullName.includes(searchName.toLowerCase());
  });

  return (
    <div className="employeeManagementPage">
      <div className="employeeManagement">
        <h2>ניהול עובדים</h2>

        <div className="search-filters">
          <input
            type="text"
            placeholder="חיפוש לפי שם משתמש / פרטי / משפחה"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <div className="employeeManagement-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>מספר עובד</th>
                <th>שם משתמש</th>
                <th>שם פרטי</th>
                <th>שם משפחה</th>
                <th>סטטוס</th>
                <th>תפקיד</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.username}</td>
                  <td>{emp.firstName}</td>
                  <td>{emp.lastName}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={emp.status === "active"}
                        onChange={() => toggleStatus(emp.id, emp.status)}
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className="status-label">
                      {emp.status === "active" ? "פעיל" : "לא פעיל"}
                    </span>
                  </td>
                  <td>
                    <select
                      className="role-select"
                      value={emp.role}
                      onChange={(e) => changeRole(emp.id, e.target.value)}
                    >
                      <option value="guard">מאבטח</option>
                      <option value="moked">מוקד</option>
                      <option value="kabat">קב"ט</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}

export default MainPageManager;
