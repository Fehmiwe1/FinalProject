-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2025 at 07:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `finalproject`
--
CREATE DATABASE IF NOT EXISTS `finalproject` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `finalproject`;

-- --------------------------------------------------------

--
-- Table structure for table `employee_constraints`
--

CREATE TABLE `employee_constraints` (
  `id` int(11) NOT NULL,
  `ID_employee` int(11) NOT NULL,
  `date` date NOT NULL,
  `shift` enum('בוקר','ערב','לילה') NOT NULL,
  `availability` enum('יכול','לא יכול','יכול חלקית') NOT NULL DEFAULT 'יכול'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_notifications`
--

CREATE TABLE `employee_notifications` (
  `id` int(11) NOT NULL,
  `ID_employee` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `event_description` text NOT NULL,
  `notification_status` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_notifications`
--

INSERT INTO `employee_notifications` (`id`, `ID_employee`, `event_date`, `event_description`, `notification_status`) VALUES
(1, 33, '2025-05-21', 'הרשמת עובד חדש', 0),
(2, 34, '2025-05-21', 'הרשמת עובד חדש', 0),
(3, 35, '2025-05-21', 'הרשמת עובד חדש', 0);

-- --------------------------------------------------------

--
-- Table structure for table `employee_requests`
--

CREATE TABLE `employee_requests` (
  `id` int(11) NOT NULL,
  `ID_employee` int(11) NOT NULL,
  `request_type` enum('חופשה','מחלה','העברת משמרת') NOT NULL,
  `request_date` date NOT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `reason` text NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `status` enum('ממתין','מאושר','סורב') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `GuestID` int(11) NOT NULL,
  `CarNumber` varchar(20) NOT NULL,
  `GuestName` varchar(100) NOT NULL,
  `GuestPhone` varchar(20) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `IsActive` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `incident`
--

CREATE TABLE `incident` (
  `id` int(11) NOT NULL,
  `Incident_Name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `Incident_Date` datetime NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ID_Employee` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `incident`
--

INSERT INTO `incident` (`id`, `Incident_Name`, `Incident_Date`, `Description`, `ID_Employee`) VALUES
(1, 'אירוע פריצת מחסום בשער ראשי', '2025-02-16 10:17:00', 'בשעה 16:17 ביום ראשון ה16.2 רכב הגיע לעמדת בידוק קידמית ונמצא ללא אישור כניסה לאחר שעמד 5 דקות במפרצון .ההמתנה החליט לפרוץ את המחסום ולהיכנס לקמפוס לאחר 10 דקות סייר רכוב וקבט מצאו אותו ליד מכלול והוציאו אותו מהקפוס', 1),
(2, 'סירוב בידוק1', '2025-02-05 03:43:00', 'בשעה 5:43 בתאריך ה5.2 הגיע רכב לעמדת הבידוק וסירב להיבדק בטענה שהוא מגיע לבריכה ובחיים לא בדקו אותו לאחר שהמאבטח הסביר שעל חובתו לבדוק כל אדם אשר מגיע לקמפוס הנהג של הרכב התעצבן ותחליט לצעוק וביקש לראות את אחראי המשמרת לאחר הגעת אחראי המשמרת הבן אדם המשיך לסרב להיבדק ופרסס ולא נכנס לקמפוס', 1),
(3, 'חפץ חשוד', '2025-02-17 19:00:00', 'בתאריך ה17.2 בשעה 19 מאבטח עלה לבדוק אוטובוס 19 אשר נכנס לקמפוס מצא במושב האחורי תיק מנופח ולאחר בדיקה עם הנוסעים המאבטח קבע שאין בעלים לתיק והכריז עליו חפץ חשוד ', 1),
(4, 'התעלפות בבניין אולמן ', '2025-01-23 17:29:00', 'בתאריך ה23.1 בשעה 17:29 מוקד הביטחון קיבל טלפון שסטודנטית התעלפה באצמע מבחן ,סייר רכוב ואחראי משמרת קפצו לאירוע ,לאחר הגעת אחראי משמרת לאירועהוחלט על הזמנת אמבולנס ,לאחר הגעת האמבולנס הוחלט על פינוי הסטודנטית', 1),
(5, 'גנבת אופניים', '2025-01-13 21:25:00', 'בתאריך ה14.1 בשעה 1:25 תועד אדם אשר מגיע למעונות מזרח ובוחן את עמדת האופניים אשר ממוקמת בכניסה של 458 בשעה 1:32 רואים אדם נוסף לבוש בכובע מגיע ופורץ את המנעולים של שלושה אופניים ולוקח את אחד מהם המשטרה עודכנה', 1);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `ID_Role` int(11) NOT NULL,
  `Role_Name` varchar(255) NOT NULL,
  `Create_Work_Schedul` tinyint(1) NOT NULL,
  `Create_Incidet` tinyint(1) NOT NULL,
  `Update_Work_Schadul` tinyint(1) NOT NULL,
  `Watch_Incidet` tinyint(1) NOT NULL,
  `Update_Guest_List` tinyint(1) NOT NULL,
  `Work_Permission` tinyint(1) NOT NULL,
  `Leave_Approval` tinyint(1) NOT NULL,
  `Work_Change_Approval` tinyint(1) NOT NULL,
  `Updating_Incident` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`ID_Role`, `Role_Name`, `Create_Work_Schedul`, `Create_Incidet`, `Update_Work_Schadul`, `Watch_Incidet`, `Update_Guest_List`, `Work_Permission`, `Leave_Approval`, `Work_Change_Approval`, `Updating_Incident`) VALUES
(1, 'manager', 0, 0, 0, 0, 0, 0, 0, 0, 0),
(2, 'kabat', 0, 0, 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `shift`
--

CREATE TABLE `shift` (
  `Shift_ID` int(11) NOT NULL,
  `Date` datetime NOT NULL,
  `Type_Of_Shift` enum('1','2','3') NOT NULL,
  `Number_Of_Employee` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shift_details`
--

CREATE TABLE `shift_details` (
  `ID` int(11) NOT NULL,
  `Shift_ID` int(11) NOT NULL,
  `Type_Of_Role` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `firstName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `lastName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `birthDate` date DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `street` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `city` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `postalCode` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `role` enum('employee','manager','kabat','moked') NOT NULL DEFAULT 'employee',
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `registration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `firstName`, `lastName`, `birthDate`, `password`, `email`, `phone`, `street`, `city`, `postalCode`, `role`, `status`, `registration_date`) VALUES
(1, 'Manager', 'פהמי', 'managerLastName', NULL, '$2b$10$nV8.B.9FcfYfnPeIlfbj0eQuJnCA9oK/21hq/4JJWDCD/pIYv/MZa', '', '', '', '', '', 'manager', 'active', NULL),
(3, 'fehmi1', 'fehmi', 'wehby', NULL, '$2b$10$FuyqWM9i.Hud9nXHyjXA7uW1GIt/teH.Fig09qkHV5nKXDfFFgZTW', 'fehmiwe1@gmail.com', '0528861847', '10', 'dalet', '3005600', 'employee', 'active', NULL),
(4, 'fehmi2', 'fehmi2', 'wehby', '2000-05-20', '$2b$10$shynZE/wVOCgHRtaJF2o3.K7bUgrFyjYZd4T8TXmD/fMQDgoqYzM.', 'fehmiwe1@gmail.com', '0528861847', '21', 'waa', '3005600', 'employee', 'inactive', NULL),
(31, 'Maor', 'מאור', 'דוד', '1997-11-13', '$2b$10$LYoogQBupC8IjAZSdwr4Nu8UcWS4kYmi9m4/yl8zurGh4ziY1GGqO', 'maor@gmail.com', '0522222222', 'חיפה', 'חיפה', '3224712', 'employee', 'active', NULL),
(32, 'avidan', 'אבידן', 'סלומי', '1989-05-26', '$2b$10$uzdG1KKuLzapqdjbyL712O/0adHbTX/ZSSTp30MNmsDeuVS1CVe1m', 'avidan@gmail.com', '0501234567', 'דד', 'רכסים', '2406080', 'employee', 'inactive', '2025-05-21'),
(33, 'elia', 'איליה', 'כרומנשק', '1982-11-02', '$2b$10$CZsW9slbd9aslRUGQoXEGuYA/qoR4g/oSxeY5dU5VRVMrx5ZVwCfi', 'elia1@gmail.com', '0521234567', 'טבריה', 'טבריה', '1234567', 'employee', 'inactive', '2025-05-21'),
(34, 'eliea', 'איליה', 'כרומנשק', '1982-11-10', '$2b$10$yiNJULnIDQjLN4ZahCR3e.YpWR50FtIuemgYzQwTbFo8S7MWj4g/e', 'elia1@gmail.com', '0521234567', 'טבריה', 'טבריה', '1234567', 'employee', 'inactive', '2025-05-21'),
(35, 'bar', 'בר', 'כהן', '1998-05-06', '$2b$10$RvrsDebDqCfeO1KDZwHeTeJV5iIaEgw8VogiOE2x3gzQ1QH73N6Y6', 'bar@gmail.com', '0521234567', '10', 'חיפה', '1234567', 'employee', 'inactive', '2025-05-21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employee_constraints`
--
ALTER TABLE `employee_constraints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ID_employee` (`ID_employee`,`date`,`shift`);

--
-- Indexes for table `employee_notifications`
--
ALTER TABLE `employee_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ID_employee` (`ID_employee`);

--
-- Indexes for table `employee_requests`
--
ALTER TABLE `employee_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ID_employee` (`ID_employee`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`GuestID`);

--
-- Indexes for table `incident`
--
ALTER TABLE `incident`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ID_Employee` (`ID_Employee`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`ID_Role`);

--
-- Indexes for table `shift`
--
ALTER TABLE `shift`
  ADD PRIMARY KEY (`Shift_ID`);

--
-- Indexes for table `shift_details`
--
ALTER TABLE `shift_details`
  ADD KEY `ID` (`ID`),
  ADD KEY `Shift_ID` (`Shift_ID`),
  ADD KEY `Type_Of_Role` (`Type_Of_Role`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `employee_constraints`
--
ALTER TABLE `employee_constraints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_notifications`
--
ALTER TABLE `employee_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee_requests`
--
ALTER TABLE `employee_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `GuestID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `incident`
--
ALTER TABLE `incident`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employee_constraints`
--
ALTER TABLE `employee_constraints`
  ADD CONSTRAINT `employee_constraints_ibfk_1` FOREIGN KEY (`ID_employee`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_notifications`
--
ALTER TABLE `employee_notifications`
  ADD CONSTRAINT `employee_notifications_ibfk_1` FOREIGN KEY (`ID_employee`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_requests`
--
ALTER TABLE `employee_requests`
  ADD CONSTRAINT `employee_requests_ibfk_1` FOREIGN KEY (`ID_employee`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `incident`
--
ALTER TABLE `incident`
  ADD CONSTRAINT `incident_ibfk_1` FOREIGN KEY (`ID_Employee`) REFERENCES `users` (`id`);

--
-- Constraints for table `shift_details`
--
ALTER TABLE `shift_details`
  ADD CONSTRAINT `shift_details_ibfk_1` FOREIGN KEY (`Type_Of_Role`) REFERENCES `role` (`ID_Role`),
  ADD CONSTRAINT `shift_details_ibfk_2` FOREIGN KEY (`ID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `shift_details_ibfk_3` FOREIGN KEY (`Shift_ID`) REFERENCES `shift` (`Shift_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
