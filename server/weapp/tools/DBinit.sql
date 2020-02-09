SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 1;

DROP TABLE IF EXISTS `cSessionInfo`;
DROP TABLE IF EXISTS `cActivity`;
DROP TABLE IF EXISTS `cSessionInfo`;
DROP TABLE IF EXISTS `cImages`;

CREATE TABLE `cSessionInfo` (
  `open_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uuid` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_visit_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `skey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `session_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_info` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `joinedAc` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT'#',
  `userId` int(10) COLLATE utf8mb4_unicode_ci NOT NULL auto_increment,
  
  PRIMARY KEY (`open_id`),
  KEY `openid` (`open_id`) USING BTREE,
  KEY `skey` (`skey`) USING BTREE,
  KEY `userId` (`userId`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话管理用户信息';

CREATE TABLE `cActivity`(
 `acId`  int(10) COLLATE utf8mb4_unicode_ci NOT NULL auto_increment,
 `acCreateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `acInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
 `creatorId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
 `creatorInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
 `statusCode` int COLLATE utf8mb4_unicode_ci NOT NULL,
 `memberList` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT '#',
 `acLocation` varchar(2048) COLLATE utf8mb4_unicode_ci,
 `acImgList` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT'#',
 `acBillList` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT'#',

 PRIMARY KEY(`acId`),
 KEY `acId` (`acId`) USING BTREE,
 constraint FK_AC_ID foreign key(creatorId) references cSessionInfo(open_id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户创建活动信息';


CREATE TABLE `cImages`(
 `acImgId`  int(10) COLLATE utf8mb4_unicode_ci NOT NULL auto_increment,
 `acImgCreateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `imgCreatorId` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
 `acImgUrl` varchar(2048) COLLATE utf8mb4_unicode_ci,

 PRIMARY KEY(`acImgId`),
 KEY `acImgId` (`acImgId`) USING BTREE

)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户上传活动图片';

CREATE TABLE `cBill`(
 `billId`  int(10) COLLATE utf8mb4_unicode_ci NOT NULL auto_increment,
 `billCreateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
 `billType`  varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
 `billInfo` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,

 PRIMARY KEY(`billId`),
 KEY `billId` (`billId`) USING BTREE
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户创建账单信息';
