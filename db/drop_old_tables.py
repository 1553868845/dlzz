import pymysql

TABLES_TO_DROP = [
    "address",
    "banner",
    "carousel",
    "cart",
    "category",
    "order_info",
    "order_item",
    "product",
    "user",
]

conn = pymysql.connect(host='localhost', user='root', password='668668', db='dianshang', charset='utf8mb4')
cur = conn.cursor()

# 先禁用外键检查，避免因外键约束阻止删除
cur.execute("SET FOREIGN_KEY_CHECKS = 0")

success = 0
errors = []
for table in TABLES_TO_DROP:
    try:
        cur.execute(f"DROP TABLE IF EXISTS `{table}`")
        conn.commit()
        print(f"[删除] {table}")
        success += 1
    except Exception as e:
        errors.append(f"  {table}: {e}")

cur.execute("SET FOREIGN_KEY_CHECKS = 1")
conn.commit()
conn.close()

print(f"\n[OK] 成功删除 {success}/{len(TABLES_TO_DROP)} 张旧表")
if errors:
    print("[WARN] 以下表删除失败：")
    for e in errors:
        print(e)

print("\n当前剩余表：")
conn2 = pymysql.connect(host='localhost', user='root', password='668668', db='dianshang', charset='utf8mb4')
cur2 = conn2.cursor()
cur2.execute("SHOW TABLES")
for row in cur2.fetchall():
    print(f"  {row[0]}")
conn2.close()
