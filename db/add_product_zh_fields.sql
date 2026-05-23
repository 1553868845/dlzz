-- ============================================================
-- 产品表新增中文字段
-- 执行一次即可，重复执行不报错（IF NOT EXISTS / IGNORE）
-- ============================================================

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS name_zh         VARCHAR(255) DEFAULT NULL COMMENT '中文名称',
  ADD COLUMN IF NOT EXISTS subtitle_zh     VARCHAR(500) DEFAULT NULL COMMENT '中文副标题',
  ADD COLUMN IF NOT EXISTS short_desc_zh   TEXT         DEFAULT NULL COMMENT '中文简短描述',
  ADD COLUMN IF NOT EXISTS description_zh  LONGTEXT     DEFAULT NULL COMMENT '中文详细描述',
  ADD COLUMN IF NOT EXISTS purity_zh       VARCHAR(100) DEFAULT NULL COMMENT '中文纯度',
  ADD COLUMN IF NOT EXISTS form_zh         VARCHAR(100) DEFAULT NULL COMMENT '中文剂型',
  ADD COLUMN IF NOT EXISTS storage_zh      VARCHAR(200) DEFAULT NULL COMMENT '中文储存条件',
  ADD COLUMN IF NOT EXISTS specification_zh VARCHAR(200) DEFAULT NULL COMMENT '中文规格';
