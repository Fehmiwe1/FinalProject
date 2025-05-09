import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Main-comp/Login";
import About from "./Main-comp/About";
import Header from "./Header";
import Footer from "./Footer";
import Contact from "./Main-comp/Contact";
import MainPageManager from "./Manager-comp/MainPageManager";
import Incident from "./CommonMKM-comp/Incident";
import CreateIncident from "./CommonMKM-comp/CreateIncident";
import SinglePost from "./CommonMKM-comp/SinglePost";
import EditIncident from "./CommonMKM-comp/EditIncident";

function MyRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mainPageManager" element={<MainPageManager />} />
        <Route path="/incident" element={<Incident />} />
        <Route path="/createIncident" element={<CreateIncident />} />
        <Route path="/post/:id" element={<SinglePost />} />
        <Route path="/editincident/:id" element={<EditIncident />} />
      </Routes>
      <Footer />
    </>
  );
}

export default MyRoutes;
