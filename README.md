# Qing Li Mall - 一键部署包

## 目录结构

```
yijianbushu/
├── deploy.sh              ← 一键部署脚本（在 Linux 上执行这个）
├── docker-compose.yml     ← 4 个服务编排配置
├── frontend.Dockerfile    ← 前端构建：Node 18 → nginx
├── backend.Dockerfile     ← 后端构建：Maven → Java 8 JRE
├── .env                   ← 环境变量（密码/域名在这里改）
├── nginx/
│   └── nginx.conf         ← nginx 反代配置
├── db/
│   ├── schema.sql         ← 建表语句（首次自动执行）
│   └── seed.sql           ← 初始数据（首次自动执行）
├── frontend/              ← React 前端源码
└── backend/               ← Spring Boot 后端源码
```

## 部署步骤

### 1. 上传到服务器

把整个 `yijianbushu` 文件夹传到 CentOS 7 服务器，例如：

```bash
scp -r yijianbushu root@43.159.171.238:/opt/qingli-mall
```

### 2. 修改配置（可选）

编辑 `.env` 文件，改成你的生产配置：

```bash
vi /opt/qingli-mall/.env
```

主要改：
- `MYSQL_ROOT_PASSWORD` — MySQL 密码
- `FRONTEND_URL` — 已预设为 `http://43.159.171.238`，如换域名再改
- `JWT_SECRET` — 改成随机字符串，保证安全

### 3. 一键部署

```bash
cd /opt/qingli-mall
chmod +x deploy.sh
bash deploy.sh
```

脚本会自动：
1. ✅ 安装 Docker（如果没有）
2. ✅ 安装 Docker Compose（如果没有）
3. ✅ 开放防火墙 80 端口
4. ✅ 构建前端（Node 18 编译 React）
5. ✅ 构建后端（Maven 编译 Spring Boot JAR）
6. ✅ 启动 MySQL、MinIO、后端、nginx 四个容器
7. ✅ 等待健康检查通过
8. ✅ 自动创建 MinIO product-images bucket

### 4. 访问

| 地址 | 说明 |
|------|------|
| `http://43.159.171.238` | 前台网站 |
| `http://43.159.171.238/admin` | 后台管理 |
| `http://43.159.171.238:9001` | MinIO 控制台 |

## 常用运维命令

```bash
# 查看所有容器状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 只看后端日志
docker-compose logs -f backend

# 重启某个服务
docker-compose restart backend

# 停止所有服务
docker-compose down

# 更新部署（重新构建）
docker-compose down && docker-compose build --no-cache && docker-compose up -d

# 备份数据库
docker-compose exec mysql mysqldump -u root -p668668 dianshang > backup_$(date +%Y%m%d).sql
```

## 服务架构

```
外部请求 → [80端口]
              ↓
         [nginx容器]
         ├── /          → 前端静态文件
         ├── /api/*     → [backend容器:8080]
         │                      ↓
         │              [mysql容器:3306]
         └── /minio-static/* → [minio容器:9000]
```

## 注意事项

- 首次部署构建镜像约需 **5-10 分钟**（需下载 Node/Maven 依赖）
- 数据保存在 Docker Volume 中，`docker-compose down` **不会**删除数据
- 彻底清除数据：`docker-compose down -v`（谨慎！）
- 生产环境建议改掉 `.env` 中所有默认密码
