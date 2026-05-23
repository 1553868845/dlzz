package com.qingli.mall.entity;

/**
 * 轮播图实体
 * 对应数据库表 banners
 */
public class Banner {
    /** 轮播图ID，主键自增 */
    private Integer id;
    /** 图片URL（MinIO 相对路径 /minio-static/...） */
    private String imageUrl;
    /** 排序序号，数字越小越靠前 */
    private Integer sortOrder;
    /** 图片描述（alt文本） */
    private String description;
    /** 是否启用：1=显示 0=隐藏 */
    private Integer isActive;
    /** 跳转链接（可选，点击轮播图跳转） */
    private String linkUrl;
    /** 创建时间 */
    private String createdAt;
    /** 更新时间 */
    private String updatedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getIsActive() { return isActive; }
    public void setIsActive(Integer isActive) { this.isActive = isActive; }
    public String getLinkUrl() { return linkUrl; }
    public void setLinkUrl(String linkUrl) { this.linkUrl = linkUrl; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
