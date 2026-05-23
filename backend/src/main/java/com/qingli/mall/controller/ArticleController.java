package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.entity.Article;
import com.qingli.mall.mapper.ArticleMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 文章/博客接口
 *
 * GET  /api/articles            文章列表（分页 + 分类 + 关键词）
 * GET  /api/articles/{slug}     文章详情（同时增加浏览量）
 * POST /api/articles            新增文章
 * PUT  /api/articles/{id}       更新文章
 * DELETE /api/articles/{id}     删除文章
 */
@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleMapper articleMapper;

    @GetMapping
    public ApiResult<List<Article>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "9") int size) {

        int offset = (Math.max(page, 1) - 1) * size;
        List<Article> list = articleMapper.findAll(category, keyword, offset, size);
        long total = articleMapper.countAll(category, keyword);
        return ApiResult.ok(list, total);
    }

    @GetMapping("/{slug}")
    public ApiResult<Article> detail(@PathVariable String slug) {
        Article article = articleMapper.findBySlug(slug);
        if (article == null) {
            return ApiResult.error("Article not found");
        }
        articleMapper.incrementViewCount(article.getId());
        return ApiResult.ok(article);
    }

    @PostMapping
    public ApiResult<Article> create(@RequestBody Article article) {
        articleMapper.insert(article);
        return ApiResult.ok(article);
    }

    @PutMapping("/{id}")
    public ApiResult<Article> update(@PathVariable Long id, @RequestBody Article article) {
        article.setId(id);
        articleMapper.update(article);
        return ApiResult.ok(articleMapper.findById(id));
    }

    @DeleteMapping("/{id}")
    public ApiResult<Void> delete(@PathVariable Long id) {
        articleMapper.deleteById(id);
        return ApiResult.ok(null);
    }
}
