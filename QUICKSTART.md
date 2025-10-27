# 快速入门指南

只需 5 分钟即可部署你的 2FA 管理系统！

## 🚀 一键部署（推荐）

### 使用自动化脚本

```bash
# 下载项目
git clone <repository-url>
cd 2fa-manager

# 运行自动化设置脚本
chmod +x setup.sh
./setup.sh
```

脚本会自动完成：
- ✅ 安装依赖
- ✅ 创建 KV 命名空间
- ✅ 生成随机密钥
- ✅ 配置环境
- ✅ 部署到 Cloudflare

## 📝 手动部署

### 第一步：安装依赖

```bash
npm install
```

### 第二步：登录 Cloudflare

```bash
npx wrangler login
```

### 第三步：创建 KV 命名空间

```bash
npx wrangler kv:namespace create "USERS_KV"
npx wrangler kv:namespace create "RATE_LIMIT_KV"
```

复制输出的 ID 并更新 `wrangler.toml`。

### 第四步：设置密钥

```bash
# 生成密钥
openssl rand -base64 32

# 设置 JWT 密钥
npx wrangler secret put JWT_SECRET
# 粘贴刚才生成的值

# 设置加密密钥
npx wrangler secret put ENCRYPTION_KEY
# 粘贴另一个随机值
```

### 第五步：部署

```bash
npm run deploy
```

完成！访问显示的 URL 即可使用。

## 🎯 首次使用

1. **登录**
   - 输入任意用户名和密码（演示模式）
   - 系统会自动创建账户

2. **添加第一个 2FA 账户**
   - 点击 "➕ 添加账户"
   - 填写账户信息和密钥
   - 点击 "添加"

3. **获取验证码**
   - 验证码会自动显示和刷新
   - 点击验证码即可复制

## ⚡ 常用操作

### 本地开发

```bash
npm run dev
```

访问 http://localhost:8787

### 查看日志

```bash
npm run tail
```

### 重新部署

```bash
npm run deploy
```

### 导出数据

在界面中点击 "📤 导出" 按钮。

### 配置云端备份

1. 点击 "☁️ 备份"
2. 选择 "WebDAV 配置"
3. 填写你的 WebDAV 服务信息
4. 保存配置

## 🔧 常见问题

### Q: 部署失败？

A: 确保：
- 已登录 Cloudflare (`npx wrangler whoami`)
- KV 命名空间 ID 正确
- 密钥已设置

### Q: 验证码不正确？

A: 检查：
- 密钥是否为 Base32 格式
- 系统时间是否准确
- 时间周期设置是否正确（通常 30 秒）

### Q: 忘记密钥？

A: JWT 和加密密钥丢失后无法恢复。建议：
- 重新设置密钥
- 重新导入账户数据

## 📚 下一步

- 阅读完整 [README.md](README.md)
- 查看 [部署指南](DEPLOYMENT.md)
- 了解 [安全策略](SECURITY.md)

## 💡 提示

- 定期备份数据
- 使用强随机密钥
- 妥善保管备份密码
- 不要分享密钥

## 🆘 需要帮助？

- 查看 [故障排除](README.md#故障排除)
- 提交 [GitHub Issue](https://github.com/your-repo/issues)

---

**开始使用吧！🎉**
