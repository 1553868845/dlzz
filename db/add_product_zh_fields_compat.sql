-- ============================================================
-- 产品表新增中文字段（兼容 MySQL 5.7+）
-- 用存储过程检查字段是否存在，避免重复执行报错
-- ============================================================

DROP PROCEDURE IF EXISTS add_zh_columns;

DELIMITER $$
CREATE PROCEDURE add_zh_columns()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'name_zh') THEN
    ALTER TABLE products ADD COLUMN name_zh VARCHAR(255) DEFAULT NULL COMMENT '中文名称';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'subtitle_zh') THEN
    ALTER TABLE products ADD COLUMN subtitle_zh VARCHAR(500) DEFAULT NULL COMMENT '中文副标题';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'short_desc_zh') THEN
    ALTER TABLE products ADD COLUMN short_desc_zh TEXT DEFAULT NULL COMMENT '中文简短描述';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'description_zh') THEN
    ALTER TABLE products ADD COLUMN description_zh LONGTEXT DEFAULT NULL COMMENT '中文详细描述';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'purity_zh') THEN
    ALTER TABLE products ADD COLUMN purity_zh VARCHAR(100) DEFAULT NULL COMMENT '中文纯度';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'form_zh') THEN
    ALTER TABLE products ADD COLUMN form_zh VARCHAR(100) DEFAULT NULL COMMENT '中文剂型';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'storage_zh') THEN
    ALTER TABLE products ADD COLUMN storage_zh VARCHAR(200) DEFAULT NULL COMMENT '中文储存条件';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'specification_zh') THEN
    ALTER TABLE products ADD COLUMN specification_zh VARCHAR(200) DEFAULT NULL COMMENT '中文规格';
  END IF;
END$$
DELIMITER ;

CALL add_zh_columns();
DROP PROCEDURE IF EXISTS add_zh_columns;

-- 验证结果
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'products'
  AND COLUMN_NAME LIKE '%_zh'
ORDER BY ORDINAL_POSITION;
