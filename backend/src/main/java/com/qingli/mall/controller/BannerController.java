package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.Banner;
import com.qingli.mall.mapper.BannerMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 轮播图接口
 *
 * GET    /api/banners           获取启用的轮播图（公开，前台用）
 * GET    /api/admin/banners     获取全部轮播图（管理员）
 * POST   /api/admin/banners     新增轮播图
 * PUT    /api/admin/banners/{id} 更新轮播图
 * DELETE /api/admin/banners/{id} 删除轮播图
 */
@RestController
public class BannerController {

    @Autowired
    private BannerMapper bannerMapper;

    /** ── 前台：获取启用的轮播图（公开） ── */
    @GetMapping("/api/banners")
    public ApiResult<List<Banner>> getActiveBanners() {
        return ApiResult.ok(bannerMapper.findActive());
    }

    /** ── 后台：获取所有轮播图 ── */
    @GetMapping("/api/admin/banners")
    public ApiResult<List<Banner>> adminListBanners() {
        return ApiResult.ok(bannerMapper.findAll());
    }

    /** ── 后台：新增轮播图 ── */
    @PostMapping("/api/admin/banners")
    public ApiResult<Banner> adminCreateBanner(@RequestBody Banner banner) {
        if (banner.getIsActive() == null) banner.setIsActive(1);
        if (banner.getSortOrder() == null) banner.setSortOrder(99);
        bannerMapper.insert(banner);
        return ApiResult.ok(bannerMapper.findById(banner.getId()));
    }

    /** ── 后台：更新轮播图 ── */
    @PutMapping("/api/admin/banners/{id}")
    public ApiResult<Banner> adminUpdateBanner(@PathVariable Integer id, @RequestBody Banner banner) {
        banner.setId(id);
        bannerMapper.update(banner);
        return ApiResult.ok(bannerMapper.findById(id));
    }

    /** ── 后台：删除轮播图 ── */
    @DeleteMapping("/api/admin/banners/{id}")
    public ApiResult<Void> adminDeleteBanner(@PathVariable Integer id) {
        bannerMapper.delete(id);
        return ApiResult.ok(null);
    }
}
