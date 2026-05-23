package com.qingli.mall.config;

import com.qingli.mall.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 配置
 *
 * 规则：
 *   - POST /api/auth/login        → 公开（登录接口）
 *   - GET  /api/**（非 admin）    → 公开（前台只读接口）
 *   - POST/PUT/DELETE /api/products, /api/articles, /api/categories → 需要 ROLE_ADMIN
 *   - /api/admin/**               → 需要 ROLE_ADMIN
 *   - /api/admin/upload           → 需要 ROLE_ADMIN
 *   - 其他                        → 拒绝
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF（REST API 使用 JWT 无需 CSRF）
            .csrf().disable()
            // 无状态 Session
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            // 认证异常返回 401（不跳转登录页）
            .exceptionHandling()
                .authenticationEntryPoint((req, res, ex) -> {
                    res.setContentType("application/json;charset=UTF-8");
                    res.setStatus(401);
                    res.getWriter().write("{\"code\":401,\"message\":\"未授权，请先登录\"}");
                })
            .and()
            .authorizeRequests()
                // ── 公开接口 ──────────────────────────────────────
                .antMatchers(HttpMethod.POST,   "/api/auth/login").permitAll()
                .antMatchers(HttpMethod.POST,   "/api/auth/change-password").hasRole("ADMIN")
                .antMatchers(HttpMethod.GET,    "/api/products/**").permitAll()
                .antMatchers(HttpMethod.GET,    "/api/categories/**").permitAll()
                .antMatchers(HttpMethod.GET,    "/api/articles/**").permitAll()
                .antMatchers(HttpMethod.GET,    "/api/misc/**").permitAll()
                .antMatchers(HttpMethod.GET,    "/api/banners").permitAll()
                .antMatchers(HttpMethod.POST,   "/api/contact/**").permitAll()
                // OPTIONS 预检放行（CORS）
                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // ── 管理接口（需要 ADMIN 角色）────────────────────
                .antMatchers(HttpMethod.PUT,    "/api/misc/contact-info").hasRole("ADMIN")
                .antMatchers("/api/admin/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.POST,   "/api/products/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT,    "/api/products/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.POST,   "/api/articles/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT,    "/api/articles/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/articles/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.POST,   "/api/categories/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.PUT,    "/api/categories/**").hasRole("ADMIN")
                .antMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")
                // 其他全部需要认证
                .anyRequest().authenticated()
            .and()
            // 在 UsernamePasswordAuthenticationFilter 之前插入 JWT 过滤器
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
