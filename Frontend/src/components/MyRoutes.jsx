import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Main-comp/Login";
import About from "./Main-comp/About";
import Header from "./Header";
import Footer from "./Footer";
import Contact from "./Main-comp/Contact";
import MainPageManager from "./Manager-comp/MainPageManager";
import RequestsManagement from "./Manager-comp/RequestsManagement";
import EmployeeConstraints from "./Manager-comp/EmployeeConstraints";
import Incident from "./CommonMKM-comp/Incident";
import CreateIncident from "./CommonMKM-comp/CreateIncident";
import SinglePost from "./CommonMKM-comp/SinglePost";
import EditIncident from "./CommonMKM-comp/EditIncident";
import MainPageGuard from "./Guard-comp/MainPageGuard";
import Report from "./CommonMKM-comp/Report";
import WorkArrangement from "./CommonMKM-comp/WorkArrangement";
import SickLeavePage from "./CommonMKM-comp/SickLeavePage";
import Constraints from "./CommonMKM-comp/Constraints";
import EmployeeManagement from "./Manager-comp/EmployeeManagement";
import ManagerSchedule from "./Manager-comp/ManagerSchedule";
import Guests from "./CommonMKM-comp/Guests";
import CreateGuests from "./CommonMKM-comp/CreateGuests";
import SingleGuest from "./CommonMKM-comp/SingleGuest";
import EditGuest from "./CommonMKM-comp/EditGuests";
import MyRequests from "./CommonMKM-comp/myRequests";
import MainPageMoked from "./Moked-comp/MainPageMoked";
import MainPageKabat from "./Kabat-comp/MainPageKabat";
import EntryConfirmation from "./Kabat-comp/EntryConfirmation";
function MyRoutes() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mainPageManager" element={<MainPageManager />} />
        <Route path="/managerSchedule" element={<ManagerSchedule />} />
        <Route path="/requestsManagement" element={<RequestsManagement />} />
        <Route path="/incident" element={<Incident />} />
        <Route path="/createIncident" element={<CreateIncident />} />
        <Route path="/post/:id" element={<SinglePost />} />
        <Route path="/editincident/:id" element={<EditIncident />} />
        <Route path="/employeeManagement" element={<EmployeeManagement />} />
        <Route path="/employeeConstraints" element={<EmployeeConstraints />} />
        <Route path="/mainPageGuard" element={<MainPageGuard />} />
        <Route path="/report" element={<Report />} />
        <Route path="/WorkArrangement" element={<WorkArrangement />} />
        <Route path="/sick-leave" element={<SickLeavePage />} />
        <Route path="/constraints" element={<Constraints />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/createGuests" element={<CreateGuests />} />
        <Route path="/guest/:id" element={<SingleGuest />} />
        <Route path="/editGuest/:id" element={<EditGuest />} />
        <Route path="/myRequests" element={<MyRequests />} />
        <Route path="/mainPageMoked" element={<MainPageMoked />} />
        <Route path="/mainPageKabat" element={<MainPageKabat />} />
        <Route path="/entryConfirmation" element={<EntryConfirmation />} />
      </Routes>
      <Footer />
    </>
  );
}

export default MyRoutes;
