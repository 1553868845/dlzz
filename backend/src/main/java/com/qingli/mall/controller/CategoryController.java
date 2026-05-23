package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.Category;
import com.qingli.mall.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类接口
 *
 * GET    /api/categories             获取所有分类（前台用，不分页）
 * GET    /api/categories/paged       后台分页+搜索
 * POST   /api/categories             新增分类
 * PUT    /api/categories/{id}        更新分类
 * DELETE /api/categories/{id}        删除分类
 */
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryMapper categoryMapper;

    /** 前台使用：获取全部分类（用于导航/筛选下拉） */
    @GetMapping
    public ApiResult<List<Category>> list() {
        return ApiResult.ok(categoryMapper.findAll());
    }

    /** 后台使用：分页+关键词搜索 */
    @GetMapping("/paged")
    public ApiResult<List<Category>> paged(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1")  int page,
            @RequestParam(defaultValue = "10") int size) {
        int offset = (Math.max(page, 1) - 1) * size;
        List<Category> list = categoryMapper.findPaged(keyword, offset, size);
        long total = categoryMapper.countPaged(keyword);
        return ApiResult.ok(list, total);
    }

    @PostMapping
    public ApiResult<Category> create(@RequestBody Category category) {
        categoryMapper.insert(category);
        return ApiResult.ok(category);
    }

    @PutMapping("/{id}")
    public ApiResult<Category> update(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        categoryMapper.update(category);
        return ApiResult.ok(categoryMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ApiResult<Void> delete(@PathVariable Long id) {
        categoryMapper.deleteById(id);
        return ApiResult.ok(null);
    }
}

