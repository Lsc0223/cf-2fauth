# API 端点列表

## 认证 API

| 端点 | 方法 | 说明 | 需要认证 |
|------|------|------|---------|
| `/api/auth/login` | POST | 用户登录 | ❌ |
| `/api/auth/oauth/login` | GET | OAuth 登录 | ❌ |
| `/api/auth/oauth/callback` | GET | OAuth 回调 | ❌ |
| `/api/auth/logout` | POST | 用户登出 | ❌ |

## 账户管理 API

| 端点 | 方法 | 说明 | 需要认证 |
|------|------|------|---------|
| `/api/accounts` | GET | 获取账户列表 | ✅ |
| `/api/accounts` | POST | 添加账户 | ✅ |
| `/api/accounts/:id` | PUT | 更新账户 | ✅ |
| `/api/accounts/:id` | DELETE | 删除账户 | ✅ |
| `/api/accounts/:id/code` | GET | 生成单个验证码 | ✅ |
| `/api/codes` | GET | 批量生成验证码 | ✅ |

## 备份 API

| 端点 | 方法 | 说明 | 需要认证 |
|------|------|------|---------|
| `/api/webdav/configs` | GET | 获取 WebDAV 配置 | ✅ |
| `/api/webdav/configs` | POST | 添加 WebDAV 配置 | ✅ |
| `/api/webdav/configs/:id` | DELETE | 删除 WebDAV 配置 | ✅ |
| `/api/backup/create` | POST | 创建备份 | ✅ |
| `/api/backup/restore` | POST | 恢复备份 | ✅ |
| `/api/backup/list` | GET | 列出备份文件 | ✅ |

## 导入导出 API

| 端点 | 方法 | 说明 | 需要认证 |
|------|------|------|---------|
| `/api/export` | GET | 导出数据 | ✅ |
| `/api/import` | POST | 导入数据 | ✅ |

## 部署管理 API（新增）

| 端点 | 方法 | 说明 | 需要认证 |
|------|------|------|---------|
| `/api/deploy/config` | GET | 获取部署配置 | ✅ |
| `/api/deploy/config` | POST | 保存部署配置 | ✅ |
| `/api/deploy/kv/create` | POST | 创建 KV 命名空间 | ✅ |
| `/api/deploy/worker` | POST | 生成部署配置 | ✅ |
| `/api/deploy/status` | GET | 查询部署状态 | ✅ |

## 认证方式

需要认证的 API 必须在请求头中包含：

```
Authorization: Bearer <JWT_TOKEN>
```

JWT Token 通过登录接口获取，有效期为 2 小时。

## CORS 支持

所有 API 端点都支持 CORS，包含以下响应头：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 错误响应格式

所有错误响应统一格式：

```json
{
  "error": "错误信息",
  "message": "详细错误说明（可选）"
}
```

常见 HTTP 状态码：

- `200` - 成功
- `400` - 请求参数错误
- `401` - 未授权（需要登录）
- `404` - 接口不存在
- `500` - 服务器内部错误
