package com.qingli.mall.mapper;

import com.qingli.mall.entity.Product;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface ProductMapper {
    List<Product> findAll(@Param("categoryId") Long categoryId,
                          @Param("keyword") String keyword,
                          @Param("featured") Integer featured,
                          @Param("offset") int offset,
                          @Param("limit") int limit);

    long countAll(@Param("categoryId") Long categoryId,
                  @Param("keyword") String keyword,
                  @Param("featured") Integer featured);

    Product findBySlug(@Param("slug") String slug);

    Product findById(@Param("id") Long id);

    int insert(Product product);

    int update(Product product);

    int deleteById(@Param("id") Long id);
}
