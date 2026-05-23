package com.qingli.mall.security;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * IP 级别请求限流过滤器
 *
 * 基于内存滑动窗口，零外部依赖。
 * 在 Spring Security FilterChain 之前执行，对公开接口提供频率限制保护。
 *
 * 限流规则：
 *   - /api/contact/send    → 同 IP 每小时最多 5 次
 *   - /api/contact/quote   → 同 IP 每小时最多 5 次
 *   - /api/auth/login      → 同 IP 每分钟最多 10 次
 *   - 其他所有接口          → 同 IP 每分钟最多 60 次
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RateLimitFilter implements Filter {

    /** 限流记录：key = "IP:path"，value = 请求时间戳列表 */
    private final ConcurrentHashMap<String, LinkedList<Long>> records = new ConcurrentHashMap<>();

    /** 后台清理线程 */
    private ScheduledExecutorService cleanupExecutor;

    @Override
    public void init(FilterConfig filterConfig) {
        // 每 5 分钟清理一次过期记录，防止内存泄漏
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "rate-limit-cleanup");
            t.setDaemon(true);
            return t;
        });
        cleanupExecutor.scheduleAtFixedRate(this::cleanup, 5, 5, TimeUnit.MINUTES);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();
        String ip = getClientIp(httpRequest);

        // 确定限流参数
        int maxRequests;
        int windowSeconds;

        if (path.startsWith("/api/contact/send") || path.startsWith("/api/contact/quote")) {
            maxRequests = 5;
            windowSeconds = 3600; // 1 小时
        } else if (path.startsWith("/api/auth/login")) {
            maxRequests = 10;
            windowSeconds = 60; // 1 分钟
        } else if (path.startsWith("/api/admin/upload")) {
            maxRequests = 20;
            windowSeconds = 3600; // 1 小时，防止磁盘/带宽攻击
        } else {
            maxRequests = 60;
            windowSeconds = 60; // 1 分钟
        }

        String key = ip + ":" + path;
        long now = System.currentTimeMillis();
        long windowStart = now - windowSeconds * 1000L;

        // 检查是否超限
        if (isRateLimited(key, maxRequests, windowStart)) {
            // 计算需要等待多久（到最早的请求过期）
            long retryAfterSeconds = getRetryAfterSeconds(key, windowStart, windowSeconds);

            httpResponse.setStatus(429);
            httpResponse.setContentType("application/json;charset=UTF-8");
            httpResponse.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            httpResponse.getWriter().write(
                    "{\"code\":429,\"message\":\"请求过于频繁，请稍后再试\"}"
            );
            return;
        }

        // 记录本次请求
        records.computeIfAbsent(key, k -> new LinkedList<>()).addLast(now);

        chain.doFilter(request, response);
    }

    /**
     * 检查指定 key 在时间窗口内是否超过限制
     */
    private boolean isRateLimited(String key, int maxRequests, long windowStart) {
        LinkedList<Long> timestamps = records.get(key);
        if (timestamps == null) return false;

        synchronized (timestamps) {
            // 先移除窗口外的旧记录
            removeExpired(timestamps, windowStart);
            return timestamps.size() >= maxRequests;
        }
    }

    /**
     * 计算需要等待多少秒才能重试
     */
    private long getRetryAfterSeconds(String key, long windowStart, int windowSeconds) {
        LinkedList<Long> timestamps = records.get(key);
        if (timestamps == null || timestamps.isEmpty()) return windowSeconds;

        synchronized (timestamps) {
            removeExpired(timestamps, windowStart);
            if (timestamps.isEmpty()) return 1;
            long oldest = timestamps.getFirst();
            long waitMs = (oldest + windowSeconds * 1000L) - System.currentTimeMillis();
            return Math.max(1, (waitMs / 1000) + 1);
        }
    }

    /**
     * 移除时间窗口之前的旧记录
     */
    private void removeExpired(LinkedList<Long> timestamps, long windowStart) {
        Iterator<Long> it = timestamps.iterator();
        while (it.hasNext()) {
            if (it.next() < windowStart) {
                it.remove();
            } else {
                break; // LinkedList 按时间顺序排列，遇到第一个未过期的就停止
            }
        }
    }

    /**
     * 获取客户端真实 IP
     * 因为经过 nginx 反代，request.getRemoteAddr() 拿到的是 Docker 内网 IP
     * 需要从 X-Forwarded-For 或 X-Real-IP header 获取
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }

        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty() && !"unknown".equalsIgnoreCase(xff)) {
            // X-Forwarded-For 可能包含多个 IP，取第一个（最原始的客户端 IP）
            int commaIndex = xff.indexOf(',');
            if (commaIndex > 0) {
                return xff.substring(0, commaIndex).trim();
            }
            return xff.trim();
        }

        return request.getRemoteAddr();
    }

    /**
     * 清理所有过期记录
     */
    private void cleanup() {
        long now = System.currentTimeMillis();
        long oldestKeep = now - 3600_000L; // 保留最近 1 小时的记录

        Iterator<String> it = records.keySet().iterator();
        while (it.hasNext()) {
            String key = it.next();
            LinkedList<Long> timestamps = records.get(key);
            if (timestamps == null) {
                it.remove();
                continue;
            }
            synchronized (timestamps) {
                removeExpired(timestamps, oldestKeep);
                if (timestamps.isEmpty()) {
                    it.remove();
                }
            }
        }
    }

    @Override
    public void destroy() {
        if (cleanupExecutor != null) {
            cleanupExecutor.shutdownNow();
        }
    }
}
