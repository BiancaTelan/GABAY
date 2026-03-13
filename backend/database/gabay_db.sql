-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: gabay_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointmentstatustable`
--

DROP TABLE IF EXISTS `appointmentstatustable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointmentstatustable` (
  `statusID` int unsigned NOT NULL AUTO_INCREMENT,
  `statusName` varchar(50) NOT NULL,
  `statusColor` varchar(7) NOT NULL DEFAULT '#FFFFFF',
  PRIMARY KEY (`statusID`),
  UNIQUE KEY `statusName` (`statusName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointmentstatustable`
--

LOCK TABLES `appointmentstatustable` WRITE;
/*!40000 ALTER TABLE `appointmentstatustable` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointmentstatustable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointmenttable`
--

DROP TABLE IF EXISTS `appointmenttable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointmenttable` (
  `appointmentID` int unsigned NOT NULL AUTO_INCREMENT,
  `patientID` int unsigned NOT NULL,
  `docID` int unsigned DEFAULT NULL,
  `deptID` int unsigned NOT NULL,
  `assignedScheduleID` int unsigned DEFAULT NULL,
  `statusID` int unsigned NOT NULL,
  `purposeDetailed` text,
  `type` varchar(50) DEFAULT NULL,
  `referral_doc` varchar(100) DEFAULT NULL,
  `isNewPatient` tinyint(1) DEFAULT '1',
  `preferredDate` date NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointmentID`),
  KEY `patientID` (`patientID`),
  KEY `docID` (`docID`),
  KEY `deptID` (`deptID`),
  KEY `assignedScheduleID` (`assignedScheduleID`),
  KEY `statusID` (`statusID`),
  CONSTRAINT `appointmenttable_ibfk_1` FOREIGN KEY (`patientID`) REFERENCES `patienttable` (`patientID`) ON DELETE RESTRICT,
  CONSTRAINT `appointmenttable_ibfk_2` FOREIGN KEY (`docID`) REFERENCES `doctortable` (`docID`) ON DELETE SET NULL,
  CONSTRAINT `appointmenttable_ibfk_3` FOREIGN KEY (`deptID`) REFERENCES `departmenttable` (`deptID`) ON DELETE RESTRICT,
  CONSTRAINT `appointmenttable_ibfk_4` FOREIGN KEY (`assignedScheduleID`) REFERENCES `scheduletable` (`scheduleID`) ON DELETE SET NULL,
  CONSTRAINT `appointmenttable_ibfk_5` FOREIGN KEY (`statusID`) REFERENCES `appointmentstatustable` (`statusID`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointmenttable`
--

LOCK TABLES `appointmenttable` WRITE;
/*!40000 ALTER TABLE `appointmenttable` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointmenttable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dailyqueuetable`
--

DROP TABLE IF EXISTS `dailyqueuetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dailyqueuetable` (
  `queueID` int unsigned NOT NULL AUTO_INCREMENT,
  `appointmentID` int unsigned NOT NULL,
  `queueNum` int unsigned NOT NULL,
  `status` enum('Waiting','In Progress','Completed','Missed') DEFAULT 'Waiting',
  `checkInTime` datetime DEFAULT NULL,
  `consultationStart` datetime DEFAULT NULL,
  `consultationEnd` datetime DEFAULT NULL,
  PRIMARY KEY (`queueID`),
  UNIQUE KEY `appointmentID` (`appointmentID`),
  CONSTRAINT `dailyqueuetable_ibfk_1` FOREIGN KEY (`appointmentID`) REFERENCES `appointmenttable` (`appointmentID`) ON DELETE CASCADE,
  CONSTRAINT `chk_consult_times` CHECK ((`consultationStart` < `consultationEnd`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dailyqueuetable`
--

LOCK TABLES `dailyqueuetable` WRITE;
/*!40000 ALTER TABLE `dailyqueuetable` DISABLE KEYS */;
/*!40000 ALTER TABLE `dailyqueuetable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departmenttable`
--

DROP TABLE IF EXISTS `departmenttable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departmenttable` (
  `deptID` int unsigned NOT NULL AUTO_INCREMENT,
  `department` varchar(100) NOT NULL,
  `referral_only` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`deptID`),
  UNIQUE KEY `department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departmenttable`
--

LOCK TABLES `departmenttable` WRITE;
/*!40000 ALTER TABLE `departmenttable` DISABLE KEYS */;
/*!40000 ALTER TABLE `departmenttable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctortable`
--

DROP TABLE IF EXISTS `doctortable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctortable` (
  `docID` int unsigned NOT NULL AUTO_INCREMENT,
  `deptID` int unsigned DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`docID`),
  KEY `deptID` (`deptID`),
  CONSTRAINT `doctortable_ibfk_1` FOREIGN KEY (`deptID`) REFERENCES `departmenttable` (`deptID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctortable`
--

LOCK TABLES `doctortable` WRITE;
/*!40000 ALTER TABLE `doctortable` DISABLE KEYS */;
/*!40000 ALTER TABLE `doctortable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patienttable`
--

DROP TABLE IF EXISTS `patienttable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patienttable` (
  `patientID` int unsigned NOT NULL AUTO_INCREMENT,
  `userID` int unsigned DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `middlename` varchar(100) DEFAULT NULL,
  `surname` varchar(100) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `birthDate` date NOT NULL,
  `address` text,
  `hospital_num` varchar(50) DEFAULT NULL,
  `hasPreviousRecord` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`patientID`),
  UNIQUE KEY `userID` (`userID`),
  UNIQUE KEY `hospital_num` (`hospital_num`),
  CONSTRAINT `patienttable_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patienttable`
--

LOCK TABLES `patienttable` WRITE;
/*!40000 ALTER TABLE `patienttable` DISABLE KEYS */;
/*!40000 ALTER TABLE `patienttable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduletable`
--

DROP TABLE IF EXISTS `scheduletable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduletable` (
  `scheduleID` int unsigned NOT NULL AUTO_INCREMENT,
  `docID` int unsigned NOT NULL,
  `WeekDay` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `maxPatients` int unsigned NOT NULL,
  `current_patientCNT` int unsigned DEFAULT '0',
  PRIMARY KEY (`scheduleID`),
  KEY `docID` (`docID`),
  CONSTRAINT `scheduletable_ibfk_1` FOREIGN KEY (`docID`) REFERENCES `doctortable` (`docID`) ON DELETE CASCADE,
  CONSTRAINT `chk_max_patients` CHECK ((`maxPatients` > 0)),
  CONSTRAINT `chk_patients` CHECK ((`current_patientCNT` <= `maxPatients`)),
  CONSTRAINT `chk_time` CHECK ((`startTime` < `endTime`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduletable`
--

LOCK TABLES `scheduletable` WRITE;
/*!40000 ALTER TABLE `scheduletable` DISABLE KEYS */;
/*!40000 ALTER TABLE `scheduletable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stafftable`
--

DROP TABLE IF EXISTS `stafftable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stafftable` (
  `staffID` int unsigned NOT NULL AUTO_INCREMENT,
  `userID` int unsigned DEFAULT NULL,
  `deptID` int unsigned DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `position` varchar(100) NOT NULL,
  PRIMARY KEY (`staffID`),
  UNIQUE KEY `userID` (`userID`),
  KEY `deptID` (`deptID`),
  CONSTRAINT `stafftable_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE RESTRICT,
  CONSTRAINT `stafftable_ibfk_2` FOREIGN KEY (`deptID`) REFERENCES `departmenttable` (`deptID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stafftable`
--

LOCK TABLES `stafftable` WRITE;
/*!40000 ALTER TABLE `stafftable` DISABLE KEYS */;
/*!40000 ALTER TABLE `stafftable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `systemlogstable`
--

DROP TABLE IF EXISTS `systemlogstable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemlogstable` (
  `logID` int unsigned NOT NULL AUTO_INCREMENT,
  `userID` int unsigned DEFAULT NULL,
  `tableAffected` varchar(50) NOT NULL,
  `actionType` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `details` text,
  PRIMARY KEY (`logID`),
  KEY `userID` (`userID`),
  CONSTRAINT `systemlogstable_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemlogstable`
--

LOCK TABLES `systemlogstable` WRITE;
/*!40000 ALTER TABLE `systemlogstable` DISABLE KEYS */;
/*!40000 ALTER TABLE `systemlogstable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertable`
--

DROP TABLE IF EXISTS `usertable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usertable` (
  `userID` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('Admin','Doctor','Staff','Patient') NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdDate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `chk_email` CHECK ((`email` like _utf8mb4'%_@__%.__%'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertable`
--

LOCK TABLES `usertable` WRITE;
/*!40000 ALTER TABLE `usertable` DISABLE KEYS */;
/*!40000 ALTER TABLE `usertable` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-10  9:47:45
