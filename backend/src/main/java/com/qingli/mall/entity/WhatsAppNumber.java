package com.qingli.mall.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * WhatsApp 多号码实体
 * 对应数据库表 whatsapp_numbers
 */
public class WhatsAppNumber {

    private Long id;

    /** WhatsApp 号码（纯数字，含国际区号，不含 +，如 85247488025） */
    private String number;

    /** 备注标签，如"香港号码1" */
    private String label;

    /** 排序值，升序，值越小越先被轮换到 */
    @JsonProperty("sortOrder")
    private int sortOrder;

    /** 是否启用：1=启用，0=禁用 */
    @JsonProperty("isActive")
    private int isActive;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    // ── Getters & Setters ────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumber() { return number; }
    public void setNumber(String number) { this.number = number; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public int getIsActive() { return isActive; }
    public void setIsActive(int isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
