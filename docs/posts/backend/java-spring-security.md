---
title: Spring Security 入门：认证与授权的核心链路
date: 2025-05-30
description: SecurityFilterChain、认证过滤器链与常见配置模式。
tags:
  - Java
  - Spring Security
---

Spring Security 通过一条过滤器链实现认证与授权。理解这条链，就理解了它的所有配置。

<!-- more -->

## 核心：SecurityFilterChain

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  return http
    .csrf(csrf -> csrf.disable())
    .authorizeHttpRequests(auth -> auth
      .requestMatchers("/api/public/**").permitAll()
      .requestMatchers("/api/admin/**").hasRole("ADMIN")
      .anyRequest().authenticated())
    .formLogin(Customizer.withDefaults())
    .build();
}
```

配置的本质是**按 URL 声明访问规则**，而不是在 Controller 里写 if 判断。

## 认证流程

请求进来 → 过滤器链中的 `UsernamePasswordAuthenticationFilter`（或 JWT 过滤器）→ 认证成功生成 `SecurityContext` → 授权决策（`AuthorizationFilter`）→ 放行或 403。

## 常见模式：JWT 无状态认证

```java
@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
  return http
    .csrf(csrf -> csrf.disable())
    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
    .build();
}
```

## 小结

把 Spring Security 当作**一条可插拔的过滤器链 + URL 授权规则**来理解：认证负责「你是谁」，授权负责「你能做什么」。配置只声明规则，过滤链执行规则。
