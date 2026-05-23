-- ============================================================
-- Qing Li Mall  数据库建表脚本  v2.0
-- MySQL 5.7+  数据库: dianshang
-- 包含：中文(zh)、西班牙语(es) 多语言字段
-- ============================================================

CREATE DATABASE IF NOT EXISTS dianshang DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dianshang;

-- ─── 1. 产品分类（categories）────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL COMMENT '分类名称(EN)',
    slug        VARCHAR(100) NOT NULL COMMENT 'URL slug',
    description TEXT                  COMMENT '分类描述',
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    name_zh     VARCHAR(100)          COMMENT '分类名称(ZH)',
    name_es     VARCHAR(100)          COMMENT '分类名称(ES)',
    PRIMARY KEY (id),
    UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品分类';

-- ─── 2. 产品表（products）───────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    category_id         BIGINT                   COMMENT '所属分类',
    name                VARCHAR(200)    NOT NULL COMMENT '产品名称(EN)',
    slug                VARCHAR(200)    NOT NULL COMMENT 'URL slug',
    subtitle            VARCHAR(300)             COMMENT '产品副标题(EN)',
    description         TEXT                     COMMENT '产品详情HTML(EN)',
    short_desc          VARCHAR(500)             COMMENT '短描述(EN)',
    purity              VARCHAR(50)              COMMENT '纯度(EN)',
    form_type           VARCHAR(50)              COMMENT '形态(EN)',
    storage             VARCHAR(200)             COMMENT '储存条件(EN)',
    specification       VARCHAR(200)             COMMENT '规格(EN)',
    price               DECIMAL(10, 2)           COMMENT '价格(USD)，NULL=询价',
    stock_status        TINYINT         NOT NULL DEFAULT 1 COMMENT '0=缺货 1=有货',
    is_featured         TINYINT         NOT NULL DEFAULT 0 COMMENT '是否首页推荐',
    image               VARCHAR(500)             COMMENT '封面图URL',
    sort_order          INT             NOT NULL DEFAULT 0,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- 中文字段
    name_zh             VARCHAR(255)             COMMENT '产品名称(ZH)',
    subtitle_zh         VARCHAR(255)             COMMENT '副标题(ZH)',
    short_desc_zh       TEXT                     COMMENT '短描述(ZH)',
    description_zh      TEXT                     COMMENT '详情HTML(ZH)',
    purity_zh           VARCHAR(50)              COMMENT '纯度(ZH)',
    form_zh             VARCHAR(50)              COMMENT '形态(ZH)',
    storage_zh          VARCHAR(100)             COMMENT '储存条件(ZH)',
    specification_zh    TEXT                     COMMENT '规格(ZH)',
    -- 西班牙语字段
    name_es             VARCHAR(200)             COMMENT '产品名称(ES)',
    subtitle_es         VARCHAR(300)             COMMENT '副标题(ES)',
    short_desc_es       TEXT                     COMMENT '短描述(ES)',
    description_es      TEXT                     COMMENT '详情HTML(ES)',
    purity_es           VARCHAR(50)              COMMENT '纯度(ES)',
    form_es             VARCHAR(50)              COMMENT '形态(ES)',
    storage_es          VARCHAR(100)             COMMENT '储存条件(ES)',
    specification_es    VARCHAR(100)             COMMENT '规格(ES)',
    PRIMARY KEY (id),
    UNIQUE KEY uk_slug (slug),
    KEY idx_category (category_id),
    KEY idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品';

-- ─── 3. 轮播图（banners）────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
    id          INT          NOT NULL AUTO_INCREMENT,
    image_url   VARCHAR(500) NOT NULL COMMENT '图片URL',
    sort_order  INT          NOT NULL DEFAULT 0,
    description VARCHAR(300)          COMMENT '描述文字',
    is_active   TINYINT      NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
    link_url    VARCHAR(500)          COMMENT '点击跳转URL',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图';

-- ─── 4. 文章/新闻（article）─────────────────────────────────
CREATE TABLE IF NOT EXISTS article (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(300) NOT NULL COMMENT '文章标题(EN)',
    slug         VARCHAR(300) NOT NULL COMMENT 'URL slug',
    excerpt      TEXT                  COMMENT '摘要(EN)',
    content      LONGTEXT              COMMENT '正文HTML(EN)',
    cover_image  VARCHAR(500)          COMMENT '封面图',
    category     VARCHAR(100)          COMMENT '文章分类，如 news/research',
    author       VARCHAR(100)          COMMENT '作者',
    view_count   INT          NOT NULL DEFAULT 0,
    published    TINYINT      NOT NULL DEFAULT 1 COMMENT '0=草稿 1=发布',
    published_at DATETIME              COMMENT '发布时间',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- 中文字段
    title_zh     VARCHAR(255)          COMMENT '标题(ZH)',
    excerpt_zh   TEXT                  COMMENT '摘要(ZH)',
    content_zh   TEXT                  COMMENT '正文HTML(ZH)',
    -- 西班牙语字段
    title_es     VARCHAR(200)          COMMENT '标题(ES)',
    excerpt_es   TEXT                  COMMENT '摘要(ES)',
    content_es   MEDIUMTEXT            COMMENT '正文HTML(ES)',
    PRIMARY KEY (id),
    UNIQUE KEY uk_slug (slug),
    KEY idx_category (category),
    KEY idx_published (published, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文章';

-- ─── 5. 联系表单留言（contact_message）──────────────────────
CREATE TABLE IF NOT EXISTS contact_message (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    form_type   VARCHAR(20)  NOT NULL DEFAULT 'contact' COMMENT 'contact | quote',
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(200) NOT NULL,
    phone       VARCHAR(50)            COMMENT '电话',
    company     VARCHAR(200)           COMMENT '公司',
    subject     VARCHAR(300)           COMMENT '主题',
    product     VARCHAR(200)           COMMENT '产品',
    quantity    VARCHAR(100)           COMMENT '数量',
    message     TEXT         NOT NULL,
    status      TINYINT      NOT NULL DEFAULT 0 COMMENT '0=未读 1=已读 2=已回复',
    ip_address  VARCHAR(50),
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_status (status),
    KEY idx_form_type (form_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='联系/报价留言';

-- ─── 6. 网站配置（site_config）──────────────────────────────
CREATE TABLE IF NOT EXISTS site_config (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    cfg_key     VARCHAR(100) NOT NULL COMMENT '配置键',
    cfg_value   TEXT                  COMMENT '配置值',
    description VARCHAR(300)          COMMENT '说明',
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_key (cfg_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网站配置';

-- ─── 7. FAQ ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS faq (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    question    VARCHAR(500) NOT NULL  COMMENT '问题(EN)',
    answer      TEXT         NOT NULL  COMMENT '答案(EN)',
    category    VARCHAR(100)           COMMENT '分类标签',
    sort_order  INT          NOT NULL DEFAULT 0,
    published   TINYINT      NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    question_zh TEXT                   COMMENT '问题(ZH)',
    answer_zh   TEXT                   COMMENT '答案(ZH)',
    question_es VARCHAR(500)           COMMENT '问题(ES)',
    answer_es   TEXT                   COMMENT '答案(ES)',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='常见问题';

-- ─── 8. 首页统计数字（stat_item）────────────────────────────
CREATE TABLE IF NOT EXISTS stat_item (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    label       VARCHAR(100) NOT NULL COMMENT '标签(EN)',
    value       VARCHAR(50)  NOT NULL COMMENT '数值，如 5000+',
    icon        VARCHAR(100)          COMMENT '图标名',
    sort_order  INT          NOT NULL DEFAULT 0,
    label_zh    VARCHAR(100)          COMMENT '标签(ZH)',
    label_es    VARCHAR(100)          COMMENT '标签(ES)',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页统计数字';

-- ─── 9. 管理员账号（users）──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    username    VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL COMMENT 'BCrypt hash',
    name        VARCHAR(100)          COMMENT '显示名',
    role        VARCHAR(50)  NOT NULL DEFAULT 'admin',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员';

-- ─── 10. WhatsApp 多号码（whatsapp_numbers）─────────────────
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    number      VARCHAR(50)  NOT NULL COLLATE utf8mb4_unicode_ci COMMENT 'WhatsApp号码',
    label       VARCHAR(100) DEFAULT '' COLLATE utf8mb4_unicode_ci COMMENT '标签',
    sort_order  INT          NOT NULL DEFAULT 0 COMMENT '排序值（用于轮换）',
    is_active   TINYINT      NOT NULL DEFAULT 1 COMMENT '是否启用（1=是，0=否）',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='WhatsApp多号码表';

-- ─── 11. 页面内容（page_contents）──────────────────────────
-- 注：page_content（旧表）和 page_contents（新表）同时存在，新系统用 page_contents
CREATE TABLE IF NOT EXISTS page_content (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    slug        VARCHAR(100) NOT NULL,
    title       VARCHAR(300) NOT NULL,
    title_zh    VARCHAR(300)          COMMENT '标题(ZH)',
    content     TEXT,
    content_zh  TEXT                  COMMENT '内容(ZH)',
    updated_at  DATETIME              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS page_contents (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    slug        VARCHAR(100) NOT NULL,
    title       VARCHAR(200) NOT NULL DEFAULT '',
    title_zh    VARCHAR(200)          COMMENT '标题(ZH)',
    title_es    VARCHAR(200)          COMMENT '标题(ES)',
    content     TEXT                  COMMENT '内容(EN)',
    content_zh  TEXT                  COMMENT '内容(ZH)',
    content_es  TEXT                  COMMENT '内容(ES)',
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
