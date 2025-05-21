import React, { useState } from "react";
import "../../assets/styles/Manager-styles/ManagerSchedule.css";

function ManagerSchedule() {
  const roles = ["מאבטח", "מוקד", "קבט"];
  const [selectedRole, setSelectedRole] = useState("מאבטח");

  const renderContent = () => {
    switch (selectedRole) {
      case "מאבטח":
        return <div className="role-view">תצוגת סידור עבודה למאבטחים</div>;
      case "מוקד":
        return <div className="role-view">תצוגת סידור עבודה למוקד</div>;
      case "קבט":
        return <div className="role-view">תצוגת סידור עבודה לרב"ט</div>;
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
