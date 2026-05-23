package com.qingli.mall.mapper;

import com.qingli.mall.entity.Category;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface CategoryMapper {
    /** 获取全部分类（前台用，不分页） */
    List<Category> findAll();

    /** 后台分页+关键词搜索 */
    List<Category> findPaged(@Param("keyword") String keyword,
                             @Param("offset") int offset,
                             @Param("limit") int limit);

    long countPaged(@Param("keyword") String keyword);

    Category findById(@Param("id") Long id);
    int insert(Category category);
    int update(Category category);
    int deleteById(@Param("id") Long id);
    long countAll();
}

