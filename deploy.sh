#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Qing Li Mall - 一键部署脚本
#  适用系统: CentOS 7
#  使用方式: bash deploy.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ── 颜色输出 ─────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; exit 1; }
info()    { echo -e "${CYAN}[→]${NC} $1"; }
section() { echo -e "\n${BOLD}${BLUE}══ $1 ══${NC}"; }

# ── 脚本所在目录（即部署包根目录）─────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Banner ───────────────────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║     Qing Li Peptide Mall Deployer     ║"
echo "  ║          CentOS 7 + Docker            ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════
# STEP 1: 环境检查 & 安装 Docker
# ═══════════════════════════════════════════════════════════════
section "STEP 1 / 5  环境检查"

# 必须 root 运行
if [[ $EUID -ne 0 ]]; then
    error "请使用 root 用户运行此脚本: sudo bash deploy.sh"
fi

# 安装或升级 Docker（需要 >= 17.05 支持多阶段构建）
REQUIRED_DOCKER_MAJOR=17
REQUIRED_DOCKER_MINOR=5

install_docker_ce() {
    warn "安装/升级 Docker CE..."
    yum install -y yum-utils device-mapper-persistent-data lvm2
    yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    # 停掉旧版本
    systemctl stop docker 2>/dev/null || true
    yum remove -y docker docker-common docker-selinux docker-engine 2>/dev/null || true
    yum install -y docker-ce docker-ce-cli containerd.io
    systemctl start docker
    systemctl enable docker
    log "Docker 安装/升级完成: $(docker --version)"
}

if ! command -v docker &>/dev/null; then
    install_docker_ce
else
    # 检查版本是否支持多阶段构建（需要 >= 17.05）
    DOCKER_VER=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo "0.0.0")
    DOCKER_MAJOR=$(echo "$DOCKER_VER" | cut -d. -f1)
    DOCKER_MINOR=$(echo "$DOCKER_VER" | cut -d. -f2 | cut -d- -f1)
    if [[ "$DOCKER_MAJOR" -lt "$REQUIRED_DOCKER_MAJOR" ]] || \
       [[ "$DOCKER_MAJOR" -eq "$REQUIRED_DOCKER_MAJOR" && "$DOCKER_MINOR" -lt "$REQUIRED_DOCKER_MINOR" ]]; then
        warn "Docker 版本 $DOCKER_VER 过旧（不支持多阶段构建），开始升级..."
        install_docker_ce
    else
        log "Docker 已安装: $(docker --version)"
    fi
fi

# 安装 Docker Compose（如果没有）
if ! command -v docker-compose &>/dev/null; then
    warn "Docker Compose 未安装，开始安装..."
    curl -SL "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" \
        -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log "Docker Compose 安装完成: $(docker-compose --version)"
else
    log "Docker Compose 已安装: $(docker-compose --version)"
fi

# 安装或升级 buildx（compose build 需要 >= 0.17.0）
BUILDX_REQUIRED="0.17.0"
BUILDX_LATEST="0.19.3"
BUILDX_DIR="${HOME}/.docker/cli-plugins"
BUILDX_BIN="${BUILDX_DIR}/docker-buildx"

need_buildx_upgrade() {
    if [[ ! -f "$BUILDX_BIN" ]]; then return 0; fi
    local ver
    ver=$(docker buildx version 2>/dev/null | grep -oP '\d+\.\d+\.\d+' | head -1 || echo "0.0.0")
    # 简单比较：把版本号转成整数比较
    local req_int cur_int
    req_int=$(echo "$BUILDX_REQUIRED" | awk -F. '{printf "%d%03d%03d", $1,$2,$3}')
    cur_int=$(echo "$ver"             | awk -F. '{printf "%d%03d%03d", $1,$2,$3}')
    [[ "$cur_int" -lt "$req_int" ]]
}

if need_buildx_upgrade; then
    warn "安装/升级 docker buildx 插件（需要 >= ${BUILDX_REQUIRED}）..."
    mkdir -p "$BUILDX_DIR"
    curl -SL "https://github.com/docker/buildx/releases/download/v${BUILDX_LATEST}/buildx-v${BUILDX_LATEST}.linux-amd64" \
        -o "$BUILDX_BIN"
    chmod +x "$BUILDX_BIN"
    log "buildx 升级完成: $(docker buildx version)"
else
    log "buildx 已满足要求: $(docker buildx version 2>/dev/null || echo '已安装')"
fi

# 开放防火墙端口 80（CentOS 7 默认 firewalld）
if command -v firewall-cmd &>/dev/null && systemctl is-active firewalld &>/dev/null; then
    firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    log "防火墙已放行 80 端口"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 2: 初始化 MinIO bucket（首次部署后自动创建）
# ═══════════════════════════════════════════════════════════════
section "STEP 2 / 5  读取配置"

# 读取 .env
if [[ -f .env ]]; then
    set -a; source .env; set +a
    log "配置文件 .env 读取成功"
else
    warn ".env 文件不存在，使用默认值"
fi

echo ""
echo -e "  ${CYAN}MySQL 密码${NC}    : ${MYSQL_ROOT_PASSWORD:-668668}"
echo -e "  ${CYAN}MinIO 账号${NC}    : ${MINIO_ACCESS_KEY:-minioadmin}"
echo -e "  ${CYAN}前端 CORS 地址${NC}: ${FRONTEND_URL:-http://localhost}"
echo ""

# ═══════════════════════════════════════════════════════════════
# STEP 3: 停止旧服务（如果在运行）
# ═══════════════════════════════════════════════════════════════
section "STEP 3 / 5  停止旧服务"

if docker-compose ps 2>/dev/null | grep -q "Up"; then
    warn "检测到旧服务正在运行，先停止..."
    docker-compose down
    log "旧服务已停止"
else
    log "没有运行中的旧服务"
fi

# ═══════════════════════════════════════════════════════════════
# STEP 4: 构建镜像 & 启动
# ═══════════════════════════════════════════════════════════════
section "STEP 4 / 5  构建镜像（首次约需 5-10 分钟）"

info "开始构建前端和后端镜像..."
docker-compose build --no-cache

section "STEP 4b/ 5  启动所有服务"
docker-compose up -d

# ═══════════════════════════════════════════════════════════════
# STEP 5: 等待健康检查 & 初始化 MinIO bucket
# ═══════════════════════════════════════════════════════════════
section "STEP 5 / 5  等待服务就绪"

info "等待 MySQL 健康检查通过..."
RETRY=0
until docker-compose exec -T mysql mysqladmin ping -h localhost \
        -u root -p"${MYSQL_ROOT_PASSWORD:-668668}" --silent 2>/dev/null; do
    RETRY=$((RETRY+1))
    if [[ $RETRY -ge 30 ]]; then
        error "MySQL 启动超时，请查看日志: docker-compose logs mysql"
    fi
    echo -n "."
    sleep 3
done
echo ""
log "MySQL 就绪"

info "等待 MinIO 就绪..."
RETRY=0
until curl -sf http://localhost:9000/minio/health/live &>/dev/null; do
    RETRY=$((RETRY+1))
    if [[ $RETRY -ge 30 ]]; then
        warn "MinIO 启动超时，请查看日志: docker-compose logs minio"
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

if curl -sf http://localhost:9000/minio/health/live &>/dev/null; then
    log "MinIO 就绪"

    info "初始化 MinIO bucket: images（公开读取）..."
    docker run --rm --network qingli-net \
        minio/mc:latest \
        sh -c "
            mc alias set qingli http://qingli-minio:9000 '${MINIO_ACCESS_KEY:-admin}' '${MINIO_SECRET_KEY:-Admin123456!}' && \
            mc mb --ignore-existing qingli/images && \
            mc anonymous set download qingli/images
        " 2>/dev/null \
        && log "MinIO bucket 'images' 已就绪（公开读取）" \
        || warn "bucket 初始化跳过，请手动在 MinIO 控制台（http://IP:9001）创建 'images' bucket 并设为公开"
else
    warn "MinIO 启动可能仍在进行中，请稍后手动初始化 bucket"
fi

info "等待后端 API 就绪..."
RETRY=0
until curl -sf http://localhost/api/products?page=0&size=1 &>/dev/null; do
    RETRY=$((RETRY+1))
    if [[ $RETRY -ge 40 ]]; then
        warn "后端 API 超时，可能仍在启动中..."
        break
    fi
    echo -n "."
    sleep 3
done
echo ""

# ═══════════════════════════════════════════════════════════════
# 部署完成
# ═══════════════════════════════════════════════════════════════

# 获取本机 IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${BOLD}${GREEN}"
echo "  ╔═══════════════════════════════════════════════╗"
echo "  ║           🎉 部署完成！                        ║"
echo "  ╠═══════════════════════════════════════════════╣"
echo -e "  ║  前台网站   : ${CYAN}http://${SERVER_IP}${GREEN}              ║"
echo -e "  ║  后台管理   : ${CYAN}http://${SERVER_IP}/admin${GREEN}         ║"
echo -e "  ║  MinIO 控制台: ${CYAN}http://${SERVER_IP}:9001${GREEN}         ║"
echo "  ╠═══════════════════════════════════════════════╣"
echo "  ║  常用命令:                                    ║"
echo "  ║  查看日志: docker-compose logs -f             ║"
echo "  ║  停止服务: docker-compose down               ║"
echo "  ║  重启服务: docker-compose restart            ║"
echo "  ╚═══════════════════════════════════════════════╝"
echo -e "${NC}"
