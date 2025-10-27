# 更新日志

## [1.1.0] - 2024-01-16

### 新增功能
- 🚀 **UI 部署管理界面** - 通过 Web 界面配置和管理 Cloudflare Workers 部署
- ⚙️ **Cloudflare API 集成** - 直接调用 Cloudflare API 进行资源管理
- 📦 **KV 命名空间管理** - 在 UI 中创建和管理 KV 命名空间
- 🎯 **部署配置向导** - 分步引导完成部署配置
- 📋 **配置保存功能** - 保存 Cloudflare 账户信息和 API Token
- 📖 **交互式部署指南** - 内置完整的部署步骤说明

### 改进
- 📚 更新 README 添加 UI 部署说明
- 📝 新增 DEPLOYMENT_VIA_UI.md 详细部署指南
- ✨ 优化部署流程，降低技术门槛

### API 更新
- 新增 `GET /api/deploy/config` - 获取部署配置
- 新增 `POST /api/deploy/config` - 保存部署配置
- 新增 `POST /api/deploy/kv/create` - 创建 KV 命名空间
- 新增 `POST /api/deploy/worker` - 部署 Worker（配置生成）
- 新增 `GET /api/deploy/status` - 获取部署状态

## [1.0.0] - 2024-01-15

### 新增功能
- ✨ 完整的 2FA 账户管理功能
- 🔐 JWT 会话认证系统
- 🛡️ AES-GCM 端到端加密
- 📱 实时 TOTP 验证码生成
- ☁️ WebDAV 云端备份支持
- 📥 多格式数据导入（JSON、2FAS、纯文本）
- 📤 加密数据导出功能
- 🎨 现代化中文界面
- ⚡ 速率限制保护
- 🔍 账户搜索和分类管理

### 技术特性
- 基于 Cloudflare Workers 无服务器架构
- 使用 KV 存储用户数据
- 完全响应式设计
- 无需第三方依赖

### 安全特性
- 密钥加密存储
- 会话自动过期
- API 速率限制
- 密码保护的备份文件
