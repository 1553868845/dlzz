package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.WhatsAppNumber;
import com.qingli.mall.mapper.MiscMapper;
import com.qingli.mall.mapper.WhatsAppMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * WhatsApp 多号码接口
 *
 * ── 公开接口（前台调用）──────────────────────────────────────────────
 * GET  /api/misc/whatsapp
 *   返回当前轮换到的 WhatsApp 号码（纯数字字符串）
 *   轮换逻辑：按 sort_order 升序，每次返回"上次之后"的第一个启用号码
 *   计数器存在 site_config 表，key = whatsapp_rotate_index
 *
 * ── 后台管理接口（需要 ADMIN 权限）──────────────────────────────────
 * GET    /api/admin/whatsapp          查询所有号码列表
 * POST   /api/admin/whatsapp          新增号码
 * PUT    /api/admin/whatsapp/{id}     修改号码
 * DELETE /api/admin/whatsapp/{id}     删除号码
 */
@RestController
public class WhatsAppController {

    @Autowired
    private WhatsAppMapper whatsAppMapper;

    @Autowired
    private MiscMapper miscMapper;

    private static final String DEFAULT_WHATSAPP   = "85247488025";
    private static final String ROTATE_INDEX_KEY   = "whatsapp_rotate_index";

    // ─────────────────────────────────────────────────────────────────
    // 前台：获取当前轮换号码
    // ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/misc/whatsapp
     * 按 sort_order 顺序轮换，返回当前该显示的号码（纯数字字符串）
     */
    @GetMapping("/api/misc/whatsapp")
    public ApiResult<String> getCurrentWhatsapp() {
        try {
            // 读取上次已显示到的 sort_order
            String indexStr = miscMapper.findConfigByKey(ROTATE_INDEX_KEY);
            int lastSortOrder = 0;
            if (indexStr != null) {
                try { lastSortOrder = Integer.parseInt(indexStr.trim()); } catch (NumberFormatException e) { lastSortOrder = 0; }
            }

            // 找下一个启用的号码（sort_order 大于上次的）
            WhatsAppNumber next = whatsAppMapper.findNextActive(lastSortOrder);

            if (next == null) {
                // 已到末尾，从头开始
                next = whatsAppMapper.findFirstActive();
            }

            if (next == null) {
                // 没有任何启用号码，降级返回旧配置
                String legacy = miscMapper.findConfigByKey("contact_whatsapp");
                return ApiResult.ok(legacy != null ? legacy : DEFAULT_WHATSAPP);
            }

            // 更新轮换计数器
            miscMapper.upsertConfig(ROTATE_INDEX_KEY, String.valueOf(next.getSortOrder()));

            return ApiResult.ok(next.getNumber());

        } catch (Exception e) {
            // 出错时降级
            String legacy = miscMapper.findConfigByKey("contact_whatsapp");
            return ApiResult.ok(legacy != null ? legacy : DEFAULT_WHATSAPP);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 后台管理：CRUD
    // ─────────────────────────────────────────────────────────────────

    /** GET /api/admin/whatsapp — 查询所有号码 */
    @GetMapping("/api/admin/whatsapp")
    public ApiResult<List<WhatsAppNumber>> list() {
        return ApiResult.ok(whatsAppMapper.findAll());
    }

    /** POST /api/admin/whatsapp — 新增号码 */
    @PostMapping("/api/admin/whatsapp")
    public ApiResult<WhatsAppNumber> create(@RequestBody WhatsAppNumber body) {
        if (body.getNumber() == null || body.getNumber().trim().isEmpty()) {
            return ApiResult.error("号码不能为空");
        }
        // 只保留数字
        body.setNumber(body.getNumber().replaceAll("\\D", ""));
        if (body.getLabel() == null) body.setLabel("");
        // sort_order 唯一性检查
        if (whatsAppMapper.countBySortOrder(body.getSortOrder(), null) > 0) {
            return ApiResult.error("排序值 " + body.getSortOrder() + " 已被其他号码使用，请换一个");
        }
        whatsAppMapper.insert(body);
        return ApiResult.ok(body);
    }

    /** PUT /api/admin/whatsapp/{id} — 修改号码 */
    @PutMapping("/api/admin/whatsapp/{id}")
    public ApiResult<WhatsAppNumber> update(@PathVariable Long id, @RequestBody WhatsAppNumber body) {
        WhatsAppNumber existing = whatsAppMapper.findById(id);
        if (existing == null) return ApiResult.error("号码不存在");

        if (body.getNumber() != null && !body.getNumber().trim().isEmpty()) {
            existing.setNumber(body.getNumber().replaceAll("\\D", ""));
        }
        if (body.getLabel() != null) existing.setLabel(body.getLabel());
        existing.setSortOrder(body.getSortOrder());
        existing.setIsActive(body.getIsActive());

        // sort_order 唯一性检查（排除当前记录自身）
        if (whatsAppMapper.countBySortOrder(existing.getSortOrder(), id) > 0) {
            return ApiResult.error("排序值 " + existing.getSortOrder() + " 已被其他号码使用，请换一个");
        }

        whatsAppMapper.update(existing);
        return ApiResult.ok(existing);
    }

    /** DELETE /api/admin/whatsapp/{id} — 删除号码 */
    @DeleteMapping("/api/admin/whatsapp/{id}")
    public ApiResult<Void> delete(@PathVariable Long id) {
        whatsAppMapper.deleteById(id);
        return ApiResult.ok(null);
    }
}
