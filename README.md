# 🔐 2FA 安全管理系统

一个基于 Cloudflare Workers 的现代化双因素认证(2FA)管理系统，提供安全的 TOTP 代码生成、账户管理和云端备份功能。

## ✨ 核心特性

### 🛡️ 安全特性
- **OAuth2 认证** - 使用 Linux.do OAuth2 安全登录
- **原生Token认证** - 直接使用 Linux.do access_token，更安全高效
- **向后兼容** - 支持现有JWT token用户的平滑迁移
- **端到端加密** - 所有敏感数据使用 AES-GCM 加密存储
- **速率限制保护** - 防止暴力攻击和 API 滥用
- **安全密钥管理** - 支持通过 Cloudflare Secrets 管理敏感配置

### 📱 2FA 管理
- **多种添加方式** - 支持手动输入密钥
- **TOTP 代码生成** - 支持 6/8 位验证码，30/60 秒周期
- **智能账户分类** - 自定义分类标签和快速搜索
- **实时代码显示** - 带进度条的验证码倒计时
- **一键复制功能** - 自动复制验证码到剪贴板

### ☁️ 云端备份
- **WebDAV 自动备份** - 支持 Nextcloud、ownCloud、TeraCloud 等
- **多账号管理** - 可配置多个 WebDAV 存储账号
- **加密备份文件** - 密码保护的备份文件
- **智能目录结构** - 按年/月/日自动组织备份文件

### 📥📤 数据迁移
- **多格式导入** - 支持 JSON、2FAS、纯文本格式
- **加密导出** - 密码保护的安全导出
- **批量操作** - 支持批量导入和去重处理
- **数据验证** - 严格的数据格式验证和清理

## 🚀 快速开始

### 前置要求

- Node.js 16+ 和 npm
- Cloudflare 账号
- Wrangler CLI 工具

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd 2fa-manager
```

#### 2. 安装依赖

```bash
npm install
```

#### 3. 创建 KV 命名空间

```bash
# 创建用户数据存储
npx wrangler kv:namespace create "USERS_KV"

# 创建速率限制存储
npx wrangler kv:namespace create "RATE_LIMIT_KV"
```

记录返回的命名空间 ID，将在下一步使用。

#### 4. 配置 wrangler.toml

编辑 `wrangler.toml` 文件，填入你的 KV 命名空间 ID：

```toml
[[kv_namespaces]]
binding = "USERS_KV"
id = "your_users_kv_namespace_id"  # 替换为实际的 ID

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your_rate_limit_kv_id"  # 替换为实际的 ID
```

#### 5. 配置 OAuth（必需）

本系统仅支持 Linux.do OAuth 登录。

1. 访问 [https://connect.linux.do](https://connect.linux.do) 创建 OAuth 应用
2. 设置回调 URL：`https://your-domain.com/api/auth/callback`（本地开发使用 `http://localhost:8787/api/auth/callback`）
3. 获取 Client ID 和 Client Secret

#### 6. 设置密钥

```bash
# JWT 签名密钥（必需）
npx wrangler secret put JWT_SECRET
# 输入一个强随机字符串，例如: openssl rand -base64 32

# 数据加密密钥（必需）
npx wrangler secret put ENCRYPTION_KEY
# 输入一个强随机字符串，例如: openssl rand -base64 32

# Linux.do OAuth 配置（必需）
npx wrangler secret put OAUTH_CLIENT_ID
# 输入你的 Linux.do OAuth Client ID

npx wrangler secret put OAUTH_CLIENT_SECRET
# 输入你的 Linux.do OAuth Client Secret
```

#### 7. 本地开发

```bash
npm run dev
```

访问 http://localhost:8787 查看应用。

#### 8. 部署到 Cloudflare

```bash
npm run deploy
```

部署成功后，你将获得一个 `*.workers.dev` 域名。

## 📖 使用指南

### 首次登录

1. 访问你的 Workers 域名
2. 点击 **"🔑 使用 Linux.do 登录"** 按钮
3. 在 Linux.do 授权页面同意授权
4. **自动注册并登录** - 系统会自动为新用户创建账户
5. 首次登录会显示欢迎页面，介绍系统功能

> **注意**：
> - 本系统仅支持 Linux.do OAuth 登录，确保您已在 Linux.do 注册账户
> - **自动注册功能**：当 OAuth 用户首次登录时，系统会自动创建用户账户，无需手动注册
> - 新用户会看到一个欢迎页面，指导如何开始使用系统

### 用户设置与账户管理

1. 登录后点击右上角 **"⚙️ 设置"** 按钮
2. 查看用户信息：
   - 用户 ID、用户名、昵称
   - 信任等级、账户状态
   - 2FA 账户数量、创建时间
3. **删除账户**（危险操作）：
   - 在设置页面底部可以删除账户
   - 将永久删除所有数据（2FA 账户、WebDAV 配置等）
   - 此操作无法撤销，请谨慎操作

### 添加 2FA 账户

1. 点击右上角 **"➕ 添加账户"** 按钮
2. 填写账户信息：
   - **账户名称**：例如 "GitHub"
   - **发行者**：可选，例如 "github.com"
   - **密钥**：Base32 格式的密钥（从 2FA 设置页面获取）
   - **分类**：自定义分类，便于管理
   - **验证码位数**：通常为 6 位
   - **时间周期**：通常为 30 秒
3. 点击 **"添加"** 完成

### 使用验证码

- 验证码会自动每秒更新
- 点击验证码可以快速复制到剪贴板
- 进度条显示验证码剩余有效时间

### 配置云端备份

#### 使用 Nextcloud

1. 登录你的 Nextcloud 账户
2. 访问 **设置 -> 安全 -> 应用专用密码**
3. 创建一个新的应用密码
4. 在 2FA 管理系统中：
   - 点击 **"☁️ 备份"** -> **"WebDAV 配置"**
   - 输入配置名称，例如 "我的 Nextcloud"
   - WebDAV URL: `https://your-nextcloud.com/remote.php/dav/files/username/`
   - 用户名：你的 Nextcloud 用户名
   - 密码：刚才创建的应用专用密码

#### 使用 ownCloud

配置方式与 Nextcloud 类似：

- WebDAV URL: `https://your-owncloud.com/remote.php/dav/files/username/`

#### 使用 TeraCloud

1. 注册 TeraCloud 账户（提供 10GB 免费空间）
2. 在 WebDAV 配置中：
   - WebDAV URL: `https://webdav.teracloud.jp/dav/`
   - 用户名：你的 TeraCloud 邮箱
   - 密码：你的 TeraCloud 密码

### 创建备份

1. 配置好 WebDAV 后，点击 **"创建备份"** 标签
2. 选择要使用的 WebDAV 配置
3. 输入备份密码（用于加密备份文件）
4. 点击 **"创建备份"**

备份文件会按照以下结构保存：
```
/2fa-backup/
  └── 2024/
      └── 01/
          └── 15/
              └── backup-1705334400000.encrypted
```

### 恢复备份

1. 点击 **"☁️ 备份"** -> **"恢复备份"**
2. 选择 WebDAV 配置
3. 选择要恢复的备份文件
4. 输入备份密码
5. 点击 **"恢复"**

> **警告**：恢复备份会覆盖当前所有账户数据！

### 导入导出

#### 导出数据

1. 点击 **"📤 导出"**
2. 选择是否加密导出：
   - 输入密码：导出加密文件 (`.encrypted`)
   - 留空：导出明文 JSON (`.json`)
3. 文件会自动下载

#### 导入数据

1. 点击 **"📥 导入"**
2. 选择要导入的文件：
   - JSON 格式：标准格式或 2FAS 格式
   - 加密文件：需要输入密码
   - 纯文本：每行格式 `名称,密钥,发行者,位数,周期`
3. 选择是否合并导入（不覆盖现有数据）
4. 点击 **"导入"**

#### 支持的导入格式

**标准 JSON 格式：**
```json
{
  "version": "1.0",
  "accounts": [
    {
      "name": "GitHub",
      "issuer": "github.com",
      "secret": "JBSWY3DPEHPK3PXP",
      "digits": 6,
      "period": 30,
      "category": "开发工具"
    }
  ]
}
```

**纯文本格式：**
```
GitHub,JBSWY3DPEHPK3PXP,github.com,6,30
Google,ABCDEFGHIJKLMNOP,google.com,6,30
```

**2FAS 格式：**
支持从 2FAS Authenticator 导出的 JSON 文件。

## 🔒 安全建议

1. **使用强密钥**
   - JWT_SECRET 和 ENCRYPTION_KEY 必须使用强随机字符串
   - 建议使用 `openssl rand -base64 32` 生成

2. **定期备份**
   - 建议每周至少备份一次
   - 备份密码要妥善保管，丢失无法恢复

3. **保护 Workers 密钥**
   - 永远不要在代码中硬编码密钥
   - 使用 `wrangler secret` 管理敏感信息

4. **限制访问**
   - 考虑使用 Cloudflare Access 限制访问
   - 启用 IP 白名单或地理限制

5. **HTTPS 访问**
   - Cloudflare Workers 默认使用 HTTPS
   - 可以绑定自定义域名以获得更好的安全性

6. **定期审计**
   - 定期检查账户列表
   - 删除不再使用的 2FA 账户

## 🛠️ 高级配置

### 自定义域名

1. 在 Cloudflare Dashboard 中添加你的域名
2. 在 Workers 设置中绑定域名：

```bash
npx wrangler publish --compatibility-date=2024-01-01
```

3. 在 `wrangler.toml` 中添加路由：

```toml
routes = [
  { pattern = "2fa.example.com", zone_name = "example.com" }
]
```

### OAuth 登录配置

本系统已配置为使用 Linux.do OAuth 登录。配置详情：

- **授权端点**: `https://connect.linux.do/oauth2/authorize`
- **令牌端点**: `https://connect.linux.do/oauth2/token`
- **用户信息端点**: `https://connect.linux.do/api/user`
- **回调 URI**: `https://your-domain.com/api/auth/callback`

如需修改回调 URI（例如使用自定义域名）：

1. 在 Linux.do OAuth 应用设置中更新回调 URL
2. 确保回调 URL 格式为：`https://your-domain.com/api/auth/callback`

设置密钥：

```bash
npx wrangler secret put OAUTH_CLIENT_ID
npx wrangler secret put OAUTH_CLIENT_SECRET
```

### 调整速率限制

在 `src/utils/rateLimit.js` 和相关 API 文件中可以调整速率限制参数：

```javascript
// 登录限制：5次/5分钟
await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 5, 300);

// 生成验证码：30次/30秒
await checkRateLimit(env.RATE_LIMIT_KV, rateLimitKey, 30, 30);
```

### 自定义 UI

所有 UI 代码位于 `src/ui/index.js`，你可以：

- 修改 CSS 变量自定义颜色主题
- 添加新功能和页面
- 集成第三方 UI 库

## 📊 API 文档

### 认证 API

#### GET `/api/auth/oauth/login`
跳转到 Linux.do OAuth 登录页面

#### GET `/api/auth/callback`
OAuth 回调处理（自动处理）

#### GET `/api/auth/logout`
退出登录

**响应：**
```json
{
  "success": true
}
```

### 用户管理 API

需要在请求头中包含：`Authorization: Bearer <token>`

#### GET `/api/user`
获取当前用户信息

**响应：**
```json
{
  "user": {
    "id": "12345",
    "username": "user",
    "name": "User Name",
    "avatar_template": "/user_avatar/...",
    "active": true,
    "trust_level": 2,
    "silenced": false,
    "accountCount": 5,
    "webdavConfigCount": 1,
    "createdAt": 1234567890000
  }
}
```

#### DELETE `/api/user`
删除当前用户账户（包括所有数据）

**响应：**
```json
{
  "success": true,
  "message": "用户账户已删除，包括所有 2FA 账户和 WebDAV 配置"
}
```

### 2FA 账户管理 API

所有账户 API 需要在请求头中包含：`Authorization: Bearer <token>`

#### GET `/api/accounts`
获取所有账户

#### POST `/api/accounts`
添加账户

**请求：**
```json
{
  "name": "GitHub",
  "issuer": "github.com",
  "secret": "JBSWY3DPEHPK3PXP",
  "digits": 6,
  "period": 30,
  "category": "开发工具"
}
```

#### PUT `/api/accounts/:id`
更新账户

#### DELETE `/api/accounts/:id`
删除账户

#### GET `/api/accounts/:id/code`
生成单个账户的 TOTP 代码

#### GET `/api/codes`
批量生成所有账户的 TOTP 代码

### 备份 API

#### GET `/api/webdav/configs`
获取 WebDAV 配置列表

#### POST `/api/webdav/configs`
添加 WebDAV 配置

#### DELETE `/api/webdav/configs/:id`
删除 WebDAV 配置

#### POST `/api/backup/create`
创建备份

#### POST `/api/backup/restore`
恢复备份

#### GET `/api/backup/list?configId=xxx`
列出备份文件

### 导入导出 API

#### GET `/api/export?password=xxx`
导出数据（可选密码加密）

#### POST `/api/import`
导入数据（支持多种格式）

## 🐛 故障排除

### 问题：部署失败

**解决方案：**
1. 检查 `wrangler.toml` 配置是否正确
2. 确认 KV 命名空间 ID 是否正确
3. 运行 `npx wrangler whoami` 确认已登录
4. 查看详细错误信息：`npx wrangler deploy --verbose`

### 问题：无法生成验证码

**解决方案：**
1. 检查密钥格式是否为 Base32
2. 确认 ENCRYPTION_KEY 已正确设置
3. 查看浏览器控制台错误信息

### 问题：WebDAV 连接失败

**解决方案：**
1. 确认 WebDAV URL 格式正确
2. 检查用户名和密码是否正确
3. 确认服务器支持 WebDAV 协议
4. 检查是否有防火墙或 CORS 限制

### 问题：备份恢复失败

**解决方案：**
1. 确认备份密码正确
2. 检查备份文件是否损坏
3. 确认备份文件格式正确

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## ⚠️ 免责声明

本项目仅供学习和个人使用。请妥善保管你的密钥和备份文件。作者不对因使用本软件造成的任何损失负责。

## 🙏 致谢

- Cloudflare Workers - 提供出色的边缘计算平台
- TOTP 标准 (RFC 6238) - 双因素认证标准
- WebDAV 协议 - 文件同步标准

## 📞 支持

如有问题，请：
1. 查看本 README 的故障排除部分
2. 在 GitHub Issues 中搜索类似问题
3. 提交新的 Issue 并详细描述问题

---

**祝使用愉快！🎉**
