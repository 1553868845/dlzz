package com.qingli.mall.entity;

import java.time.LocalDateTime;

public class PageContent {
    private Long id;
    private String slug;
    private String title;
    private String titleZh;
    private String content;
    private String contentZh;
    private String titleEs;
    private String contentEs;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTitleZh() { return titleZh; }
    public void setTitleZh(String titleZh) { this.titleZh = titleZh; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getContentZh() { return contentZh; }
    public void setContentZh(String contentZh) { this.contentZh = contentZh; }
    public String getTitleEs() { return titleEs; }
    public void setTitleEs(String titleEs) { this.titleEs = titleEs; }
    public String getContentEs() { return contentEs; }
    public void setContentEs(String contentEs) { this.contentEs = contentEs; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
