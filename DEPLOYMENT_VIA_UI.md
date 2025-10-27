# 通过用户界面部署指南

本指南介绍如何使用 Web UI 配置和管理 Cloudflare Workers 部署。

## 🚀 快速开始

### 1. 访问部署界面

1. 登录应用后，点击顶部的 **"🚀 部署"** 按钮
2. 将看到部署管理界面，包含四个标签页：
   - **配置** - 设置 Cloudflare 账户信息
   - **KV 命名空间** - 创建数据存储
   - **部署** - 执行部署操作
   - **部署指南** - 详细步骤说明

## 📝 详细步骤

### 步骤 1：获取 Cloudflare 凭据

#### 获取 Account ID

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 在右侧栏可以看到 **Account ID**，点击复制

#### 创建 API Token

1. 访问 **My Profile** > **API Tokens**
2. 点击 **Create Token**
3. 选择 **Edit Cloudflare Workers** 模板
4. 或自定义权限，确保包含：
   - Account - Workers Scripts - Edit
   - Account - Workers KV Storage - Edit
5. 继续完成创建，复制生成的 Token

### 步骤 2：配置账户信息

1. 在部署界面的 **"配置"** 标签页：
2. 填写以下信息：
   - **Account ID**: 粘贴你的 Cloudflare Account ID
   - **API Token**: 粘贴刚创建的 API Token
   - **Worker 名称**: 输入你的 Worker 名称，如 `2fa-manager`
   - **KV 命名空间 ID**: 暂时留空，下一步创建
3. 点击 **"💾 保存配置"**

### 步骤 3：创建 KV 命名空间

KV 命名空间用于存储应用数据。需要创建两个：

1. 切换到 **"KV 命名空间"** 标签页
2. 创建第一个命名空间：
   - 输入名称：`USERS_KV`
   - 点击 **"➕ 创建 KV 命名空间"**
   - 复制返回的命名空间 ID
3. 创建第二个命名空间：
   - 输入名称：`RATE_LIMIT_KV`
   - 点击 **"➕ 创建 KV 命名空间"**
   - 复制返回的命名空间 ID

### 步骤 4：更新配置

1. 返回 **"配置"** 标签页
2. 将两个命名空间 ID 填入对应字段：
   - **USERS_KV 命名空间 ID**: 粘贴第一个 ID
   - **RATE_LIMIT_KV 命名空间 ID**: 粘贴第二个 ID
3. 点击 **"💾 保存配置"**

### 步骤 5：本地部署

由于浏览器安全限制，完整部署仍需使用命令行工具。

#### 方式一：使用 UI 生成配置（推荐）

1. 切换到 **"部署"** 标签页
2. 点击 **"🚀 开始部署"**
3. 系统会生成部署配置和命令
4. 复制显示的 `wrangler.toml` 配置
5. 在本地项目中更新 `wrangler.toml`
6. 在终端运行：

```bash
npm run deploy
```

#### 方式二：手动配置

在项目的 `wrangler.toml` 中配置：

```toml
name = "2fa-manager"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "USERS_KV"
id = "你的_USERS_KV_ID"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "你的_RATE_LIMIT_KV_ID"
```

然后部署：

```bash
npx wrangler deploy
```

### 步骤 6：配置密钥

部署后，还需要设置环境变量：

#### 在 Cloudflare Dashboard 中设置

1. 进入 **Workers & Pages** > 你的 Worker
2. 选择 **Settings** > **Variables**
3. 添加以下密钥：

**JWT_SECRET**
```bash
# 生成命令
openssl rand -base64 32
```

**ENCRYPTION_KEY**
```bash
# 生成命令
openssl rand -base64 32
```

#### 或使用 wrangler 命令

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put ENCRYPTION_KEY
```

### 步骤 7：验证部署

1. 访问你的 Worker URL: `https://your-worker.workers.dev`
2. 测试登录功能
3. 添加测试账户
4. 验证 2FA 代码生成

## 🎯 功能说明

### 配置管理

- **保存配置**: 将 Cloudflare 凭据安全保存在 KV 存储中
- **加载配置**: 自动加载已保存的配置
- **更新配置**: 随时修改账户信息

### KV 命名空间管理

- **一键创建**: 通过 UI 直接调用 Cloudflare API 创建 KV 命名空间
- **复制 ID**: 快速复制命名空间 ID
- **查看信息**: 显示创建的命名空间详情

### 部署管理

- **配置验证**: 自动检查必要配置是否完整
- **生成配置**: 自动生成 wrangler.toml 配置内容
- **部署指导**: 提供详细的部署命令和说明

## ⚠️ 注意事项

1. **API Token 安全**
   - API Token 具有管理权限，请妥善保管
   - 建议定期轮换 Token
   - 不要在公共场合分享 Token

2. **KV 命名空间**
   - 免费版 Cloudflare 账户限制：
     - 最多 100 个命名空间
     - 每天 100,000 次读取
     - 每天 1,000 次写入
   - 确保不重复创建命名空间

3. **Worker 限制**
   - 免费版限制：
     - 每天 100,000 个请求
     - 每个请求最多 10ms CPU 时间
   - 超出限制可能导致服务不可用

4. **浏览器限制**
   - 无法直接上传 Worker 脚本
   - 仍需使用 wrangler CLI 完成最终部署
   - UI 主要用于配置管理和 KV 创建

## 🔧 故障排除

### 问题：创建 KV 命名空间失败

**可能原因：**
- API Token 权限不足
- Account ID 错误
- 达到命名空间数量限制

**解决方案：**
1. 检查 API Token 是否有 KV Storage Edit 权限
2. 确认 Account ID 正确
3. 在 Cloudflare Dashboard 中检查现有命名空间

### 问题：保存配置失败

**可能原因：**
- 网络连接问题
- 登录会话过期

**解决方案：**
1. 检查网络连接
2. 重新登录应用
3. 清除浏览器缓存后重试

### 问题：部署配置无效

**可能原因：**
- KV 命名空间 ID 错误
- Worker 名称不符合规范

**解决方案：**
1. 重新检查 KV 命名空间 ID
2. Worker 名称只能包含小写字母、数字和连字符
3. 确保所有必填字段都已填写

## 📚 相关文档

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare API 文档](https://developers.cloudflare.com/api/)
- [KV 存储文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [项目完整部署指南](./DEPLOYMENT.md)

## 💡 最佳实践

1. **首次部署**
   - 先在 UI 中配置和创建 KV
   - 使用 UI 生成的配置文件
   - 在本地测试后再部署

2. **配置管理**
   - 定期备份配置信息
   - 使用不同的 Worker 名称区分环境（dev/prod）
   - 为每个环境创建独立的 KV 命名空间

3. **安全加固**
   - 使用最小权限原则创建 API Token
   - 设置 Token 过期时间
   - 定期审计 API Token 使用情况

4. **监控运维**
   - 在 Cloudflare Dashboard 中监控 Worker 使用情况
   - 设置告警通知
   - 定期检查 KV 存储使用量

## 🤝 获取帮助

如有问题，请：
1. 查看本文档的故障排除部分
2. 阅读 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取更多信息
3. 在 GitHub Issues 中搜索或提交问题
4. 查看 Cloudflare Workers 社区

---

**祝部署顺利！** 🎉
