package com.qingli.mall.mapper;

import com.qingli.mall.entity.Faq;
import com.qingli.mall.entity.PageContent;
import com.qingli.mall.entity.StatItem;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.Map;

public interface MiscMapper {
    @Select("SELECT * FROM faq WHERE published = 1 ORDER BY sort_order ASC")
    List<Faq> findFaqs();

    /** 后台：查询全部 FAQ（含未发布） */
    @Select("SELECT * FROM faq ORDER BY sort_order ASC")
    List<Faq> findAllFaqs();

    /** 后台：新增 FAQ */
    @Insert("INSERT INTO faq(question, question_zh, question_es, answer, answer_zh, answer_es, sort_order, published) VALUES(#{question}, #{questionZh}, #{questionEs}, #{answer}, #{answerZh}, #{answerEs}, #{sortOrder}, #{published})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertFaq(Faq faq);

    /** 后台：更新 FAQ */
    @Update("UPDATE faq SET question=#{question}, question_zh=#{questionZh}, question_es=#{questionEs}, answer=#{answer}, answer_zh=#{answerZh}, answer_es=#{answerEs}, sort_order=#{sortOrder}, published=#{published} WHERE id=#{id}")
    void updateFaq(Faq faq);

    /** 后台：删除 FAQ */
    @Delete("DELETE FROM faq WHERE id=#{id}")
    void deleteFaq(Long id);

    /** 后台：切换 FAQ 发布状态 */
    @Update("UPDATE faq SET published=#{published} WHERE id=#{id}")
    void updateFaqPublished(@Param("id") Long id, @Param("published") Integer published);

    @Select("SELECT * FROM stat_item ORDER BY sort_order ASC")
    List<StatItem> findStats();

    @Select("SELECT cfg_key AS config_key, cfg_value AS config_val FROM site_config")
    List<Map<String, String>> findAllConfig();

    @Select("SELECT cfg_value FROM site_config WHERE cfg_key = #{key}")
    String findConfigByKey(String key);

    @org.apache.ibatis.annotations.Update("INSERT INTO site_config(cfg_key, cfg_value) VALUES(#{key}, #{value}) ON DUPLICATE KEY UPDATE cfg_value = #{value}")
    void upsertConfig(@org.apache.ibatis.annotations.Param("key") String key,
                      @org.apache.ibatis.annotations.Param("value") String value);

    // ── PageContent 管理 ──────────────────────────────────────────────

    @Select("SELECT * FROM page_contents ORDER BY id ASC")
    List<PageContent> findAllPageContents();

    @Select("SELECT * FROM page_contents WHERE slug = #{slug}")
    PageContent findPageContentBySlug(@Param("slug") String slug);

    @Insert("INSERT INTO page_contents(slug, title, title_zh, title_es, content, content_zh, content_es, updated_at) VALUES(#{slug}, #{title}, #{titleZh}, #{titleEs}, #{content}, #{contentZh}, #{contentEs}, NOW())")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertPageContent(PageContent page);

    @Update("UPDATE page_contents SET title=#{title}, title_zh=#{titleZh}, title_es=#{titleEs}, content=#{content}, content_zh=#{contentZh}, content_es=#{contentEs}, updated_at=NOW() WHERE slug=#{slug}")
    void updatePageContent(PageContent page);
}
