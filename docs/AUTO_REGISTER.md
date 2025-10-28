# OAuth 自动注册功能说明

## 功能概述

本系统已实现 OAuth 用户自动注册功能。当用户通过 Linux.do OAuth 首次登录时，系统会自动创建用户账户，无需手动注册步骤。

## 工作流程

### 1. OAuth 登录流程

```
用户点击登录
    ↓
跳转到 Linux.do 授权页面
    ↓
用户同意授权
    ↓
系统获取用户信息
    ↓
检查用户是否存在
    ↓
├─ 不存在 → 自动创建新用户账户
└─ 已存在 → 更新用户信息
    ↓
生成 JWT token
    ↓
用户登录成功
```

### 2. 自动注册逻辑

在 `src/api/auth.js` 的 `handleOAuthCallback` 函数中：

```javascript
// 检查用户是否已存在
let userData = await env.USERS_KV.get(`user:${userId}`, 'json');
let isNewUser = false;

if (!userData) {
  // 自动注册新用户
  console.log(`自动注册新用户: ${userInfo.username} (ID: ${userId})`);
  isNewUser = true;
  userData = {
    id: userId,
    username: userInfo.username,
    name: userInfo.name,
    avatar_template: userInfo.avatar_template,
    active: userInfo.active,
    trust_level: userInfo.trust_level,
    silenced: userInfo.silenced,
    external_ids: userInfo.external_ids,
    accounts: [],
    webdavConfigs: [],
    createdAt: Date.now()
  };
  await env.USERS_KV.put(`user:${userId}`, JSON.stringify(userData));
}
```

### 3. 首次登录欢迎页

当新用户首次登录时：

1. JWT token 中包含 `isNewUser: true` 标志
2. 前端在 localStorage 中存储 `is_new_user` 标记
3. 页面加载完成后检测到该标记，显示欢迎弹窗
4. 欢迎弹窗介绍系统功能并引导用户开始使用

## 相关文件

- `src/api/auth.js` - OAuth 认证和自动注册逻辑
- `src/ui/index.js` - 前端UI和欢迎页面显示
- `README.md` - 用户使用文档
- `CHANGELOG.md` - 版本更新日志

## 调试和日志

系统在以下情况会输出日志：

```javascript
// 新用户注册
console.log(`自动注册新用户: ${userInfo.username} (ID: ${userId})`);

// 已有用户登录
console.log(`用户登录: ${userInfo.username} (ID: ${userId})`);
```

可以在 Cloudflare Workers 日志中查看这些信息。

## 用户数据结构

新注册用户的数据结构：

```javascript
{
  id: "用户ID",              // 来自 Linux.do
  username: "用户名",        // 来自 Linux.do
  name: "昵称",              // 来自 Linux.do
  avatar_template: "...",   // 头像模板
  active: true,             // 账户状态
  trust_level: 0,           // 信任等级
  silenced: false,          // 是否被禁言
  external_ids: {},         // 外部ID
  accounts: [],             // 2FA 账户列表（初始为空）
  webdavConfigs: [],        // WebDAV 配置（初始为空）
  createdAt: 1234567890000, // 创建时间戳
  lastLogin: 1234567890000  // 最后登录时间戳（后续登录时更新）
}
```

## 安全考虑

1. **OAuth 认证**：所有用户必须通过 Linux.do OAuth 认证
2. **数据验证**：从 OAuth 获取的用户信息已通过 Linux.do 验证
3. **唯一标识**：使用 Linux.do 的用户 ID 作为唯一标识符
4. **权限控制**：每个用户只能访问自己的数据

## 测试

### 测试新用户注册

1. 使用未在系统中注册的 Linux.do 账户登录
2. 检查是否显示欢迎页面
3. 在设置页面查看用户信息
4. 确认 `createdAt` 时间戳正确

### 测试已有用户登录

1. 使用已注册的账户再次登录
2. 确认不会显示欢迎页面
3. 确认用户信息被正确更新
4. 确认 `lastLogin` 时间戳已更新

## 故障排除

### 问题：新用户无法登录

**可能原因**：
- KV 命名空间未正确配置
- JWT_SECRET 未设置
- OAuth 配置错误

**解决方案**：
1. 检查 `wrangler.toml` 中的 KV 配置
2. 确认所有 secrets 都已设置
3. 查看 Workers 日志中的错误信息

### 问题：欢迎页面未显示

**可能原因**：
- localStorage 被清除
- `is_new_user` 标记未正确设置

**解决方案**：
1. 检查浏览器控制台是否有错误
2. 检查 localStorage 中是否有 `is_new_user` 键
3. 清除 localStorage 并重新登录测试
