-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 11, 2025 at 05:12 PM
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

--
-- Dumping data for table `employee_constraints`
--

INSERT INTO `employee_constraints` (`id`, `ID_employee`, `date`, `shift`, `availability`) VALUES
(89, 31, '2025-06-02', 'בוקר', 'לא יכול'),
(90, 31, '2025-06-02', 'ערב', 'לא יכול'),
(91, 31, '2025-06-02', 'לילה', 'לא יכול'),
(93, 31, '2025-06-01', 'בוקר', 'לא יכול'),
(94, 31, '2025-06-01', 'ערב', 'לא יכול'),
(95, 31, '2025-06-01', 'לילה', 'לא יכול'),
(100, 31, '2025-05-31', 'בוקר', 'לא יכול'),
(101, 31, '2025-05-31', 'ערב', 'לא יכול'),
(102, 31, '2025-05-31', 'לילה', 'לא יכול'),
(103, 31, '2025-06-05', 'בוקר', 'לא יכול'),
(104, 31, '2025-06-05', 'ערב', 'לא יכול'),
(105, 31, '2025-06-05', 'לילה', 'לא יכול'),
(118, 31, '2025-06-04', 'בוקר', 'יכול חלקית'),
(132, 31, '2025-06-09', 'בוקר', 'לא יכול'),
(133, 31, '2025-06-09', 'ערב', 'לא יכול'),
(134, 31, '2025-06-09', 'לילה', 'לא יכול'),
(135, 31, '2025-06-10', 'ערב', 'יכול חלקית'),
(136, 31, '2025-06-11', 'ערב', 'יכול חלקית'),
(191, 3, '2025-06-05', 'בוקר', 'לא יכול'),
(192, 3, '2025-06-05', 'ערב', 'לא יכול'),
(193, 3, '2025-06-05', 'לילה', 'לא יכול'),
(194, 3, '2025-06-06', 'בוקר', 'לא יכול'),
(195, 3, '2025-06-06', 'ערב', 'לא יכול'),
(196, 3, '2025-06-06', 'לילה', 'לא יכול'),
(197, 3, '2025-06-12', 'ערב', 'יכול חלקית'),
(198, 3, '2025-06-12', 'לילה', 'יכול חלקית'),
(199, 3, '2025-06-12', 'בוקר', 'יכול חלקית'),
(200, 35, '2025-06-09', 'בוקר', 'לא יכול'),
(201, 35, '2025-06-09', 'ערב', 'לא יכול'),
(202, 35, '2025-06-09', 'לילה', 'לא יכול'),
(203, 35, '2025-06-10', 'בוקר', 'יכול חלקית'),
(204, 35, '2025-06-13', 'לילה', 'יכול חלקית'),
(205, 35, '2025-06-05', 'בוקר', 'יכול חלקית'),
(206, 35, '2025-06-02', 'ערב', 'יכול חלקית'),
(207, 35, '2025-06-11', 'ערב', 'לא יכול'),
(208, 33, '2025-06-14', 'בוקר', 'לא יכול'),
(209, 33, '2025-06-14', 'ערב', 'לא יכול'),
(210, 33, '2025-06-14', 'לילה', 'לא יכול'),
(211, 33, '2025-06-10', 'בוקר', 'יכול חלקית'),
(212, 33, '2025-06-09', 'ערב', 'יכול חלקית'),
(213, 33, '2025-06-02', 'לילה', 'יכול חלקית'),
(214, 33, '2025-06-03', 'ערב', 'יכול חלקית'),
(215, 33, '2025-06-01', 'ערב', 'יכול חלקית'),
(216, 33, '2025-06-05', 'ערב', 'יכול חלקית'),
(217, 32, '2025-06-12', 'בוקר', 'לא יכול'),
(218, 32, '2025-06-12', 'ערב', 'יכול חלקית'),
(219, 32, '2025-06-12', 'לילה', 'לא יכול'),
(220, 32, '2025-06-06', 'בוקר', 'לא יכול'),
(221, 32, '2025-06-06', 'ערב', 'לא יכול'),
(222, 32, '2025-06-06', 'לילה', 'לא יכול');

-- --------------------------------------------------------

--
-- Table structure for table `employee_notifications`
--

CREATE TABLE `employee_notifications` (
  `id` int(11) NOT NULL,
  `ID_employee` int(11) NOT NULL,
  `event_date` date NOT NULL,
  `event_description` text NOT NULL,
  `notification_status` enum('approval','rejection','pending') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_notifications`
--

INSERT INTO `employee_notifications` (`id`, `ID_employee`, `event_date`, `event_description`, `notification_status`) VALUES
(1, 33, '2025-05-21', 'הרשמת עובד חדש', 'pending'),
(3, 35, '2025-05-21', 'הרשמת עובד חדש', 'pending'),
(4, 36, '2025-06-09', 'הרשמת עובד חדש', 'approval'),
(5, 37, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(6, 38, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(7, 39, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(8, 40, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(9, 41, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(10, 42, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(11, 43, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(12, 44, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(13, 45, '2025-06-10', 'הרשמת עובד חדש', 'approval');

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
  `vacation_days` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `days_to_pay` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `reason` text NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `status` enum('ממתין','אושר','סורב') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_requests`
--

INSERT INTO `employee_requests` (`id`, `ID_employee`, `request_type`, `request_date`, `from_date`, `to_date`, `vacation_days`, `days_to_pay`, `reason`, `file_path`, `status`) VALUES
(3, 31, 'מחלה', '2025-06-02', '0000-00-00', '0000-00-00', 0, 0, '', 'uploads\\sick-1748884337492.pdf', NULL),
(4, 31, 'מחלה', '2025-06-02', '0000-00-00', '0000-00-00', 0, 0, '', 'uploads\\sick-1748884622065.pdf', NULL),
(5, 31, 'חופשה', '2025-06-02', '2025-06-03', '2025-06-05', 3, 2, '', NULL, 'סורב'),
(6, 31, 'חופשה', '2025-06-02', '2025-06-03', '2025-06-14', 12, 13, '', NULL, 'ממתין'),
(7, 31, 'חופשה', '2025-06-02', '2025-06-03', '2025-06-07', 5, 5, '', NULL, 'ממתין'),
(8, 3, 'מחלה', '2025-06-03', '0000-00-00', '0000-00-00', 0, 0, '', 'uploads\\sick-1748989977037.pdf', NULL),
(9, 3, 'חופשה', '2025-06-03', '2025-06-05', '2025-06-07', 3, 3, 'טיול', NULL, 'אושר'),
(10, 31, 'חופשה', '2025-06-09', '2025-06-26', '2025-06-28', 3, 2, 'טיול', NULL, 'סורב');

-- --------------------------------------------------------

--
-- Table structure for table `employee_shift_assignment`
--

CREATE TABLE `employee_shift_assignment` (
  `ID` int(11) NOT NULL,
  `Employee_ID` int(11) NOT NULL,
  `Shift_ID` int(11) NOT NULL,
  `Shift_Detail_ID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guests`
--

CREATE TABLE `guests` (
  `GuestID` int(11) NOT NULL,
  `GuestNumber` varchar(50) NOT NULL,
  `CarNumber` varchar(20) NOT NULL,
  `GuestName` varchar(100) NOT NULL,
  `GuestPhone` varchar(20) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guests`
--

INSERT INTO `guests` (`GuestID`, `GuestNumber`, `CarNumber`, `GuestName`, `GuestPhone`, `StartDate`, `EndDate`, `IsActive`) VALUES
(1, '1001', '12345678', 'דני לוי', '0501234567', '2025-05-20', '2025-06-01', 0),
(2, '1001', '23456789', 'דני לוי', '0501234567', '2025-05-20', '2025-06-01', 0),
(3, '1002', '34567890', 'מיכל כהן', '0529876543', '2025-05-22', '2025-08-03', 1),
(4, '1002', '45678901', 'מיכל כהן', '0529876543', '2025-05-22', '2025-08-03', 1),
(5, '202', '123456789', 'אאא', '0521234567', '2025-01-20', '2026-06-29', 1),
(6, '202', '55566647', 'בבב', '0501234567', '2025-01-20', '2026-06-29', 1),
(8, '12223', '123555', '222', '1234567890', '2025-05-14', '2025-05-30', 0),
(9, '10', '01', 'אאאצל', '0501234567', '2025-05-06', '2025-05-27', 0);

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
  `Number_Of_Employee` int(11) NOT NULL,
  `Role_In_Shift` enum('guard','kabat','moked') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL
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
  `role` enum('guard','manager','kabat','moked') NOT NULL DEFAULT 'guard',
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `registration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `firstName`, `lastName`, `birthDate`, `password`, `email`, `phone`, `street`, `city`, `postalCode`, `role`, `status`, `registration_date`) VALUES
(1, 'Manager', 'מנהל', 'מנהל', NULL, '$2b$10$nV8.B.9FcfYfnPeIlfbj0eQuJnCA9oK/21hq/4JJWDCD/pIYv/MZa', '', '', '', '', '', 'manager', 'active', NULL),
(3, 'fehmi1', 'פהמי1', 'והבי', NULL, '$2b$10$FuyqWM9i.Hud9nXHyjXA7uW1GIt/teH.Fig09qkHV5nKXDfFFgZTW', 'fehmiwe1@gmail.com', '0528861847', '10', 'dalet', '3005600', 'guard', 'active', NULL),
(4, 'fehmi2', 'פהמי2', 'והבי', '2000-05-20', '$2b$10$shynZE/wVOCgHRtaJF2o3.K7bUgrFyjYZd4T8TXmD/fMQDgoqYzM.', 'fehmiwe1@gmail.com', '0528861847', '21', 'waa', '3005600', 'guard', 'active', NULL),
(31, 'Maor', 'מאור', 'דוד', '1997-11-13', '$2b$10$LYoogQBupC8IjAZSdwr4Nu8UcWS4kYmi9m4/yl8zurGh4ziY1GGqO', 'maor@gmail.com', '0522222222', 'חיפה', 'חיפה', '3224712', 'guard', 'active', NULL),
(32, 'avidan', 'אבידן', 'סלומי', '1989-05-26', '$2b$10$vWKRtl7x0PHUFA2uWQzWF..kKkuvO0CTqeVzZo73vnaaU7utCUiOa', 'avidan@gmail.com', '0501234567', 'דד', 'רכסים', '2406080', 'kabat', 'active', '2025-05-21'),
(33, 'elia', 'איליה', 'כרומנשק', '1982-11-02', '$2b$10$tpdi6ExqJLPzgiXN5RccheDlpqyj9JHeXUwk/MSdsZDhvZcjlbpCS', 'elia1@gmail.com', '0521234567', 'טבריה', 'טבריה', '1234567', 'moked', 'active', '2025-05-21'),
(35, 'bar', 'בר', 'כהן', '1998-05-06', '$2b$10$YWhI4LpVlYOqED4sW1QsRujztkHEiAZq9FbFW91mXNq3VjYL.xHCS', 'bar@gmail.com', '0521234567', '10', 'חיפה', '1234567', 'guard', 'active', '2025-05-21'),
(36, 'armon2020', 'יונתן', 'ארמון', '2000-10-20', '$2b$10$aP/cAkKi0yR7vUIs2E86IuYyUQo1iJoTwiPENlsT1VB0syvOHdvwW', 'armon@gmail.com', '0522222224', 'הבריכה', 'נשר', '3663910', 'kabat', 'active', '2025-06-09'),
(37, 'kabat1', 'קבט1', 'קבט1', '2008-02-11', '$2b$10$P/X4fDXxPwUR04YHHYT9guhmtQ0PKf2utAu9tlCwDZz1uTLtPvKNS', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(38, 'kabat2', 'קבט2', 'קבט2', '2008-02-11', '$2b$10$VjTpjWr13M4IkNFIxj8hKeHbrxveFbrKgd1liX4xz5qEM9UYVim82', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(39, 'kabat3', 'קבט3', 'קבט3', '2008-02-11', '$2b$10$G3nosFZJFl8arSkl49HOJuDqwH1UV8i3hcKtIqWKBtB5doXFym5QC', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(40, 'kabat4', 'קבט4', 'קבט4', '2008-02-11', '$2b$10$KNXxjOda1icEwMa/2glQ6./ivxTfMnrt6LhbGQ/j/VMqbkSkbCHBu', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(41, 'moked1', 'מוקד1', 'מוקד1', '2008-02-11', '$2b$10$oLoBUIJlMCu7U3tv7YKCbOfhnuK3ypQgkkxO7eO/xp20KjsqIm12.', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(42, 'moked2', 'מוקד2', 'מוקד2', '2008-02-11', '$2b$10$D.YO/VEm5be/QertNSR0Aeo1CpwBsbCwtMY84l8VThgd3CoFQOYBO', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(43, 'moked3', 'מוקד3', 'מוקד3', '2008-02-11', '$2b$10$DUEa5ZOjgB5osS2UVjXKauKDi9BTwGbbOmOiKdc3wAG2ulKp8iHGS', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(44, 'moked4', 'מוקד4', 'מוקד4', '2008-02-11', '$2b$10$MJIKkBOqm4VPPq0p/gkPeuLBsbhDGKVyDOQkjQIY/iieFE3dNFctS', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(45, 'moked5', 'מוקד5', 'מוקד5', '2008-02-11', '$2b$10$BeFxicWuhsWkiA11IfOHwOsHR9MEun7SRSwh1EqYvsjzYHSejdKAi', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employee_constraints`
--
ALTER TABLE `employee_constraints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ID_employee` (`ID_employee`,`date`,`shift`),
  ADD UNIQUE KEY `uniq_employee_date_shift` (`ID_employee`,`date`,`shift`);

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
-- Indexes for table `employee_shift_assignment`
--
ALTER TABLE `employee_shift_assignment`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `Employee_ID` (`Employee_ID`,`Shift_ID`),
  ADD KEY `Shift_ID` (`Shift_ID`),
  ADD KEY `Shift_Detail_ID` (`Shift_Detail_ID`);

--
-- Indexes for table `guests`
--
ALTER TABLE `guests`
  ADD PRIMARY KEY (`GuestID`),
  ADD UNIQUE KEY `GuestNumber` (`GuestNumber`,`CarNumber`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=235;

--
-- AUTO_INCREMENT for table `employee_notifications`
--
ALTER TABLE `employee_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `employee_requests`
--
ALTER TABLE `employee_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `employee_shift_assignment`
--
ALTER TABLE `employee_shift_assignment`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `GuestID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `incident`
--
ALTER TABLE `incident`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

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
-- Constraints for table `employee_shift_assignment`
--
ALTER TABLE `employee_shift_assignment`
  ADD CONSTRAINT `employee_shift_assignment_ibfk_1` FOREIGN KEY (`Employee_ID`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `employee_shift_assignment_ibfk_2` FOREIGN KEY (`Shift_ID`) REFERENCES `shift` (`Shift_ID`),
  ADD CONSTRAINT `employee_shift_assignment_ibfk_3` FOREIGN KEY (`Shift_Detail_ID`) REFERENCES `shift_details` (`ID`);

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
