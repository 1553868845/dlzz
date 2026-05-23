package com.qingli.mall.mapper;

import com.qingli.mall.entity.ContactMessage;
import org.apache.ibatis.annotations.Param;
import java.util.List;

public interface ContactMessageMapper {
    int insert(ContactMessage msg);

    List<ContactMessage> findAll();

    ContactMessage findById(@Param("id") Long id);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    int deleteById(@Param("id") Long id);

    // 管理端扩展
    long countAll();

    long countByStatus(@Param("status") Integer status);

    List<ContactMessage> findRecent(@Param("limit") int limit);

    List<ContactMessage> findAllPaged(@Param("status") Integer status,
                                      @Param("formType") String formType,
                                      @Param("date") String date,
                                      @Param("offset") int offset,
                                      @Param("limit") int limit);

    long countAllFiltered(@Param("status") Integer status,
                          @Param("formType") String formType,
                          @Param("date") String date);

    /** 获取所有有消息的日期列表（用于前端日期筛选器） */
    @org.apache.ibatis.annotations.Select("SELECT DATE(created_at) as d FROM contact_message GROUP BY DATE(created_at) ORDER BY d DESC")
    java.util.List<String> findDistinctDates();
}
