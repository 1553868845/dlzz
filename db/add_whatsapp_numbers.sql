-- ============================================================
-- WhatsApp 多号码轮换表
-- 数据库：dianshang
-- 功能：存储多个 WhatsApp 号码，前台按 sort_order 升序轮换显示
-- ============================================================

USE dianshang;

-- 创建 whatsapp_numbers 表
CREATE TABLE IF NOT EXISTS `whatsapp_numbers` (
  `id`         INT UNSIGNED     NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `number`     VARCHAR(30)      NOT NULL                COMMENT 'WhatsApp号码（纯数字，含国际区号，不含+，如 85247488025）',
  `label`      VARCHAR(100)     NOT NULL DEFAULT ''     COMMENT '备注标签（如：香港号码1、测试号等）',
  `sort_order` INT              NOT NULL DEFAULT 0      COMMENT '排序值，升序排列，值越小越优先轮换',
  `is_active`  TINYINT(1)       NOT NULL DEFAULT 1      COMMENT '是否启用：1=启用，0=禁用',
  `created_at` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort_active` (`sort_order`, `is_active`) COMMENT '排序+状态联合索引，优化轮换查询'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='WhatsApp多号码轮换表';

-- ============================================================
-- 轮换计数器：记录当前已轮换到哪个号码
-- 每次访问网站时，后端按 sort_order 取下一个启用的号码
-- ============================================================
-- 方案：在 site_config 中存储当前轮换索引（sort_order 的当前值）
-- key='whatsapp_rotate_index' value=上次显示号码的 sort_order 值

INSERT INTO `site_config` (`cfg_key`, `cfg_value`, `description`)
VALUES ('whatsapp_rotate_index', '0', 'WhatsApp号码轮换计数器，记录上次已显示到哪个号码的sort_order')
ON DUPLICATE KEY UPDATE
  `description` = 'WhatsApp号码轮换计数器，记录上次已显示到哪个sort_order';

-- ============================================================
-- 初始化示例数据（可选，仅供测试）
-- 生产环境请通过后台管理界面添加
-- ============================================================
-- INSERT INTO `whatsapp_numbers` (`number`, `label`, `sort_order`, `is_active`)
-- VALUES
--   ('85247488025', '香港号码1', 1, 1),
--   ('85298765432', '香港号码2', 2, 1),
--   ('8613800138000', '大陆号码', 3, 1);

-- ============================================================
-- 备注：轮换逻辑（后端 Java 实现）
-- 1. 查询所有 is_active=1 的号码，按 sort_order ASC 排序
-- 2. 从 site_config 读取 whatsapp_rotate_index（上次的 sort_order）
-- 3. 找到第一个 sort_order > whatsapp_rotate_index 的号码
-- 4. 如果没有（已到末尾），取 sort_order 最小的号码（循环）
-- 5. 更新 whatsapp_rotate_index 为当前号码的 sort_order
-- 6. 返回当前号码
-- ============================================================
