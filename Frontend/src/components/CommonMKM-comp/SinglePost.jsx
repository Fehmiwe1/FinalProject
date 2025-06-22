import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/styles/CommonMKM-styles/SinglePost.css";

function SinglePost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    axios
      .get(`/post/${id}`)
      .then((res) => {
        setPost(res.data[0]);
        setLoading(false);
        console.log("📄 פוסט:", res.data[0]);
      })
      .catch((error) => {
        console.error("שגיאה:", error);
        setLoading(false);
      });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="post main">
      {loading ? (
        <div className="container">
          <p>טוען נתונים...</p>
        </div>
      ) : post ? (
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
              <p className="post-p">
                תאריך האירוע: {formatDate(post.Incident_Date)}
              </p>

              {post.Kabat_Name && (
                <p className="post-p">קב"ט: {post.Kabat_Name}</p>
              )}
              {post.Dispatcher_Name && (
                <p className="post-p">מוקדנית: {post.Dispatcher_Name}</p>
              )}
              {post.Patrol_Name && (
                <p className="post-p">סייר רכוב: {post.Patrol_Name}</p>
              )}
              {post.Other_Participants && (
                <p className="post-p">
                  משתתפים נוספים: {post.Other_Participants}
                </p>
              )}
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
