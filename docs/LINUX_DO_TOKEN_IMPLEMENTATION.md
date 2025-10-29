# Linux.do Access Token 认证实现说明

## 概述

从 v1.2.0 版本开始，2FA管理系统改为直接使用 Linux.do 的 access_token 作为认证令牌，替代了之前自生成JWT token的方案。这个变更提供了更好的安全性、性能和用户体验。

## 变更动机

### 原方案的问题
1. **双重token管理**：需要同时管理Linux.do的access_token和自生成的JWT token
2. **额外开销**：每次登录都需要生成和验证JWT token
3. **过期时间不一致**：JWT token固定2小时，与Linux.do token不同步
4. **安全风险**：自生成token可能存在实现漏洞

### 新方案的优势
1. **单一token**：直接使用Linux.do access_token，简化架构
2. **原生安全**：依赖Linux.do的专业安全实现
3. **动态过期**：根据Linux.do的token策略自动调整
4. **减少开销**：无需额外的token生成和验证过程

## 技术实现

### 1. OAuth回调处理

```javascript
// 获取Linux.do token响应
const tokenData = await tokenResponse.json();

// 直接使用access_token作为认证令牌
const authToken = tokenData.access_token;

// 存储token与用户信息的映射关系
const tokenInfo = {
  userId,
  username: userInfo.username,
  name: userInfo.name,
  isNewUser,
  expiresAt: Date.now() + (tokenData.expires_in * 1000),
  scope: tokenData.scope
};

// 存储到KV，设置与token相同的过期时间
await env.USERS_KV.put(`token:${authToken}`, JSON.stringify(tokenInfo), {
  expirationTtl: tokenData.expires_in
});
```

### 2. 认证中间件

```javascript
export async function authenticate(request, env) {
  const token = authHeader.substring(7);
  
  try {
    // 优先验证Linux.do access_token
    let tokenInfo = await env.USERS_KV.get(`token:${token}`, 'json');
    
    if (tokenInfo) {
      // 验证token是否过期
      if (tokenInfo.expiresAt && tokenInfo.expiresAt < Date.now()) {
        return null;
      }
      
      // 确保用户存在
      const userData = await env.USERS_KV.get(`user:${tokenInfo.userId}`, 'json');
      if (!userData) {
        return null;
      }
      
      return {
        userId: tokenInfo.userId,
        username: tokenInfo.username,
        name: tokenInfo.name,
        isNewUser: tokenInfo.isNewUser
      };
    }
    
    // 向后兼容：尝试验证JWT token
    const payload = await verifyJWT(token, env.JWT_SECRET);
    // ... JWT验证逻辑
    
  } catch (error) {
    return null;
  }
}
```

### 3. 登出处理

```javascript
export async function handleLogout(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // 清理token映射
    try {
      await env.USERS_KV.delete(`token:${token}`);
    } catch (error) {
      console.log(`登出时删除token映射失败: ${error.message}`);
    }
  }
  
  return new Response(JSON.stringify({ success: true }));
}
```

## 数据结构

### Token映射信息
```json
{
  "userId": "123456",
  "username": "user_name",
  "name": "Display Name",
  "isNewUser": false,
  "expiresAt": 1641002400000,
  "scope": "read"
}
```

### 用户数据结构（不变）
```json
{
  "id": "123456",
  "username": "user_name",
  "name": "Display Name",
  "avatar_template": "...",
  "active": true,
  "trust_level": 0,
  "silenced": false,
  "external_ids": {},
  "accounts": [],
  "webdavConfigs": [],
  "createdAt": 1234567890000,
  "lastLogin": 1234567890000
}
```

## 向后兼容性

### JWT Token支持
为了确保现有用户的平滑迁移，系统仍然支持JWT token验证：

1. **优先级**：首先尝试验证Linux.do access_token
2. **降级**：如果没有找到token映射，尝试验证JWT token
3. **渐进迁移**：用户重新登录时会自动切换到新的token方案

### 迁移策略
- **自动迁移**：用户下次登录时自动使用新方案
- **无感知**：现有JWT token在过期前仍可正常使用
- **强制迁移**：JWT token过期后必须通过OAuth重新登录

## 安全考虑

### Token安全
1. **传输安全**：所有token通过HTTPS传输
2. **存储安全**：token映射存储在加密的KV存储中
3. **过期管理**：自动清理过期的token映射
4. **作用域限制**：仅请求必要的OAuth作用域

### 访问控制
1. **用户隔离**：每个用户只能访问自己的数据
2. **权限验证**：每次API调用都验证token有效性
3. **日志记录**：记录所有认证相关操作

## 性能优化

### 减少计算开销
- 消除JWT签名生成和验证的计算成本
- 减少加密解密操作
- 简化token验证流程

### 存储优化
- token映射设置自动过期时间
- 减少长期存储的敏感数据
- 优化KV存储访问模式

## 监控和调试

### 日志记录
```javascript
// 新用户注册
console.log(`自动注册新用户: ${userInfo.username} (ID: ${userId})`);

// 已有用户登录
console.log(`用户登录: ${userInfo.username} (ID: ${userId})`);

// Token过期
console.log(`认证失败: token已过期 - ${request.url}`);

// Token映射删除
console.log(`登出时删除token映射失败: ${error.message}`);
```

### 调试工具
1. **KV浏览器**：查看token映射和用户数据
2. **日志分析**：监控认证成功/失败情况
3. **性能监控**：观察认证响应时间

## 故障排除

### 常见问题

#### 问题：新用户无法登录
**可能原因**：
- Linux.do OAuth配置错误
- KV命名空间未正确配置
- Token映射存储失败

**解决方案**：
1. 检查OAuth客户端配置
2. 验证KV命名空间设置
3. 查看Workers日志中的详细错误

#### 问题：现有用户认证失败
**可能原因**：
- JWT token已过期
- Token映射已清理
- 用户数据丢失

**解决方案**：
1. 引导用户重新登录
2. 检查KV存储中的用户数据
3. 验证token映射是否存在

#### 问题：Token过期频繁
**可能原因**：
- Linux.do token策略变更
- 网络时间同步问题
- 客户端时间不准确

**解决方案**：
1. 检查Linux.do OAuth文档
2. 验证服务器时间设置
3. 实现token刷新机制

## 测试

### 单元测试
```javascript
// 测试token映射存储
await env.USERS_KV.put(`token:${testToken}`, testTokenInfo, {
  expirationTtl: 3600
});

// 测试token验证
const result = await authenticate(mockRequest, env);
assert(result.userId === testUserId);
```

### 集成测试
1. **完整OAuth流程**：测试从登录到API调用的完整流程
2. **Token过期处理**：测试token过期后的处理逻辑
3. **向后兼容性**：测试JWT token的验证流程

### 性能测试
1. **认证响应时间**：测量新的认证方案响应时间
2. **并发处理**：测试高并发下的认证性能
3. **存储压力**：验证KV存储在高负载下的表现

## 未来改进

### 可能的增强功能
1. **Token刷新**：实现Linux.do token的自动刷新
2. **多设备支持**：支持同一用户的多个设备登录
3. **会话管理**：提供更细粒度的会话控制
4. **安全审计**：增强的安全事件记录和分析

### 长期规划
1. **完全迁移**：逐步淘汰JWT token支持
2. **标准化**：遵循OAuth 2.1安全最佳实践
3. **国际化**：支持其他OAuth提供商
4. **API版本控制**：为认证API添加版本支持

## 总结

这个变更是系统架构的重要改进，提供了更好的安全性、性能和用户体验。通过直接使用Linux.do的access_token，我们简化了认证流程，减少了安全风险，并为未来的功能扩展奠定了基础。

向后兼容的设计确保了现有用户的平滑迁移，而详细的文档和测试保证了变更的可靠性。