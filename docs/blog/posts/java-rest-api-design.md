---
title: Java REST API 设计：从 Controller 到错误响应
date: 2026-01-20
description: 用 Spring Boot 写出结构清晰、错误一致的 REST API。
tags:
  - Java
  - Spring Boot
  - REST
categories:
  - Java后端
---

REST API 的「设计」不只是 URL 长什么样，还包括响应结构、错误处理与版本化。

<!-- more -->

## 一致的响应包装

避免每个接口各写各的返回格式，用一个通用包装统一结构：

```java
public record ApiResponse<T>(int code, String message, T data) {
  public static <T> ApiResponse<T> ok(T data) {
    return new ApiResponse<>(0, "ok", data);
  }
  public static <T> ApiResponse<T> error(int code, String message) {
    return new ApiResponse<>(code, message, null);
  }
}
```

## 统一的错误处理

用 `@RestControllerAdvice` 把异常集中映射为一致的响应，而不是在每个 Controller 里 try-catch：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ApiResponse<Void> notFound(ResourceNotFoundException e) {
    return ApiResponse.error(404, e.getMessage());
  }
}
```

## 资源设计要点

- URL 用名词复数：`/api/users/{id}`
- HTTP 方法表达动作：GET 查询 / POST 创建 / PUT 全量更新 / PATCH 部分更新 / DELETE 删除
- 分页返回元信息：`{ items, total, page, size }`

## 小结

REST API 的一致性好坏决定了客户端集成成本。**响应包装、集中异常处理、资源命名规范**这三件事做好，接口就「可预期」了。
