package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.User;
import com.qingli.mall.mapper.UserMapper;
import com.qingli.mall.security.JwtUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 登录认证接口
 * POST /api/auth/login           { "username": "xxx", "password": "xxx" }
 * POST /api/auth/change-password { "oldPassword": "xxx", "newPassword": "xxx" }（需要登录）
 * 账号信息从数据库 users 表读取，密码使用 BCrypt 验证
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtUtil jwtUtil, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ApiResult<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");

        if (username.isEmpty() || password.isEmpty()) {
            return ApiResult.fail(400, "用户名和密码不能为空");
        }

        // 从数据库查找用户
        User user = userMapper.findByUsername(username);
        if (user == null) {
            return ApiResult.fail(401, "用户名或密码错误");
        }

        // BCrypt 验证密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ApiResult.fail(401, "用户名或密码错误");
        }

        String token = jwtUtil.generate(username);
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("username", username);
        data.put("name", user.getName());
        return ApiResult.ok(data);
    }

    /**
     * 修改密码（需要登录状态）
     * Body: { "oldPassword": "xxx", "newPassword": "xxx" }
     */
    @PostMapping("/change-password")
    public ApiResult<Void> changePassword(@RequestBody Map<String, String> body) {
        String oldPassword = body.getOrDefault("oldPassword", "");
        String newPassword = body.getOrDefault("newPassword", "");

        if (oldPassword.isEmpty() || newPassword.isEmpty()) {
            return ApiResult.fail(400, "旧密码和新密码不能为空");
        }
        if (newPassword.length() < 6) {
            return ApiResult.fail(400, "新密码长度不能少于6位");
        }

        // 从 JWT 上下文获取当前登录用户名
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userMapper.findByUsername(username);
        if (user == null) {
            return ApiResult.fail(401, "用户不存在");
        }

        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ApiResult.fail(400, "旧密码不正确");
        }

        // 加密新密码并更新
        String encodedNew = passwordEncoder.encode(newPassword);
        int updated = userMapper.updatePassword(username, encodedNew);
        if (updated == 0) {
            return ApiResult.fail(500, "密码更新失败，请重试");
        }

        return ApiResult.ok(null);
    }
}

