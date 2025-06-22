-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 22, 2025 at 08:12 PM
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
(222, 32, '2025-06-06', 'לילה', 'לא יכול'),
(253, 31, '2025-06-15', 'בוקר', 'לא יכול'),
(254, 31, '2025-06-15', 'ערב', 'לא יכול'),
(255, 31, '2025-06-15', 'לילה', 'לא יכול'),
(256, 31, '2025-06-16', 'ערב', 'יכול חלקית'),
(257, 31, '2025-06-16', 'בוקר', 'יכול חלקית'),
(258, 31, '2025-06-16', 'לילה', 'יכול חלקית'),
(259, 31, '2025-06-24', 'בוקר', 'לא יכול'),
(260, 31, '2025-06-24', 'ערב', 'לא יכול'),
(261, 31, '2025-06-24', 'לילה', 'לא יכול'),
(262, 41, '2025-06-15', 'בוקר', 'לא יכול'),
(263, 41, '2025-06-15', 'ערב', 'לא יכול'),
(264, 41, '2025-06-15', 'לילה', 'לא יכול'),
(265, 41, '2025-06-16', 'בוקר', 'יכול חלקית'),
(266, 41, '2025-06-16', 'ערב', 'יכול חלקית'),
(267, 41, '2025-06-16', 'לילה', 'יכול חלקית'),
(268, 41, '2025-06-24', 'בוקר', 'לא יכול'),
(269, 41, '2025-06-24', 'ערב', 'לא יכול'),
(270, 41, '2025-06-24', 'לילה', 'לא יכול'),
(271, 37, '2025-06-15', 'בוקר', 'לא יכול'),
(272, 37, '2025-06-15', 'ערב', 'לא יכול'),
(273, 37, '2025-06-15', 'לילה', 'לא יכול'),
(274, 37, '2025-06-16', 'בוקר', 'יכול חלקית'),
(275, 37, '2025-06-16', 'ערב', 'יכול חלקית'),
(276, 37, '2025-06-16', 'לילה', 'יכול חלקית'),
(277, 37, '2025-06-24', 'בוקר', 'לא יכול'),
(278, 37, '2025-06-24', 'ערב', 'לא יכול'),
(279, 37, '2025-06-24', 'לילה', 'לא יכול'),
(307, 31, '2025-06-17', 'ערב', 'לא יכול'),
(308, 31, '2025-06-17', 'לילה', 'יכול חלקית'),
(318, 3, '2025-06-15', 'בוקר', 'יכול חלקית'),
(319, 3, '2025-06-15', 'ערב', 'יכול חלקית'),
(320, 3, '2025-06-15', 'לילה', 'יכול חלקית');

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
(13, 45, '2025-06-10', 'הרשמת עובד חדש', 'approval'),
(14, 46, '2025-06-21', 'הרשמת עובד חדש', 'approval'),
(15, 47, '2025-06-21', 'הרשמת עובד חדש', 'approval'),
(16, 48, '2025-06-21', 'הרשמת עובד חדש', 'approval'),
(17, 49, '2025-06-21', 'הרשמת עובד חדש', 'approval'),
(18, 50, '2025-06-21', 'הרשמת עובד חדש', 'approval');

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
(11, 31, 'חופשה', '2025-06-22', '2025-06-24', '2025-06-26', 3, 3, 'חופשה לטובת טיול', NULL, 'ממתין'),
(12, 41, 'חופשה', '2025-06-22', '2025-06-03', '2025-06-05', 3, 2, 'איורע', NULL, 'אושר'),
(13, 37, 'מחלה', '2025-03-22', '0000-00-00', '0000-00-00', 0, 0, '', 'uploads\\sick-1750602978970.pdf', NULL),
(14, 37, 'חופשה', '2025-06-22', '2025-06-30', '2025-07-03', 4, 4, 'טיול', NULL, 'סורב'),
(15, 70, 'מחלה', '2025-06-22', '0000-00-00', '0000-00-00', 0, 0, '', 'uploads\\sick-1750603742618.pdf', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_shift_assignment`
--

CREATE TABLE `employee_shift_assignment` (
  `ID` int(11) NOT NULL,
  `Employee_ID` int(11) NOT NULL,
  `Shift_ID` int(11) NOT NULL,
  `Role` enum('מאבטח','מוקד','קבט','סייר רכוב','סייר א','סייר ב','סייר ג','הפסקות') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_shift_assignment`
--

INSERT INTO `employee_shift_assignment` (`ID`, `Employee_ID`, `Shift_ID`, `Role`) VALUES
(1808, 45, 2205, 'מוקד'),
(1809, 43, 2206, 'מוקד'),
(1810, 44, 2207, 'מוקד'),
(1811, 42, 2208, 'מוקד');

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
  `Incident_Name` varchar(100) NOT NULL,
  `Incident_Date` datetime DEFAULT NULL,
  `Kabat_Name` varchar(100) DEFAULT NULL,
  `Dispatcher_Name` varchar(100) DEFAULT NULL,
  `Patrol_Name` varchar(100) DEFAULT NULL,
  `Other_Participants` text DEFAULT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `incident`
--

INSERT INTO `incident` (`id`, `Incident_Name`, `Incident_Date`, `Kabat_Name`, `Dispatcher_Name`, `Patrol_Name`, `Other_Participants`, `Description`) VALUES
(1, 'סירוב בידוק', '2025-06-22 10:06:30', 'קבט1 קבט1', 'מוקד1 מוקד1', 'מאבטח1 מאבטח1', 'נהג רכב', 'סירוב בידוק'),
(2, 'פריצת מחסום', '2025-06-22 06:36:20', 'קבט1 קבט1', 'מוקד1 מוקד1', 'מאבטח1 מאבטח1', 'נהג רכב', 'פריצת מחסום'),
(3, 'חדירה לשטח אסור', '2025-06-21 02:15:00', 'כהן דוד', 'מורן בר', 'סייר לילה 1', 'נציג משטרה', 'התרחשה חדירה לשטח מגודר בשעות הלילה'),
(4, 'אירוע רכב חשוד', '2025-06-20 18:30:00', 'לוי נועם', 'דנה שרון', 'סייר 2', 'עובר אורח', 'רכב חנה זמן רב סמוך לשער הראשי ללא זיהוי'),
(5, 'עיכוב בשער', '2025-06-19 07:45:00', 'קבסה יניב', 'נופר זהבי', 'סייר ראשי', 'אורח מהנדסה', 'אורח סירב להזדהות – הוזמן קב\"ט'),
(6, 'תקרית מילולית', '2025-06-18 15:10:00', 'מימון יוסי', 'טל גולן', 'סייר רכוב 3', 'עובד ניקיון', 'ויכוח בין קבלן לאחד העובדים; לא נדרשה התערבות חיצונית'),
(7, 'הצתת פח אשפה', '2025-06-17 17:53:00', '', 'אור גרשון', 'סייר לילה 2', 'כיבוי אש', 'נרשמה הצתה של פח ליד המעונות, הוזעק כיבוי אש');

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
  `ID` int(11) NOT NULL,
  `Date` date NOT NULL,
  `Location` enum('נשר','ראשי','אחר') NOT NULL,
  `ShiftType` enum('בוקר','ערב','לילה') NOT NULL,
  `Num_Guards` int(11) DEFAULT 0,
  `Num_Moked` int(11) DEFAULT 0,
  `Num_Kabat` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shift`
--

INSERT INTO `shift` (`ID`, `Date`, `Location`, `ShiftType`, `Num_Guards`, `Num_Moked`, `Num_Kabat`) VALUES
(2205, '2025-06-15', 'אחר', 'בוקר', 0, 1, 0),
(2206, '2025-06-15', 'אחר', 'ערב', 0, 1, 0),
(2207, '2025-06-15', 'אחר', 'לילה', 0, 1, 0),
(2208, '2025-06-16', 'אחר', 'בוקר', 0, 1, 0);

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
(32, 'avidan', 'אבידן', 'סלומי', '1989-05-26', '$2b$10$vWKRtl7x0PHUFA2uWQzWF..kKkuvO0CTqeVzZo73vnaaU7utCUiOa', 'avidan@gmail.com', '0501234567', 'דד', 'רכסים', '2406080', 'guard', 'active', '2025-05-21'),
(33, 'elia', 'איליה', 'כרומנשק', '1982-11-02', '$2b$10$tpdi6ExqJLPzgiXN5RccheDlpqyj9JHeXUwk/MSdsZDhvZcjlbpCS', 'elia1@gmail.com', '0521234567', 'טבריה', 'טבריה', '1234567', 'guard', 'active', '2025-05-21'),
(35, 'bar', 'בר', 'כהן', '1998-05-06', '$2b$10$YWhI4LpVlYOqED4sW1QsRujztkHEiAZq9FbFW91mXNq3VjYL.xHCS', 'bar@gmail.com', '0521234567', '10', 'חיפה', '1234567', 'guard', 'active', '2025-05-21'),
(36, 'armon2020', 'יונתן', 'ארמון', '2000-10-20', '$2b$10$aP/cAkKi0yR7vUIs2E86IuYyUQo1iJoTwiPENlsT1VB0syvOHdvwW', 'armon@gmail.com', '0522222224', 'הבריכה', 'נשר', '3663910', 'guard', 'active', '2025-06-09'),
(37, 'kabat1', 'קבט1', 'קבט1', '2008-02-11', '$2b$10$P/X4fDXxPwUR04YHHYT9guhmtQ0PKf2utAu9tlCwDZz1uTLtPvKNS', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(38, 'kabat2', 'קבט2', 'קבט2', '2008-02-11', '$2b$10$VjTpjWr13M4IkNFIxj8hKeHbrxveFbrKgd1liX4xz5qEM9UYVim82', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(39, 'kabat3', 'קבט3', 'קבט3', '2008-02-11', '$2b$10$G3nosFZJFl8arSkl49HOJuDqwH1UV8i3hcKtIqWKBtB5doXFym5QC', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(40, 'kabat4', 'קבט4', 'קבט4', '2008-02-11', '$2b$10$KNXxjOda1icEwMa/2glQ6./ivxTfMnrt6LhbGQ/j/VMqbkSkbCHBu', 'kabat1@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'kabat', 'active', '2025-06-10'),
(41, 'moked1', 'מוקד1', 'מוקד1', '2008-02-11', '$2b$10$oLoBUIJlMCu7U3tv7YKCbOfhnuK3ypQgkkxO7eO/xp20KjsqIm12.', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(42, 'moked2', 'מוקד2', 'מוקד2', '2008-02-11', '$2b$10$D.YO/VEm5be/QertNSR0Aeo1CpwBsbCwtMY84l8VThgd3CoFQOYBO', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(43, 'moked3', 'מוקד3', 'מוקד3', '2008-02-11', '$2b$10$DUEa5ZOjgB5osS2UVjXKauKDi9BTwGbbOmOiKdc3wAG2ulKp8iHGS', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(44, 'moked4', 'מוקד4', 'מוקד4', '2008-02-11', '$2b$10$MJIKkBOqm4VPPq0p/gkPeuLBsbhDGKVyDOQkjQIY/iieFE3dNFctS', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(45, 'moked5', 'מוקד5', 'מוקד5', '2008-02-11', '$2b$10$BeFxicWuhsWkiA11IfOHwOsHR9MEun7SRSwh1EqYvsjzYHSejdKAi', 'moked@gmail.com', '0522222224', 'חיפה', 'חיפה', '1234567', 'moked', 'active', '2025-06-10'),
(46, 'kabat5', 'קבט5', 'קבט5', '2025-06-03', '$2b$10$Z06X5Excw6m5ziEXYfmCNuukgmQwVaOqYZ.GZFoP18WTmiqBqxA1K', 'kabat5@gmail.com', '0522222224', 'רחוברחוב', 'חיפה', '1234567', 'kabat', 'active', '2025-06-21'),
(47, 'kabat6', 'קבט6', 'קבט6', '2025-06-03', '$2b$10$cahKJGfFJ6Ehat69ynT9xu9qB5u8koypv9b10q7HHXzv7ZSMakx5G', 'kabat6@gmail.com', '0522222224', 'רחוב', 'חיפה', '1234567', 'kabat', 'active', '2025-06-21'),
(48, 'kabat7', 'קבט7', 'קבט7', '2025-06-03', '$2b$10$stAZKv6bXKtlxF1dEN2V0OXpCwYyqRAjFEZZZtbqHIRjApVQKE9ye', 'kabat7@gmail.com', '0522222224', 'רחוב', 'חיפה', '1234567', 'kabat', 'active', '2025-06-21'),
(49, 'Moked6', 'מוקד6', 'מוקד6', '2025-06-03', '$2b$10$g70D873D.krvsi9BJItRae0sp0lXMlNr2Tu6MUJ9agPx41xjq4ef6', 'Moked6@gmail.com', '0522222224', 'רחוב', 'חיפה', '1234567', 'moked', 'active', '2025-06-21'),
(50, 'Moked7', 'מוקד7', 'מוקד7', '2025-06-03', '$2b$10$bC/621GGmWnsHpaR6X5gyu1VlcEr88cz7eAtJwjeVyTrpDTm81/nC', 'Moked7@gmail.com', '0522222224', 'רחוב', 'חיפה', '1234567', 'moked', 'active', '2025-06-21'),
(51, 'guard1', 'מאבטח1', 'מאבטח1', NULL, '$2b$10$GRlDytwHtX068U.Ll/p4r.9fc1EqWioMxKM.V/dgZ8etOOdDjpWLS', 'guard1@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(52, 'guard2', 'מאבטח2', 'מאבטח2', NULL, '$2b$10$DyrxJUUUvoTACTiQ3z04duavfn6Gxx8S6XGnNO.TQK3laaAdTtuju', 'guard2@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(53, 'guard3', 'מאבטח3', 'מאבטח3', NULL, '$2b$10$jUMZri1PpPU6pbAL4eKxEOwhFUGpqXVa/FaVJLao/7q6eFAAlWabG', 'guard3@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(54, 'guard4', 'מאבטח4', 'מאבטח4', NULL, '$2b$10$RJCu1moJqzPUHbAN2u5T3eWaTwqocIhIlDwOJAQdEpdR/Iedz/Rmu', 'guard4@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(55, 'guard5', 'מאבטח5', 'מאבטח5', NULL, '$2b$10$2qpyDSb5SBZmUrkCNUV.r.C/o.IrQCxVLpPK45Mx9E6LU8t48zxIW', 'guard5@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(56, 'guard6', 'מאבטח6', 'מאבטח6', NULL, '$2b$10$bCpwFb4enZR3k3zDHBcqWO3CVp9UBBaDrHGV86Bm6871zkCQMUAIe', 'guard6@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(57, 'guard7', 'מאבטח7', 'מאבטח7', NULL, '$2b$10$U9CinL2LglamTx2cbLrpGO0l5SBGgnoDR8b8p0/JUGv6RGqfHmGGe', 'guard7@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(58, 'guard8', 'מאבטח8', 'מאבטח8', NULL, '$2b$10$jeCWzMe.YaJtHSaflQr5YuzlP/ZkkPrEWOcp.b.SXzEfiFe8Suh6G', 'guard8@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(59, 'guard9', 'מאבטח9', 'מאבטח9', NULL, '$2b$10$Bfc/CHnyHTnVuUxqUA6JKeQ2xpISf09Er/ZpT.t4hJIExLcxR1sre', 'guard9@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(60, 'guard10', 'מאבטח10', 'מאבטח10', NULL, '$2b$10$6VDYbWlfS95vO2Yghv3Gz.1PkP4VQtw8mGnFBjwYKVNFd4bMAhWsy', 'guard10@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(61, 'guard11', 'מאבטח11', 'מאבטח11', NULL, '$2b$10$slvt3RFqTCT4sAdCCaoJdOApKAD/1nN1tNMz6rmiyTHN8vr6mlmC6', 'guard11@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(62, 'guard12', 'מאבטח12', 'מאבטח12', NULL, '$2b$10$flKXBPJiAkhq6ObTbQvesOh.VU6JEUi5afL0dEIjkCh8vtH4vvzwq', 'guard12@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(63, 'guard13', 'מאבטח13', 'מאבטח13', NULL, '$2b$10$eaKMED67zaYPa2MF/WpON.e.17IXVoCUhUBoFbiZeCEyQ9Aa3z54y', 'guard13@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(64, 'guard14', 'מאבטח14', 'מאבטח14', NULL, '$2b$10$J.iv0BWZmRVeDVi/rWg8h.N85pcym.qiLMSbfZhLfm7c5hLGEewlO', 'guard14@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(65, 'guard15', 'מאבטח15', 'מאבטח15', NULL, '$2b$10$x/Z8TsVN7Oh6ou3bFwyHtutWOm1j8fjfKXCmVP77DJ.hGv1STLWBS', 'guard15@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(66, 'guard16', 'מאבטח16', 'מאבטח16', NULL, '$2b$10$sjJvo5XR/5uOOiJbKAphtO17IwF/migp3TttAD0pRSMPSKip1FkLK', 'guard16@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(67, 'guard17', 'מאבטח17', 'מאבטח17', NULL, '$2b$10$PKkXfJ3zX.fzwWcApdRWtuUbJZED.ugYYI7MqK39HqRpdWqAennia', 'guard17@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(68, 'guard18', 'מאבטח18', 'מאבטח18', NULL, '$2b$10$7IZ5EKChSD/iBfTFhqupFOOvALjl0QudHtf.UrSAZH6pPW6h0DOkm', 'guard18@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(69, 'guard19', 'מאבטח19', 'מאבטח19', NULL, '$2b$10$c4EuSepdYh7CgeqMABCp9u9m3boxndTJ8SLN8LUWwLrjUSBLrfpDa', 'guard19@gmail.com', '', '', '', '', 'guard', 'active', NULL),
(70, 'guard20', 'מאבטח20', 'מאבטח20', NULL, '$2b$10$MhhyMfOXSvakAsrhnPb7leFWZnN5PlG2zuNU1qgVXsk3DJ.vlBmC.', 'guard20@gmail.com', '', '', '', '', 'guard', 'active', NULL);

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
  ADD KEY `Employee_ID` (`Employee_ID`),
  ADD KEY `Shift_ID` (`Shift_ID`);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`ID_Role`);

--
-- Indexes for table `shift`
--
ALTER TABLE `shift`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `unique_shift` (`Date`,`Location`,`ShiftType`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=321;

--
-- AUTO_INCREMENT for table `employee_notifications`
--
ALTER TABLE `employee_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `employee_requests`
--
ALTER TABLE `employee_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `employee_shift_assignment`
--
ALTER TABLE `employee_shift_assignment`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1812;

--
-- AUTO_INCREMENT for table `guests`
--
ALTER TABLE `guests`
  MODIFY `GuestID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `incident`
--
ALTER TABLE `incident`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `shift`
--
ALTER TABLE `shift`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2213;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

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
  ADD CONSTRAINT `employee_shift_assignment_ibfk_2` FOREIGN KEY (`Shift_ID`) REFERENCES `shift` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
