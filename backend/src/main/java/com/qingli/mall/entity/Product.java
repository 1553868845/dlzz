package com.qingli.mall.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Product {
    private Long id;
    private Long categoryId;
    private String name;
    private String slug;
    private String subtitle;
    private String description;
    private String shortDesc;
    private String purity;
    private String form;
    private String storage;
    private String specification;
    private BigDecimal price;
    private Integer stockStatus;   // 0=缺货 1=有货
    private Integer isFeatured;
    private String coverImage;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // 关联
    private String categoryName;
    // 中文字段
    private String nameZh;
    private String subtitleZh;
    private String shortDescZh;
    private String descriptionZh;
    private String purityZh;
    private String formZh;
    private String storageZh;
    private String specificationZh;
    // 西班牙语字段
    private String nameEs;
    private String subtitleEs;
    private String shortDescEs;
    private String descriptionEs;
    private String purityEs;
    private String formEs;
    private String storageEs;
    private String specificationEs;

    // ── Getters & Setters ─────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getShortDesc() { return shortDesc; }
    public void setShortDesc(String shortDesc) { this.shortDesc = shortDesc; }
    public String getPurity() { return purity; }
    public void setPurity(String purity) { this.purity = purity; }
    public String getForm() { return form; }
    public void setForm(String form) { this.form = form; }
    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }
    public String getSpecification() { return specification; }
    public void setSpecification(String specification) { this.specification = specification; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStockStatus() { return stockStatus; }
    public void setStockStatus(Integer stockStatus) { this.stockStatus = stockStatus; }
    public Integer getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Integer isFeatured) { this.isFeatured = isFeatured; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    // ── 中文字段 Getters & Setters ──────────────────────────────
    public String getNameZh() { return nameZh; }
    public void setNameZh(String nameZh) { this.nameZh = nameZh; }
    public String getSubtitleZh() { return subtitleZh; }
    public void setSubtitleZh(String subtitleZh) { this.subtitleZh = subtitleZh; }
    public String getShortDescZh() { return shortDescZh; }
    public void setShortDescZh(String shortDescZh) { this.shortDescZh = shortDescZh; }
    public String getDescriptionZh() { return descriptionZh; }
    public void setDescriptionZh(String descriptionZh) { this.descriptionZh = descriptionZh; }
    public String getPurityZh() { return purityZh; }
    public void setPurityZh(String purityZh) { this.purityZh = purityZh; }
    public String getFormZh() { return formZh; }
    public void setFormZh(String formZh) { this.formZh = formZh; }
    public String getStorageZh() { return storageZh; }
    public void setStorageZh(String storageZh) { this.storageZh = storageZh; }
    public String getSpecificationZh() { return specificationZh; }
    public void setSpecificationZh(String specificationZh) { this.specificationZh = specificationZh; }

    // ── 西班牙语字段 Getters & Setters ────────────────────────
    public String getNameEs() { return nameEs; }
    public void setNameEs(String nameEs) { this.nameEs = nameEs; }
    public String getSubtitleEs() { return subtitleEs; }
    public void setSubtitleEs(String subtitleEs) { this.subtitleEs = subtitleEs; }
    public String getShortDescEs() { return shortDescEs; }
    public void setShortDescEs(String shortDescEs) { this.shortDescEs = shortDescEs; }
    public String getDescriptionEs() { return descriptionEs; }
    public void setDescriptionEs(String descriptionEs) { this.descriptionEs = descriptionEs; }
    public String getPurityEs() { return purityEs; }
    public void setPurityEs(String purityEs) { this.purityEs = purityEs; }
    public String getFormEs() { return formEs; }
    public void setFormEs(String formEs) { this.formEs = formEs; }
    public String getStorageEs() { return storageEs; }
    public void setStorageEs(String storageEs) { this.storageEs = storageEs; }
    public String getSpecificationEs() { return specificationEs; }
    public void setSpecificationEs(String specificationEs) { this.specificationEs = specificationEs; }
}
