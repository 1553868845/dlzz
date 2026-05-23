# -*- coding: utf-8 -*-
"""
通过 pymysql 直接执行 ALTER TABLE，给 dianshang 数据库所有核心表添加中文注释
"""
import pymysql

conn = pymysql.connect(
    host='127.0.0.1', port=3306,
    user='root', password='668668',
    database='dianshang', charset='utf8mb4'
)
cursor = conn.cursor()

statements = [

    # ── 1. 产品分类表 ──────────────────────────────────────────
    "ALTER TABLE categories COMMENT = '产品分类'",
    "ALTER TABLE categories MODIFY COLUMN id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID'",
    "ALTER TABLE categories MODIFY COLUMN name        VARCHAR(100) NOT NULL                COMMENT '分类名称'",
    "ALTER TABLE categories MODIFY COLUMN slug        VARCHAR(100) NOT NULL                COMMENT 'URL路径标识符（英文小写）'",
    "ALTER TABLE categories MODIFY COLUMN description TEXT                                 COMMENT '分类描述'",
    "ALTER TABLE categories MODIFY COLUMN sort_order  INT          NOT NULL DEFAULT 0      COMMENT '排序权重，数字越小越靠前'",
    "ALTER TABLE categories MODIFY COLUMN created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'",
    "ALTER TABLE categories MODIFY COLUMN updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'",

    # ── 2. 产品表 ──────────────────────────────────────────────
    "ALTER TABLE products COMMENT = '产品信息'",
    "ALTER TABLE products MODIFY COLUMN id            BIGINT          NOT NULL AUTO_INCREMENT COMMENT '主键ID'",
    "ALTER TABLE products MODIFY COLUMN category_id   BIGINT                                 COMMENT '所属分类ID（关联 categories.id）'",
    "ALTER TABLE products MODIFY COLUMN name          VARCHAR(200)    NOT NULL               COMMENT '产品名称'",
    "ALTER TABLE products MODIFY COLUMN slug          VARCHAR(200)    NOT NULL               COMMENT 'URL路径标识符（英文小写）'",
    "ALTER TABLE products MODIFY COLUMN subtitle      VARCHAR(300)                           COMMENT '产品副标题'",
    "ALTER TABLE products MODIFY COLUMN description   TEXT                                   COMMENT '产品详情（支持HTML富文本）'",
    "ALTER TABLE products MODIFY COLUMN short_desc    VARCHAR(500)                           COMMENT '产品简短描述'",
    "ALTER TABLE products MODIFY COLUMN purity        VARCHAR(50)                            COMMENT '纯度，例如：≥99%'",
    "ALTER TABLE products MODIFY COLUMN form_type     VARCHAR(50)                            COMMENT '产品形态，例如：Lyophilized Powder（冻干粉）'",
    "ALTER TABLE products MODIFY COLUMN storage       VARCHAR(200)                           COMMENT '储存条件，例如：-20℃冷冻保存'",
    "ALTER TABLE products MODIFY COLUMN specification VARCHAR(200)                           COMMENT '规格，例如：5mg/vial'",
    "ALTER TABLE products MODIFY COLUMN price         DECIMAL(10,2)                          COMMENT '售价（美元USD），NULL表示询价'",
    "ALTER TABLE products MODIFY COLUMN stock_status  TINYINT         NOT NULL DEFAULT 1     COMMENT '库存状态：0=缺货，1=有货'",
    "ALTER TABLE products MODIFY COLUMN is_featured   TINYINT         NOT NULL DEFAULT 0     COMMENT '是否首页推荐：0=否，1=是'",
    "ALTER TABLE products MODIFY COLUMN image         VARCHAR(500)                           COMMENT '产品封面图URL'",
    "ALTER TABLE products MODIFY COLUMN sort_order    INT             NOT NULL DEFAULT 0     COMMENT '排序权重，数字越小越靠前'",
    "ALTER TABLE products MODIFY COLUMN created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'",
    "ALTER TABLE products MODIFY COLUMN updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'",

    # ── 3. 轮播图表 ──────────────────────────────────────────
    "ALTER TABLE banners COMMENT = '首页轮播图'",
    "ALTER TABLE banners MODIFY COLUMN id          INT          NOT NULL AUTO_INCREMENT COMMENT '主键ID'",
    "ALTER TABLE banners MODIFY COLUMN image_url   VARCHAR(500) NOT NULL               COMMENT '轮播图片URL'",
    "ALTER TABLE banners MODIFY COLUMN sort_order  INT          NOT NULL DEFAULT 0     COMMENT '排序权重，数字越小越靠前'",
    "ALTER TABLE banners MODIFY COLUMN description VARCHAR(300)                        COMMENT '图片描述文字（可选）'",
    "ALTER TABLE banners MODIFY COLUMN is_active   TINYINT      NOT NULL DEFAULT 1     COMMENT '是否启用：0=禁用，1=启用'",
    "ALTER TABLE banners MODIFY COLUMN link_url    VARCHAR(500)                        COMMENT '点击轮播图后跳转的URL（可为空）'",
    "ALTER TABLE banners MODIFY COLUMN created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'",
    "ALTER TABLE banners MODIFY COLUMN updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'",

    # ── 4. 文章/新闻表 ────────────────────────────────────────
    "ALTER TABLE article COMMENT = '文章与新闻'",
    "ALTER TABLE article MODIFY COLUMN id           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID'",
    "ALTER TABLE article MODIFY COLUMN title        VARCHAR(300) NOT NULL               COMMENT '文章标题'",
    "ALTER TABLE article MODIFY COLUMN slug         VARCHAR(300) NOT NULL               COMMENT 'URL路径标识符（英文小写）'",
    "ALTER TABLE article MODIFY COLUMN excerpt      TEXT                                COMMENT '文章摘要（列表页显示）'",
    "ALTER TABLE article MODIFY COLUMN content      LONGTEXT                            COMMENT '文章正文（支持HTML富文本）'",
    "ALTER TABLE article MODIFY COLUMN cover_image  VARCHAR(500)                        COMMENT '封面图URL'",
    "ALTER TABLE article MODIFY COLUMN category     VARCHAR(100)                        COMMENT '文章分类标签，如：news/research/science'",
    "ALTER TABLE article MODIFY COLUMN author       VARCHAR(100)                        COMMENT '作者名称'",
    "ALTER TABLE article MODIFY COLUMN view_count   INT          NOT NULL DEFAULT 0     COMMENT '浏览次数'",
    "ALTER TABLE article MODIFY COLUMN published    TINYINT      NOT NULL DEFAULT 1     COMMENT '发布状态：0=草稿，1=已发布'",
    "ALTER TABLE article MODIFY COLUMN published_at DATETIME                            COMMENT '发布时间'",
    "ALTER TABLE article MODIFY COLUMN created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'",
    "ALTER TABLE article MODIFY COLUMN updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'",

    # ── 5. 联系/报价留言表 ────────────────────────────────────
    "ALTER TABLE contact_message COMMENT = '用户联系与报价留言'",
    "ALTER TABLE contact_message MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT     COMMENT '主键ID'",
    "ALTER TABLE contact_message MODIFY COLUMN form_type  VARCHAR(20)  NOT NULL DEFAULT 'contact'  COMMENT '表单类型：contact=联系我们，quote=询价'",
    "ALTER TABLE contact_message MODIFY COLUMN name       VARCHAR(100) NOT NULL                    COMMENT '留言人姓名'",
    "ALTER TABLE contact_message MODIFY COLUMN email      VARCHAR(200) NOT NULL                    COMMENT '留言人邮箱'",
    "ALTER TABLE contact_message MODIFY COLUMN phone      VARCHAR(50)                              COMMENT '联系电话（可选）'",
    "ALTER TABLE contact_message MODIFY COLUMN company    VARCHAR(200)                             COMMENT '所在公司（可选）'",
    "ALTER TABLE contact_message MODIFY COLUMN subject    VARCHAR(300)                             COMMENT '留言主题'",
    "ALTER TABLE contact_message MODIFY COLUMN product    VARCHAR(200)                             COMMENT '询价产品名称（仅报价表单）'",
    "ALTER TABLE contact_message MODIFY COLUMN quantity   VARCHAR(100)                             COMMENT '询价数量（仅报价表单）'",
    "ALTER TABLE contact_message MODIFY COLUMN message    TEXT         NOT NULL                    COMMENT '留言内容'",
    "ALTER TABLE contact_message MODIFY COLUMN status     TINYINT      NOT NULL DEFAULT 0          COMMENT '处理状态：0=未读，1=已读，2=已回复'",
    "ALTER TABLE contact_message MODIFY COLUMN ip_address VARCHAR(50)                              COMMENT '提交者IP地址'",
    "ALTER TABLE contact_message MODIFY COLUMN created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '提交时间'",

    # ── 6. 网站配置表 ─────────────────────────────────────────
    "ALTER TABLE site_config COMMENT = '网站全局配置（键值对存储）'",
    "ALTER TABLE site_config MODIFY COLUMN id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID'",
    "ALTER TABLE site_config MODIFY COLUMN cfg_key     VARCHAR(100) NOT NULL               COMMENT '配置键名（唯一），如：site_name、company_email'",
    "ALTER TABLE site_config MODIFY COLUMN cfg_value   TEXT                                COMMENT '配置值'",
    "ALTER TABLE site_config MODIFY COLUMN description VARCHAR(300)                        COMMENT '该配置项的用途说明'",
    "ALTER TABLE site_config MODIFY COLUMN updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'",

    # ── 7. 常见问题表 ─────────────────────────────────────────
    "ALTER TABLE faq COMMENT = '常见问题（FAQ）'",
    "ALTER TABLE faq MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID'",
    "ALTER TABLE faq MODIFY COLUMN question   VARCHAR(500) NOT NULL               COMMENT '问题内容'",
    "ALTER TABLE faq MODIFY COLUMN answer     TEXT         NOT NULL               COMMENT '答案内容'",
    "ALTER TABLE faq MODIFY COLUMN category   VARCHAR(100)                        COMMENT '问题分类标签，如：Quality/Storage/Payment/Shipping'",
    "ALTER TABLE faq MODIFY COLUMN sort_order INT          NOT NULL DEFAULT 0     COMMENT '排序权重，数字越小越靠前'",
    "ALTER TABLE faq MODIFY COLUMN published  TINYINT      NOT NULL DEFAULT 1     COMMENT '是否显示：0=隐藏，1=显示'",
    "ALTER TABLE faq MODIFY COLUMN created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'",

    # ── 8. 首页统计数字表 ─────────────────────────────────────
    "ALTER TABLE stat_item COMMENT = '首页展示统计数字（如：5000+客户）'",
    "ALTER TABLE stat_item MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID'",
    "ALTER TABLE stat_item MODIFY COLUMN label      VARCHAR(100) NOT NULL               COMMENT '统计项标签，如：Happy Customers、Products'",
    "ALTER TABLE stat_item MODIFY COLUMN value      VARCHAR(50)  NOT NULL               COMMENT '统计数值，如：5000+、200+'",
    "ALTER TABLE stat_item MODIFY COLUMN icon       VARCHAR(100)                        COMMENT '图标名称（对应前端图标库）'",
    "ALTER TABLE stat_item MODIFY COLUMN sort_order INT          NOT NULL DEFAULT 0     COMMENT '排序权重，数字越小越靠前'",

    # ── 9. 管理员账号表 ───────────────────────────────────────
    "ALTER TABLE users COMMENT = '后台管理员账号'",
    "ALTER TABLE users MODIFY COLUMN id         BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '主键ID'",
    "ALTER TABLE users MODIFY COLUMN username   VARCHAR(100) NOT NULL                 COMMENT '登录用户名（唯一）'",
    "ALTER TABLE users MODIFY COLUMN password   VARCHAR(255) NOT NULL                 COMMENT '登录密码（BCrypt加密哈希）'",
    "ALTER TABLE users MODIFY COLUMN name       VARCHAR(100)                          COMMENT '显示名称'",
    "ALTER TABLE users MODIFY COLUMN role       VARCHAR(50)  NOT NULL DEFAULT 'admin' COMMENT '角色：admin=超级管理员'",
    "ALTER TABLE users MODIFY COLUMN created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '账号创建时间'",
    "ALTER TABLE users MODIFY COLUMN updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后更新时间'",
]

success = 0
errors = []
for sql in statements:
    try:
        cursor.execute(sql)
        conn.commit()
        success += 1
    except Exception as e:
        errors.append(f"❌ {e}\n   SQL: {sql[:80]}...")

print(f"\n[OK] 成功执行 {success}/{len(statements)} 条 ALTER TABLE 语句")
if errors:
    print(f"\n[WARN] 以下 {len(errors)} 条执行失败：")
    for e in errors:
        print(e)

# 验证：读取 products 表字段注释
print("\n── products 表字段注释验证 ──")
cursor.execute("""
    SELECT COLUMN_NAME, COLUMN_COMMENT
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA='dianshang' AND TABLE_NAME='products'
    ORDER BY ORDINAL_POSITION
""")
for row in cursor.fetchall():
    print(f"  {row[0]:20s}  {row[1]}")

# 验证：读取所有表的表注释
print("\n── 所有表的表注释 ──")
cursor.execute("""
    SELECT TABLE_NAME, TABLE_COMMENT
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA='dianshang'
    AND TABLE_NAME IN ('categories','products','banners','article','contact_message','site_config','faq','stat_item','users')
    ORDER BY TABLE_NAME
""")
for row in cursor.fetchall():
    print(f"  {row[0]:20s}  {row[1]}")

cursor.close()
conn.close()
