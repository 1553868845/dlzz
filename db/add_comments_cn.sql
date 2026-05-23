-- ============================================================
-- 数据库中文注释脚本
-- 数据库: dianshang
-- 给所有核心业务表及字段加上中文备注
-- ============================================================
USE dianshang;

-- ─── 1. 产品分类表（categories）─────────────────────────────
ALTER TABLE categories
  COMMENT = '产品分类',
  MODIFY COLUMN id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN name        VARCHAR(100) NOT NULL COMMENT '分类名称',
  MODIFY COLUMN slug        VARCHAR(100) NOT NULL COMMENT 'URL路径标识符（英文小写）',
  MODIFY COLUMN description TEXT                  COMMENT '分类描述',
  MODIFY COLUMN sort_order  INT          NOT NULL DEFAULT 0 COMMENT '排序权重，数字越小越靠前',
  MODIFY COLUMN created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  MODIFY COLUMN updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间';

-- ─── 2. 产品表（products）──────────────────────────────────
ALTER TABLE products
  COMMENT = '产品信息',
  MODIFY COLUMN id            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN category_id   BIGINT                   COMMENT '所属分类ID（关联 categories.id）',
  MODIFY COLUMN name          VARCHAR(200)    NOT NULL COMMENT '产品名称',
  MODIFY COLUMN slug          VARCHAR(200)    NOT NULL COMMENT 'URL路径标识符（英文小写）',
  MODIFY COLUMN subtitle      VARCHAR(300)             COMMENT '产品副标题',
  MODIFY COLUMN description   TEXT                     COMMENT '产品详情（支持HTML富文本）',
  MODIFY COLUMN short_desc    VARCHAR(500)             COMMENT '产品简短描述',
  MODIFY COLUMN purity        VARCHAR(50)              COMMENT '纯度，例如：≥99%',
  MODIFY COLUMN form_type     VARCHAR(50)              COMMENT '产品形态，例如：Lyophilized Powder（冻干粉）',
  MODIFY COLUMN storage       VARCHAR(200)             COMMENT '储存条件，例如：-20℃冷冻保存',
  MODIFY COLUMN specification VARCHAR(200)             COMMENT '规格，例如：5mg/vial',
  MODIFY COLUMN price         DECIMAL(10, 2)           COMMENT '售价（美元USD），NULL表示询价',
  MODIFY COLUMN stock_status  TINYINT         NOT NULL DEFAULT 1 COMMENT '库存状态：0=缺货，1=有货',
  MODIFY COLUMN is_featured   TINYINT         NOT NULL DEFAULT 0 COMMENT '是否首页推荐：0=否，1=是',
  MODIFY COLUMN image         VARCHAR(500)             COMMENT '产品封面图URL',
  MODIFY COLUMN sort_order    INT             NOT NULL DEFAULT 0 COMMENT '排序权重，数字越小越靠前',
  MODIFY COLUMN created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  MODIFY COLUMN updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间';

-- ─── 3. 轮播图表（banners）─────────────────────────────────
ALTER TABLE banners
  COMMENT = '首页轮播图',
  MODIFY COLUMN id          INT          NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN image_url   VARCHAR(500) NOT NULL COMMENT '轮播图片URL',
  MODIFY COLUMN sort_order  INT          NOT NULL DEFAULT 0 COMMENT '排序权重，数字越小越靠前',
  MODIFY COLUMN description VARCHAR(300)          COMMENT '图片描述文字（可选）',
  MODIFY COLUMN is_active   TINYINT      NOT NULL DEFAULT 1 COMMENT '是否启用：0=禁用，1=启用',
  MODIFY COLUMN link_url    VARCHAR(500)          COMMENT '点击轮播图后跳转的URL（可为空）',
  MODIFY COLUMN created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  MODIFY COLUMN updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间';

-- ─── 4. 文章/新闻表（article）──────────────────────────────
ALTER TABLE article
  COMMENT = '文章与新闻',
  MODIFY COLUMN id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN title        VARCHAR(300) NOT NULL COMMENT '文章标题',
  MODIFY COLUMN slug         VARCHAR(300) NOT NULL COMMENT 'URL路径标识符（英文小写）',
  MODIFY COLUMN excerpt      TEXT                  COMMENT '文章摘要（列表页显示）',
  MODIFY COLUMN content      LONGTEXT              COMMENT '文章正文（支持HTML富文本）',
  MODIFY COLUMN cover_image  VARCHAR(500)          COMMENT '封面图URL',
  MODIFY COLUMN category     VARCHAR(100)          COMMENT '文章分类标签，如：news/research/science',
  MODIFY COLUMN author       VARCHAR(100)          COMMENT '作者名称',
  MODIFY COLUMN view_count   INT          NOT NULL DEFAULT 0 COMMENT '浏览次数',
  MODIFY COLUMN published    TINYINT      NOT NULL DEFAULT 1 COMMENT '发布状态：0=草稿，1=已发布',
  MODIFY COLUMN published_at DATETIME              COMMENT '发布时间',
  MODIFY COLUMN created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  MODIFY COLUMN updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间';

-- ─── 5. 联系/报价留言表（contact_message）──────────────────
ALTER TABLE contact_message
  COMMENT = '用户联系与报价留言',
  MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN form_type  VARCHAR(20)  NOT NULL DEFAULT 'contact' COMMENT '表单类型：contact=联系我们，quote=询价',
  MODIFY COLUMN name       VARCHAR(100) NOT NULL COMMENT '留言人姓名',
  MODIFY COLUMN email      VARCHAR(200) NOT NULL COMMENT '留言人邮箱',
  MODIFY COLUMN phone      VARCHAR(50)            COMMENT '联系电话（可选）',
  MODIFY COLUMN company    VARCHAR(200)           COMMENT '所在公司（可选）',
  MODIFY COLUMN subject    VARCHAR(300)           COMMENT '留言主题',
  MODIFY COLUMN product    VARCHAR(200)           COMMENT '询价产品名称（仅报价表单）',
  MODIFY COLUMN quantity   VARCHAR(100)           COMMENT '询价数量（仅报价表单）',
  MODIFY COLUMN message    TEXT         NOT NULL COMMENT '留言内容',
  MODIFY COLUMN status     TINYINT      NOT NULL DEFAULT 0 COMMENT '处理状态：0=未读，1=已读，2=已回复',
  MODIFY COLUMN ip_address VARCHAR(50)            COMMENT '提交者IP地址',
  MODIFY COLUMN created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间';

-- ─── 6. 网站配置表（site_config）───────────────────────────
ALTER TABLE site_config
  COMMENT = '网站全局配置（键值对存储）',
  MODIFY COLUMN id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN cfg_key     VARCHAR(100) NOT NULL COMMENT '配置键名（唯一），如：site_name、company_email',
  MODIFY COLUMN cfg_value   TEXT                  COMMENT '配置值',
  MODIFY COLUMN description VARCHAR(300)          COMMENT '该配置项的用途说明',
  MODIFY COLUMN updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间';

-- ─── 7. 常见问题表（faq）───────────────────────────────────
ALTER TABLE faq
  COMMENT = '常见问题（FAQ）',
  MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN question   VARCHAR(500) NOT NULL COMMENT '问题内容',
  MODIFY COLUMN answer     TEXT         NOT NULL COMMENT '答案内容',
  MODIFY COLUMN category   VARCHAR(100)          COMMENT '问题分类标签，如：Quality/Storage/Payment/Shipping',
  MODIFY COLUMN sort_order INT          NOT NULL DEFAULT 0 COMMENT '排序权重，数字越小越靠前',
  MODIFY COLUMN published  TINYINT      NOT NULL DEFAULT 1 COMMENT '是否显示：0=隐藏，1=显示',
  MODIFY COLUMN created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';

-- ─── 8. 首页统计数字表（stat_item）─────────────────────────
ALTER TABLE stat_item
  COMMENT = '首页展示统计数字（如：5000+ 客户）',
  MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN label      VARCHAR(100) NOT NULL COMMENT '统计项标签，如：Happy Customers、Products',
  MODIFY COLUMN value      VARCHAR(50)  NOT NULL COMMENT '统计数值，如：5000+、200+',
  MODIFY COLUMN icon       VARCHAR(100)          COMMENT '图标名称（对应前端图标库）',
  MODIFY COLUMN sort_order INT          NOT NULL DEFAULT 0 COMMENT '排序权重，数字越小越靠前';

-- ─── 9. 管理员账号表（users）───────────────────────────────
ALTER TABLE users
  COMMENT = '后台管理员账号',
  MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  MODIFY COLUMN username   VARCHAR(100) NOT NULL COMMENT '登录用户名（唯一）',
  MODIFY COLUMN password   VARCHAR(255) NOT NULL COMMENT '登录密码（BCrypt加密哈希）',
  MODIFY COLUMN name       VARCHAR(100)          COMMENT '显示名称',
  MODIFY COLUMN role       VARCHAR(50)  NOT NULL DEFAULT 'admin' COMMENT '角色：admin=超级管理员',
  MODIFY COLUMN created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '账号创建时间',
  MODIFY COLUMN updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间';

SELECT '✅ 所有表的中文注释已添加完成！' AS result;
