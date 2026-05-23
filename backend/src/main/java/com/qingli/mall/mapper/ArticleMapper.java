package com.qingli.mall.mapper;

import com.qingli.mall.entity.Article;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface ArticleMapper {
    List<Article> findAll(@Param("category") String category,
                          @Param("keyword") String keyword,
                          @Param("offset") int offset,
                          @Param("limit") int limit);

    long countAll(@Param("category") String category, @Param("keyword") String keyword);

    Article findBySlug(@Param("slug") String slug);

    Article findById(@Param("id") Long id);

    int incrementViewCount(@Param("id") Long id);

    int insert(Article article);

    int update(Article article);

    int deleteById(@Param("id") Long id);
}
