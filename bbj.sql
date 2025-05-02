/*
 Navicat Premium Dump SQL

 Source Server         : Mysql
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : bbj

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 01/05/2025 20:45:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for history_records
-- ----------------------------
DROP TABLE IF EXISTS `history_records`;
CREATE TABLE `history_records`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `id`(`id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 31 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of history_records
-- ----------------------------
INSERT INTO `history_records` VALUES (1, '《计算机组成原理教案》已生成，包含教学目标、重难点分析、教学过程等。', '教案', '2025-05-10 15:32:10');
INSERT INTO `history_records` VALUES (2, '《Python编程基础PPT》自动生成，含代码示例和练习题。', 'PPT', '2025-05-10 14:58:22');
INSERT INTO `history_records` VALUES (3, '《数据结构与算法习题集》已生成，包含常见题型及解析。', '习题', '2025-05-10 14:30:01');
INSERT INTO `history_records` VALUES (4, '《计算机网络原理教案》已生成，包含详细步骤和代码。', '教案', '2025-05-10 13:50:45');
INSERT INTO `history_records` VALUES (5, '《人工智能基础教学大纲》已生成，含课程目标、章节安排等。', '教学大纲', '2025-05-10 13:20:10');
INSERT INTO `history_records` VALUES (6, '《操作系统课程PPT》自动生成，含核心概念与应用案例。', 'PPT', '2025-05-10 12:55:33');
INSERT INTO `history_records` VALUES (7, '《网络安全基础习题》已生成，含详细解答。', '习题', '2025-05-10 12:30:12');
INSERT INTO `history_records` VALUES (8, '《Java程序设计教案》生成，包含项目流程与代码。', '教案', '2025-05-10 12:10:01');
INSERT INTO `history_records` VALUES (9, '《数据库原理PPT》生成，含基本概念与设计模式。', 'PPT', '2025-05-10 11:45:22');
INSERT INTO `history_records` VALUES (10, '《软件工程教程》已生成，汇总常用方法与技巧。', '图文', '2025-05-10 11:20:10');
INSERT INTO `history_records` VALUES (11, '《云计算课程习题集》自动生成，含典型问题及解答。', '习题', '2025-05-10 10:55:33');
INSERT INTO `history_records` VALUES (12, '《前端开发框架PPT》生成，含常用框架与实践案例。', 'PPT', '2025-05-10 10:30:12');
INSERT INTO `history_records` VALUES (13, '《计算机图形学教案》生成，讲解核心原理与算法。', '教案', '2025-05-10 10:10:01');
INSERT INTO `history_records` VALUES (14, '《信息安全基础图文》生成，包含数据加密与攻击防护方法。', '图文', '2025-05-10 09:45:22');
INSERT INTO `history_records` VALUES (15, '《计算机视觉习题集》已生成，含详细解析。', '习题', '2025-05-10 09:20:10');
INSERT INTO `history_records` VALUES (16, '《嵌入式系统基础教案》已生成，包含硬件接口与编程技巧。', '教案', '2025-01-15 09:20:00');
INSERT INTO `history_records` VALUES (17, '《C++数据结构PPT》自动生成，包含链表、树与图的应用。', 'PPT', '2025-01-15 09:35:00');
INSERT INTO `history_records` VALUES (18, '《软件架构设计习题集》已生成，包含常见问题及案例。', '习题', '2025-01-15 09:40:00');
INSERT INTO `history_records` VALUES (19, '《人工智能导论教案》已生成，介绍AI的核心算法与技术。', '教案', '2025-01-15 10:00:00');
INSERT INTO `history_records` VALUES (20, '《数据挖掘课程PPT》自动生成，讲解分类与聚类算法。', 'PPT', '2025-01-15 10:10:00');
INSERT INTO `history_records` VALUES (21, '《网络协议分析习题集》已生成，包含常见协议分析题目。', '习题', '2025-01-15 10:25:00');
INSERT INTO `history_records` VALUES (22, '《云计算架构教案》生成，包含虚拟化、容器与云服务。', '教案', '2025-01-15 10:50:00');
INSERT INTO `history_records` VALUES (23, '《数据库优化PPT》生成，讲解SQL查询优化与索引。', 'PPT', '2025-01-15 11:00:00');
INSERT INTO `history_records` VALUES (24, '《计算机安全技术习题集》已生成，含常见安全漏洞解析。', '习题', '2025-01-15 11:10:00');
INSERT INTO `history_records` VALUES (25, '《编译原理教案》已生成，讲解编译过程与优化技术。', '教案', '2025-01-15 11:20:00');
INSERT INTO `history_records` VALUES (26, '《前端框架与技术PPT》生成，介绍Vue.js与React框架。', 'PPT', '2025-01-15 11:30:00');
INSERT INTO `history_records` VALUES (27, '《操作系统习题集》已生成，包含内存管理与进程调度题目。', '习题', '2025-01-15 11:45:00');
INSERT INTO `history_records` VALUES (28, '《大数据分析教程》教案生成，介绍MapReduce与Hadoop技术。', '教案', '2025-01-15 12:00:00');
INSERT INTO `history_records` VALUES (29, '《区块链技术PPT》生成，讲解智能合约与加密技术。', 'PPT', '2025-01-15 12:10:00');
INSERT INTO `history_records` VALUES (30, '《深度学习基础习题集》已生成，含常见算法与应用。', '习题', '2025-01-15 12:20:00');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `school` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `subject` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'USER',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username_unique`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email_unique`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2a$10$KQpNRX6GsT8VZHRr.YmbYuDxdJJ1Vry7jy.mXkhXS11TzzN1hMXNK', '李老师', 'https://pic4.zhimg.com/80/v2-3dbd399559982ab3e3e0e5d621268c12_720w.webp', '13800000000', 'admin@example.com', '计算机科学大学', 'computer_science', '2023-04-01 10:00:00', '2023-04-01 10:00:00', '2023-04-01 10:00:00', 'ADMIN');
INSERT INTO `users` VALUES (2, 'teacher', '$2a$10$KQpNRX6GsT8VZHRr.YmbYuDxdJJ1Vry7jy.mXkhXS11TzzN1hMXNK', '张老师', 'https://pic1.zhimg.com/80/v2-d1a96aac1a7778cfe98a98b3fdba39cf_720w.webp', '13900000000', 'teacher@example.com', '计算机科学大学', 'programming', '2023-04-01 11:00:00', '2023-04-01 11:00:00', '2023-04-01 11:00:00', 'USER');

SET FOREIGN_KEY_CHECKS = 1;
