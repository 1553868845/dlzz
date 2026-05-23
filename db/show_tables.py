import pymysql

conn = pymysql.connect(host='localhost', user='root', password='668668', db='information_schema', charset='utf8mb4')
cur = conn.cursor()
cur.execute("SELECT TABLE_NAME, TABLE_ROWS, TABLE_COMMENT, CREATE_TIME FROM TABLES WHERE TABLE_SCHEMA='dianshang' ORDER BY TABLE_NAME")
rows = cur.fetchall()
print(f"{'表名':<30} {'行数':<8} {'注释':<35} 创建时间")
print('-'*100)
for r in rows:
    print(f"{str(r[0]):<30} {str(r[1]):<8} {str(r[2]):<35} {str(r[3])}")
conn.close()
