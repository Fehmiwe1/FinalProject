import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/logo.png";
import Cookies from "js-cookie";

function Header() {
  const navigate = useNavigate();
  const [, setMsg] = useState("");
  const location = useLocation();

  const role = Cookies.get("userRole");
  const firstName = Cookies.get("userFirstName");

  const guestPages = ["/", "/about", "/contact"];
  const isGuestPage = guestPages.includes(location.pathname);

  const handleLogout = async () => {
    try {
      const response = await axios.get("/users/logout", {
        withCredentials: true,
      });

      if (response.status === 200) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setMsg("Logout failed.");
    }
  };

  return (
    <header dir="rtl" lang="he">
      <div className="container">
        <div className="header__wrap">
          <div className="logo">
            <Link>
              <img src={logo} alt="לוגו" />
              <span className="slogan">
                {isGuestPage ? (
                  <span>מערכת ניהול שערים</span>
                ) : firstName ? (
                  <span>ברוך הבא {firstName}</span>
                ) : null}
              </span>
            </Link>

            {isGuestPage ? (
              <p className="pName">פהמי והבי ומאור דוד</p>
            ) : (
              <button onClick={handleLogout} className="logout-button">
                התנתק
              </button>
            )}
          </div>

          <nav>
            <ul className="menu">
              {isGuestPage && (
                <>
                  <li>
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      דף הבית
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/about"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      אודות
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/contact"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      צור קשר
                    </NavLink>
                  </li>
                </>
              )}

              {!isGuestPage && role === "manager" && (
                <>
                  <li>
                    <NavLink
                      to="/mainPageManager"
                      end
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      ראשי
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/managerSchedule"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      סידור עבודה
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/constraints"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      אילוצים
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/requestsManagement"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      בקשות
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/contractors"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      קבלנים
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/incident"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      אירועים
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/employeeManagement"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      ניהול עובדים
                    </NavLink>
                  </li>
                </>
              )}
              {!isGuestPage && role === "employee" && (
                <>
                  <li>
                    <NavLink
                      to="/mainPageGuerd"
                      end
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      ראשי
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/report"
                      end
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      דו"ח שעות
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/constraints"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      אילוצים
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/schedule"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      סידור עבודה
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/sick-leave"
                      className={({ isActive }) =>
                        isActive ? "menu-item active" : "menu-item"
                      }
                    >
                      מחלה/חופשה
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
