# UI 部署功能说明

## 概述

本功能允许用户通过 Web 用户界面配置和管理 Cloudflare Workers 部署，降低技术门槛，简化部署流程。

## 功能特性

### 1. 配置管理

- **保存配置**: 存储 Cloudflare Account ID 和 API Token
- **加载配置**: 自动读取已保存的配置信息
- **更新配置**: 支持随时修改配置参数

### 2. KV 命名空间管理

- **创建命名空间**: 直接调用 Cloudflare API 创建 KV 命名空间
- **复制 ID**: 一键复制命名空间 ID
- **引导提示**: 清晰说明需要创建的命名空间及其用途

### 3. 部署向导

- **配置验证**: 自动检查必要参数是否完整
- **生成配置**: 自动生成 wrangler.toml 配置内容
- **部署指导**: 提供详细的命令行操作说明

### 4. 交互式指南

- **分步说明**: 4 个标签页分别对应不同阶段
- **获取凭据**: 详细说明如何获取 Cloudflare 凭据
- **创建资源**: 引导创建必要的云资源
- **最佳实践**: 提供安全和运维建议

## 技术实现

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/deploy/config` | GET | 获取部署配置 |
| `/api/deploy/config` | POST | 保存部署配置 |
| `/api/deploy/kv/create` | POST | 创建 KV 命名空间 |
| `/api/deploy/worker` | POST | 生成部署配置 |
| `/api/deploy/status` | GET | 查询部署状态 |

### 数据存储

配置信息存储在 KV 中，格式如下：

```json
{
  "accountId": "cloudflare_account_id",
  "apiToken": "cloudflare_api_token",
  "workerName": "worker_name",
  "kvNamespaceUsers": "kv_namespace_id_1",
  "kvNamespaceRateLimit": "kv_namespace_id_2",
  "updatedAt": 1234567890000
}
```

### Cloudflare API 调用

使用 Cloudflare REST API v4：

- **创建 KV 命名空间**: `POST /accounts/{account_id}/storage/kv/namespaces`
- **查询 Worker**: `GET /accounts/{account_id}/workers/services/{worker_name}`

## 使用流程

1. **登录应用** → 点击"🚀 部署"按钮
2. **配置账户** → 填写 Cloudflare 凭据
3. **创建 KV** → 使用 UI 创建命名空间
4. **生成配置** → 获取 wrangler.toml 配置
5. **本地部署** → 运行 `wrangler deploy`

## 安全考虑

- API Token 使用 password 输入框，避免明文显示
- 配置存储在 KV 中，仅当前用户可访问
- 建议使用最小权限原则创建 API Token
- 提供 Token 安全管理的最佳实践建议

## 限制说明

由于浏览器安全限制：

- 无法直接上传 Worker 脚本
- 无法执行完整的部署操作
- 仍需使用 wrangler CLI 完成最终部署

UI 主要用于：
- 简化配置过程
- 管理云资源（KV 命名空间）
- 提供部署指导
- 降低学习曲线

## 未来增强

可能的改进方向：

1. **部署历史**: 记录每次部署的时间和版本
2. **环境管理**: 支持 dev/staging/prod 环境
3. **一键回滚**: 快速回滚到之前的版本
4. **监控面板**: 显示 Worker 运行状态和指标
5. **日志查看**: 在 UI 中查看 Worker 日志
6. **密钥管理**: UI 中设置环境变量和密钥

## 相关文档

- [完整部署指南](../DEPLOYMENT_VIA_UI.md)
- [API 文档](../README.md#api-文档)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
