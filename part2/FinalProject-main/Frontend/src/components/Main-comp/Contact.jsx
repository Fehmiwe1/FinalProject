import React from "react";
import emailjs from "emailjs-com";
import "../../assets/styles/Main-styles/Contact.css";

function Contact() {
  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_29qmieq",
        "template_q6pxibc",
        e.target,
        "Ri48pYrCXyJVp24k5"
      )
      .then(
        (result) => {
          alert("ההודעה נשלחה בהצלחה!");
        },
        (error) => {
          alert("אירעה שגיאה, אנא נסה שוב.");
        }
      );

    e.target.reset();
  };

  return (
    <div className="main container">
      <h1 className="Hcss">צור קשר</h1>
      <div className="contactContainer">
        <h2>זה פשוט ליצור איתנו קשר!</h2>
        <p>לכל שאלה בכל נושא – אתם מוזמנים לשלוח לנו מייל דרך הטופס.</p>
        <form className="contact-form" onSubmit={sendEmail}>
          <div className="form-group">
            <label htmlFor="name">שם:</label>
            <input type="text" className="form-control" name="name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">אימייל:</label>
            <input
              type="email"
              className="form-control"
              name="email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">הודעה:</label>
            <textarea
              className="form-control"
              name="message"
              rows="5"
              required
            ></textarea>
          </div>
          <div className="btn-send-container">
            <button type="submit" className="btn-send">
              שלח הודעה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Contact;
