import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "../../assets/styles/Main-styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [errorSingUp, setErrorSingUp] = useState(null);
  const navigate = useNavigate();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorForgotPassword, setErrorForgotPassword] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    password: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
  });

  const [successMessage, setSuccessMessage] = useState(null);
  const [updatedPasswordMessage, setUpdatedPasswordMessage] = useState(null);

  const isValidUsername = (username) => /^[a-zA-Z0-9]+$/.test(username);
  const isValidPassword = (password) =>
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /^[a-zA-Z0-9]+$/.test(password);
  const isHebrewText = (text) => /^[\u0590-\u05FF\s]+$/.test(text);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/users/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const isActive = Cookies.get("userStatus");
      const role = Cookies.get("userRole");

      if (
        isActive === "active" &&
        response.data.message === "Logged in successfully."
      ) {
        if (role === "manager") {
          navigate("/mainPageManager");
        } else if (role === "employee") {
          navigate("/mainPageGuerd");
        }
      } else if (isActive === "inactive") {
        setError("החשבון שלך אינו פעיל. אנא פנה למנהל.");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError("שם משתמש או סיסמה לא נכונים.");
      setTimeout(() => setError(null), 2000);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isValidUsername(newUser.username)) {
      setErrorSingUp("שם המשתמש חייב להיות באנגלית בלבד.");
      setTimeout(() => setErrorSingUp(null), 2000);
      return;
    }

    if (!isHebrewText(newUser.firstName)) {
      setErrorSingUp("השם הפרטי חייב להכיל אותיות בעברית בלבד.");
      setTimeout(() => setErrorSingUp(null), 2000);
      return;
    }

    if (!isHebrewText(newUser.lastName)) {
      setErrorSingUp("שם המשפחה חייב להכיל אותיות בעברית בלבד.");
      setTimeout(() => setErrorSingUp(null), 2000);
      return;
    }

    if (!isHebrewText(newUser.street)) {
      setErrorSingUp("שם הרחוב חייב להכיל אותיות בעברית בלבד.");
      setTimeout(() => setErrorSingUp(null), 2000);
      return;
    }

    if (!isHebrewText(newUser.city)) {
      setErrorSingUp("שם העיר חייב להכיל אותיות בעברית בלבד.");
      setTimeout(() => setErrorSingUp(null), 2000);
      return;
    }

    if (!isValidPassword(newUser.password)) {
      setErrorSingUp(
        "הסיסמה חייבת לכלול אות גדולה אחת לפחות ומספר אחד לפחות, באנגלית בלבד."
      );
      setTimeout(() => setErrorSingUp(null), 3500);
      return;
    }

    try {
      const response = await axios.post("users/register", newUser);

      if (response.data.message === "User added and notification created!") {
        setSuccessMessage("ההרשמה הצליחה!");

        setNewUser({
          username: "",
          firstName: "",
          lastName: "",
          birthDate: "",
          password: "",
          email: "",
          phone: "",
          street: "",
          city: "",
          postalCode: "",
        });

        setTimeout(() => {
          setShowSignUp(false);
          setSuccessMessage(null);
        }, 2000);
      }
    } catch (errorSingUp) {
      setErrorSingUp("אירעה שגיאה ביצירת המשתמש.");
      setTimeout(() => setErrorSingUp(null), 2000);
    }
  };

  const handleCloseSignUp = () => {
    setShowSignUp(false);
    setNewUser({
      username: "",
      firstName: "",
      lastName: "",
      birthDate: "",
      password: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
    });
    setErrorSingUp(null);
    setSuccessMessage(null);
  };

  // שחזור סיסמה
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/users/forgotPassword", {
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        newPassword: newUser.newPassword,
      });

      if (response.data.message === "Password updated!") {
        setUpdatedPasswordMessage("הסיסמה עודכנה בהצלחה!");
        //מנקה תוכן
        setNewUser({
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          newPassword: "",
        });

        setTimeout(() => {
          setShowForgotPassword(false);
          setUpdatedPasswordMessage(null);
        }, 2000);
      }
    } catch (errorForgotPassword) {
      setErrorForgotPassword("אירעה שגיאה בשחזור הסיסמה.");
      setTimeout(() => setErrorForgotPassword(null), 2000);
    }
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setNewUser({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      newPassword: "",
    });
    setErrorForgotPassword(null);
    setUpdatedPasswordMessage(null);
  };

  return (
    <div className="LoginP">
      <section>
        <div className="container">
          <div className="mainPageContainer">
            <div className="login-container">
              <form className="login-form" onSubmit={handleLogin}>
                <h1>התחברות</h1>
                {error && <div className="error-message">{error}</div>}
                <div className="login-form-group">
                  <div className="label-input-form">
                    <label className="login-label" htmlFor="username">
                      שם משתמש:
                    </label>
                    <input
                      type="text"
                      className="login-form-control"
                      id="username"
                      name="name"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="label-input-form">
                    <label className="login-label" htmlFor="password">
                      סיסמה:
                    </label>
                    <input
                      type="password"
                      className="password-form-control"
                      id="password"
                      name="name"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="login-btn">
                    התחבר
                  </button>
                  <h3>אין לך חשבון?</h3>
                  <button
                    type="button"
                    className="signup-btn"
                    onClick={() => setShowSignUp(true)}
                  >
                    הירשם
                  </button>
                  <h3>שכחת סיסמה?</h3>
                  <button
                    type="button"
                    className="forgot-password-btn"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    עדכן סיסמה חדשה
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {showSignUp && (
        <div className="signup-modal">
          <div className="signup-modal-content">
            <span className="close-btn" onClick={handleCloseSignUp}>
              &times;
            </span>
            <h2>הרשמה</h2>
            <p>הרשמה למערכת</p>
            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
            {errorSingUp && <div className="error-message">{errorSingUp}</div>}
            <form className="signup-form" onSubmit={handleSignUp}>
              <div className="signup-form-group">
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="new-username">
                    שם משתמש:
                  </label>
                  <input
                    type="text"
                    id="new-username"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="firstName">
                    שם פרטי:
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="lastName">
                    שם משפחה:
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="birthDate">
                    תאריך לידה:
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    value={newUser.birthDate}
                    onChange={(e) =>
                      setNewUser({ ...newUser, birthDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="new-password">
                    סיסמה:
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="email-label-input-form">
                  <label className="signup-label" htmlFor="email">
                    דוא"ל:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="phone">
                    טלפון:
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={newUser.phone}
                    pattern="\d{10}"
                    title="נא להזין בדיוק 10 ספרות"
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <h3 className="signup-h3">כתובת:</h3>
                <div className="address-label-input-form">
                  <input
                    type="text"
                    placeholder="רחוב"
                    value={newUser.street}
                    onChange={(e) =>
                      setNewUser({ ...newUser, street: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="עיר"
                    value={newUser.city}
                    onChange={(e) =>
                      setNewUser({ ...newUser, city: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="מיקוד"
                    value={newUser.postalCode}
                    pattern="\d{7}"
                    title="נא להזין בדיוק 7 ספרות"
                    onChange={(e) =>
                      setNewUser({ ...newUser, postalCode: e.target.value })
                    }
                    required
                  />
                </div>
                <button type="submit" className="signup-btn">
                  הירשם
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForgotPassword && (
        <div className="signup-modal">
          <div className="signup-modal-content">
            <span className="close-btn" onClick={handleCloseForgotPassword}>
              &times;
            </span>
            <h2>שחזור סיסמה</h2>
            <p>הזן את פרטך לשחזור סיסמה</p>
            {updatedPasswordMessage && (
              <div className="success-message">{updatedPasswordMessage}</div>
            )}
            {errorForgotPassword && (
              <div className="error-message">{errorForgotPassword}</div>
            )}

            <form className="signup-form" onSubmit={handleForgotPassword}>
              <div className="signup-form-group">
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="new-username">
                    שם משתמש:
                  </label>
                  <input
                    type="text"
                    id="new-username"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="firstName">
                    שם פרטי:
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="lastName">
                    שם משפחה:
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="email-label-input-form">
                  <label className="signup-label" htmlFor="email">
                    דוא"ל:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="label-input-form">
                  <label className="signup-label" htmlFor="new-password">
                    סיסמה חדשה:
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newUser.newPassword}
                    onChange={(e) =>
                      setNewUser({ ...newUser, newPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <button type="submit" className="signup-btn">
                  עדכון סיסמה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
