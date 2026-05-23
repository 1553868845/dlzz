# ── Stage 1: Maven 构建 ──────────────────────────────────────
FROM maven:3.6.3-jdk-8 AS builder

WORKDIR /build

# 先复制 pom.xml，利用依赖缓存
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B --no-transfer-progress

# 复制源码并打包（跳过测试）
COPY backend/src ./src
RUN mvn package -DskipTests -B --no-transfer-progress

# ── Stage 2: 运行时 ──────────────────────────────────────────
FROM eclipse-temurin:8-jre-jammy

WORKDIR /app

# 安装 curl（健康检查用）
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 复制 JAR
COPY --from=builder /build/target/*.jar app.jar

# JVM 优化（容器环境）
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseContainerSupport"

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8081/api/products?page=0&size=1 || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
