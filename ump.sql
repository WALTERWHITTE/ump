-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: unifiedmessaging
-- ------------------------------------------------------
-- Server version	8.0.36

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
-- Table structure for table `clientdetails`
--

DROP TABLE IF EXISTS `clientdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientdetails` (
  `clientId` int NOT NULL AUTO_INCREMENT,
  `clientName` varchar(255) NOT NULL,
  `clientEmail` varchar(255) NOT NULL,
  `clientContact` bigint DEFAULT NULL,
  `clientDob` date DEFAULT NULL,
  `clientProfession` varchar(255) DEFAULT NULL,
  `familyId` int DEFAULT NULL,
  `familyHead` tinyint(1) DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `clientGender` enum('Male','Female') DEFAULT NULL,
  PRIMARY KEY (`clientId`),
  UNIQUE KEY `clientEmail` (`clientEmail`),
  KEY `fk_family_id` (`familyId`),
  CONSTRAINT `fk_family_id` FOREIGN KEY (`familyId`) REFERENCES `family` (`familyId`)
) ENGINE=InnoDB AUTO_INCREMENT=116 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientdetails`
--

LOCK TABLES `clientdetails` WRITE;
/*!40000 ALTER TABLE `clientdetails` DISABLE KEYS */;
INSERT INTO `clientdetails` VALUES (101,'John wick smith','abinavgs27@gmail.com',9876543210,'1980-06-14','Engineer',1,1,'2025-04-29 07:26:41','2025-05-05 08:45:31','Male'),(102,'Mary Smith','ironmanonlineminecraft@gmail.com',9876543211,'1982-08-20','Teacher',1,0,'2025-04-29 07:26:58','2025-04-29 07:39:14','Female'),(103,'Anna Smith','abinavg@proton.me',9876543212,'2007-01-05','Student',1,0,'2025-04-29 07:26:58','2025-04-29 07:39:14','Female'),(104,'Robert Johnson','majjagaming@gmail.com',9876543213,'1975-02-10','Contractor',2,1,'2025-04-29 07:26:41','2025-04-29 07:39:14','Male'),(105,'Emily Johnson','mailtoaceclowngamer@gmail.com',9876543214,'1977-09-12','Nurse',2,0,'2025-04-29 07:26:58','2025-04-29 07:39:14','Female'),(106,'Ravi Patel','sachinvivekananddan@gmail.com',9876543215,'1980-04-30','Doctor',3,1,'2025-04-29 07:26:41','2025-04-30 07:32:10','Male'),(107,'Asha Patel','shona.gs29@gmail.com',9876543218,'1975-07-11','Homemaker',3,0,'2025-04-29 07:26:58','2025-04-29 07:39:14','Female'),(108,'Kiran Patel','727823tuio002@skct.edu.in',9876543219,'2005-09-18','Student',3,0,'2025-04-29 07:26:58','2025-04-29 07:39:14','Female'),(109,'Linh Nguyen','727823tuio027@skct.edu.in',9876543216,'1987-03-22','Designer',4,1,'2025-04-29 07:26:41','2025-04-29 07:39:14','Male'),(111,'Carlos Garcia','727823tuio048@skct.edu.in',9876543217,'1978-12-30','Manager',5,1,'2025-04-29 07:26:41','2025-04-29 07:39:14','Male'),(113,'Ags2','727823tuio019@skct.edu.in',123456789,'2006-02-27','Student',NULL,0,'2025-05-05 07:26:13','2025-05-05 10:26:49','Male'),(114,'Pakya Priyaa','727823tuio033@skct.edu.in',987654321,'2005-10-10','Student',7,0,'2025-05-05 10:51:56','2025-05-05 10:55:50','Female'),(115,'Priyadharshini','727823tuio040@skct.edu.in',234567890,'2003-05-24','Student',7,1,'2025-05-05 10:53:47','2025-05-05 10:55:50','Female');
/*!40000 ALTER TABLE `clientdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientproducts`
--

DROP TABLE IF EXISTS `clientproducts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientproducts` (
  `clientId` int NOT NULL,
  `productId` int NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`clientId`,`productId`),
  KEY `productId` (`productId`),
  CONSTRAINT `clientproducts_ibfk_1` FOREIGN KEY (`clientId`) REFERENCES `clientdetails` (`clientId`) ON DELETE CASCADE,
  CONSTRAINT `clientproducts_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`productId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientproducts`
--

LOCK TABLES `clientproducts` WRITE;
/*!40000 ALTER TABLE `clientproducts` DISABLE KEYS */;
INSERT INTO `clientproducts` VALUES (101,1,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(101,2,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(102,2,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(103,3,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(104,1,'2025-05-05 09:04:41','2025-05-05 09:04:41'),(105,2,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(106,2,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(106,4,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(107,2,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(108,3,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(109,2,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(111,1,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(111,5,'2025-05-05 07:59:49','2025-05-05 07:59:49'),(113,4,'2025-05-05 09:04:23','2025-05-05 09:04:23'),(114,2,'2025-05-05 10:58:43','2025-05-05 10:58:43'),(114,4,'2025-05-05 10:58:43','2025-05-05 10:58:43'),(114,8,'2025-05-05 10:58:43','2025-05-05 10:58:43');
/*!40000 ALTER TABLE `clientproducts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `family`
--

DROP TABLE IF EXISTS `family`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `family` (
  `familyId` int NOT NULL AUTO_INCREMENT,
  `familyName` varchar(255) DEFAULT NULL,
  `familyHeadId` int DEFAULT NULL,
  `totalMembers` int DEFAULT NULL,
  `familyAddress` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`familyId`),
  KEY `family_ibfk_1` (`familyHeadId`),
  CONSTRAINT `family_ibfk_1` FOREIGN KEY (`familyHeadId`) REFERENCES `clientdetails` (`clientId`) ON DELETE CASCADE,
  CONSTRAINT `family_chk_1` CHECK ((`totalMembers` >= 1))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `family`
--

LOCK TABLES `family` WRITE;
/*!40000 ALTER TABLE `family` DISABLE KEYS */;
INSERT INTO `family` VALUES (1,'Smith Family',101,3,'123 Maple Street','2025-04-29 07:26:52','2025-04-29 07:26:52'),(2,'Johnson Family',104,2,'456 Oak Avenue','2025-04-29 07:26:52','2025-04-29 07:26:52'),(3,'Patel Family',106,4,'789 Pine Road','2025-04-29 07:26:52','2025-04-29 07:26:52'),(4,'Nguyen Family',109,1,'321 Elm Boulevard','2025-04-29 07:26:52','2025-04-29 07:26:52'),(5,'Garcia Family',111,2,'654 Cedar Lane','2025-04-29 07:26:52','2025-04-29 07:26:52'),(7,'The Priyaas',115,2,'Skct kovaipudur','2025-05-05 10:55:27','2025-05-05 10:55:50');
/*!40000 ALTER TABLE `family` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `productId` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(100) NOT NULL,
  PRIMARY KEY (`productId`),
  UNIQUE KEY `productName` (`productName`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (3,'Child Savings'),(8,'Health Insurance'),(4,'Investment'),(1,'Loan'),(5,'Mortgage'),(2,'Savings');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-05 16:53:34
