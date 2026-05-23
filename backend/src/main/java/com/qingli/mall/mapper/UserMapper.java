package com.qingli.mall.mapper;

import com.qingli.mall.entity.User;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

/**
 * 管理员用户 Mapper
 */
public interface UserMapper {

    @Select("SELECT id, username, password, name, role, created_at, updated_at FROM users WHERE username = #{username} LIMIT 1")
    User findByUsername(@Param("username") String username);

    @Update("UPDATE users SET password = #{password}, updated_at = NOW() WHERE username = #{username}")
    int updatePassword(@Param("username") String username, @Param("password") String password);
}

