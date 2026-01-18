# 腾讯云 CloudBase 部署指南

本项目支持部署到腾讯云 CloudBase 云托管服务，享受国内快速访问和免费额度。

## 部署方式对比

| 部署方式 | 优点 | 缺点 | 推荐度 |
|---------|------|------|--------|
| **云托管 (推荐)** | 完整 Node.js 支持，无超时限制 | 需要容器配置 | ⭐⭐⭐⭐⭐ |
| 云函数 | 按需计费 | 15分钟超时限制 | ⭐⭐⭐ |

---

## 方式一：云托管部署（推荐）

云托管提供完整的容器环境，支持原生模块，无超时限制。

### 1. 前置准备

1. 注册并登录 [腾讯云 CloudBase 控制台](https://console.cloud.tencent.com/tcb)
2. 开通云托管服务
3. 安装 CloudBase CLI：

```bash
npm install -g @cloudbase/cli
```

### 2. 创建环境

1. 进入 CloudBase 控制台
2. 点击「新建环境」
3. 选择「按量计费」或「包年包月」（按量计费有免费额度）
4. 环境名称：例如 `poem-app`
5. 记录环境 ID（格式如 `poem-app-xxx`）

### 3. 配置环境变量

在控制台配置以下环境变量：

```bash
# AI API 配置
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL_NAME=gpt-4
AI_TIMEOUT=120000

# 或使用兼容的 API（如国内中转）
# AI_BASE_URL=https://your-proxy.com/v1
```

### 4. 部署

**方式 A：通过 CLI 部署**

```bash
# 登录 CloudBase
cloudbase login

# 初始化（如果还没初始化）
cloudbase init

# 部署到云托管
cloudbase hosting:deploy docker
```

**方式 B：通过控制台部署**

1. 进入「云托管」→「服务管理」
2. 点击「新建服务」
3. 填写服务信息：
   - 服务名称：`poem-app`
   - 版本名称：`v1`
   - 部署方式：选择「代码仓库」或「本地上传」
4. 选择 Dockerfile：使用项目根目录的 `Dockerfile`
5. 配置端口：`3000`
6. 配置资源：
   - CPU：1 核
   - 内存：2GB
7. 点击「部署」

### 5. 配置访问

部署完成后，CloudBase 会提供一个访问地址，格式如：
```
https://poem-app-xxx.service.tcloudbase.com
```

你可以配置自定义域名：

1. 进入「静态网站托管」→「域名管理」
2. 添加自定义域名
3. 按照提示配置 DNS 解析

---

## 方式二：云函数部署

使用 CloudBase 框架部署，适合需要快速启动的场景。

### 1. 安装依赖

```bash
npm install -g @cloudbase/cli
```

### 2. 初始化项目

```bash
cloudbase init
```

### 3. 配置 cloudbaserc.json

配置文件已创建在项目根目录，包含必要的配置。

### 4. 部署

```bash
# 登录
cloudbase login

# 部署
cloudbase deploy
```

---

## 免费额度说明

腾讯云 CloudBase 免费额度（按量计费）：

| 资源 | 免费额度 |
|------|---------|
| 云托管 CPU/内存 | 每月 5000 GiB*秒 |
| 云托管请求 | 每月 100 万次 |
| 公网流量 | 每月 5 GB |
| 存储容量 | 5 GB |

对于个人项目，免费额度基本够用。

---

## 常见问题

### 1. 部署失败：无法连接到 AI API

**解决方案**：
- 检查环境变量是否正确配置
- 如果使用 OpenAI，确认 API Key 有效
- 考虑使用国内中转服务

### 2. 字体文件加载失败

**解决方案**：
- 确保 `public/fonts/` 目录下的字体文件存在
- 检查 CloudBase 静态托管配置

### 3. 构建超时

**解决方案**：
- 在云托管配置中增加超时时间
- 使用 `npm install --legacy-peer-deps` 加速安装

---

## 监控和日志

部署后可以通过以下方式监控：

1. **控制台监控**：CloudBase 控制台 → 云托管 → 监控
2. **日志查看**：CloudBase 控制台 → 云托管 → 日志
3. **CLI 查看日志**：

```bash
cloudbase logs:cloudrun
```

---

## 成本估算

假设每月 1000 次请求，每次请求平均耗时 10 秒：

| 资源 | 用量 | 费用 |
|------|------|------|
| 云托管 | 1000 次 × 10 秒 = 2.78 GiB*秒 | ¥0.01 |
| 流量 | 约 100 MB | ¥0.08 |
| **总计** | - | **约 ¥0.09/月** |

免费额度内基本零成本。

---

## 总结

- **推荐**：使用云托管方式，完整支持 Node.js 和原生模块
- **成本**：个人项目免费额度足够
- **性能**：国内访问快速稳定
- **维护**：配置一次，后续自动部署
