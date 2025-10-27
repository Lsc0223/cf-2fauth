# 项目结构说明

本文档详细说明项目的文件组织结构和各部分职责。

## 📁 目录结构

```
2fa-manager/
├── src/                          # 源代码目录
│   ├── api/                      # API 路由处理器
│   │   ├── auth.js              # 认证相关 API（登录、登出、JWT）
│   │   ├── accounts.js          # 账户管理 API（增删改查、生成验证码）
│   │   ├── backup.js            # 备份管理 API（WebDAV 配置、云端备份）
│   │   └── import.js            # 导入导出 API（多格式支持）
│   ├── utils/                    # 工具函数
│   │   ├── crypto.js            # 加密工具（AES-GCM、TOTP、JWT、Base32）
│   │   ├── rateLimit.js         # 速率限制工具
│   │   └── webdav.js            # WebDAV 客户端工具
│   ├── ui/                       # 前端界面
│   │   └── index.js             # 单页应用 HTML/CSS/JS
│   └── index.js                  # Workers 入口文件（路由分发）
├── docs/                         # 文档目录
│   ├── API.md                   # 完整 API 文档
│   ├── FAQ.md                   # 常见问题解答
│   └── PROJECT_STRUCTURE.md     # 本文件
├── .editorconfig                 # 编辑器配置
├── .prettierrc                   # 代码格式化配置
├── .gitignore                    # Git 忽略文件
├── .dev.vars.example            # 本地环境变量示例
├── wrangler.toml                # Cloudflare Workers 配置
├── package.json                 # npm 项目配置
├── setup.sh                     # Linux/macOS 自动化部署脚本
├── setup.ps1                    # Windows PowerShell 部署脚本
├── README.md                    # 项目说明文档
├── QUICKSTART.md                # 快速入门指南
├── DEPLOYMENT.md                # 详细部署指南
├── CONTRIBUTING.md              # 贡献指南
├── SECURITY.md                  # 安全策略
├── CHANGELOG.md                 # 更新日志
└── LICENSE                      # MIT 许可证
```

## 📄 核心文件说明

### 入口文件

#### `src/index.js`
- Workers 的主入口文件
- 处理所有 HTTP 请求
- 路由分发到对应的 API 处理器
- 提供前端 HTML 页面
- 处理 CORS 跨域请求
- 统一错误处理

**主要职责：**
```javascript
- 路由匹配和分发
- 认证中间件调用
- 静态资源服务（前端页面）
- 全局错误捕获
```

### API 处理器

#### `src/api/auth.js`
认证和授权管理

**功能：**
- 简单登录（演示模式）
- OAuth 2.0 登录（可选）
- JWT Token 生成和验证
- 用户会话管理
- 登出处理

**主要函数：**
```javascript
- handleSimpleLogin()     // 简单登录
- handleOAuthLogin()      // OAuth 登录
- handleOAuthCallback()   // OAuth 回调
- authenticate()          // JWT 验证中间件
- handleLogout()          // 登出
```

#### `src/api/accounts.js`
2FA 账户管理

**功能：**
- 获取账户列表
- 添加新账户
- 更新账户信息
- 删除账户
- 生成 TOTP 验证码
- 批量生成验证码

**主要函数：**
```javascript
- getAccounts()           // 获取所有账户
- addAccount()            // 添加账户
- updateAccount()         // 更新账户
- deleteAccount()         // 删除账户
- generateCode()          // 生成单个验证码
- generateAllCodes()      // 批量生成验证码
```

#### `src/api/backup.js`
云端备份管理

**功能：**
- WebDAV 配置管理
- 创建云端备份
- 恢复备份
- 列出备份文件

**主要函数：**
```javascript
- getWebDAVConfigs()      // 获取 WebDAV 配置
- addWebDAVConfig()       // 添加配置
- deleteWebDAVConfig()    // 删除配置
- createBackup()          // 创建备份
- restoreBackup()         // 恢复备份
- listBackups()           // 列出备份
```

#### `src/api/import.js`
数据导入导出

**功能：**
- 导出加密/非加密数据
- 导入多种格式（JSON、2FAS、纯文本）
- 数据格式转换
- 批量操作和去重

**主要函数：**
```javascript
- exportAccounts()        // 导出数据
- importAccounts()        // 导入数据
- performImport()         // 执行导入
- parsePlainTextImport()  // 解析纯文本
- convert2FASFormat()     // 转换 2FAS 格式
```

### 工具函数

#### `src/utils/crypto.js`
加密和安全工具

**功能：**
- TOTP 验证码生成（RFC 6238）
- AES-GCM-256 加密/解密
- JWT Token 生成和验证
- Base32 编码/解码
- PBKDF2 密钥派生
- 随机密钥生成

**主要函数：**
```javascript
- generateTOTP()          // 生成 TOTP 验证码
- encrypt()               // AES-GCM 加密
- decrypt()               // AES-GCM 解密
- generateJWT()           // 生成 JWT
- verifyJWT()             // 验证 JWT
- generateSecret()        // 生成随机密钥
- base32Decode()          // Base32 解码
```

#### `src/utils/rateLimit.js`
速率限制工具

**功能：**
- 基于 IP 的速率限制
- 滑动时间窗口算法
- 可配置的限制参数

**主要函数：**
```javascript
- checkRateLimit()        // 检查速率限制
- getClientIP()           // 获取客户端 IP
```

#### `src/utils/webdav.js`
WebDAV 客户端

**功能：**
- WebDAV 文件操作
- 目录管理
- 备份文件组织

**主要函数：**
```javascript
- WebDAVClient.upload()   // 上传文件
- WebDAVClient.download() // 下载文件
- WebDAVClient.list()     // 列出目录
- WebDAVClient.mkdir()    // 创建目录
- WebDAVClient.delete()   // 删除文件
- generateBackupPath()    // 生成备份路径
```

### 前端界面

#### `src/ui/index.js`
单页应用（SPA）

**技术栈：**
- 原生 JavaScript（ES6+）
- 无框架依赖
- 响应式 CSS
- Fetch API

**组件：**
```javascript
- 登录页面
- 账户列表
- 添加/编辑账户模态框
- 云端备份配置
- 导入导出界面
- 实时验证码显示
- 搜索和过滤
```

**主要函数：**
```javascript
- init()                  // 初始化应用
- renderLogin()           // 渲染登录页
- renderApp()             // 渲染主应用
- renderAccounts()        // 渲染账户列表
- showAddModal()          // 显示添加模态框
- editAccount()           // 编辑账户
- deleteAccount()         // 删除账户
- loadCodes()             // 加载验证码
- exportData()            // 导出数据
- importData()            // 导入数据
```

## 🔐 数据流

### 1. 认证流程

```
用户输入凭证
    ↓
POST /api/auth/login
    ↓
验证凭证
    ↓
生成 JWT Token
    ↓
返回 Token 给客户端
    ↓
客户端存储在 localStorage
    ↓
后续请求携带 Token
```

### 2. 添加账户流程

```
用户填写账户信息
    ↓
POST /api/accounts
    ↓
验证 JWT Token
    ↓
加密密钥（AES-GCM）
    ↓
保存到 KV 存储
    ↓
返回账户信息（不含密钥）
```

### 3. 生成验证码流程

```
前端定时请求
    ↓
GET /api/codes
    ↓
从 KV 读取账户
    ↓
解密密钥
    ↓
生成 TOTP 验证码
    ↓
返回所有验证码
    ↓
前端更新显示
```

### 4. 云端备份流程

```
用户触发备份
    ↓
POST /api/backup/create
    ↓
加密账户数据
    ↓
连接 WebDAV 服务
    ↓
创建目录结构
    ↓
上传加密文件
    ↓
返回备份路径
```

## 🗄️ 数据存储

### KV 命名空间

#### USERS_KV
存储用户数据

**键格式：** `user:{userId}`

**值结构：**
```json
{
  "id": "user_id",
  "username": "username",
  "email": "email@example.com",
  "accounts": [
    {
      "id": "account_id",
      "name": "GitHub",
      "issuer": "github.com",
      "secret": "encrypted_secret",
      "digits": 6,
      "period": 30,
      "category": "开发工具",
      "createdAt": 1705334400000,
      "updatedAt": 1705334400000
    }
  ],
  "webdavConfigs": [
    {
      "id": "config_id",
      "name": "我的 Nextcloud",
      "url": "https://...",
      "username": "user",
      "password": "encrypted_password",
      "createdAt": 1705334400000
    }
  ],
  "createdAt": 1705334400000
}
```

#### RATE_LIMIT_KV
存储速率限制数据

**键格式：** `{action}:{identifier}`

**值结构：**
```json
{
  "count": 5,
  "resetTime": 1705334700000
}
```

### Cloudflare Secrets
敏感配置存储

```
JWT_SECRET          - JWT 签名密钥
ENCRYPTION_KEY      - 数据加密密钥
OAUTH_CLIENT_ID     - OAuth 客户端 ID（可选）
OAUTH_CLIENT_SECRET - OAuth 客户端密钥（可选）
```

## 🔄 工作流程

### 开发流程

```bash
# 1. 修改代码
vim src/api/accounts.js

# 2. 本地测试
npm run dev

# 3. 测试功能
curl http://localhost:8787/api/accounts

# 4. 提交代码
git add .
git commit -m "feat: 添加新功能"

# 5. 部署
npm run deploy
```

### 部署流程

```bash
# 1. 构建（Wrangler 自动处理）
# 2. 上传到 Cloudflare
# 3. 分发到全球边缘节点
# 4. 更新 KV 绑定
# 5. 生效（几秒内）
```

## 📊 技术选型

### 后端
- **运行时**: Cloudflare Workers (V8 Isolates)
- **存储**: Cloudflare KV (Key-Value Store)
- **加密**: Web Crypto API
- **认证**: JWT (HS256)

### 前端
- **框架**: 原生 JavaScript（无依赖）
- **样式**: CSS 变量 + Flexbox/Grid
- **API**: Fetch API
- **存储**: localStorage

### 开发工具
- **CLI**: Wrangler
- **包管理**: npm
- **版本控制**: Git

## 🎯 设计原则

1. **安全第一**
   - 端到端加密
   - 最小权限原则
   - 安全的默认配置

2. **简单易用**
   - 直观的界面
   - 一键部署
   - 详细的文档

3. **无依赖**
   - 使用 Web 标准 API
   - 减少供应链风险
   - 提高性能

4. **可维护性**
   - 模块化设计
   - 清晰的代码结构
   - 完善的注释

5. **性能优化**
   - 边缘计算
   - KV 缓存
   - 最小化传输

## 📈 扩展性

### 添加新 API

1. 在 `src/api/` 创建新文件
2. 实现处理函数
3. 在 `src/index.js` 注册路由
4. 添加速率限制
5. 更新 API 文档

### 添加新功能

1. 在 `src/ui/index.js` 添加 UI
2. 实现 API 调用
3. 添加错误处理
4. 测试功能
5. 更新用户文档

### 自定义主题

修改 `src/ui/index.js` 中的 CSS 变量：
```css
:root {
  --primary: #3b82f6;
  --success: #10b981;
  --danger: #ef4444;
  /* ... */
}
```

## 🔍 调试技巧

### 本地调试

```bash
# 查看实时日志
npm run tail

# 使用浏览器开发者工具
# Network 选项卡查看请求
# Console 选项卡查看错误
```

### 生产调试

```bash
# 查看 Workers 日志
npx wrangler tail --format pretty

# 查看 KV 内容
npx wrangler kv:key get "user:xxx" --binding=USERS_KV
```

---

**需要帮助？** 查看 [FAQ.md](FAQ.md) 或提交 Issue。
