---
title: Spring Boot 配置管理：从 application.yml 到类型安全绑定
date: 2026-08-23
description: 理顺 Spring Boot 外部化配置的优先级，并用 @ConfigurationProperties 告别散落的 @Value。
tags:
  - Java
  - Spring Boot
categories:
  - Java后端
---

同一个应用，开发环境和生产环境的配置往往不同。Spring Boot 的「外部化配置」让你可以在不碰代码的前提下覆盖配置——关键是理解它的优先级顺序。

<!-- more -->

## 配置来源的优先级

Spring Boot 把配置来源按优先级从低到高排列，**高优先级覆盖低优先级**。常用的几个层级：

1. classpath 根目录下的 `application.yml` / `application.properties`
2. classpath 下的 `/config` 子目录
3. 当前目录（运行 jar 的目录）
4. 当前目录下的 `/config` 子目录
5. OS 环境变量
6. Java 系统属性（`-Dkey=value`）
7. 命令行参数（`--key=value`）

也就是说，`java -jar app.jar --server.port=9090` 里命令行参数的优先级最高，会覆盖配置文件中的端口。把敏感值放进环境变量、把「只在这一台机器上成立」的值用命令行覆盖，是常见的生产实践。

## Profile：按环境切换配置

把配置拆成多个 `application-{profile}.yml`，再用 profile 激活指定的一份：

```yaml
# application.yml
spring:
  profiles:
    active: dev
```

```yaml
# application-prod.yml
server:
  port: 8080
logging:
  level:
    root: WARN
```

激活方式按优先级：`--spring.profiles.active=prod` 命令行 > `SPRING_PROFILES_ACTIVE` 环境变量 > 配置文件内的 `spring.profiles.active`。生产环境通常用环境变量或命令行传入，避免把激活状态写死在代码里。

## 用 @Value 读取单个属性

```java
@RestController
public class OrderController {

  @Value("${app.default-page-size:20}")
  private int defaultPageSize;
}
```

`${...}` 里用冒号给出默认值，属性缺失时不会启动失败。

## @ConfigurationProperties：类型安全绑定

散落各处的 `@Value` 难以维护。把一组相关属性绑定到一个 POJO 上：

```java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
  private String name;
  private int pageSize;
  private List<String> adminEmails;

  // getter / setter 必须有（Spring Boot 通过 setter 或构造器绑定）
  // ...
}
```

```yaml
app:
  name: order-service
  page-size: 20
  admin-emails:
    - dev@example.com
    - ops@example.com
```

在启动类上加 `@ConfigurationPropertiesScan` 即可自动注册这些绑定类，比逐一手写 `@EnableConfigurationProperties` 更省事。之后在需要的地方注入 `AppProperties`，配置就变成了有类型、可校验、可追踪的对象。

## 小结

Spring Boot 配置的核心是**外部化 + 优先级**：把可变配置留在 `application.yml`，把敏感值与环境差异交给环境变量和命令行覆盖；聚合相关属性时优先 `@ConfigurationProperties`，让配置有类型、可校验、可维护。
