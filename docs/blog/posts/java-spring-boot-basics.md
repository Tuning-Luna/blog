---
title: Spring Boot 入门：从一个 Hello 到可运行的服务
date: 2024-03-15
description: 用最小步骤理解 Spring Boot 的自动配置与启动流程。
tags:
  - Java
  - Spring Boot
categories:
  - Java后端
---

Spring Boot 最大的价值是「约定优于配置」：一个 main 方法就能把整个应用跑起来。这篇文章用最小例子拆解它到底做了什么。

<!-- more -->

## 最小可运行应用

```java
@SpringBootApplication
public class DemoApplication {
  public static void main(String[] args) {
    SpringApplication.run(DemoApplication.class, args);
  }
}
```

`@SpringBootApplication` 是三个注解的组合：`@SpringBootConfiguration`（配置类）、`@EnableAutoConfiguration`（开启自动配置）、`@ComponentScan`（扫描当前包及其子包的组件）。

## 自动配置在做什么

自动配置的本质是一堆 `@ConditionalOn*` 条件判断：当 classpath 里存在某个依赖时，就装配对应的 Bean。例如 classpath 有 `spring-boot-starter-web`，就自动配置内嵌 Tomcat 与 Spring MVC。

```java
@Configuration
@ConditionalOnClass(name = "org.springframework.web.servlet.DispatcherServlet")
public class WebMvcAutoConfiguration {
  // ...
}
```

## Controller 与 REST

```java
@RestController
@RequestMapping("/api")
public class HelloController {
  @GetMapping("/hello")
  public Map<String, String> hello() {
    return Map.of("message", "Hello, Spring Boot");
  }
}
```

## 小结

Spring Boot 的核心思想是：**用条件判断把「常用配置」变成「自动配置」**，让你专注写业务代码而不是胶水配置。理解自动配置的触发条件，就理解了 Spring Boot 的大半。
