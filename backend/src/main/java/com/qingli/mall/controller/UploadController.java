package com.qingli.mall.controller;

import com.qingli.mall.dto.ApiResult;
import com.qingli.mall.service.MinioService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * 文件上传接口（需要 ROLE_ADMIN）
 * POST /api/admin/upload  multipart/form-data  file=<图片>
 */
@RestController
@RequestMapping("/api/admin")
public class UploadController {

    private final MinioService minioService;

    public UploadController(MinioService minioService) {
        this.minioService = minioService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResult<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ApiResult.error("请选择要上传的文件");
        }

        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResult.error("只允许上传图片文件（jpg/png/gif/webp）");
        }

        // 验证文件大小（限制 5MB）
        if (file.getSize() > 5 * 1024 * 1024) {
            return ApiResult.error("图片大小不能超过 5MB");
        }

        try {
            String url = minioService.upload(file);
            Map<String, String> data = new HashMap<>();
            data.put("url", url);
            return ApiResult.ok(data);
        } catch (Exception e) {
            return ApiResult.error("上传失败：" + e.getMessage());
        }
    }
}
