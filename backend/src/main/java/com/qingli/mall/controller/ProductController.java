package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.Product;
import com.qingli.mall.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 产品接口
 *
 * GET  /api/products            获取产品列表（分页、分类筛选、关键词搜索）
 * GET  /api/products/featured   获取首页推荐产品
 * GET  /api/products/{slug}     根据 slug 获取产品详情
 * POST /api/products            新增产品（管理端）
 * PUT  /api/products/{id}       更新产品（管理端）
 * DELETE /api/products/{id}     删除产品（管理端）
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductMapper productMapper;

    /** 产品列表，支持分页 + 分类 + 关键词 */
    @GetMapping
    public ApiResult<List<Product>> list(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int size) {

        int offset = (Math.max(page, 1) - 1) * size;
        List<Product> list = productMapper.findAll(categoryId, keyword, null, offset, size);
        long total = productMapper.countAll(categoryId, keyword, null);
        return ApiResult.ok(list, total);
    }

    /** 首页推荐产品 */
    @GetMapping("/featured")
    public ApiResult<List<Product>> featured() {
        List<Product> list = productMapper.findAll(null, null, 1, 0, 20);
        return ApiResult.ok(list);
    }

    /** 产品详情（slug） */
    @GetMapping("/{slug}")
    public ApiResult<Product> detail(@PathVariable String slug) {
        Product product = productMapper.findBySlug(slug);
        if (product == null) {
            return ApiResult.error("Product not found");
        }
        return ApiResult.ok(product);
    }

    /** 新增产品 */
    @PostMapping
    public ApiResult<Product> create(@RequestBody Product product) {
        // 检查 slug 是否已存在（uk_slug 唯一索引）
        Product existing = productMapper.findBySlug(product.getSlug());
        if (existing != null) {
            return ApiResult.error("产品已存在（Slug 已被占用，请更换 Slug）");
        }
        productMapper.insert(product);
        return ApiResult.ok(product);
    }

    /** 更新产品 */
    @PutMapping("/{id}")
    public ApiResult<Product> update(@PathVariable Long id, @RequestBody Product product) {
        Product current = productMapper.findById(id);
        if (current == null) {
            return ApiResult.error("产品不存在");
        }
        // 检查 slug 是否与其他产品冲突
        if (product.getSlug() != null && !product.getSlug().equals(current.getSlug())) {
            Product slugOwner = productMapper.findBySlug(product.getSlug());
            if (slugOwner != null) {
                return ApiResult.error("Slug 已被其他产品占用，请更换");
            }
        }
        product.setId(id);
        productMapper.update(product);
        return ApiResult.ok(productMapper.findById(id));
    }

    /** 删除产品 */
    @DeleteMapping("/{id}")
    public ApiResult<Void> delete(@PathVariable Long id) {
        productMapper.deleteById(id);
        return ApiResult.ok(null);
    }
}
