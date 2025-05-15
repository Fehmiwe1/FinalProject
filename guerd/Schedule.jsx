import React from "react";
import logo from "../../assets/img/logo.png";
import "../../assets/styles/Main-styles/MainPage.css";

function Schedule() {
  const username = "משתמש";

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <div className="main-wrapper">
      <header className="main-header-bar">
        <div className="header-left">
          <img src={logo} alt="Logo" className="header-logo" />
          <span className="welcome-text">Welcome {username}</span>
          <button className="logout-btn" onClick={handleLogout}>התנתקות</button>
        </div>
        <nav className="header-nav">
          <a href="/">ראשי</a>
          <a href="/report">דו"ח שעות</a>
          <a href="/constraints">אילוצים</a>
          <a href="/sick-leave">מחלה/חופשה</a>
        </nav>
      </header>

      <main className="main-body">
        <section className="entry-section">
          <h2>סידור עבודה</h2>
          <p>כאן יופיעו פרטי הסידור שלך.</p>
        </section>
      </main>

      <footer className="main-footer">
        כל הזכויות שמורות - מערכת ניהול שערים &copy; 2025
      </footer>
    </div>
  );
}

export default Schedule;