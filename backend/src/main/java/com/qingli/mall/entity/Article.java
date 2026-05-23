package com.qingli.mall.entity;

import java.time.LocalDateTime;

public class Article {
    private Long id;
    private String title;
    private String titleZh;
    private String slug;
    private String excerpt;
    private String excerptZh;
    private String content;
    private String contentZh;
    private String titleEs;
    private String excerptEs;
    private String contentEs;
    private String coverImage;
    private String category;
    private String author;
    private Integer viewCount;
    private Integer published;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getTitleZh() { return titleZh; }
    public void setTitleZh(String titleZh) { this.titleZh = titleZh; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public String getExcerptZh() { return excerptZh; }
    public void setExcerptZh(String excerptZh) { this.excerptZh = excerptZh; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getContentZh() { return contentZh; }
    public void setContentZh(String contentZh) { this.contentZh = contentZh; }
    public String getTitleEs() { return titleEs; }
    public void setTitleEs(String titleEs) { this.titleEs = titleEs; }
    public String getExcerptEs() { return excerptEs; }
    public void setExcerptEs(String excerptEs) { this.excerptEs = excerptEs; }
    public String getContentEs() { return contentEs; }
    public void setContentEs(String contentEs) { this.contentEs = contentEs; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }
    public Integer getPublished() { return published; }
    public void setPublished(Integer published) { this.published = published; }
    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
