import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/SinglePost.css";

function SinglePost() {
  const [post, setPost] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []); // חשוב: הוספנו [] כדי למנוע קריאות אינסופיות

  const fetchData = () => {
    axios
      .get(`/post/${id}`)
      .then((res) => {
        setPost(res.data[0]);
        console.log(res.data);
      })
      .catch((error) => {
        console.error("שגיאה:", error);
      });
  };

  return (
    <section className="post main">
      {post ? (
        <div className="container">
          <div className="single-post">
            <button
              className="close-button"
              onClick={() => navigate("/Incident")}
            >
              ✕
            </button>
            <h1 className="post-title">{post.Incident_Name}</h1>
            <div className="post-details">
              <p className="post-p">מספר אירוע: {post.id}</p>
              <p className="post-p">תאריך: {post.Incident_Date}</p>
              <p className="post-p">מספר עובד: {post.ID_Employee}</p>
            </div>
            <div className="single-post-container">
              <h2 className="post-subtitle">תיאור האירוע</h2>
              <p className="post-content">{post.Description}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <p>אין נתונים להצגה</p>
        </div>
      )}
    </section>
  );
}

export default SinglePost;
