package com.qingli.mall.mapper;

import com.qingli.mall.entity.Banner;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * 轮播图 Mapper
 */
@Mapper
public interface BannerMapper {

    /** 查询所有启用的轮播图，按 sort_order 排序（前台用） */
    @Select("SELECT id, image_url, sort_order, description, is_active, link_url, created_at, updated_at FROM banners WHERE is_active = 1 ORDER BY sort_order ASC")
    @Results({
        @Result(column = "image_url",   property = "imageUrl"),
        @Result(column = "sort_order",  property = "sortOrder"),
        @Result(column = "is_active",   property = "isActive"),
        @Result(column = "link_url",    property = "linkUrl"),
        @Result(column = "created_at",  property = "createdAt"),
        @Result(column = "updated_at",  property = "updatedAt"),
    })
    List<Banner> findActive();

    /** 查询全部轮播图（后台管理用） */
    @Select("SELECT id, image_url, sort_order, description, is_active, link_url, created_at, updated_at FROM banners ORDER BY sort_order ASC")
    @Results({
        @Result(column = "image_url",   property = "imageUrl"),
        @Result(column = "sort_order",  property = "sortOrder"),
        @Result(column = "is_active",   property = "isActive"),
        @Result(column = "link_url",    property = "linkUrl"),
        @Result(column = "created_at",  property = "createdAt"),
        @Result(column = "updated_at",  property = "updatedAt"),
    })
    List<Banner> findAll();

    /** 新增轮播图 */
    @Insert("INSERT INTO banners(image_url, sort_order, description, is_active, link_url) VALUES(#{imageUrl}, #{sortOrder}, #{description}, #{isActive}, #{linkUrl})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Banner banner);

    /** 更新轮播图 */
    @Update("UPDATE banners SET image_url=#{imageUrl}, sort_order=#{sortOrder}, description=#{description}, is_active=#{isActive}, link_url=#{linkUrl} WHERE id=#{id}")
    void update(Banner banner);

    /** 删除轮播图 */
    @Delete("DELETE FROM banners WHERE id=#{id}")
    void delete(Integer id);

    /** 根据ID查询 */
    @Select("SELECT id, image_url, sort_order, description, is_active, link_url, created_at, updated_at FROM banners WHERE id=#{id}")
    @Results({
        @Result(column = "image_url",   property = "imageUrl"),
        @Result(column = "sort_order",  property = "sortOrder"),
        @Result(column = "is_active",   property = "isActive"),
        @Result(column = "link_url",    property = "linkUrl"),
        @Result(column = "created_at",  property = "createdAt"),
        @Result(column = "updated_at",  property = "updatedAt"),
    })
    Banner findById(Integer id);
}
