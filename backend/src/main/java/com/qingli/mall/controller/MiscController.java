package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.Faq;
import com.qingli.mall.entity.PageContent;
import com.qingli.mall.entity.StatItem;
import com.qingli.mall.mapper.MiscMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 首页公共数据接口
 *
 * GET /api/misc/faqs          获取 FAQ 列表
 * GET /api/misc/stats         获取首页统计数字
 * GET /api/misc/config        获取网站配置（邮箱、WhatsApp等）
 * GET /api/misc/contact-info  获取悬浮联系方式（邮箱 + WhatsApp），从数据库 site_config 读取
 * PUT /api/misc/contact-info  更新联系方式（需要 ADMIN 权限），持久化到数据库
 * GET /api/misc/home          首页聚合接口
 */
@RestController
@RequestMapping("/api/misc")
public class MiscController {

    @Autowired
    private MiscMapper miscMapper;

    // 默认兜底值（数据库未配置时使用）
    private static final String DEFAULT_EMAIL     = "info@qinglipeptide.com";
    private static final String DEFAULT_WHATSAPP  = "85247488025";

    @GetMapping("/faqs")
    public ApiResult<List<Faq>> faqs() {
        return ApiResult.ok(miscMapper.findFaqs());
    }

    @GetMapping("/stats")
    public ApiResult<List<StatItem>> stats() {
        return ApiResult.ok(miscMapper.findStats());
    }

    @GetMapping("/config")
    public ApiResult<List<Map<String, String>>> config() {
        return ApiResult.ok(miscMapper.findAllConfig());
    }

    /** 首页聚合接口 - 一次拿所有首页数据 */
    @GetMapping("/home")
    public ApiResult<Map<String, Object>> homeData() {
        Map<String, Object> data = new HashMap<>();
        data.put("stats", miscMapper.findStats());
        data.put("faqs",  miscMapper.findFaqs());
        return ApiResult.ok(data);
    }

    /**
     * 获取悬浮联系方式（公开，前台调用）
     * 从数据库 site_config 表读取 contact_email / contact_whatsapp
     */
    @GetMapping("/contact-info")
    public ApiResult<Map<String, String>> contactInfo() {
        String email    = miscMapper.findConfigByKey("contact_email");
        String whatsapp = miscMapper.findConfigByKey("contact_whatsapp");
        Map<String, String> info = new HashMap<>();
        info.put("email",    email    != null ? email    : DEFAULT_EMAIL);
        info.put("whatsapp", whatsapp != null ? whatsapp : DEFAULT_WHATSAPP);
        return ApiResult.ok(info);
    }

    /**
     * 更新联系方式（需要 ADMIN Token）
     * 持久化到数据库，重启后依然有效
     */
    @PutMapping("/contact-info")
    public ApiResult<Map<String, String>> updateContactInfo(@RequestBody Map<String, String> body) {
        if (body.containsKey("email"))    miscMapper.upsertConfig("contact_email",    body.get("email"));
        if (body.containsKey("whatsapp")) miscMapper.upsertConfig("contact_whatsapp", body.get("whatsapp"));
        return contactInfo();
    }

    /** 前台：获取单个页面内容（隐私政策、退货政策等） */
    @GetMapping("/page-content")
    public ApiResult<PageContent> pageContent(@RequestParam String slug) {
        PageContent page = miscMapper.findPageContentBySlug(slug);
        if (page == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Page not found: " + slug);
        }
        return ApiResult.ok(page);
    }
}


