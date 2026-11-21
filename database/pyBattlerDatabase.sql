CREATE DATABASE  IF NOT EXISTS `pybattler` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pybattler`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: pybattler
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `action`
--

DROP TABLE IF EXISTS `action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `action` (
  `action_id` varchar(10) NOT NULL,
  `turn_id` varchar(10) NOT NULL,
  `card_id` varchar(10) NOT NULL,
  `participant_id` varchar(10) NOT NULL,
  `question_id` varchar(10) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `success` tinyint(1) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `target_participant_id` varchar(10) DEFAULT NULL,
  `action_status` varchar(30) NOT NULL DEFAULT 'Completed',
  PRIMARY KEY (`action_id`),
  KEY `turn_id` (`turn_id`),
  KEY `card_id` (`card_id`),
  KEY `participant_id` (`participant_id`),
  KEY `question_id` (`question_id`),
  KEY `action_ibfk_5` (`target_participant_id`),
  CONSTRAINT `action_ibfk_1` FOREIGN KEY (`turn_id`) REFERENCES `turn` (`turn_id`),
  CONSTRAINT `action_ibfk_2` FOREIGN KEY (`card_id`) REFERENCES `card` (`card_id`),
  CONSTRAINT `action_ibfk_3` FOREIGN KEY (`participant_id`) REFERENCES `participant` (`participant_id`),
  CONSTRAINT `action_ibfk_4` FOREIGN KEY (`question_id`) REFERENCES `question` (`question_id`),
  CONSTRAINT `action_ibfk_5` FOREIGN KEY (`target_participant_id`) REFERENCES `participant` (`participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `action`
--

LOCK TABLES `action` WRITE;
/*!40000 ALTER TABLE `action` DISABLE KEYS */;
INSERT INTO `action` VALUES ('AMW34H6S7','T93022c05f','C0001','P0002','Q0002','Attack',0,'2026-11-05 13:46:03','P0003','Completed'),('AMW34HYLK','T93022c05f','C0013','P0003','Q0003','Defense',1,'2026-11-05 13:46:39','P0002','Completed'),('AMW34I8QA','Tcf90b4c9f','C0007','P0003','Q0004','Attack',1,'2026-11-05 13:46:52','P0002','Completed'),('AMW34IQZQ','TD438DFEC6','C0026','P0002','Q0001','Recovery',1,'2026-11-05 13:47:16',NULL,'Completed'),('AMW34J08G','T0CCA3A210','C0007','P0003','Q0008','Attack',0,'2026-11-05 13:47:28','P0002','Completed'),('AMW34JBWJ','T884285601','C0026','P0002','Q0008','Recovery',0,'2026-11-05 13:47:43',NULL,'Completed'),('AMW34X5QL','T02872c73e','C0001','P0004','Q0010','Attack',0,'2026-11-05 13:58:28','P0005','Completed'),('AMW34XD95','T9b97a56cc','C0003','P0005','Q0004','Attack',0,'2026-11-05 13:58:38','P0004','Completed'),('AMW34XJUJ','T9b97a56cc','C0014','P0004','Q0004','Defense',1,'2026-11-05 13:58:47','P0005','Completed'),('AMW34XTPC','TD865B7A43','C0001','P0004','Q0003','Attack',1,'2026-11-05 13:59:00','P0005','Completed'),('AMW356XJ4','T5c7c9fe4b','C0001','P0006','Q0008','Attack',0,'2026-11-05 14:06:04','P0007','Completed'),('AMW35936M','T8434cd031','C0001','P0008','Q0010','Attack',1,'2026-11-05 14:07:45','P0009','Completed'),('AMW359AS4','T8434cd031','C0014','P0009','Q0008','Defense',0,'2026-11-05 14:07:55','P0008','Completed'),('AMW359K9W','Te7b6c1824','C0003','P0009','Q0003','Attack',1,'2026-11-05 14:08:07','P0008','Completed'),('AMW359W2L','TB939ADD23','C0001','P0008','Q0004','Attack',1,'2026-11-05 14:08:22','P0009','Completed'),('AMW35AH72','T0BEB99EBA','C0003','P0009','Q0005','Attack',0,'2026-11-05 14:08:50','P0008','Completed'),('AMW35AQ88','T126301A53','C0001','P0008','Q0009','Attack',0,'2026-11-05 14:09:02','P0009','Completed'),('AMW35B6SL','TC7D5D68C5','C0003','P0009','Q0006','Attack',1,'2026-11-05 14:09:23','P0008','Completed'),('AMW35BHMF','T019D058CD','C0001','P0008','Q0001','Attack',1,'2026-11-05 14:09:37','P0009','Completed'),('AMW35BS4X','T51DF2C319','C0003','P0009','Q0007','Attack',1,'2026-11-05 14:09:51','P0008','Completed'),('AMW35CG4W','T22103534A','C0001','P0008','Q0004','Attack',1,'2026-11-05 14:10:22','P0009','Completed'),('AMW35CRXU','T4B34CFFAE','C0003','P0009','Q0006','Attack',1,'2026-11-05 14:10:37','P0008','Completed'),('AMW35D5BN','T94E15F4C5','C0001','P0008','Q0008','Attack',1,'2026-11-05 14:10:54','P0009','Completed'),('AMW35DNCD','TC76910A7A','C0003','P0009','Q0009','Attack',1,'2026-11-05 14:11:18','P0008','Completed'),('AMW35DYJ0','TFB0AF9E9A','C0001','P0008','Q0010','Attack',0,'2026-11-05 14:11:32','P0009','Completed'),('AMW35E77X','T906E5F7BF','C0003','P0009','Q0001','Attack',1,'2026-11-05 14:11:44','P0008','Completed'),('AMW35EGAS','TD98326D6B','C0001','P0008','Q0004','Attack',1,'2026-11-05 14:11:55','P0009','Completed'),('AMW35EPRB','TEE3F73971','C0003','P0009','Q0004','Attack',1,'2026-11-05 14:12:08','P0008','Completed'),('AMW35EXDH','TE629CF148','C0001','P0008','Q0004','Attack',1,'2026-11-05 14:12:17','P0009','Completed'),('AMW35F572','TEF64D6074','C0003','P0009','Q0004','Attack',1,'2026-11-05 14:12:28','P0008','Completed'),('AMW35FEIC','T6BD337654','C0001','P0008','Q0004','Attack',1,'2026-11-05 14:12:40','P0009','Completed'),('AMW35FNA8','TB5B441DA8','C0003','P0009','Q0003','Attack',1,'2026-11-05 14:12:51','P0008','Completed'),('AMW35FXZI','TD9DC30FF4','C0001','P0008','Q0005','Attack',1,'2026-11-05 14:13:05','P0009','Completed'),('AMW35GB7N','T283D25AF2','C0003','P0009','Q0006','Attack',1,'2026-11-05 14:13:22','P0008','Completed'),('AMW63LGUR','T2fb7afa68','C0001','P0015','Q0009','Attack',0,'2026-11-07 15:44:42','P0016','Completed'),('AMW63PZZ2','T9abd4008d','C0001','P0016','Q0001','Attack',0,'2026-11-07 15:48:13','P0015','Completed'),('AMW63VO14','T9abd4008d','C0014','P0015','Q0009','Defense',1,'2026-11-07 15:52:38','P0016','Completed'),('AMWCBG54Q','T40387293b','C0004','P0034','Q0005','Attack',1,'2026-11-12 00:11:07','P0035','Completed'),('AMWCBH4VB','T2b04fddda','C0004','P0035','Q0008','Attack',0,'2026-11-12 00:11:54','P0034','Completed'),('AMWCBI2CO','TB36B4AFF8','C0001','P0034','Q0003','Attack',1,'2026-11-12 00:12:37','P0035','Completed'),('AMWCBIKBX','T18F37A827','C0004','P0035','Q0004','Attack',0,'2026-11-12 00:13:00','P0034','Completed'),('AMWCBJQZY','T18F37A827','C0011','P0034','Q0008','Defense',1,'2026-11-12 00:13:56','P0035','Completed'),('AMWCBKSN8','T3DA3ABB19','C0005','P0034','Q0004','Attack',1,'2026-11-12 00:14:44','P0035','Completed'),('AMWCBLCP8','T75BF66838','C0021','P0035','Q0010','Recovery',0,'2026-11-12 00:15:10',NULL,'Completed'),('AMWCBM1NP','TFF755A279','C0005','P0034','Q0003','Attack',1,'2026-11-12 00:15:43','P0035','Completed'),('AMWCBMITY','T77C5402D3','C0025','P0035','Q0002','Recovery',0,'2026-11-12 00:16:05',NULL,'Completed'),('AMWCBN4IO','T9C088717C','C0005','P0034','Q0004','Attack',1,'2026-11-12 00:16:33','P0035','Completed'),('AMWCBNC8M','T1596333F5','C0025','P0035','Q0010','Recovery',0,'2026-11-12 00:16:43',NULL,'Completed'),('AMWCBNODS','T59713A500','C0005','P0034','Q0005','Attack',1,'2026-11-12 00:16:59','P0035','Completed'),('AMWCBNZRC','T6A82FD306','C0025','P0035','Q0008','Recovery',0,'2026-11-12 00:17:14',NULL,'Completed'),('AMWCBOBIH','TC36004471','C0005','P0034','Q0003','Attack',1,'2026-11-12 00:17:29','P0035','Completed'),('AMWCBOIIF','T37CD03964','C0025','P0035','Q0010','Recovery',0,'2026-11-12 00:17:38',NULL,'Completed'),('AMWCBP0JT','T4C8CDEE4C','C0005','P0034','Q0009','Attack',1,'2026-11-12 00:18:01','P0035','Completed'),('AMWCBPE2A','T326129EB8','C0025','P0035','Q0004','Recovery',0,'2026-11-12 00:18:19',NULL,'Completed'),('AMWCBPN4Q','TC82160BA1','C0005','P0034','Q0004','Attack',1,'2026-11-12 00:18:31','P0035','Completed'),('AMWCBPUKM','T6F2FB9694','C0025','P0035','Q0002','Recovery',0,'2026-11-12 00:18:40',NULL,'Completed'),('AMWCBQA6G','T7EEF21753','C0005','P0034','Q0002','Attack',1,'2026-11-12 00:19:01','P0035','Completed'),('AMWD9O3FC','T10b3a0cf3','C0004','P0038','Q0001','Attack',1,'2026-11-12 16:09:05','P0039','Completed'),('AMWD9PFC4','T80efc8a82','C0010','P0039','Q0007','Attack',0,'2026-11-12 16:10:07','P0038','Completed'),('AMWD9PSFH','T14C856B8A','C0004','P0038','Q0004','Attack',1,'2026-11-12 16:10:24','P0039','Completed'),('AMWD9Q4XZ','T23DA9CEE7','C0010','P0039','Q0004','Attack',0,'2026-11-12 16:10:41','P0038','Completed'),('AMWD9QNLB','T23DA9CEE7','C0012','P0038','Q0003','Defense',1,'2026-11-12 16:11:05','P0039','Completed'),('AMWD9S6WA','T46DC11FEC','C0004','P0038','Q0007','Attack',0,'2026-11-12 16:12:17','P0039','Completed'),('AMWD9SSWS','T82AEE9C4B','C0010','P0039','Q0010','Attack',0,'2026-11-12 16:12:45','P0038','Completed'),('AMWD9TD42','TE34AFC468','C0004','P0038','Q0006','Attack',1,'2026-11-12 16:13:11','P0039','Completed'),('AMWD9TMYY','TE2C8CB39E','C0010','P0039','Q0007','Attack',0,'2026-11-12 16:13:24','P0038','Completed'),('AMWD9U1IA','TB96F31D73','C0004','P0038','Q0007','Attack',1,'2026-11-12 16:13:43','P0039','Completed'),('AMWD9UDBG','T8EAD07B65','C0010','P0039','Q0009','Attack',0,'2026-11-12 16:13:58','P0038','Completed'),('AMWD9UQNX','T0C93F7D3A','C0004','P0038','Q0001','Attack',1,'2026-11-12 16:14:15','P0039','Completed'),('AMWD9V0WI','T7C02F4602','C0010','P0039','Q0001','Attack',1,'2026-11-12 16:14:29','P0038','Completed'),('AMWD9VFQ9','T362A0F346','C0004','P0038','Q0005','Attack',1,'2026-11-12 16:14:48','P0039','Completed'),('AMWD9W3GU','TD3AB23919','C0010','P0039','Q0009','Attack',0,'2026-11-12 16:15:19','P0038','Completed'),('AMWD9WHRG','TF024528BD','C0004','P0038','Q0008','Attack',0,'2026-11-12 16:15:37','P0039','Completed'),('AMWD9WQM2','T93FAF941D','C0010','P0039','Q0004','Attack',1,'2026-11-12 16:15:49','P0038','Completed'),('AMWD9X1CC','T6434473F5','C0004','P0038','Q0001','Attack',1,'2026-11-12 16:16:03','P0039','Completed'),('AMWD9XCHX','T3932E7870','C0010','P0039','Q0004','Attack',0,'2026-11-12 16:16:17','P0038','Completed'),('AMWD9XOT9','T8231C826A','C0004','P0038','Q0005','Attack',1,'2026-11-12 16:16:33','P0039','Completed'),('AMWD9Y844','T32A8BF999','C0010','P0039','Q0001','Attack',1,'2026-11-12 16:16:58','P0038','Completed'),('AMWD9YL6P','T43C503011','C0004','P0038','Q0005','Attack',1,'2026-11-12 16:17:15','P0039','Completed'),('AMWD9YV0I','TCE14A4A6A','C0010','P0039','Q0007','Attack',1,'2026-11-12 16:17:28','P0038','Completed'),('AMWD9ZD08','T1B36BD4EB','C0004','P0038','Q0001','Attack',1,'2026-11-12 16:17:51','P0039','Completed'),('AMWNORK36','Ta6d88b61c','C0005','P0052','Q0011','Attack',0,'2026-11-19 23:09:23','P0053','Completed'),('AMWNOTKK6','T979b3b950','C0005','P0053','Q0011','Attack',0,'2026-11-19 23:10:57','P0052','Completed'),('AMWNOUHRB','T1B0151BA8','C0004','P0052','Q0001','Attack',0,'2026-11-19 23:11:40','P0053','Completed'),('AMWNOV7DI','T31511B191','C0004','P0053','Q0010','Attack',0,'2026-11-19 23:12:13','P0052','Completed'),('AMWNOVGQU','TB4CBF7F84','C0004','P0052','Q0002','Attack',1,'2026-11-19 23:12:25','P0053','Completed'),('AMWNOVQDW','TB4CBF7F84','C0012','P0053','Q0010','Defense',0,'2026-11-19 23:12:38','P0052','Completed'),('AMWNOW1EX','TBAB5DAD17','C0005','P0053','Q0010','Attack',1,'2026-11-19 23:12:52','P0052','Completed'),('AMWNOYW37','TEF33EAE96','C0005','P0052','Q0010','Attack',0,'2026-11-19 23:15:05','P0053','Completed'),('AMWNP0TIC','T3DAB6CE26','C0024','P0053','Q0004','Recovery',0,'2026-11-19 23:16:35',NULL,'Completed'),('AMWNP133D','TB4DC5D9F0','C0005','P0052','Q0010','Attack',0,'2026-11-19 23:16:47','P0053','Completed'),('AMWNP1Y8S','TA56FBD7C8','C0004','P0053','Q0006','Attack',1,'2026-11-19 23:17:28','P0052','Completed'),('AMWNPB7B6','TA56FBD7C8','C0015','P0052','Q0006','Defense',0,'2026-11-19 23:24:40','P0053','Completed'),('AMWPZO8GK','Td3b76a78e','C0005','P0056','Q0010','Attack',1,'2026-11-21 13:50:16','P0057','Completed'),('AMWPZOWWH','Tfbe08e168','C0005','P0057','Q0005','Attack',0,'2026-11-21 13:50:48','P0056','Completed'),('AMWPZPDVD','T3E0BF599F','C0005','P0056','Q0008','Attack',0,'2026-11-21 13:51:10','P0057','Completed'),('AMWPZPPB8','T79C685C51','C0005','P0057','Q0001','Attack',0,'2026-11-21 13:51:25','P0056','Completed'),('AMWPZQAMC','TB0C5859C7','C0005','P0056','Q0002','Attack',0,'2026-11-21 13:51:52','P0057','Completed'),('AMWPZQVUW','T103AD460F','C0005','P0057','Q0010','Attack',0,'2026-11-21 13:52:20','P0056','Completed'),('AMWPZR5KA','TA73926C9C','C0005','P0056','Q0004','Attack',0,'2026-11-21 13:52:32','P0057','Completed'),('AMWPZRPIB','TE89E5932E','C0005','P0057','Q0006','Attack',0,'2026-11-21 13:52:58','P0056','Completed'),('AMWPZSBG6','TF20B3C081','C0005','P0056','Q0008','Attack',0,'2026-11-21 13:53:27','P0057','Completed'),('AMWPZUA5U','TE70F609C5','C0005','P0057','Q0003','Attack',0,'2026-11-21 13:54:58','P0056','Pending'),('AMWQ2JU6J','T0ae89cbb6','C0005','P0062','Q0008','Attack',0,'2026-11-21 15:10:50','P0063','Completed'),('AMWQ2KGGR','Td6ae83780','C0005','P0063','Q0004','Attack',0,'2026-11-21 15:11:19','P0062','Completed'),('AMWQ2MB7Y','T31DD13B7E','C0002','P0062','Q0009','Attack',0,'2026-11-21 15:12:45','P0063','Completed'),('AMWQ2MXFM','T3022FC7C2','C0002','P0063','Q0008','Attack',0,'2026-11-21 15:13:14','P0062','Completed'),('AMWQ2QNI1','T65843E0C2','C0002','P0062','Q0004','Attack',0,'2026-11-21 15:16:08','P0063','Completed'),('AMWQ2VJK6','T1263654df','C0002','P0064','Q0001','Attack',0,'2026-11-21 15:19:56','P0065','Completed'),('AMWQ2VSS9','T1263654df','C0011','P0065','Q0005','Defense',1,'2026-11-21 15:20:08','P0064','Completed'),('AMWQ2WUVZ','Td02b2fbdc','C0005','P0065','Q0006','Attack',1,'2026-11-21 15:20:57','P0064','Completed'),('AMWQ2XAEP','T924C2B6A1','C0002','P0064','Q0011','Attack',1,'2026-11-21 15:21:17','P0065','Completed'),('AMWQ2XS1D','T123C103FB','C0002','P0065','Q0005','Attack',1,'2026-11-21 15:21:40','P0064','Completed'),('AMWQ2Y29Q','T379404065','C0002','P0064','Q0005','Attack',1,'2026-11-21 15:21:53','P0065','Completed'),('AMWQ2YQMS','TFA76E0D0E','C0021','P0065','Q0010','Recovery',0,'2026-11-21 15:22:25',NULL,'Completed'),('AMWQ2ZRDD','TD150F08B2','C0002','P0064','Q0011','Attack',1,'2026-11-21 15:23:13','P0065','Completed'),('AMWQ2ZYHF','TD9F4891D5','C0021','P0065','Q0004','Recovery',1,'2026-11-21 15:23:22',NULL,'Completed'),('AMWQ309YM','T7256A6B31','C0002','P0064','Q0005','Attack',1,'2026-11-21 15:23:37','P0065','Completed'),('AMWQ30OTL','T76D7A60B7','C0002','P0065','Q0003','Attack',1,'2026-11-21 15:23:56','P0064','Completed'),('AMWQ313UB','TB05C34A25','C0002','P0064','Q0009','Attack',1,'2026-11-21 15:24:15','P0065','Completed'),('AMWQ31COG','T86B61402F','C0002','P0065','Q0005','Attack',1,'2026-11-21 15:24:27','P0064','Completed'),('AMWQ31NFM','TF4915FF8A','C0002','P0064','Q0001','Attack',1,'2026-11-21 15:24:41','P0065','Completed'),('AMWQ31VV4','T966995629','C0002','P0065','Q0003','Attack',1,'2026-11-21 15:24:52','P0064','Completed'),('AMWQ32836','TEEE7CDAC1','C0002','P0064','Q0008','Attack',1,'2026-11-21 15:25:08','P0065','Completed'),('AMWQ32GNW','T106EB1DDF','C0002','P0065','Q0009','Attack',1,'2026-11-21 15:25:19','P0064','Completed'),('AMWQ32QYX','T62F289FA9','C0002','P0064','Q0009','Attack',1,'2026-11-21 15:25:32','P0065','Completed'),('AMWQ32ZVM','TE7A0D550A','C0002','P0065','Q0011','Attack',1,'2026-11-21 15:25:44','P0064','Completed'),('AMWQ33BJ6','T156AC0C40','C0002','P0064','Q0008','Attack',1,'2026-11-21 15:25:59','P0065','Completed'),('AMWQ33LEU','T77693960E','C0002','P0065','Q0007','Attack',1,'2026-11-21 15:26:12','P0064','Completed'),('AMWQ33ZF8','T3291DFFB0','C0002','P0064','Q0011','Attack',1,'2026-11-21 15:26:30','P0065','Completed'),('AMWQ34AOV','T13F4EE1C5','C0002','P0065','Q0008','Attack',0,'2026-11-21 15:26:44','P0064','Completed'),('AMWQ34LCU','TDB358BEF2','C0002','P0064','Q0005','Attack',1,'2026-11-21 15:26:58','P0065','Completed'),('AMWQ4UASG','T11a24a115','C0002','P0066','Q0001','Attack',1,'2026-11-21 16:14:57','P0067','Completed'),('AMWQ4UTF2','Ta26e859ba','C0002','P0067','Q0009','Attack',0,'2026-11-21 16:15:21','P0066','Completed'),('AMWQ4VJ7W','Ta26e859ba','C0011','P0066','Q0008','Defense',1,'2026-11-21 16:15:55','P0067','Completed'),('AMWQ4W6SN','TC3FE1A3CE','C0002','P0066','Q0006','Attack',1,'2026-11-21 16:16:25','P0067','Completed');
/*!40000 ALTER TABLE `action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `card`
--

DROP TABLE IF EXISTS `card`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card` (
  `card_id` varchar(10) NOT NULL,
  `card_type` varchar(50) NOT NULL,
  `qr_code` varchar(255) NOT NULL,
  `card_description` text,
  PRIMARY KEY (`card_id`),
  UNIQUE KEY `qr_code` (`qr_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card`
--

LOCK TABLES `card` WRITE;
/*!40000 ALTER TABLE `card` DISABLE KEYS */;
INSERT INTO `card` VALUES ('C0001','Attack','PYB-CARD-C0001','Deals 10 HP damage to an opponent.'),('C0002','Attack','PYB-CARD-C0002','Deals 10 HP damage to an opponent.'),('C0003','Attack','PYB-CARD-C0003','Deals 10 HP damage to an opponent.'),('C0004','Attack','PYB-CARD-C0004','Deals 10 HP damage to an opponent.'),('C0005','Attack','PYB-CARD-C0005','Deals 10 HP damage to an opponent.'),('C0006','Attack','PYB-CARD-C0006','Deals 10 HP damage to an opponent.'),('C0007','Attack','PYB-CARD-C0007','Deals 10 HP damage to an opponent.'),('C0008','Attack','PYB-CARD-C0008','Deals 10 HP damage to an opponent.'),('C0009','Attack','PYB-CARD-C0009','Deals 10 HP damage to an opponent.'),('C0010','Attack','PYB-CARD-C0010','Deals 10 HP damage to an opponent.'),('C0011','Defense','PYB-CARD-C0011','Blocks an opponent\'s attack.'),('C0012','Defense','PYB-CARD-C0012','Blocks an opponent\'s attack.'),('C0013','Defense','PYB-CARD-C0013','Blocks an opponent\'s attack.'),('C0014','Defense','PYB-CARD-C0014','Blocks an opponent\'s attack.'),('C0015','Defense','PYB-CARD-C0015','Blocks an opponent\'s attack.'),('C0016','Defense','PYB-CARD-C0016','Blocks an opponent\'s attack.'),('C0017','Defense','PYB-CARD-C0017','Blocks an opponent\'s attack.'),('C0018','Defense','PYB-CARD-C0018','Blocks an opponent\'s attack.'),('C0019','Defense','PYB-CARD-C0019','Blocks an opponent\'s attack.'),('C0020','Defense','PYB-CARD-C0020','Blocks an opponent\'s attack.'),('C0021','Recovery','PYB-CARD-C0021','Restores 5 HP when the player has less than 100 HP.'),('C0022','Recovery','PYB-CARD-C0022','Restores 5 HP when the player has less than 100 HP.'),('C0023','Recovery','PYB-CARD-C0023','Restores 5 HP when the player has less than 100 HP.'),('C0024','Recovery','PYB-CARD-C0024','Restores 5 HP when the player has less than 100 HP.'),('C0025','Recovery','PYB-CARD-C0025','Restores 5 HP when the player has less than 100 HP.'),('C0026','Recovery','PYB-CARD-C0026','Restores 5 HP when the player has less than 100 HP.'),('C0027','Recovery','PYB-CARD-C0027','Restores 5 HP when the player has less than 100 HP.'),('C0028','Recovery','PYB-CARD-C0028','Restores 5 HP when the player has less than 100 HP.'),('C0029','Recovery','PYB-CARD-C0029','Restores 5 HP when the player has less than 100 HP.'),('C0030','Recovery','PYB-CARD-C0030','Restores 5 HP when the player has less than 100 HP.');
/*!40000 ALTER TABLE `card` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `game_round`
--

DROP TABLE IF EXISTS `game_round`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_round` (
  `room_id` varchar(10) NOT NULL,
  `round_number` int NOT NULL,
  `status` varchar(30) NOT NULL,
  PRIMARY KEY (`room_id`,`round_number`),
  CONSTRAINT `game_round_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_round`
--

LOCK TABLES `game_round` WRITE;
/*!40000 ALTER TABLE `game_round` DISABLE KEYS */;
INSERT INTO `game_round` VALUES ('R0002',1,'Completed'),('R0002',2,'Completed'),('R0002',3,'In Progress'),('R0003',1,'Completed'),('R0003',2,'In Progress'),('R0004',1,'In Progress'),('R0005',1,'Completed'),('R0005',2,'Completed'),('R0005',3,'Completed'),('R0005',4,'Completed'),('R0005',5,'Completed'),('R0005',6,'Completed'),('R0005',7,'Completed'),('R0005',8,'Completed'),('R0005',9,'Completed'),('R0005',10,'Completed'),('R0005',11,'Completed'),('R0006',1,'In Progress'),('R0009',1,'Completed'),('R0009',2,'In Progress'),('R0013',1,'In Progress'),('R0015',1,'In Progress'),('R0017',1,'In Progress'),('R0019',1,'Completed'),('R0019',2,'Completed'),('R0019',3,'Completed'),('R0019',4,'Completed'),('R0019',5,'Completed'),('R0019',6,'Completed'),('R0019',7,'Completed'),('R0019',8,'Completed'),('R0019',9,'Completed'),('R0019',10,'Completed'),('R0021',1,'Completed'),('R0021',2,'Completed'),('R0021',3,'Completed'),('R0021',4,'Completed'),('R0021',5,'Completed'),('R0021',6,'Completed'),('R0021',7,'Completed'),('R0021',8,'Completed'),('R0021',9,'Completed'),('R0021',10,'Completed'),('R0021',11,'Completed'),('R0021',12,'Completed'),('R0026',1,'In Progress'),('R0027',1,'In Progress'),('R0028',1,'In Progress'),('R0029',1,'In Progress'),('R0030',1,'Completed'),('R0030',2,'Completed'),('R0030',3,'Completed'),('R0030',4,'Completed'),('R0030',5,'Completed'),('R0030',6,'In Progress'),('R0032',1,'Completed'),('R0032',2,'Completed'),('R0032',3,'Completed'),('R0032',4,'Completed'),('R0032',5,'In Progress'),('R0034',1,'Completed'),('R0034',2,'Completed'),('R0034',3,'In Progress'),('R0035',1,'Completed'),('R0035',2,'Completed'),('R0035',3,'Completed'),('R0035',4,'Completed'),('R0035',5,'Completed'),('R0035',6,'Completed'),('R0035',7,'Completed'),('R0035',8,'Completed'),('R0035',9,'Completed'),('R0035',10,'Completed'),('R0035',11,'Completed'),('R0035',12,'Completed'),('R0036',1,'Completed'),('R0036',2,'In Progress');
/*!40000 ALTER TABLE `game_round` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_player`
--

DROP TABLE IF EXISTS `guest_player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_player` (
  `guest_id` varchar(10) NOT NULL,
  `guest_name` varchar(100) NOT NULL,
  PRIMARY KEY (`guest_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_player`
--

LOCK TABLES `guest_player` WRITE;
/*!40000 ALTER TABLE `guest_player` DISABLE KEYS */;
INSERT INTO `guest_player` VALUES ('G0001','Chan'),('G0002','Kah'),('G0003','James'),('G0004','Chan'),('G0005','Chan Guest'),('G0006','Chan Guest'),('G0007','Chan Testing'),('G0008','Chan Guest'),('G0009','Chan Testing'),('G0010','Chan Testing'),('G0011','Chan Testing'),('G0012','Chan Guest'),('G0013','Chan Guest'),('G0014','Chan Guest'),('G0015','Chan Guest'),('G0016','Chan Guest'),('G0017','Chan Guest'),('G0018','Chan Guest'),('G0019','Chan Guest'),('G0020','Chan Guest'),('G0021','Chan Guest'),('G0022','Chan Guest'),('G0023','Chan Guest'),('G0024','Chan Guest'),('G0025','Chan Guest'),('G0026','Chan guest'),('G0027','Chan Guest'),('G0028','Chan guest'),('G0029','Chan Guest'),('G0030','Chan Guest'),('G0031','Chan Guest');
/*!40000 ALTER TABLE `guest_player` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaderboard`
--

DROP TABLE IF EXISTS `leaderboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard` (
  `leaderboard_id` varchar(10) NOT NULL,
  `room_id` varchar(10) NOT NULL,
  `participant_id` varchar(10) NOT NULL,
  `rank` int NOT NULL,
  `recorded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`leaderboard_id`),
  KEY `room_id` (`room_id`),
  KEY `participant_id` (`participant_id`),
  CONSTRAINT `leaderboard_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`),
  CONSTRAINT `leaderboard_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `participant` (`participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard`
--

LOCK TABLES `leaderboard` WRITE;
/*!40000 ALTER TABLE `leaderboard` DISABLE KEYS */;
INSERT INTO `leaderboard` VALUES ('L093280e3','R0005','P0009',1,'2026-11-05 14:13:24'),('L35d80a61','R0035','P0065',2,'2026-11-21 15:27:00'),('L60407970','R0021','P0039',2,'2026-11-12 16:17:57'),('L82a8d1e3','R0019','P0035',2,'2026-11-12 00:19:03'),('L959bfeb3','R0021','P0038',1,'2026-11-12 16:17:57'),('Ld496653d','R0035','P0064',1,'2026-11-21 15:27:00'),('Ldfcda896','R0019','P0034',1,'2026-11-12 00:19:03'),('Lf05c3440','R0005','P0008',2,'2026-11-05 14:13:24');
/*!40000 ALTER TABLE `leaderboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participant`
--

DROP TABLE IF EXISTS `participant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participant` (
  `participant_id` varchar(10) NOT NULL,
  `room_id` varchar(10) NOT NULL,
  `user_id` varchar(10) DEFAULT NULL,
  `guest_id` varchar(10) DEFAULT NULL,
  `player_name` varchar(100) NOT NULL,
  `hp` int NOT NULL DEFAULT '100',
  `score` int NOT NULL DEFAULT '0',
  `is_alive` tinyint(1) NOT NULL,
  PRIMARY KEY (`participant_id`),
  KEY `room_id` (`room_id`),
  KEY `user_id` (`user_id`),
  KEY `guest_id` (`guest_id`),
  CONSTRAINT `participant_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`),
  CONSTRAINT `participant_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `participant_ibfk_3` FOREIGN KEY (`guest_id`) REFERENCES `guest_player` (`guest_id`),
  CONSTRAINT `participant_chk_1` CHECK ((((`user_id` is not null) and (`guest_id` is null)) or ((`user_id` is null) and (`guest_id` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participant`
--

LOCK TABLES `participant` WRITE;
/*!40000 ALTER TABLE `participant` DISABLE KEYS */;
INSERT INTO `participant` VALUES ('P0001','R0001','U0001',NULL,'Chan 1 Test Edit Username Email and Password',100,0,1),('P0002','R0002','U0001',NULL,'Chan 1',95,10,1),('P0003','R0002','U0003',NULL,'Chan 2',100,20,1),('P0004','R0003','U0001',NULL,'Chan 1',100,20,1),('P0005','R0003','U0003',NULL,'Chan 2',90,0,1),('P0006','R0004','U0001',NULL,'Chan 1',100,0,1),('P0007','R0004','U0004',NULL,'Chan 4',100,0,1),('P0008','R0005','U0001',NULL,'Chan 1',0,90,0),('P0009','R0005','U0004',NULL,'Chan 4',10,100,1),('P0010','R0006',NULL,'G0001','Chan',100,0,1),('P0011','R0006',NULL,'G0002','Kah',100,0,1),('P0012','R0007','U0001',NULL,'Chan 1',100,0,1),('P0013','R0008','U0003',NULL,'Chan 2',100,0,1),('P0014','R0008','U0001',NULL,'Chan 1',100,0,1),('P0015','R0009','U0001',NULL,'Chan 1',100,10,1),('P0016','R0009','U0003',NULL,'Chan 3',100,0,1),('P0018','R0010','U0001',NULL,'Chan 1',100,0,1),('P0019','R0011','U0001',NULL,'Chan 1',100,0,1),('P0020','R0012','U0003',NULL,'John',100,0,1),('P0021','R0012','U0001',NULL,'Chan 1',100,0,1),('P0022','R0013','U0001',NULL,'Chan 1',100,0,1),('P0023','R0013','U0003',NULL,'John',100,0,1),('P0024','R0014','U0003',NULL,'John',100,0,1),('P0025','R0014','U0001',NULL,'Chan 1',100,0,1),('P0026','R0015','U0001',NULL,'Chan 1',100,0,1),('P0027','R0015','U0003',NULL,'John',100,0,1),('P0028','R0016','U0003',NULL,'John',100,0,1),('P0029','R0016','U0001',NULL,'Chan 1',100,0,1),('P0030','R0017','U0001',NULL,'Chan 1',100,0,1),('P0031','R0017','U0003',NULL,'John',100,0,1),('P0032','R0018','U0003',NULL,'John',100,0,1),('P0033','R0018','U0001',NULL,'Chan 1',100,0,1),('P0034','R0019','U0001',NULL,'Chan 1',100,110,1),('P0035','R0019','U0003',NULL,'John',0,0,0),('P0036','R0020','U0004',NULL,'Chan 4',100,0,1),('P0037','R0020','U0001',NULL,'Chan 1',100,0,1),('P0038','R0021','U0001',NULL,'Chan 1',60,110,1),('P0039','R0021','U0004',NULL,'Chan 4',0,40,0),('P0040','R0022','U0001',NULL,'Chan 1',100,0,1),('P0041','R0023',NULL,'G0031','Chan Guest',100,0,1),('P0042','R0024','U0001',NULL,'Chan 1',100,0,1),('P0043','R0025','U0001',NULL,'Chan 1',100,0,1),('P0044','R0026','U0004',NULL,'Chan 4',100,0,1),('P0045','R0026','U0001',NULL,'Chan 1',100,0,1),('P0046','R0027','U0004',NULL,'Chan 4',100,0,1),('P0047','R0027','U0001',NULL,'Chan 1',100,0,1),('P0048','R0028','U0004',NULL,'Chan 4',100,0,1),('P0049','R0028','U0001',NULL,'Chan 1',100,0,1),('P0050','R0029','U0004',NULL,'Chan 4',100,0,1),('P0051','R0029','U0001',NULL,'Chan 1',100,0,1),('P0052','R0030','U0004',NULL,'Chan 4',80,10,1),('P0053','R0030','U0001',NULL,'Chan 1',90,20,1),('P0054','R0031','U0001',NULL,'Chan 1',100,0,1),('P0055','R0031','U0004',NULL,'Chan 4',100,0,1),('P0056','R0032','U0004',NULL,'Chan 4',100,10,1),('P0057','R0032','U0001',NULL,'Chan 1',90,0,1),('P0059','R0033','U0001',NULL,'Chan 1',100,0,1),('P0062','R0034','U0004',NULL,'Chan 4',100,0,1),('P0063','R0034','U0001',NULL,'Chan 1',100,0,1),('P0064','R0035','U0001',NULL,'Chan 1',20,110,1),('P0065','R0035','U0004',NULL,'Chan 4',0,100,0),('P0066','R0036','U0001',NULL,'Chan 1',100,30,1),('P0067','R0036','U0004',NULL,'Chan 4',80,0,1);
/*!40000 ALTER TABLE `participant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `question_id` varchar(10) NOT NULL,
  `question_text` text NOT NULL,
  `option_a` text NOT NULL,
  `option_b` text NOT NULL,
  `option_c` text NOT NULL,
  `option_d` text NOT NULL,
  `correct_answer` varchar(255) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES ('Q0001','What will be the output of this code?\n\nx = 10\nif x > 5:\n    print(\"A\")\nelse:\n    print(\"B\")','A','B','10','No output','A',NULL,1),('Q0002','How many times will this loop execute?\n\nfor i in range(1, 5):\n    print(i)','3 times','4 times','5 times','Infinite times','4 times',NULL,1),('Q0003','What will be the output of this code?\n\nx = 3\nwhile x > 0:\n    print(x)\n    x -= 1','1 2 3','3 2 1 0','3 2 1','Infinite loop','3 2 1',NULL,1),('Q0004','What does the break statement do inside a loop?','Skips the current iteration','Restarts the loop','Pauses the loop temporarily','Terminates the loop immediately','Terminates the loop immediately',NULL,1),('Q0005','What will be the output of this code?\n\nfor i in range(5):\n    if i == 2:\n        continue\n    print(i)','0 1 3 4','0 1 2 3 4','2','0 1','0 1 3 4',NULL,1),('Q0006','What will be the output of this code?\n\nx = 8\nif x > 10:\n    print(\"A\")\nelif x > 5:\n    print(\"B\")\nelse:\n    print(\"C\")','A','C','B','No output','B',NULL,1),('Q0007','What will be the output of this code?\n\nfor i in range(2):\n    for j in range(3):\n        print(\"*\", end=\"\")','**','******','*****','***','******',NULL,1),('Q0008','What will happen when this code runs?\n\nx = 5\nwhile x < 5:\n    print(x)','Prints 5 once','Prints 4 once','Runs forever','Nothing is printed','Nothing is printed',NULL,1),('Q0009','What will be the output of this code?\n\nfor i in range(1, 6):\n    if i == 4:\n        break\n    print(i)','1 2 3','1 2 3 4','1 2 3 4 5','4 5','1 2 3',NULL,1),('Q0010','What will be the output of this code?\n\nx = 0\nfor i in range(4):\n    x += i\nprint(x)','4','5','6','10','6',NULL,1),('Q0011','The answer is Brother','Apple','Brother','Cat','Donkey','Brother',NULL,1),('Q0012','This is a testing question. Answer is Boy','Apple','Boy','Cat','Donkey','Boy',NULL,0);
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `room_id` varchar(10) NOT NULL,
  `room_code` varchar(20) NOT NULL,
  `status` varchar(30) NOT NULL,
  `max_players` int NOT NULL,
  `current_round` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `winner_id` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `room_code` (`room_code`),
  KEY `fk_room_winner` (`winner_id`),
  CONSTRAINT `fk_room_winner` FOREIGN KEY (`winner_id`) REFERENCES `participant` (`participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES ('R0001','JGNQH9','Waiting',4,1,'2026-11-05 13:44:38',NULL),('R0002','W8CVZC','In Progress',4,3,'2026-11-05 13:45:01',NULL),('R0003','24HDVE','In Progress',4,2,'2026-11-05 13:57:58',NULL),('R0004','KB2KO0','In Progress',4,1,'2026-11-05 14:02:28',NULL),('R0005','MIINZ1','Completed',4,11,'2026-11-05 14:07:12','P0009'),('R0006','PBZLZF','In Progress',4,1,'2026-11-05 14:14:21',NULL),('R0007','GR6MOL','Waiting',4,1,'2026-11-07 15:05:03',NULL),('R0008','CXE775','Waiting',4,1,'2026-11-07 15:14:59',NULL),('R0009','163GK7','In Progress',4,2,'2026-11-07 15:23:56',NULL),('R0010','43Q4PF','Waiting',4,1,'2026-11-11 22:58:12',NULL),('R0011','P0B608','Waiting',4,1,'2026-11-11 22:59:00',NULL),('R0012','TW17K9','Waiting',4,1,'2026-11-11 23:13:35',NULL),('R0013','3V08VZ','In Progress',4,1,'2026-11-11 23:14:07',NULL),('R0014','NTPAT4','Waiting',4,1,'2026-11-11 23:28:37',NULL),('R0015','A7GGX2','In Progress',4,1,'2026-11-11 23:29:19',NULL),('R0016','WLNPDH','Waiting',4,1,'2026-11-11 23:48:26',NULL),('R0017','8Z9P1M','In Progress',4,1,'2026-11-11 23:49:04',NULL),('R0018','EITVS9','Waiting',4,1,'2026-11-12 00:06:36',NULL),('R0019','HG48KD','Completed',4,10,'2026-11-12 00:07:09','P0034'),('R0020','OBESNH','Waiting',4,1,'2026-11-12 16:05:20',NULL),('R0021','6IEY4S','Completed',4,12,'2026-11-12 16:05:57','P0038'),('R0022','36K8V9','Waiting',4,1,'2026-11-18 22:33:20',NULL),('R0023','0ZQ13E','Waiting',4,1,'2026-11-18 22:33:42',NULL),('R0024','CBALMP','Waiting',4,1,'2026-11-18 22:52:21',NULL),('R0025','HIK1RK','Waiting',4,1,'2026-11-19 16:09:13',NULL),('R0026','GR1YD5','In Progress',4,1,'2026-11-19 22:48:39',NULL),('R0027','YSUMRL','In Progress',4,1,'2026-11-19 22:52:50',NULL),('R0028','JR466I','In Progress',4,1,'2026-11-19 22:55:20',NULL),('R0029','Y6HOBU','In Progress',4,1,'2026-11-19 22:56:53',NULL),('R0030','319RB5','In Progress',4,6,'2026-11-19 23:02:29',NULL),('R0031','WGIODY','Waiting',4,1,'2026-11-21 13:48:06',NULL),('R0032','JFFFRJ','In Progress',4,5,'2026-11-21 13:49:21',NULL),('R0033','JX8HFY','Waiting',4,1,'2026-11-21 14:41:25',NULL),('R0034','1N3V9H','In Progress',4,3,'2026-11-21 15:09:40',NULL),('R0035','BBAZUM','Completed',4,12,'2026-11-21 15:19:30','P0064'),('R0036','0YKYPL','In Progress',4,2,'2026-11-21 16:12:55',NULL);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `turn`
--

DROP TABLE IF EXISTS `turn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `turn` (
  `turn_id` varchar(10) NOT NULL,
  `room_id` varchar(10) NOT NULL,
  `round_number` int NOT NULL,
  `participant_id` varchar(10) NOT NULL,
  `turn_order` int NOT NULL,
  `status` varchar(30) NOT NULL,
  PRIMARY KEY (`turn_id`),
  KEY `room_id` (`room_id`,`round_number`),
  KEY `participant_id` (`participant_id`),
  CONSTRAINT `turn_ibfk_1` FOREIGN KEY (`room_id`, `round_number`) REFERENCES `game_round` (`room_id`, `round_number`),
  CONSTRAINT `turn_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `participant` (`participant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `turn`
--

LOCK TABLES `turn` WRITE;
/*!40000 ALTER TABLE `turn` DISABLE KEYS */;
INSERT INTO `turn` VALUES ('T019D058CD','R0005',4,'P0008',1,'Completed'),('T01eaa92ca','R0029',1,'P0050',1,'Active'),('T02872c73e','R0003',1,'P0004',1,'Completed'),('T088E15C82','R0021',12,'P0039',2,'Completed'),('T0a9f83aaf','R0028',1,'P0048',1,'Active'),('T0ae89cbb6','R0034',1,'P0062',1,'Completed'),('T0BEB99EBA','R0005',2,'P0009',2,'Completed'),('T0C93F7D3A','R0021',6,'P0038',1,'Completed'),('T0CCA3A210','R0002',2,'P0003',2,'Completed'),('T103AD460F','R0032',3,'P0057',2,'Completed'),('T106EB1DDF','R0035',8,'P0065',2,'Completed'),('T10b3a0cf3','R0021',1,'P0038',1,'Completed'),('T11a24a115','R0036',1,'P0066',1,'Completed'),('T123C103FB','R0035',2,'P0065',2,'Completed'),('T126301A53','R0005',3,'P0008',1,'Completed'),('T1263654df','R0035',1,'P0064',1,'Completed'),('T13F4EE1C5','R0035',11,'P0065',2,'Completed'),('T148b7b183','R0013',1,'P0022',1,'Active'),('T14C856B8A','R0021',2,'P0038',1,'Completed'),('T156AC0C40','R0035',10,'P0064',1,'Completed'),('T1596333F5','R0019',5,'P0035',2,'Completed'),('T18F37A827','R0019',2,'P0035',2,'Completed'),('T1B0151BA8','R0030',2,'P0052',1,'Completed'),('T1B36BD4EB','R0021',12,'P0038',1,'Completed'),('T22103534A','R0005',5,'P0008',1,'Completed'),('T23DA9CEE7','R0021',2,'P0039',2,'Completed'),('T283D25AF2','R0005',11,'P0009',2,'Completed'),('T2ac563d4f','R0013',1,'P0023',2,'Waiting'),('T2b04fddda','R0019',1,'P0035',2,'Completed'),('T2fb7afa68','R0009',1,'P0015',1,'Completed'),('T3022FC7C2','R0034',2,'P0063',2,'Completed'),('T31511B191','R0030',2,'P0053',2,'Completed'),('T31DD13B7E','R0034',2,'P0062',1,'Completed'),('T326129EB8','R0019',8,'P0035',2,'Completed'),('T3291DFFB0','R0035',11,'P0064',1,'Completed'),('T32A8BF999','R0021',10,'P0039',2,'Completed'),('T362A0F346','R0021',7,'P0038',1,'Completed'),('T379404065','R0035',3,'P0064',1,'Completed'),('T37CD03964','R0019',7,'P0035',2,'Completed'),('T3932E7870','R0021',9,'P0039',2,'Completed'),('T3DA3ABB19','R0019',3,'P0034',1,'Completed'),('T3DAB6CE26','R0030',4,'P0053',2,'Completed'),('T3E0BF599F','R0032',2,'P0056',1,'Completed'),('T3e736b5e9','R0004',1,'P0007',2,'Active'),('T40387293b','R0019',1,'P0034',1,'Completed'),('T43C503011','R0021',11,'P0038',1,'Completed'),('T46DC11FEC','R0021',3,'P0038',1,'Completed'),('T4B34CFFAE','R0005',5,'P0009',2,'Completed'),('T4C8CDEE4C','R0019',8,'P0034',1,'Completed'),('T505B6D203','R0030',6,'P0052',1,'Active'),('T51DF2C319','R0005',4,'P0009',2,'Completed'),('T52eec79c7','R0027',1,'P0046',1,'Active'),('T561BE7D7A','R0030',6,'P0053',2,'Waiting'),('T589ac5a25','R0026',1,'P0044',1,'Active'),('T58cd89346','R0017',1,'P0030',1,'Active'),('T5926F6D4B','R0009',2,'P0016',2,'Waiting'),('T59713A500','R0019',6,'P0034',1,'Completed'),('T5c7c9fe4b','R0004',1,'P0006',1,'Completed'),('T62F289FA9','R0035',9,'P0064',1,'Completed'),('T6434473F5','R0021',9,'P0038',1,'Completed'),('T65843E0C2','R0034',3,'P0062',1,'Completed'),('T6A82FD306','R0019',6,'P0035',2,'Completed'),('T6BD337654','R0005',10,'P0008',1,'Completed'),('T6c212e2e0','R0026',1,'P0045',2,'Waiting'),('T6F2FB9694','R0019',9,'P0035',2,'Completed'),('T7256A6B31','R0035',5,'P0064',1,'Completed'),('T75BF66838','R0019',3,'P0035',2,'Completed'),('T76D7A60B7','R0035',5,'P0065',2,'Completed'),('T77693960E','R0035',10,'P0065',2,'Completed'),('T77C5402D3','R0019',4,'P0035',2,'Completed'),('T79C685C51','R0032',2,'P0057',2,'Completed'),('T7C02F4602','R0021',6,'P0039',2,'Completed'),('T7EE0A115D','R0019',10,'P0035',2,'Completed'),('T7EEF21753','R0019',10,'P0034',1,'Completed'),('T80efc8a82','R0021',1,'P0039',2,'Completed'),('T8231C826A','R0021',10,'P0038',1,'Completed'),('T82AEE9C4B','R0021',3,'P0039',2,'Completed'),('T8434cd031','R0005',1,'P0008',1,'Completed'),('T86B61402F','R0035',6,'P0065',2,'Completed'),('T884285601','R0002',3,'P0002',1,'Completed'),('T8EAD07B65','R0021',5,'P0039',2,'Completed'),('T906E5F7BF','R0005',7,'P0009',2,'Completed'),('T924C2B6A1','R0035',2,'P0064',1,'Completed'),('T93022c05f','R0002',1,'P0002',1,'Completed'),('T93E34925A','R0003',2,'P0005',2,'Active'),('T93FAF941D','R0021',8,'P0039',2,'Completed'),('T94E15F4C5','R0005',6,'P0008',1,'Completed'),('T966995629','R0035',7,'P0065',2,'Completed'),('T979b3b950','R0030',1,'P0053',2,'Completed'),('T9abd4008d','R0009',1,'P0016',2,'Completed'),('T9b97a56cc','R0003',1,'P0005',2,'Completed'),('T9C088717C','R0019',5,'P0034',1,'Completed'),('T9c54a059b','R0029',1,'P0051',2,'Waiting'),('T9EC546733','R0036',2,'P0067',2,'Active'),('TA17B842A6','R0034',3,'P0063',2,'Active'),('Ta1a8da830','R0027',1,'P0047',2,'Waiting'),('TA214ED071','R0009',2,'P0015',1,'Active'),('Ta26e859ba','R0036',1,'P0067',2,'Completed'),('TA2F980D3D','R0035',12,'P0065',2,'Completed'),('TA56FBD7C8','R0030',5,'P0053',2,'Completed'),('Ta6d88b61c','R0030',1,'P0052',1,'Completed'),('TA73926C9C','R0032',4,'P0056',1,'Completed'),('TB05C34A25','R0035',6,'P0064',1,'Completed'),('TB0C5859C7','R0032',3,'P0056',1,'Completed'),('TB36B4AFF8','R0019',2,'P0034',1,'Completed'),('TB4CBF7F84','R0030',3,'P0052',1,'Completed'),('TB4DC5D9F0','R0030',5,'P0052',1,'Completed'),('TB5B441DA8','R0005',10,'P0009',2,'Completed'),('TB939ADD23','R0005',2,'P0008',1,'Completed'),('TB96F31D73','R0021',5,'P0038',1,'Completed'),('TBAB5DAD17','R0030',3,'P0053',2,'Completed'),('Tbd2cbd01b','R0006',1,'P0011',2,'Waiting'),('TBE8A4E199','R0002',3,'P0003',2,'Active'),('TC36004471','R0019',7,'P0034',1,'Completed'),('TC3FE1A3CE','R0036',2,'P0066',1,'Completed'),('TC76910A7A','R0005',6,'P0009',2,'Completed'),('TC7D5D68C5','R0005',3,'P0009',2,'Completed'),('TC82160BA1','R0019',9,'P0034',1,'Completed'),('Tc828a84f4','R0015',1,'P0026',1,'Active'),('TCE14A4A6A','R0021',11,'P0039',2,'Completed'),('Tcf90b4c9f','R0002',1,'P0003',2,'Completed'),('Td02b2fbdc','R0035',1,'P0065',2,'Completed'),('TD150F08B2','R0035',4,'P0064',1,'Completed'),('TD3AB23919','R0021',7,'P0039',2,'Completed'),('Td3b76a78e','R0032',1,'P0056',1,'Completed'),('TD438DFEC6','R0002',2,'P0002',1,'Completed'),('Td6ae83780','R0034',1,'P0063',2,'Completed'),('TD865B7A43','R0003',2,'P0004',1,'Completed'),('Td94bf7df2','R0006',1,'P0010',1,'Active'),('TD98326D6B','R0005',8,'P0008',1,'Completed'),('TD9DC30FF4','R0005',11,'P0008',1,'Completed'),('TD9F4891D5','R0035',4,'P0065',2,'Completed'),('TDB358BEF2','R0035',12,'P0064',1,'Completed'),('Te03dd0f38','R0017',1,'P0031',2,'Waiting'),('TE2C8CB39E','R0021',4,'P0039',2,'Completed'),('TE34AFC468','R0021',4,'P0038',1,'Completed'),('TE629CF148','R0005',9,'P0008',1,'Completed'),('TE70F609C5','R0032',5,'P0057',2,'Active'),('TE7A0D550A','R0035',9,'P0065',2,'Completed'),('Te7b6c1824','R0005',1,'P0009',2,'Completed'),('TE89E5932E','R0032',4,'P0057',2,'Completed'),('TEE3F73971','R0005',8,'P0009',2,'Completed'),('TEEE7CDAC1','R0035',8,'P0064',1,'Completed'),('TEF33EAE96','R0030',4,'P0052',1,'Completed'),('TEF64D6074','R0005',9,'P0009',2,'Completed'),('TF024528BD','R0021',8,'P0038',1,'Completed'),('TF20B3C081','R0032',5,'P0056',1,'Completed'),('TF4915FF8A','R0035',7,'P0064',1,'Completed'),('Tf9ea98e81','R0028',1,'P0049',2,'Waiting'),('TFA76E0D0E','R0035',3,'P0065',2,'Completed'),('Tfa939b95f','R0015',1,'P0027',2,'Waiting'),('TFB0AF9E9A','R0005',7,'P0008',1,'Completed'),('Tfbe08e168','R0032',1,'P0057',2,'Completed'),('TFF755A279','R0019',4,'P0034',1,'Completed');
/*!40000 ALTER TABLE `turn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` varchar(10) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `active_session_id` varchar(255) DEFAULT NULL,
  `role` enum('player','admin') NOT NULL DEFAULT 'player',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('U0001','Chan 1','c1@gmail.com','$2b$10$4OCZld3D7bKwOok62jg75.tknnvYw0loFPEmrVFpH2gLN6HtVzG.y',NULL,'player'),('U0002','Chan','c2@gmail.com','$2b$10$h5Yz25Fx/vOT3ecU0oZYV.f0zmyJWPmue11g9LG0zQwduCE14l97S',NULL,'player'),('U0003','John','john@gmail.com','$2b$10$NwYdVo.RiLhPEbYQ4Ju8zOjbWuQvyxt79qSQYCk2wr4Z7Nxhe61Lm','B5i0KbUBsCsP7EVcLTZFlNaC4fLH-6y8','player'),('U0004','Chan 4','c4@gmail.com','$2b$10$anEPihTH9Q9bzrvFDegvoOxViPlBZII8m6qIK9GVZ3bcxVsrRrO8G','MqiMHvOaB0GaAomzCYAAKuS9XF2xZixU','player'),('U0005','Chan 5','c5@gmail.com','$2b$10$25sIH4B1t38mGg37SMS6xuk16leH0HqmBp4bOzP/4AVn4b86Xt5o2',NULL,'player'),('U0006','James New Username','jamesnewemail@gmail.com','$2b$10$rrjG9JxmIuLXFa2Kuu6FfuUQIRhAAtHjcA8D9QYDvGYBC8Sv/fRVa',NULL,'player'),('U0007','Janny New User Name','jannynewemail@gmail.com','$2b$10$n/KOYUGjXFCJzoSD8dLQseoAh9VkLMtB3cK2DRM4TZuKhR9Ia7dJm',NULL,'player'),('U0008','Admin','admin@gmail.com','$2b$10$.RSp0w1Y3vT.OGyl5Vl4leQ3gsMnp8vQnfcZFp3eGvLFdyLXIFBkG','HVjsbJlzyLtlgse-d6Vnn62BaktTnuR1','admin');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-21 17:12:30
