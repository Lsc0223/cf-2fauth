# API 文档

完整的 API 接口文档。

## 基础信息

- **Base URL**: `https://your-worker.workers.dev`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON
- **字符编码**: UTF-8

## 认证流程

### 获取 Token

所有受保护的 API 都需要在请求头中包含：

```
Authorization: Bearer <your_jwt_token>
```

## 接口列表

### 认证 API

#### 1. 登录

**POST** `/api/auth/login`

简单登录（演示模式）。

**请求体：**
```json
{
  "username": "user",
  "password": "password"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "demo_user",
    "username": "user"
  }
}
```

**状态码：**
- `200` - 成功
- `400` - 请求参数错误
- `429` - 请求过于频繁
- `500` - 服务器错误

#### 2. 登出

**POST** `/api/auth/logout`

登出当前用户。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true
}
```

---

### 账户管理 API

#### 1. 获取所有账户

**GET** `/api/accounts`

获取当前用户的所有 2FA 账户。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "accounts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "GitHub",
      "issuer": "github.com",
      "category": "开发工具",
      "digits": 6,
      "period": 30,
      "createdAt": 1705334400000,
      "updatedAt": 1705334400000
    }
  ]
}
```

**注意：** 响应中不包含 `secret` 字段以保护安全。

#### 2. 添加账户

**POST** `/api/accounts`

添加新的 2FA 账户。

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
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

**字段说明：**
- `name` (必需): 账户名称
- `secret` (必需): Base32 格式的密钥
- `issuer` (可选): 发行者
- `digits` (可选): 验证码位数，默认 6
- `period` (可选): 时间周期（秒），默认 30
- `category` (可选): 分类，默认"未分类"

**响应：**
```json
{
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "GitHub",
    "issuer": "github.com",
    "category": "开发工具",
    "digits": 6,
    "period": 30,
    "createdAt": 1705334400000,
    "updatedAt": 1705334400000
  }
}
```

**状态码：**
- `201` - 创建成功
- `400` - 请求参数错误
- `429` - 请求过于频繁
- `500` - 服务器错误

#### 3. 更新账户

**PUT** `/api/accounts/:id`

更新指定账户的信息。

**URL 参数：**
- `id`: 账户 ID

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "name": "GitHub (Work)",
  "issuer": "github.com",
  "category": "工作",
  "digits": 6,
  "period": 30
}
```

**注意：** 只需包含要更新的字段。

**响应：**
```json
{
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "GitHub (Work)",
    "issuer": "github.com",
    "category": "工作",
    "digits": 6,
    "period": 30,
    "createdAt": 1705334400000,
    "updatedAt": 1705334500000
  }
}
```

#### 4. 删除账户

**DELETE** `/api/accounts/:id`

删除指定账户。

**URL 参数：**
- `id`: 账户 ID

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true
}
```

**状态码：**
- `200` - 删除成功
- `404` - 账户不存在
- `500` - 服务器错误

#### 5. 生成验证码

**GET** `/api/accounts/:id/code`

为指定账户生成 TOTP 验证码。

**URL 参数：**
- `id`: 账户 ID

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "code": "123456",
  "remaining": 25,
  "period": 30
}
```

**字段说明：**
- `code`: 当前验证码
- `remaining`: 剩余有效秒数
- `period`: 时间周期（秒）

#### 6. 批量生成验证码

**GET** `/api/codes`

为所有账户批量生成验证码。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "codes": [
    {
      "accountId": "550e8400-e29b-41d4-a716-446655440000",
      "code": "123456",
      "remaining": 25,
      "period": 30
    }
  ]
}
```

---

### 云端备份 API

#### 1. 获取 WebDAV 配置

**GET** `/api/webdav/configs`

获取所有 WebDAV 配置。

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "configs": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "name": "我的 Nextcloud",
      "url": "https://nextcloud.example.com/remote.php/dav/files/user/",
      "username": "user",
      "createdAt": 1705334400000
    }
  ]
}
```

**注意：** 响应中不包含密码字段。

#### 2. 添加 WebDAV 配置

**POST** `/api/webdav/configs`

添加新的 WebDAV 配置。

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "name": "我的 Nextcloud",
  "url": "https://nextcloud.example.com/remote.php/dav/files/user/",
  "username": "user",
  "password": "app-password"
}
```

**响应：**
```json
{
  "config": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "我的 Nextcloud",
    "url": "https://nextcloud.example.com/remote.php/dav/files/user/",
    "username": "user",
    "createdAt": 1705334400000
  }
}
```

**状态码：**
- `201` - 创建成功
- `400` - 请求参数错误
- `500` - WebDAV 连接失败

#### 3. 删除 WebDAV 配置

**DELETE** `/api/webdav/configs/:id`

删除指定的 WebDAV 配置。

**URL 参数：**
- `id`: 配置 ID

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "success": true
}
```

#### 4. 创建备份

**POST** `/api/backup/create`

创建云端备份。

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "configId": "660e8400-e29b-41d4-a716-446655440000",
  "password": "backup-password"
}
```

**响应：**
```json
{
  "success": true,
  "path": "/2fa-backup/2024/01/15/backup-1705334400000.encrypted",
  "timestamp": 1705334400000
}
```

**速率限制：** 10 次/小时

#### 5. 恢复备份

**POST** `/api/backup/restore`

从云端恢复备份。

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "configId": "660e8400-e29b-41d4-a716-446655440000",
  "path": "/2fa-backup/2024/01/15/backup-1705334400000.encrypted",
  "password": "backup-password"
}
```

**响应：**
```json
{
  "success": true,
  "count": 10
}
```

**字段说明：**
- `count`: 恢复的账户数量

**注意：** 恢复会覆盖当前所有账户！

#### 6. 列出备份文件

**GET** `/api/backup/list?configId=xxx`

列出指定 WebDAV 配置中的所有备份文件。

**查询参数：**
- `configId`: WebDAV 配置 ID

**请求头：**
```
Authorization: Bearer <token>
```

**响应：**
```json
{
  "backups": [
    {
      "path": "/2fa-backup/2024/01/15/backup-1705334400000.encrypted",
      "name": "backup-1705334400000.encrypted"
    }
  ]
}
```

---

### 导入导出 API

#### 1. 导出数据

**GET** `/api/export?password=xxx`

导出所有账户数据。

**查询参数：**
- `password` (可选): 导出密码，如提供则返回加密文件

**请求头：**
```
Authorization: Bearer <token>
```

**响应（无密码）：**
```json
{
  "version": "1.0",
  "exportTime": 1705334400000,
  "accounts": [...]
}
```

**响应（有密码）：**
返回加密的二进制数据，Content-Type: `application/octet-stream`

#### 2. 导入数据

**POST** `/api/import`

导入账户数据。

**方式 1 - 文件上传：**

**请求头：**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**表单字段：**
- `file`: 文件（.json / .txt / .encrypted）
- `password`: 密码（如果是加密文件）
- `merge`: 是否合并（true/false）

**方式 2 - JSON 数据：**

**请求头：**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体：**
```json
{
  "accounts": [...],
  "merge": false,
  "format": "standard"
}
```

**format 选项：**
- `standard`: 标准格式
- `2fas`: 2FAS Authenticator 格式

**响应：**
```json
{
  "success": true,
  "count": 10,
  "total": 15
}
```

**字段说明：**
- `count`: 导入的账户数
- `total`: 总账户数

---

## 错误响应

所有错误响应格式统一为：

```json
{
  "error": "错误描述"
}
```

### 常见状态码

- `200` - 请求成功
- `201` - 资源创建成功
- `400` - 请求参数错误
- `401` - 未授权（需要登录）
- `404` - 资源不存在
- `429` - 请求过于频繁
- `500` - 服务器内部错误

### 速率限制

不同接口有不同的速率限制：

| 接口 | 限制 | 时间窗口 |
|------|------|----------|
| 登录 | 5 次 | 5 分钟 |
| 添加账户 | 20 次 | 1 分钟 |
| 生成验证码 | 30 次 | 30 秒 |
| 批量生成 | 60 次 | 1 分钟 |
| 创建备份 | 10 次 | 1 小时 |

超过限制会返回 `429` 状态码。

---

## 示例代码

### JavaScript/Fetch

```javascript
// 登录
const loginResponse = await fetch('https://your-worker.workers.dev/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
})
const { token } = await loginResponse.json()

// 获取账户列表
const accountsResponse = await fetch('https://your-worker.workers.dev/api/accounts', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { accounts } = await accountsResponse.json()

// 添加账户
const addResponse = await fetch('https://your-worker.workers.dev/api/accounts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'GitHub',
    secret: 'JBSWY3DPEHPK3PXP'
  })
})
```

### Python/Requests

```python
import requests

# 登录
login_response = requests.post(
    'https://your-worker.workers.dev/api/auth/login',
    json={'username': 'user', 'password': 'pass'}
)
token = login_response.json()['token']

# 获取账户列表
accounts_response = requests.get(
    'https://your-worker.workers.dev/api/accounts',
    headers={'Authorization': f'Bearer {token}'}
)
accounts = accounts_response.json()['accounts']

# 添加账户
add_response = requests.post(
    'https://your-worker.workers.dev/api/accounts',
    headers={'Authorization': f'Bearer {token}'},
    json={
        'name': 'GitHub',
        'secret': 'JBSWY3DPEHPK3PXP'
    }
)
```

### cURL

```bash
# 登录
TOKEN=$(curl -X POST https://your-worker.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}' \
  | jq -r '.token')

# 获取账户列表
curl https://your-worker.workers.dev/api/accounts \
  -H "Authorization: Bearer $TOKEN"

# 添加账户
curl -X POST https://your-worker.workers.dev/api/accounts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub",
    "secret": "JBSWY3DPEHPK3PXP"
  }'
```

---

## 数据格式

### 账户对象

```typescript
interface Account {
  id: string              // UUID
  name: string            // 账户名称
  issuer?: string         // 发行者
  secret: string          // 加密的密钥（仅服务端）
  digits: number          // 验证码位数 (6/8)
  period: number          // 时间周期 (30/60)
  category: string        // 分类
  createdAt: number       // 创建时间（时间戳）
  updatedAt: number       // 更新时间（时间戳）
}
```

### WebDAV 配置对象

```typescript
interface WebDAVConfig {
  id: string              // UUID
  name: string            // 配置名称
  url: string             // WebDAV URL
  username: string        // 用户名
  password: string        // 加密的密码（仅服务端）
  createdAt: number       // 创建时间（时间戳）
}
```

---

## 注意事项

1. **Token 有效期**：JWT Token 默认 2 小时有效期，过期后需要重新登录
2. **密钥加密**：所有密钥在服务端使用 AES-GCM 加密存储
3. **时间同步**：TOTP 依赖准确的系统时间
4. **备份密码**：备份密码丢失后无法恢复数据
5. **速率限制**：注意遵守各接口的速率限制

---

如有其他问题，请提交 Issue。
