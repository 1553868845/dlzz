package com.qingli.mall.dto;

import java.util.List;

/**
 * 统一 API 响应包装
 */
public class ApiResult<T> {

    private boolean success;
    private String message;
    private T data;
    private long total;

    private ApiResult() {}

    public static <T> ApiResult<T> ok(T data) {
        ApiResult<T> r = new ApiResult<>();
        r.success = true;
        r.data = data;
        r.message = "success";
        return r;
    }

    public static <T> ApiResult<T> ok(T data, long total) {
        ApiResult<T> r = ok(data);
        r.total = total;
        return r;
    }

    public static <T> ApiResult<T> error(String message) {
        ApiResult<T> r = new ApiResult<>();
        r.success = false;
        r.message = message;
        return r;
    }

    public static <T> ApiResult<T> fail(int code, String message) {
        ApiResult<T> r = new ApiResult<>();
        r.success = false;
        r.message = message;
        return r;
    }

    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public long getTotal() { return total; }
}
