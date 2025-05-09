import React from "react";

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer__wrap">
          <p>
            כל הזכויות שמורות - מערכת ניהול שערים &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
