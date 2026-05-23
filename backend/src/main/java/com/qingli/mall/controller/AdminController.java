package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.ContactMessage;
import com.qingli.mall.entity.Faq;
import com.qingli.mall.entity.PageContent;
import com.qingli.mall.mapper.ArticleMapper;
import com.qingli.mall.mapper.CategoryMapper;
import com.qingli.mall.mapper.ContactMessageMapper;
import com.qingli.mall.mapper.MiscMapper;
import com.qingli.mall.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 后台管理接口
 *
 * 所有接口均受 Spring Security 保护（需要 ROLE_ADMIN），
 * 通过 Authorization: Bearer <JWT> 认证。
 *
 * GET    /api/admin/overview              仪表盘概览
 * GET    /api/admin/messages              留言列表（分页+筛选）
 * PUT    /api/admin/messages/{id}/status  更新留言状态
 * DELETE /api/admin/messages/{id}         删除留言
 * POST   /api/admin/upload                上传图片到 MinIO（见 UploadController）
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private ContactMessageMapper messageMapper;

    @Autowired
    private MiscMapper miscMapper;

    /** 仪表盘概览数据 */
    @GetMapping("/overview")
    public ApiResult<Map<String, Object>> overview() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalProducts",   productMapper.countAll(null, null, null));
        data.put("totalArticles",   articleMapper.countAll(null, null));
        data.put("totalCategories", categoryMapper.countAll());
        data.put("totalMessages",   messageMapper.countAll());
        data.put("unreadMessages",  messageMapper.countByStatus(0));
        data.put("recentMessages",  messageMapper.findRecent(5));
        return ApiResult.ok(data);
    }

    /** 留言列表（分页 + 状态/类型/日期筛选） */
    @GetMapping("/messages")
    public ApiResult<List<ContactMessage>> messages(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String formType,
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "15") int size) {
        int offset = (Math.max(page, 1) - 1) * size;
        List<ContactMessage> list = messageMapper.findAllPaged(status, formType, date, offset, size);
        long total = messageMapper.countAllFiltered(status, formType, date);
        return ApiResult.ok(list, total);
    }

    /** 获取所有有消息的日期列表（用于前端日期筛选器） */
    @GetMapping("/messages/dates")
    public ApiResult<java.util.List<String>> messageDates() {
        return ApiResult.ok(messageMapper.findDistinctDates());
    }


    /** 更新留言状态 */
    @PutMapping("/messages/{id}/status")
    public ApiResult<Void> updateMessageStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer newStatus = body.get("status");
        if (newStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        messageMapper.updateStatus(id, newStatus);
        return ApiResult.ok(null);
    }

    /** 删除留言 */
    @DeleteMapping("/messages/{id}")
    public ApiResult<Void> deleteMessage(@PathVariable Long id) {
        messageMapper.deleteById(id);
        return ApiResult.ok(null);
    }

    // ── FAQ 管理 ──────────────────────────────────────────────────────

    /** 获取全部 FAQ（含未发布） */
    @GetMapping("/faqs")
    public ApiResult<List<Faq>> listFaqs() {
        return ApiResult.ok(miscMapper.findAllFaqs());
    }

    /** 新增 FAQ */
    @PostMapping("/faqs")
    public ApiResult<Faq> createFaq(@RequestBody Faq faq) {
        if (faq.getSortOrder() == null) faq.setSortOrder(99);
        if (faq.getPublished() == null) faq.setPublished(1);
        miscMapper.insertFaq(faq);
        return ApiResult.ok(faq);
    }

    /** 更新 FAQ */
    @PutMapping("/faqs/{id}")
    public ApiResult<Faq> updateFaq(@PathVariable Long id, @RequestBody Faq faq) {
        faq.setId(id);
        miscMapper.updateFaq(faq);
        return ApiResult.ok(faq);
    }

    /** 切换 FAQ 发布状态 */
    @PutMapping("/faqs/{id}/published")
    public ApiResult<Void> toggleFaqPublished(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer published = body.get("published");
        if (published == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "published is required");
        }
        miscMapper.updateFaqPublished(id, published);
        return ApiResult.ok(null);
    }

    /** 删除 FAQ */
    @DeleteMapping("/faqs/{id}")
    public ApiResult<Void> deleteFaq(@PathVariable Long id) {
        miscMapper.deleteFaq(id);
        return ApiResult.ok(null);
    }

    // ── PageContent 管理 ──────────────────────────────────────────────

    /** 获取所有页面内容 */
    @GetMapping("/page-contents")
    public ApiResult<List<PageContent>> listPageContents() {
        List<PageContent> pages = miscMapper.findAllPageContents();
        // 确保隐私政策和退货政策始终存在
        ensurePageContent(pages, "privacy");
        ensurePageContent(pages, "refund");
        if (pages.size() <= 2) {
            pages = miscMapper.findAllPageContents();
        }
        return ApiResult.ok(pages);
    }

    /** 更新页面内容 */
    @PutMapping("/page-contents/{slug}")
    public ApiResult<PageContent> updatePageContent(
            @PathVariable String slug,
            @RequestBody PageContent data) {
        data.setSlug(slug);
        PageContent existing = miscMapper.findPageContentBySlug(slug);
        if (existing != null) {
            miscMapper.updatePageContent(data);
        } else {
            miscMapper.insertPageContent(data);
        }
        return ApiResult.ok(data);
    }

    private void ensurePageContent(List<PageContent> pages, String slug) {
        boolean exists = pages.stream().anyMatch(p -> slug.equals(p.getSlug()));
        if (!exists) {
            PageContent p = new PageContent();
            p.setSlug(slug);
            p.setTitle(slug.equals("privacy") ? "Privacy Policy" : "Refund & Returns");
            miscMapper.insertPageContent(p);
        }
    }
}
