import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "../../assets/styles/Main-styles/Login.css";

function Login() {
  // ======== State: Login ========
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // ======== State: Sign Up ========
  const [errorSingUp, setErrorSingUp] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // זמינות שם משתמש (onBlur)
  const [usernameStatus, setUsernameStatus] = useState(null); // 'ok' | 'taken' | null
  const [checkingUsername, setCheckingUsername] = useState(false);

  // נהלים — גרסת התקנון (עדכן כשאתה משנה טקסט נהלים)
  const POLICIES_VERSION = "v1.0 - 2025-08-25";

  const [policiesAccepted, setPoliciesAccepted] = useState(false);
  const [showPoliciesModal, setShowPoliciesModal] = useState(false);

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
    newPassword: "",

    // שדות חדשים לשמירת אישור נהלים
    acceptedPolicies: false,
    acceptedPoliciesAt: null,
    policiesVersion: POLICIES_VERSION,
  });

  // ======== State: Forgot Password ========
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorForgotPassword, setErrorForgotPassword] = useState(null);
  const [updatedPasswordMessage, setUpdatedPasswordMessage] = useState(null);

  const navigate = useNavigate();

  // ======== Validators ========
  const isValidUsername = (username) => /^[a-zA-Z0-9]+$/.test(username);
  const isValidPassword = (password) =>
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /^[a-zA-Z0-9]+$/.test(password);
  const isHebrewText = (text) => /^[\u0590-\u05FF\s]+$/.test(text);

  // ======== Username availability (onBlur) ========
  const checkUsernameAvailability = async (u) => {
    if (!u || !isValidUsername(u)) {
      setUsernameStatus(null);
      return;
    }
    try {
      setCheckingUsername(true);
      const res = await axios.get("/users/checkUsername", {
        params: { username: u },
      });
      setUsernameStatus(res.data?.available ? "ok" : "taken");
    } catch {
      setUsernameStatus(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  // ======== Login ========
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/users/login",
        { username, password },
        { withCredentials: true }
      );

      const isActive = Cookies.get("userStatus");
      const role = Cookies.get("userRole");

      if (
        isActive === "active" &&
        response.data.message === "Logged in successfully."
      ) {
        if (role === "manager") navigate("/mainPageManager");
        else if (role === "guard") navigate("/mainPageGuard");
        else if (role === "moked") navigate("/mainPageMoked");
        else if (role === "kabat") navigate("/mainPageKabat");
      } else if (isActive === "inactive") {
        setError("החשבון שלך אינו פעיל. אנא פנה למנהל.");
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError("שם משתמש או סיסמה לא נכונים.");
      setTimeout(() => setError(null), 2000);
    }
  };

  // ======== Sign Up ========
  const handleSignUp = async (e) => {
    e.preventDefault();

    // ולידציות קיימות
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

    // בדיקת אישור נהלים — חובה
    if (!policiesAccepted) {
      setErrorSingUp("יש לאשר את התקנות והנהלים לפני ההרשמה.");
      setTimeout(() => setErrorSingUp(null), 3000);
      return;
    }

    // אם onBlur כבר הציג "taken" — תחסום גם לפני שליחה
    if (usernameStatus === "taken") {
      setErrorSingUp("שם משתמש כבר קיים במערכת.");
      setTimeout(() => setErrorSingUp(null), 2500);
      return;
    }

    // מכין שדות לאישור נהלים לשליחה לשרת
    const payload = {
      ...newUser,
      acceptedPolicies: true,
      acceptedPoliciesAt: new Date().toISOString(),
      policiesVersion: POLICIES_VERSION,
    };

    try {
      const response = await axios.post("/users/register", payload);

      if (response.data.message === "User added and notification created!") {
        setSuccessMessage("ההרשמה הצליחה!");

        // איפוס טופס
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
          newPassword: "",
          acceptedPolicies: false,
          acceptedPoliciesAt: null,
          policiesVersion: POLICIES_VERSION,
        });
        setPoliciesAccepted(false);
        setUsernameStatus(null);

        setTimeout(() => {
          setShowSignUp(false);
          setSuccessMessage(null);
        }, 2000);
      }
    } catch (err) {
      if (err?.response?.status === 409) {
        setErrorSingUp("שם משתמש כבר קיים במערכת.");
      } else {
        setErrorSingUp("אירעה שגיאה ביצירת המשתמש.");
      }
      setTimeout(() => setErrorSingUp(null), 2500);
    }
  };

  // ======== Forgot Password ========
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!isValidPassword(newUser.newPassword)) {
      setErrorForgotPassword(
        "הסיסמה חייבת לכלול אות גדולה אחת לפחות ומספר אחד לפחות, באנגלית בלבד."
      );
      setTimeout(() => setErrorForgotPassword(null), 3500);
      return;
    }

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

        setNewUser({
          username: "",
          firstName: "",
          lastName: "",
          email: "",
          newPassword: "",
          // לא נוגעים בשדות הנהלים כאן
        });

        setTimeout(() => {
          setShowForgotPassword(false);
          setUpdatedPasswordMessage(null);
        }, 2000);
      }
    } catch (err) {
      setErrorForgotPassword("אירעה שגיאה בשחזור הסיסמה.");
      setTimeout(() => setErrorForgotPassword(null), 2000);
    }
  };

  // ======== Close Modals ========
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
      newPassword: "",
      acceptedPolicies: false,
      acceptedPoliciesAt: null,
      policiesVersion: POLICIES_VERSION,
    });
    setPoliciesAccepted(false);
    setUsernameStatus(null);
    setErrorSingUp(null);
    setSuccessMessage(null);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setNewUser({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      newPassword: "",
      acceptedPolicies: false,
      acceptedPoliciesAt: null,
      policiesVersion: POLICIES_VERSION,
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

      {/* ======== Sign Up Modal ======== */}
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
                    onChange={(e) => {
                      setNewUser({ ...newUser, username: e.target.value });
                      setUsernameStatus(null); // איפוס אינדיקציה בזמן הקלדה
                    }}
                    onBlur={() => checkUsernameAvailability(newUser.username)}
                    required
                  />
                </div>

                {/* אינדיקציית זמינות שם משתמש */}
                {checkingUsername && (
                  <div className="success-message" style={{ opacity: 0.85 }}>
                    בודק זמינות…
                  </div>
                )}
                {usernameStatus === "taken" && (
                  <div className="error-message">שם משתמש כבר קיים במערכת.</div>
                )}
                {usernameStatus === "ok" && (
                  <div className="success-message">שם המשתמש פנוי.</div>
                )}

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

                {/* ======== תקנון ונהלים ======== */}
                <div className="policies-section">
                  <div className="policies-header">
                    <button
                      type="button"
                      className="policies-open-btn"
                      onClick={() => setShowPoliciesModal(true)}
                    >
                      הצג נהלים
                    </button>
                  </div>

                  <label className="policies-consent">
                    <input
                      type="checkbox"
                      checked={policiesAccepted}
                      onChange={(e) => {
                        setPoliciesAccepted(e.target.checked);
                        setNewUser({
                          ...newUser,
                          acceptedPolicies: e.target.checked,
                          policiesVersion: POLICIES_VERSION,
                          acceptedPoliciesAt: e.target.checked
                            ? new Date().toISOString()
                            : null,
                        });
                      }}
                      required
                    />
                    קראתי ואני מאשר/ת את התקנון והנהלים
                  </label>
                </div>

                <button type="submit" className="signup-btn">
                  הירשם
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======== Forgot Password Modal ======== */}
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

      {/* ======== Policies Modal ======== */}
      {showPoliciesModal && (
        <div className="signup-modal">
          <div className="signup-modal-content policies-content">
            <span
              className="close-btn"
              onClick={() => setShowPoliciesModal(false)}
            >
              &times;
            </span>
            <h2>תקנון ונהלים</h2>

            <div className="policies-scroll">
              <ol>
                <li>
                  <strong>שמירה על סודיות:</strong> כל מידע במערכת הוא קניין
                  המעביד/הארגון. חל איסור מוחלט לחשוף, לשכפל או להעבירו לכל צד
                  שלישי ללא הרשאה.
                </li>
                <li>
                  <strong>שימוש עסקי בלבד:</strong> המערכת מיועדת לצרכי עבודה
                  בלבד. חל איסור שימוש אישי, בידורי או שאינו קשור לתפקידיך.
                </li>
                <li>
                  <strong>הגנת פרטיות:</strong> אין להזין, לשמור או להעביר מידע
                  אישי/רגיש ללא צורך תפקידי והוראות הדין והארגון.
                </li>
                <li>
                  <strong>אבטחת גישה:</strong> שמירת סיסמה בסוד, איסור שיתוף
                  חשבון, התנתקות בתום שימוש, דיווח מיידי על חשד לפגיעה באבטחה.
                </li>
                <li>
                  <strong>רישום ושקיפות:</strong> כל פעולה במערכת עשויה להירשם
                  ולבוקר. שימוש במערכת מהווה הסכמה למדיניות זו.
                </li>
                <li>
                  <strong>ציות לחוק ולנהלים:</strong> המשתמש מתחייב לפעול לפי כל
                  דין, הוראות הארגון ומדיניות אבטחת המידע.
                </li>
                <li>
                  <strong>איסור העברת מידע:</strong> אין להוציא מידע מהמערכת
                  (ייצוא/צילום מסך/הדפסה) ללא הרשאה מפורשת.
                </li>
                <li>
                  <strong>סנקציות:</strong> הפרת נהלים עשויה להוביל לחסימת גישה,
                  נקיטת צעדים משמעתיים ו/או הליכים משפטיים.
                </li>
              </ol>
            </div>

            <div className="policies-actions">
              <button
                type="button"
                className="signup-btn"
                onClick={() => {
                  setPoliciesAccepted(true);
                  setNewUser({
                    ...newUser,
                    acceptedPolicies: true,
                    policiesVersion: POLICIES_VERSION,
                    acceptedPoliciesAt: new Date().toISOString(),
                  });
                  setShowPoliciesModal(false);
                }}
              >
                הבנתי ואני מאשר/ת
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
