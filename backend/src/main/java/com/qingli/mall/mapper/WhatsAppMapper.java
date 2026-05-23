package com.qingli.mall.mapper;

import com.qingli.mall.entity.WhatsAppNumber;
import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * WhatsApp 多号码 Mapper
 * 数据库表：whatsapp_numbers
 */
@Mapper
public interface WhatsAppMapper {

    /**
     * 查询所有启用的号码，按 sort_order 升序排列（用于轮换）
     */
    @Select("SELECT * FROM whatsapp_numbers WHERE is_active = 1 ORDER BY sort_order ASC")
    List<WhatsAppNumber> findActiveOrdered();

    /**
     * 查询所有号码（后台管理用），按 sort_order 升序
     */
    @Select("SELECT * FROM whatsapp_numbers ORDER BY sort_order ASC, id ASC")
    List<WhatsAppNumber> findAll();

    /**
     * 查询第一个 sort_order 大于指定值的启用号码（轮换逻辑）
     */
    @Select("SELECT * FROM whatsapp_numbers WHERE is_active = 1 AND sort_order > #{lastSortOrder} ORDER BY sort_order ASC LIMIT 1")
    WhatsAppNumber findNextActive(@Param("lastSortOrder") int lastSortOrder);

    /**
     * 查询 sort_order 最小的启用号码（轮换到末尾后回头）
     */
    @Select("SELECT * FROM whatsapp_numbers WHERE is_active = 1 ORDER BY sort_order ASC LIMIT 1")
    WhatsAppNumber findFirstActive();

    /**
     * 新增号码
     */
    @Insert("INSERT INTO whatsapp_numbers(number, label, sort_order, is_active) VALUES(#{number}, #{label}, #{sortOrder}, #{isActive})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(WhatsAppNumber num);

    /**
     * 更新号码
     */
    @Update("UPDATE whatsapp_numbers SET number=#{number}, label=#{label}, sort_order=#{sortOrder}, is_active=#{isActive} WHERE id=#{id}")
    int update(WhatsAppNumber num);

    /**
     * 删除号码
     */
    @Delete("DELETE FROM whatsapp_numbers WHERE id=#{id}")
    int deleteById(@Param("id") Long id);

    /**
     * 根据 ID 查询
     */
    @Select("SELECT * FROM whatsapp_numbers WHERE id=#{id}")
    WhatsAppNumber findById(@Param("id") Long id);

    /**
     * 检查某个 sort_order 是否已被占用（excludeId 为 null 时不排除任何记录）
     * 用于唯一性校验
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM whatsapp_numbers WHERE sort_order = #{sortOrder}" +
            "<if test='excludeId != null'> AND id != #{excludeId}</if>" +
            "</script>")
    int countBySortOrder(@Param("sortOrder") int sortOrder, @Param("excludeId") Long excludeId);
}
