package com.qingli.mall.service;

import io.minio.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.util.UUID;

/**
 * MinIO 文件存储服务
 *
 * 职责：
 *  1. 文件名安全清洗（防路径穿越）
 *  2. 直接上传原文件到 MinIO
 *
 * 图片裁剪已移至前端处理（用户自选裁剪区域）
 */
@Service
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucketName}")
    private String bucketName;

    @Value("${minio.endpoint}")
    private String endpoint;

    public MinioService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    /**
     * 应用启动时自动初始化 bucket 及公共读策略
     */
    @PostConstruct
    public void init() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build()
                );
            }
            String policy = "{"
                    + "\"Version\":\"2012-10-17\","
                    + "\"Statement\":[{"
                    + "\"Effect\":\"Allow\","
                    + "\"Principal\":{\"AWS\":[\"*\"]},"
                    + "\"Action\":[\"s3:GetObject\"],"
                    + "\"Resource\":[\"arn:aws:s3:::" + bucketName + "/*\"]"
                    + "}]}";
            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(bucketName)
                            .config(policy)
                            .build()
            );
        } catch (Exception e) {
            System.err.println("[MinIO] bucket 初始化失败，请检查 MinIO 服务是否运行: " + e.getMessage());
        }
    }

    /**
     * 上传文件，返回可公开访问的 URL
     */
    public String upload(MultipartFile file) throws Exception {
        // 安全清洗文件名
        String safeName = sanitizeFilename(file.getOriginalFilename());
        String ext = getExtension(safeName);
        String objectName = "products/" + UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        return "/minio-static/" + bucketName + "/" + objectName;
    }

    /**
     * 删除文件
     */
    public void delete(String objectName) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .build()
        );
    }

    // ── 内部工具方法 ────────────────────────────────────────────

    /**
     * 安全清洗文件名：只取 basename，去除路径分隔符，防止路径穿越攻击
     */
    private String sanitizeFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isEmpty()) return "upload";
        String name = new File(originalFilename).getName();
        name = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        return name.isEmpty() ? "upload" : name;
    }

    /**
     * 获取文件扩展名（小写，不含点号）
     */
    private String getExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        if (dot < 0) return "";
        return filename.substring(dot + 1).toLowerCase();
    }
}
