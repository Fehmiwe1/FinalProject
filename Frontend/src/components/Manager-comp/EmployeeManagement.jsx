import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../assets/styles/Manager-styles/EmployeeManagement.css";

function MainPageManager() {
  const [employees, setEmployees] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [msg, setMsg] = useState("");
  const [roles, setRoles] = useState([]);
  const [filterRole, setFilterRole] = useState("all"); // ✅ בורר תפקיד

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/employeeManagement");
      setEmployees(res.data);
    } catch (error) {
      console.error("שגיאה:", error);
      setMsg("אירעה שגיאה בטעינת העובדים.");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/role");
      setRoles(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת ההרשאות", err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const res = await axios.put(`/employeeManagement/${id}`, {
        status: currentStatus === "active" ? "inactive" : "active",
      });
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === id ? { ...emp, status: res.data.status } : emp
        )
      );
    } catch (error) {
      console.error("שגיאה בעדכון הסטטוס:", error);
      setMsg("אירעה שגיאה בעדכון הסטטוס.");
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      await axios.put(`/employeeManagement/role/${id}`, { role: newRole });
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, role: newRole } : emp))
      );
    } catch (error) {
      console.error("שגיאה בעדכון התפקיד:", error);
      setMsg("אירעה שגיאה בעדכון התפקיד.");
    }
  };

  const togglePermission = async (roleName, field, newValue) => {
    try {
      const response = await axios.put("/role/updatePermission", {
        roleName,
        permissionField: field,
        newValue,
      });

      if (response.data.success) {
        setRoles((prev) =>
          prev.map((role) =>
            role.Role_Name === roleName ? { ...role, [field]: newValue } : role
          )
        );
      } else {
        console.error("שגיאה בעדכון ההרשאה - ללא success");
        setMsg("שגיאה בעדכון ההרשאה.");
      }
    } catch (err) {
      console.error("❌ שגיאה בבקשת axios:", err);
      setMsg("שגיאה בעדכון ההרשאה.");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName =
      `${emp.firstName} ${emp.lastName} ${emp.username}`.toLowerCase();
    const matchesName = fullName.includes(searchName.toLowerCase());
    const matchesRole = filterRole === "all" || emp.role === filterRole;
    return matchesName && matchesRole;
  });

  const permissionFields = [
    { field: "Create_Work_Schedule", label: "יצירת סידור עבודה" },
    { field: "Update_Work_Schedule", label: "עדכון סידור עבודה" },
    { field: "Watch_Work_Schedule", label: "צפייה בסידור עבודה" },
    { field: "Watch_Incident", label: "צפייה בדוחות אירוע" },
    { field: "Create_Incident", label: "הוספת דוח אירוע" },
    { field: "Updating_Incident", label: "עריכת דוח אירוע" },
    { field: "Create_Guest_List", label: "הוספת אורח" },
    { field: "Update_Guest_List", label: "עדכון רשימת אורחים" },
  ];

  const translateRole = (role) => {
    switch (role) {
      case "manager":
        return "מנהל";
      case "kabat":
        return 'קב"ט';
      case "moked":
        return "מוקד";
      case "guard":
        return "מאבטח";
      default:
        return role;
    }
  };

  return (
    <div className="employeeManagementPage">
      <div className="employeeManagement">
        <h2>ניהול עובדים</h2>

        {/* טבלת ההרשאות */}
        <h3 className="role-table-title">טבלת הרשאות תפקידים</h3>
        <div className="role-table-container">
          <table className="role-table">
            <thead>
              <tr>
                <th>תפקיד</th>
                {permissionFields.map(({ label }) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.ID_Role}>
                  <td>{translateRole(role.Role_Name)}</td>
                  {permissionFields.map(({ field }) => (
                    <td key={field}>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={role[field] === "able"}
                          onChange={() =>
                            togglePermission(
                              role.Role_Name,
                              field,
                              role[field] === "able" ? "unable" : "able"
                            )
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* חיפוש עובדים */}
        <h3 className="role-table-title">טבלת עובדים</h3>

        <div className="search-filters">
          <input
            type="text"
            placeholder="חיפוש לפי שם משתמש / פרטי / משפחה"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />

          {/* ✅ בורר לפי תפקיד */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-select-filter"
          >
            <option className="role-select-filter-option" value="all">
              הכל
            </option>
            <option className="role-select-filter-option" value="guard">
              מאבטח
            </option>
            <option className="role-select-filter-option" value="moked">
              מוקד
            </option>
            <option className="role-select-filter-option" value="kabat">
              קב"ט
            </option>
          </select>
        </div>

        {/* טבלת עובדים */}
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
