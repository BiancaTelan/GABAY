-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: gabay_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointmentstatustable`
--

LOCK TABLES `appointmentstatustable` WRITE;
/*!40000 ALTER TABLE `appointmentstatustable` DISABLE KEYS */;
INSERT INTO `appointmentstatustable` VALUES (1,'Pending','#33AFAE'),(2,'Confirmed','#59CF6E'),(3,'Cancelled','#D13C3C'),(4,'Denied','#9B2D2D'),(5,'Approved','#59CF6A'),(6,'Reschedule','#33AF5E'),(7,'Book','#59CF6B'),(8,'No Show','#9B2D2D');
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
  `assignedDate` date DEFAULT NULL,
  `statusID` int NOT NULL,
  `purposeDetailed` text,
  `type` varchar(50) DEFAULT NULL,
  `hasPreviousRecord` tinyint(1) DEFAULT '0',
  `referral_doc` varchar(100) DEFAULT NULL,
  `preferredStartDate` date NOT NULL,
  `preferredEndDate` date DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT (now()),
  `actionBy_userID` int DEFAULT NULL,
  `actionReason` text,
  `actionDate` datetime DEFAULT NULL,
  PRIMARY KEY (`appointmentID`),
  KEY `docID` (`docID`),
  KEY `deptID` (`deptID`),
  KEY `assignedScheduleID` (`assignedScheduleID`),
  KEY `statusID` (`statusID`),
  KEY `fk_patient_appointment` (`patientID`),
  KEY `actionBy_userID` (`actionBy_userID`),
  CONSTRAINT `appointmenttable_ibfk_2` FOREIGN KEY (`docID`) REFERENCES `doctortable` (`docID`) ON DELETE SET NULL,
  CONSTRAINT `appointmenttable_ibfk_3` FOREIGN KEY (`deptID`) REFERENCES `departmenttable` (`deptID`) ON DELETE RESTRICT,
  CONSTRAINT `appointmenttable_ibfk_4` FOREIGN KEY (`assignedScheduleID`) REFERENCES `scheduletable` (`scheduleID`) ON DELETE SET NULL,
  CONSTRAINT `appointmenttable_ibfk_5` FOREIGN KEY (`statusID`) REFERENCES `appointmentstatustable` (`statusID`) ON DELETE RESTRICT,
  CONSTRAINT `appointmenttable_ibfk_6` FOREIGN KEY (`actionBy_userID`) REFERENCES `usertable` (`userID`) ON DELETE SET NULL,
  CONSTRAINT `fk_patient_appointment` FOREIGN KEY (`patientID`) REFERENCES `patienttable` (`patientID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointmenttable`
--

LOCK TABLES `appointmenttable` WRITE;
/*!40000 ALTER TABLE `appointmenttable` DISABLE KEYS */;
INSERT INTO `appointmenttable` VALUES (1,6,5,3,NULL,NULL,5,'Severe cough','General',1,NULL,'2026-03-25','2026-03-31','2026-03-15 13:34:33',10,NULL,'2026-04-13 02:36:04'),(2,6,11,19,NULL,NULL,5,'need surgery','Specialty',1,'uploads/referrals\\26-000001_1773553370_Ran 1.jpg','2026-03-25','2026-03-31','2026-03-15 13:42:50',NULL,NULL,NULL),(3,6,28,5,NULL,NULL,3,'May ubo','General',1,NULL,'2026-03-18','2026-03-23','2026-03-16 13:00:26',NULL,NULL,NULL),(4,6,24,25,8,'2026-05-06',2,'Need ','Specialty',1,'uploads/referrals\\26-000001_1773637401_Ran 1.jpg','2026-03-24','2026-03-25','2026-03-16 13:03:21',NULL,NULL,NULL),(5,6,4,3,NULL,NULL,1,'severe cough','Specialty',1,'uploads/referrals\\26-000001_1773637401_Ran 1.jpg','2026-04-15','2026-04-16','2026-04-02 12:09:00',NULL,NULL,NULL),(13,6,24,25,8,'2026-05-27',6,'MM',NULL,0,NULL,'2026-05-29','2026-05-29','2026-05-04 04:30:49',22,'Rescheduled: Need','2026-05-04 16:58:19'),(14,6,24,25,9,'2026-05-29',6,'MM',NULL,0,NULL,'2026-05-27','2026-05-27','2026-05-04 04:30:59',NULL,NULL,NULL),(15,6,24,25,10,'2026-05-23',6,'MM',NULL,0,NULL,'2026-05-27','2026-05-27','2026-05-04 04:31:08',NULL,NULL,NULL),(16,6,24,25,8,'2026-05-27',2,'MM',NULL,0,NULL,'2026-05-27','2026-05-27','2026-05-04 04:34:47',NULL,NULL,NULL);
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
  `slotCapacity` int NOT NULL DEFAULT '25',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`deptID`),
  UNIQUE KEY `department` (`department`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departmenttable`
--

LOCK TABLES `departmenttable` WRITE;
/*!40000 ALTER TABLE `departmenttable` DISABLE KEYS */;
INSERT INTO `departmenttable` VALUES (2,'General Internal Medicine','general',25,1),(3,'General Pediatrics','general',25,1),(4,'General Dentistry','general',25,1),(5,'General Medicine','general',25,1),(6,'General Surgery','general',25,1),(16,'Pediatric Nephrology','specialty',25,1),(17,'Pediatric Neurology','specialty',25,1),(18,'Pediatric Cardiology','specialty',25,1),(19,'Otorhinolaryngology (ENT)','specialty',25,1),(20,'Adult Psychiatry','specialty',25,1),(21,'IM - Pulmonology','specialty',25,1),(22,'IM - Cardiology','specialty',25,1),(23,'IM - Vascular Cardiology','specialty',25,1),(24,'IM - Nephrology','specialty',25,1),(25,'IM - Rheumatology','Specialty',25,1),(26,'Adult Neurology','Specialty',20,1),(27,'Dermatology','specialty',25,1),(28,'Restorative Dentistry','specialty',25,1);
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
INSERT INTO `doctortable` VALUES (1,2,'Ritchie','Cruz',1),(2,2,'Diane Marie','Mendoza',1),(3,2,'Glenn','Tomas',1),(4,3,'Jamie Rose','Orlina',1),(5,3,'Ernesto','Santiago',1),(6,3,'Jexel','Bautista',1),(7,3,'Racquel','Cruz',1),(8,16,'John Paul','Ancheta',1),(9,18,'Ma. Jasmine','Ruiz',1),(10,19,'Khristine','Girardo-Pizarro',1),(11,19,'Peter Simon','Jarin',1),(12,27,'Raul','Kimpo',1),(13,20,'Mariano','Gagui',1),(14,20,'Charitel','Gongora',1),(15,28,'Girlie','Nieto',1),(16,4,'Ester','German',1),(17,4,'Princess Mira','Gulmatico',1),(18,24,'Ma. Antonieta','Dial',1),(19,24,'Pamela','Tan-Lim',1),(20,26,'Manuelito','Baredo',1),(21,26,'Dennis','Naval',1),(22,26,'Karisse','Abril',1),(23,22,'Vinhcent','Sandoval',1),(24,25,'Sheila Marie','Reyes',1),(25,21,'Marie Grace','Cal',1),(26,26,'Adelina','Paule',1),(27,5,'Monechelle','Sierra',1),(28,5,'Marcelo','Cruz',1),(29,6,'Erwin Carlo','Culangen',1),(30,6,'Rocco Carmine','Paragas',1),(31,6,'John Vincent','Advincula',1),(32,6,'Joalzon','Tolentino',1),(33,6,'Louvencio','Villarena',1);
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
  CONSTRAINT `fk_user_patient` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patienttable`
--

LOCK TABLES `patienttable` WRITE;
/*!40000 ALTER TABLE `patienttable` DISABLE KEYS */;
INSERT INTO `patienttable` VALUES (6,6,'Cess',NULL,'Mariocep',NULL,'1997-01-07','RIzal','26-000001','09952098991','Female','Shebuya Krosing','09956398874','shebuya1@gmail.com');
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
  PRIMARY KEY (`scheduleID`),
  KEY `docID` (`docID`),
  CONSTRAINT `scheduletable_ibfk_1` FOREIGN KEY (`docID`) REFERENCES `doctortable` (`docID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scheduletable`
--

LOCK TABLES `scheduletable` WRITE;
/*!40000 ALTER TABLE `scheduletable` DISABLE KEYS */;
INSERT INTO `scheduletable` VALUES (3,26,'Tuesday','12:00:00','17:00:00',20),(4,26,'Thursday','12:00:00','17:00:00',20),(5,26,'Saturday','12:00:00','17:00:00',20),(8,24,'Monday','08:00:00','17:00:00',20),(9,24,'Friday','08:00:00','17:00:00',20),(10,24,'Saturday','08:00:00','17:00:00',20),(11,1,'Tuesday','08:00:00','14:00:00',20),(13,1,'Thursday','08:00:00','14:00:00',20);
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
  `gender` varchar(10) DEFAULT NULL,
  `contactNumber` varchar(15) DEFAULT NULL,
  `workingDays` varchar(50) DEFAULT NULL,
  `workingHours` varchar(50) DEFAULT NULL,
  `profilePhoto` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `address` text,
  PRIMARY KEY (`staffID`),
  UNIQUE KEY `userID` (`userID`),
  KEY `deptID` (`deptID`),
  CONSTRAINT `stafftable_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE RESTRICT,
  CONSTRAINT `stafftable_ibfk_2` FOREIGN KEY (`deptID`) REFERENCES `departmenttable` (`deptID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stafftable`
--

LOCK TABLES `stafftable` WRITE;
/*!40000 ALTER TABLE `stafftable` DISABLE KEYS */;
INSERT INTO `stafftable` VALUES (1,10,NULL,'System','Admin','Admin','Female','09958033571','M, T, W, TH, F','8:00 AM - 5:00 PM','http://127.0.0.1:8000/uploads/69721437a66c48989a2990b930682d0c.jpg','1997-03-05','','Morong, Rizal'),(3,22,25,'Maria','Li','IT ','Female','09952098991','M, T, W, TH, F','8:00 AM - 5:00 PM','http://127.0.0.1:8000/uploads/69721437a66c48989a2990b930682d0c.jpg','1996-03-05','I','Morong, Rizal');
/*!40000 ALTER TABLE `stafftable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `systemhealthlogtable`
--

DROP TABLE IF EXISTS `systemhealthlogtable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemhealthlogtable` (
  `logID` int NOT NULL AUTO_INCREMENT,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `issueType` varchar(50) NOT NULL,
  `module` varchar(100) NOT NULL,
  `priority` varchar(20) NOT NULL,
  `description` text NOT NULL,
  `recommendedAction` text NOT NULL,
  PRIMARY KEY (`logID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemhealthlogtable`
--

LOCK TABLES `systemhealthlogtable` WRITE;
/*!40000 ALTER TABLE `systemhealthlogtable` DISABLE KEYS */;
/*!40000 ALTER TABLE `systemhealthlogtable` ENABLE KEYS */;
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
  `actionType` enum('INSERT','UPDATE','DELETE','LOGIN','LOGOUT','APPROVE','RESCHEDULE','DENY','BOOK') NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT (now()),
  `details` text,
  `ipAddress` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`logID`),
  KEY `userID` (`userID`),
  CONSTRAINT `systemlogtable_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `usertable` (`userID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemlogtable`
--

LOCK TABLES `systemlogtable` WRITE;
/*!40000 ALTER TABLE `systemlogtable` DISABLE KEYS */;
INSERT INTO `systemlogtable` VALUES (1,10,'userTable','INSERT','2026-04-12 21:20:25','Created Admin account: Marinel Li','127.0.0.1'),(2,10,'userTable/staffTable','UPDATE','2026-04-12 21:23:38','Updated profile for: Rei Turano (Status: Active)','127.0.0.1'),(3,10,'userTable/staffTable','UPDATE','2026-04-12 22:09:50','Updated profile for: System Admin (Status: Active)','127.0.0.1'),(4,10,'staffTable','UPDATE','2026-04-12 22:55:32','Updated assignment/schedule for: Marinel Li','127.0.0.1'),(5,10,'staffTable','UPDATE','2026-04-12 23:00:05','Updated assignment/schedule for: Marinel Li','127.0.0.1'),(6,10,'staffTable','UPDATE','2026-04-12 23:00:21','Updated assignment/schedule for: Marinel Li','127.0.0.1'),(7,10,'doctorTable','UPDATE','2026-04-13 00:12:22','Updated assignment/profile for: Dr. Dr. Adelina Paule','127.0.0.1'),(8,10,'doctorTable','UPDATE','2026-04-13 00:26:46','Updated assignment/profile for: Dr. Dr. Adelina Paule','127.0.0.1'),(9,10,'staffTable','UPDATE','2026-04-13 00:27:39','Updated assignment/profile for: Rei Turano','127.0.0.1'),(10,10,'staffTable','UPDATE','2026-04-13 00:27:55','Updated assignment/profile for: Rei Turano','127.0.0.1'),(11,10,'staffTable','UPDATE','2026-04-13 00:28:18','Updated assignment/profile for: Rei Turano','127.0.0.1'),(12,10,'departmentTable/scheduleTable','UPDATE','2026-04-13 01:12:04','Updated department: Adult Neurology (Capacity: 24)','127.0.0.1'),(13,10,'appointmentTable','APPROVE','2026-04-13 02:36:03','Marked Appointment #1 as Approved','127.0.0.1'),(14,21,'staffTable','UPDATE','2026-04-13 03:40:11','Updated personal account profile','127.0.0.1'),(15,21,'staffTable','UPDATE','2026-04-13 03:53:25','Updated personal account profile','127.0.0.1'),(16,21,'staffTable','UPDATE','2026-04-13 14:42:51','Updated personal account profile','127.0.0.1'),(17,21,'staffTable','UPDATE','2026-04-13 14:52:40','Updated personal account profile','127.0.0.1'),(18,21,'staffTable','UPDATE','2026-04-13 14:53:04','Updated personal account profile','127.0.0.1'),(19,21,'staffTable','UPDATE','2026-04-13 15:01:42','Updated personal account profile','127.0.0.1'),(20,21,'userTable','UPDATE','2026-04-13 15:17:34','Personnel updated their login email','127.0.0.1'),(21,21,'userTable','UPDATE','2026-04-13 15:24:02','Personnel updated their login password','127.0.0.1'),(22,21,'staffTable','UPDATE','2026-04-13 15:24:08','Updated personal account profile','127.0.0.1'),(23,10,'staffTable','UPDATE','2026-05-03 20:54:05','Updated personal account profile','127.0.0.1'),(24,22,'appointmentTable','APPROVE','2026-05-03 23:12:44','Approved appointment #2 for Patient ID 6','127.0.0.1'),(25,10,'doctorTable','UPDATE','2026-05-04 00:09:32','Updated assignment/profile for: Dr. Dr. Adelina Paule','127.0.0.1'),(26,10,'doctorTable','UPDATE','2026-05-04 00:30:14','Updated assignment/profile for: Dr. Dr. Sheila Marie Reyes','127.0.0.1'),(27,10,'doctorTable','UPDATE','2026-05-04 00:30:54','Updated assignment/profile for: Dr. Dr. Sheila Marie Reyes','127.0.0.1'),(28,22,'appointmentTable','APPROVE','2026-05-04 01:54:25','Approved appointment #4 for 2026-05-08 (Template: Friday)','127.0.0.1'),(29,22,'appointmentTable','APPROVE','2026-05-04 02:42:18','Approved appointment #4 for 2026-05-06 (Template: Wednesday)','127.0.0.1'),(30,22,'appointmentTable','APPROVE','2026-05-04 02:48:44','Approved appointment #4 for 2026-05-06 (Template: Wednesday)','127.0.0.1'),(31,22,'appointmentTable','APPROVE','2026-05-04 02:52:46','Approved appointment #4 for 2026-05-06 (Template: Wednesday)','127.0.0.1'),(32,22,'appointmentTable','APPROVE','2026-05-04 02:57:59','Approved appointment #4 for 2026-05-08 (Template: Friday)','127.0.0.1'),(33,22,'appointmentTable','APPROVE','2026-05-04 03:01:33','Approved appointment #4 for 2026-05-06 (Template: Wednesday)','127.0.0.1'),(34,22,'appointmentTable','BOOK','2026-05-04 04:30:49','Staff booked appointment for Patient 26-000001 on 2026-05-29',NULL),(35,22,'appointmentTable','BOOK','2026-05-04 04:30:59','Staff booked appointment for Patient 26-000001 on 2026-05-27',NULL),(36,22,'appointmentTable','BOOK','2026-05-04 04:31:08','Staff booked appointment for Patient 26-000001 on 2026-05-27',NULL),(37,22,'appointmentTable','BOOK','2026-05-04 04:34:47','Staff booked appointment for Patient 26-000001 on 2026-05-27',NULL),(38,22,'appointmentTable','UPDATE','2026-05-04 14:21:16','Staff rescheduled appointment 14 to 2026-05-29. Reason: Need for another patient',NULL),(39,22,'appointmentTable','UPDATE','2026-05-04 15:42:30','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(40,22,'appointmentTable','UPDATE','2026-05-04 15:42:32','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(41,22,'appointmentTable','UPDATE','2026-05-04 15:44:41','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(42,22,'appointmentTable','UPDATE','2026-05-04 15:46:54','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(43,22,'appointmentTable','UPDATE','2026-05-04 15:46:55','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(44,22,'appointmentTable','UPDATE','2026-05-04 15:46:56','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(45,22,'appointmentTable','UPDATE','2026-05-04 15:46:57','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(46,22,'appointmentTable','UPDATE','2026-05-04 15:46:58','Staff manually pushed a confirmation reminder to patient for appointment #16','127.0.0.1'),(47,22,'appointmentTable','UPDATE','2026-05-04 15:47:08','Staff manually pushed a confirmation reminder to patient for appointment #4','127.0.0.1'),(48,22,'appointmentTable','UPDATE','2026-05-04 15:55:08','Staff rescheduled appointment 15 to 2026-05-23. Reason: Need',NULL),(49,22,'appointmentTable','UPDATE','2026-05-04 16:58:19','Staff rescheduled appointment 13 to 2026-05-27. Reason: Need',NULL),(50,22,'scheduleTable','INSERT','2026-05-04 18:01:54','Staff added new schedule blocks for Dr. Cruz','127.0.0.1'),(51,22,'scheduleTable','INSERT','2026-05-04 18:02:08','Staff added new schedule blocks for Dr. Cruz','127.0.0.1'),(52,22,'scheduleTable','DELETE','2026-05-04 18:11:13','Staff deleted schedule #12','127.0.0.1'),(53,22,'scheduleTable','UPDATE','2026-05-04 22:08:17','Staff updated schedule #8','127.0.0.1'),(54,10,'departmentTable/scheduleTable','UPDATE','2026-05-04 22:15:50','Updated department: Adult Neurology (Capacity: 20)','127.0.0.1'),(55,10,'departmentTable/scheduleTable','UPDATE','2026-05-04 22:16:46','Updated department: IM - Rheumatology (Capacity: 20)','127.0.0.1'),(56,10,'departmentTable/scheduleTable','UPDATE','2026-05-04 22:17:09','Updated department: IM - Rheumatology (Capacity: 25)','127.0.0.1');
/*!40000 ALTER TABLE `systemlogtable` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `systemsettingstable`
--

DROP TABLE IF EXISTS `systemsettingstable`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systemsettingstable` (
  `settingID` int NOT NULL AUTO_INCREMENT,
  `startTime` varchar(20) NOT NULL,
  `endTime` varchar(20) NOT NULL,
  `retentionValue` varchar(10) NOT NULL,
  `retentionUnit` varchar(20) NOT NULL,
  `autoBackup` tinyint(1) NOT NULL,
  `backupFrequency` varchar(50) NOT NULL,
  `backupTime` varchar(20) NOT NULL,
  `maintenanceMode` tinyint(1) NOT NULL,
  `downtimeReason` varchar(100) NOT NULL,
  `resumeTimer` varchar(20) NOT NULL,
  PRIMARY KEY (`settingID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systemsettingstable`
--

LOCK TABLES `systemsettingstable` WRITE;
/*!40000 ALTER TABLE `systemsettingstable` DISABLE KEYS */;
INSERT INTO `systemsettingstable` VALUES (1,'08:00 AM','05:00 PM','3','years',0,'Weekly','12:00 AM',0,'Maintenance Mode','60');
/*!40000 ALTER TABLE `systemsettingstable` ENABLE KEYS */;
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
  `is_verified` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`userID`),
  UNIQUE KEY `ix_userTable_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertable`
--

LOCK TABLES `usertable` WRITE;
/*!40000 ALTER TABLE `usertable` DISABLE KEYS */;
INSERT INTO `usertable` VALUES (6,'mmm@gmail.com','$2b$12$5V/5EzmwP0TBsnQC//5e8eV0vkpWcS4a4X0VgjOYb/j9plpHLEcHi','Patient',1,'2026-03-11 14:52:49',0),(10,'admin@gabay.com','$2b$12$hxLqfRwrmv2EscDcI.h8RuiQSg669Sz.izPKFZ0OICa8KtCaFwGta','Admin',1,'2026-04-07 16:20:04',1),(21,'trixiabautista09@gmail.com','$2b$12$KCrQUn0bQbEATq4GBusDtu1OW4XU4jOub3GvEPoRPSlXroZRjd0pW','Admin',1,'2026-04-12 21:20:25',1),(22,'turano.educ@gmail.com','$2b$12$hxLqfRwrmv2EscDcI.h8RuiQSg669Sz.izPKFZ0OICa8KtCaFwGta','Staff',1,'2026-04-15 10:14:38',1);
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

-- Dump completed on 2026-05-05  0:34:34
