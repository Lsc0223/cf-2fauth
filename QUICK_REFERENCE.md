# OAuth 自动注册功能 - 快速参考

## 🎯 功能概述

当用户通过 Linux.do OAuth 登录时：
- ✅ 如果是**新用户** → 自动创建账户 + 显示欢迎页
- ✅ 如果是**老用户** → 更新信息 + 直接登录
- 🔥 **新特性**：直接使用 Linux.do access_token，不再自生成JWT

## 📝 关键代码位置

### 1. 后端逻辑
**文件**: `src/api/auth.js`  
**函数**: `handleOAuthCallback()`  
**行数**: 第 106-121 行

```javascript
// 直接使用从 linux.do 获取的 access_token 作为认证令牌
const authToken = tokenData.access_token;

// 存储token与用户信息的映射关系
const tokenInfo = {
  userId, username, name, isNewUser,
  expiresAt: Date.now() + (tokenData.expires_in * 1000),
  scope: tokenData.scope
};
await env.USERS_KV.put(`token:${authToken}`, JSON.stringify(tokenInfo), {
  expirationTtl: tokenData.expires_in
});
```

### 2. 前端处理
**文件**: `src/ui/index.js`  
**函数**: `init()`, `showWelcomeMessage()`  
**行数**: 第 434-457 行, 第 1023-1053 行

```javascript
// 检测新用户
if (localStorage.getItem('is_new_user') === 'true') {
  showWelcomeMessage();
}
```

## 🔍 调试信息

### 查看日志
```bash
# 实时查看 Workers 日志
npm run tail

# 或在 Cloudflare Dashboard 查看
```

### 日志输出
```
自动注册新用户: username (ID: 12345)  # 新用户
用户登录: username (ID: 12345)        # 老用户
```

## 🧪 测试方法

### 测试新用户注册
1. 清除浏览器 localStorage
2. 使用新的 Linux.do 账户登录
3. 应该看到欢迎页面
4. 检查 Workers 日志，应该有"自动注册新用户"

### 测试老用户登录
1. 使用已注册的账户登录
2. 不应该看到欢迎页面
3. 检查日志，应该有"用户登录"

### 验证数据
```bash
# 在 Cloudflare Dashboard 或使用 wrangler CLI
# 查看 KV 中的用户数据
# Key: user:{userId}
```

## 📦 部署

### 部署到生产环境
```bash
# 确保所有 secrets 已设置
npx wrangler secret list

# 部署
npm run deploy
```

### 本地开发测试
```bash
# 本地启动
npm run dev

# 访问
# http://localhost:8787
```

## ⚠️ 注意事项

1. **必需配置**
   - OAUTH_CLIENT_ID
   - OAUTH_CLIENT_SECRET
   - JWT_SECRET
   - ENCRYPTION_KEY

2. **KV 命名空间**
   - USERS_KV (存储用户数据)
   - RATE_LIMIT_KV (速率限制)

3. **OAuth 回调 URL**
   - 生产: `https://your-domain.com/api/auth/callback`
   - 开发: `http://localhost:8787/api/auth/callback`

## 📊 数据结构

### 新用户数据
```json
{
  "id": "12345",
  "username": "user",
  "name": "User Name",
  "accounts": [],
  "webdavConfigs": [],
  "createdAt": 1234567890000
}
```

### JWT Payload
```json
{
  "userId": "12345",
  "username": "user",
  "name": "User Name",
  "isNewUser": true
}
```

## 🔗 相关文档

- **详细技术文档**: `docs/AUTO_REGISTER.md`
- **功能实现总结**: `FEATURE_SUMMARY.md`
- **更新日志**: `CHANGELOG.md`
- **用户指南**: `README.md`

## 💡 常见问题

### Q: 新用户没有显示欢迎页？
A: 检查：
- localStorage 是否被禁用
- 浏览器控制台是否有错误
- `is_new_user` 标记是否正确设置

### Q: 用户数据没有保存？
A: 检查：
- KV 命名空间是否正确配置
- Workers 日志中是否有错误
- ENCRYPTION_KEY 是否正确设置

### Q: 如何重置用户状态？
A: 
```javascript
// 删除 localStorage 中的数据
localStorage.removeItem('auth_token');
localStorage.removeItem('is_new_user');

// 或在 KV 中删除用户数据
// Key: user:{userId}
```

## 📞 支持

如有问题，请查看：
1. Workers 日志
2. 浏览器控制台
3. 项目文档
4. CHANGELOG.md
