import React from "react";
import "../../assets/styles/Manager-styles/MainPageManager.css";

function MainPageManager() {
  return (
    <div className="mainPageManager">
      <div className="mainPageManager-container">
        <div className="notifications-container">
          <form className="notifications-form">
            <h1>התראות</h1>
          </form>
          <p>dsfdsf sf sf s</p>
        </div>
        <div className="WorkArrangement-container">
          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - מאבטחים</h1>
            </form>
            <p>dsfdsf sf sf s</p>
          </div>
          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - מוקד</h1>
            </form>
            <p>dsfdsf sf sf s</p>
          </div>
          <div className="WA-container">
            <form className="WA-form">
              <h1>סידור עבודה - קבט"ים</h1>
            </form>
            <p>dsfdsf sf sf s</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPageManager;
