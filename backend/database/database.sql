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
  `statusID` int NOT NULL AUTO_INCREMENT,
  `statusName` varchar(50) NOT NULL,
  `statusColor` varchar(7) NOT NULL,
  PRIMARY KEY (`statusID`),
  UNIQUE KEY `statusName` (`statusName`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointmentstatustable`
--

LOCK TABLES `appointmentstatustable` WRITE;
/*!40000 ALTER TABLE `appointmentstatustable` DISABLE KEYS */;
INSERT INTO `appointmentstatustable` VALUES (1,'Pending','#33AFAE'),(2,'Confirmed','#59CF6E'),(3,'Cancelled','#D13C3C'),(4,'Denied','#9B2D2D');
/*!40000 ALTER TABLE `appointmentstatustable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointmenttable`
--

DROP TABLE IF EXISTS `appointmenttable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointmenttable` (
  `appointmentID` int NOT NULL AUTO_INCREMENT,
  `patientID` int NOT NULL,
  `docID` int DEFAULT NULL,
  `deptID` int NOT NULL,
  `assignedScheduleID` int DEFAULT NULL,
  `statusID` int NOT NULL,
  `purposeDetailed` text,
  `type` varchar(50) DEFAULT NULL,
  `hasPreviousRecord` tinyint(1) DEFAULT '0',
  `referral_doc` varchar(100) DEFAULT NULL,
  `preferredStartDate` date NOT NULL,
  `preferredEndDate` date DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT (now()),
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointmenttable`
--

LOCK TABLES `appointmenttable` WRITE;
/*!40000 ALTER TABLE `appointmenttable` DISABLE KEYS */;
INSERT INTO `appointmenttable` VALUES (1,6,5,3,NULL,1,'Severe cough','General',1,NULL,'2026-03-25','2026-03-31','2026-03-15 13:34:33'),(2,6,11,19,NULL,1,'need surgery','Specialty',1,'uploads/referrals\\26-000001_1773553370_Ran 1.jpg','2026-03-25','2026-03-31','2026-03-15 13:42:50');
/*!40000 ALTER TABLE `appointmenttable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dailyqueuetable`
--

DROP TABLE IF EXISTS `dailyqueuetable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dailyqueuetable` (
  `queueID` int NOT NULL AUTO_INCREMENT,
  `appointmentID` int NOT NULL,
  `queueNum` int NOT NULL,
  `queueStatus` enum('Waiting','inProgress','Completed','noShow') NOT NULL,
  `checkInTime` datetime DEFAULT NULL,
  `consultationStart` datetime DEFAULT NULL,
  `consultationEnd` datetime DEFAULT NULL,
  PRIMARY KEY (`queueID`),
  UNIQUE KEY `appointmentID` (`appointmentID`),
  CONSTRAINT `dailyqueuetable_ibfk_1` FOREIGN KEY (`appointmentID`) REFERENCES `appointmenttable` (`appointmentID`) ON DELETE CASCADE
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
  `deptID` int NOT NULL AUTO_INCREMENT,
  `department` varchar(100) NOT NULL,
  `type` varchar(50) NOT NULL,
  PRIMARY KEY (`deptID`),
  UNIQUE KEY `department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departmenttable`
--

LOCK TABLES `departmenttable` WRITE;
/*!40000 ALTER TABLE `departmenttable` DISABLE KEYS */;
INSERT INTO `departmenttable` VALUES (2,'General Internal Medicine','general'),(3,'General Pediatrics','general'),(4,'General Dentistry','general'),(5,'General Medicine','general'),(6,'General Surgery','general'),(16,'Pediatric Nephrology','specialty'),(17,'Pediatric Neurology','specialty'),(18,'Pediatric Cardiology','specialty'),(19,'Otorhinolaryngology (ENT)','specialty'),(20,'Adult Psychiatry','specialty'),(21,'IM - Pulmonology','specialty'),(22,'IM - Cardiology','specialty'),(23,'IM - Vascular Cardiology','specialty'),(24,'IM - Nephrology','specialty'),(25,'IM - Rheumatology','specialty'),(26,'Adult Neurology','specialty'),(27,'Dermatology','specialty'),(28,'Restorative Dentistry','specialty');
/*!40000 ALTER TABLE `departmenttable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctortable`
--

DROP TABLE IF EXISTS `doctortable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctortable` (
  `docID` int NOT NULL AUTO_INCREMENT,
  `deptID` int DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `isAvailable` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`docID`),
  KEY `deptID` (`deptID`),
  CONSTRAINT `doctortable_ibfk_1` FOREIGN KEY (`deptID`) REFERENCES `departmenttable` (`deptID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctortable`
--

LOCK TABLES `doctortable` WRITE;
/*!40000 ALTER TABLE `doctortable` DISABLE KEYS */;
INSERT INTO `doctortable` VALUES (1,2,'Dr. Ritchie','Cruz',1),(2,2,'Dr. Diane Marie','Mendoza',1),(3,2,'Dr. Glenn','Tomas',1),(4,3,'Dr. Jamie Rose','Orlina',1),(5,3,'Dr. Ernesto','Santiago',1),(6,3,'Dr. Jexel','Bautista',1),(7,3,'Dr. Racquel','Cruz',1),(8,16,'Dr. John Paul','Ancheta',1),(9,18,'Dr. Ma. Jasmine','Ruiz',1),(10,19,'Dr. Khristine','Girardo-Pizarro',1),(11,19,'Dr. Peter Simon','Jarin',1),(12,27,'Dr. Raul','Kimpo',1),(13,20,'Dr. Mariano','Gagui',1),(14,20,'Dr. Charitel','Gongora',1),(15,28,'Dr. Girlie','Nieto',1),(16,4,'Dr. Ester','German',1),(17,4,'Dr. Princess Mira','Gulmatico',1),(18,24,'Dr. Ma. Antonieta','Dial',1),(19,24,'Dr. Pamela','Tan-Lim',1),(20,26,'Dr. Manuelito','Baredo',1),(21,26,'Dr. Dennis','Naval',1),(22,26,'Dr. Karisse','Abril',1),(23,22,'Dr. Vinhcent','Sandoval',1),(24,25,'Dr. Sheila Marie','Reyes',1),(25,21,'Dr. Marie Grace','Cal',1),(26,23,'Dr. Adelina','Paule',1),(27,5,'Dr. Monechelle','Sierra',1),(28,5,'Dr. Marcelo','Cruz',1),(29,6,'Dr. Erwin Carlo','Culangen',1),(30,6,'Dr. Rocco Carmine','Paragas',1),(31,6,'Dr. John Vincent','Advincula',1),(32,6,'Dr. Joalzon','Tolentino',1),(33,6,'Dr. Louvencio','Villarena',1);
/*!40000 ALTER TABLE `doctortable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patienttable`
--

DROP TABLE IF EXISTS `patienttable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patienttable` (
  `patientID` int NOT NULL AUTO_INCREMENT,
  `userID` int DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `middlename` varchar(100) DEFAULT NULL,
  `surname` varchar(100) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `address` text,
  `hospital_num` varchar(50) DEFAULT NULL,
  `contactNumber` varchar(15) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `emergencyContact` varchar(100) DEFAULT NULL,
  `emergencyContactNum` varchar(15) DEFAULT NULL,
  `emergencyEmail` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`patientID`),
  UNIQUE KEY `userID` (`userID`),
  UNIQUE KEY `hospital_num` (`hospital_num`),
  CONSTRAINT `patienttable_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patienttable`
--

LOCK TABLES `patienttable` WRITE;
/*!40000 ALTER TABLE `patienttable` DISABLE KEYS */;
INSERT INTO `patienttable` VALUES (3,3,'Maria',NULL,'Turano',NULL,NULL,NULL,'26-00001',NULL,NULL,NULL,NULL,NULL),(4,4,'Ruiza',NULL,'Bautista',NULL,NULL,NULL,'26-00002',NULL,NULL,NULL,NULL,NULL),(6,6,'Cess',NULL,'Mariocep',NULL,'1997-01-07','RIzal','26-000001','09952098991','Female','Shebuya Krosing','09956398874','shebuya@gmail.com');
/*!40000 ALTER TABLE `patienttable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scheduletable`
--

DROP TABLE IF EXISTS `scheduletable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `scheduletable` (
  `scheduleID` int NOT NULL AUTO_INCREMENT,
  `docID` int NOT NULL,
  `weekDay` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `maxPatients` int NOT NULL,
  `current_patient` int NOT NULL,
  PRIMARY KEY (`scheduleID`),
  KEY `docID` (`docID`),
  CONSTRAINT `scheduletable_ibfk_1` FOREIGN KEY (`docID`) REFERENCES `doctortable` (`docID`) ON DELETE CASCADE
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
  `staffID` int NOT NULL AUTO_INCREMENT,
  `userID` int DEFAULT NULL,
  `deptID` int DEFAULT NULL,
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
-- Table structure for table `systemlogtable`
--

DROP TABLE IF EXISTS `systemlogtable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemlogtable` (
  `logID` int NOT NULL AUTO_INCREMENT,
  `userID` int DEFAULT NULL,
  `tableAffected` varchar(50) NOT NULL,
  `actionType` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT (now()),
  `details` text,
  PRIMARY KEY (`logID`),
  KEY `userID` (`userID`),
  CONSTRAINT `systemlogtable_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemlogtable`
--

LOCK TABLES `systemlogtable` WRITE;
/*!40000 ALTER TABLE `systemlogtable` DISABLE KEYS */;
/*!40000 ALTER TABLE `systemlogtable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertable`
--

DROP TABLE IF EXISTS `usertable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usertable` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `role` enum('Admin','Staff','Patient') NOT NULL,
  `isActive` tinyint(1) NOT NULL,
  `createdDate` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`userID`),
  UNIQUE KEY `ix_userTable_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertable`
--

LOCK TABLES `usertable` WRITE;
/*!40000 ALTER TABLE `usertable` DISABLE KEYS */;
INSERT INTO `usertable` VALUES (3,'miniemin.2118@gmail.com','$2b$12$Y4Xe0qaEcriyhonFsAlPPuHblEpxIstz1jrgbj82EPMuOnoZ.Udyi','Patient',1,'2026-03-11 13:29:36'),(4,'trixiabautista09@gmail.com','$2b$12$VwBnFEjgp76X21hfp1.N0./JY1pYsEZBvS9oa8FstpcKoQ/aX69/.','Patient',1,'2026-03-11 14:41:44'),(6,'mmm@gmail.com','$2b$12$5V/5EzmwP0TBsnQC//5e8eV0vkpWcS4a4X0VgjOYb/j9plpHLEcHi','Patient',1,'2026-03-11 14:52:49');
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

-- Dump completed on 2026-03-15 15:17:54
