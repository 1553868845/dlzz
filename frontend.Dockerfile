# ── 前端镜像（直接 COPY 预构建 dist 到 nginx）───────────────────
FROM nginx:1.25-alpine

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# 直接复制本地 vite build 好的 dist
COPY frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
