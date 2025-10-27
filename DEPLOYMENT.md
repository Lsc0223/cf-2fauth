# 部署指南

本文档提供详细的部署步骤和常见部署场景的解决方案。

## 前置要求检查

在开始部署前，请确保：

- [x] 已安装 Node.js 16 或更高版本
- [x] 已安装 npm 或 yarn
- [x] 拥有 Cloudflare 账号
- [x] 已安装 Wrangler CLI

### 验证环境

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 16.0.0

# 检查 npm 版本
npm --version

# 检查 Wrangler
npx wrangler --version
```

## 完整部署流程

### 第一步：准备项目

```bash
# 1. 克隆或下载项目
git clone <repository-url>
cd 2fa-manager

# 2. 安装依赖
npm install

# 3. 登录 Cloudflare
npx wrangler login
```

### 第二步：创建资源

```bash
# 1. 创建 KV 命名空间
npx wrangler kv:namespace create "USERS_KV"
npx wrangler kv:namespace create "RATE_LIMIT_KV"

# 记录输出的 ID，例如：
# { binding = "USERS_KV", id = "abc123..." }
# { binding = "RATE_LIMIT_KV", id = "def456..." }
```

### 第三步：配置项目

编辑 `wrangler.toml` 文件：

```toml
name = "2fa-manager"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "USERS_KV"
id = "你的_USERS_KV_ID"  # 替换为第二步获得的 ID

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "你的_RATE_LIMIT_KV_ID"  # 替换为第二步获得的 ID
```

### 第四步：设置密钥

```bash
# 生成随机密钥
# macOS/Linux:
openssl rand -base64 32

# Windows PowerShell:
# [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# 设置 JWT 密钥
npx wrangler secret put JWT_SECRET
# 粘贴刚才生成的随机字符串

# 设置加密密钥
npx wrangler secret put ENCRYPTION_KEY
# 粘贴另一个随机字符串
```

### 第五步：测试部署

```bash
# 本地测试
npm run dev

# 在浏览器中访问 http://localhost:8787
# 测试登录和基本功能
```

### 第六步：正式部署

```bash
# 部署到 Cloudflare Workers
npm run deploy

# 部署成功后会显示类似信息：
# Published 2fa-manager (X.XX sec)
#   https://2fa-manager.your-subdomain.workers.dev
```

## 自定义域名配置

### 方法一：通过 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. 选择你的域名
3. 进入 Workers Routes
4. 添加路由：
   - Route: `2fa.yourdomain.com/*`
   - Worker: `2fa-manager`

### 方法二：通过 wrangler.toml

编辑 `wrangler.toml` 添加：

```toml
routes = [
  { pattern = "2fa.yourdomain.com", zone_name = "yourdomain.com" }
]
```

然后重新部署：

```bash
npm run deploy
```

### 配置 DNS

在 Cloudflare DNS 中添加记录：

- 类型: `CNAME`
- 名称: `2fa`（或你的子域名）
- 目标: `2fa-manager.your-subdomain.workers.dev`
- 代理状态: 已代理（橙色云朵）

## 环境变量配置

### 本地开发环境

创建 `.dev.vars` 文件：

```bash
cp .dev.vars.example .dev.vars
```

编辑 `.dev.vars`：

```
JWT_SECRET=your_local_jwt_secret
ENCRYPTION_KEY=your_local_encryption_key
```

### 生产环境

使用 Wrangler Secrets：

```bash
# 查看所有密钥
npx wrangler secret list

# 删除密钥（如果需要重新设置）
npx wrangler secret delete JWT_SECRET

# 更新密钥
npx wrangler secret put JWT_SECRET
```

## 多环境部署

### 开发环境

```toml
# wrangler.dev.toml
name = "2fa-manager-dev"
vars = { ENVIRONMENT = "development" }
```

部署：

```bash
npx wrangler deploy --config wrangler.dev.toml
```

### 生产环境

```toml
# wrangler.prod.toml
name = "2fa-manager"
vars = { ENVIRONMENT = "production" }
```

部署：

```bash
npx wrangler deploy --config wrangler.prod.toml
```

## 数据迁移

### 从其他 Workers 迁移

```bash
# 1. 导出旧环境数据
npx wrangler kv:key list --binding=USERS_KV

# 2. 批量导出
npx wrangler kv:key get "user:xxx" --binding=USERS_KV > user_data.json

# 3. 导入到新环境
npx wrangler kv:key put "user:xxx" --binding=USERS_KV --path=user_data.json
```

### 批量迁移脚本

创建 `migrate.js`：

```javascript
// 迁移脚本示例
async function migrate() {
  // 从旧 KV 读取
  const oldData = await OLD_KV.list();
  
  // 写入新 KV
  for (const key of oldData.keys) {
    const value = await OLD_KV.get(key.name);
    await NEW_KV.put(key.name, value);
  }
}
```

## 监控和日志

### 实时日志

```bash
# 查看实时日志
npm run tail

# 或
npx wrangler tail
```

### 查看指标

访问 Cloudflare Dashboard > Workers > 你的 Worker > 指标

可以看到：
- 请求数
- 错误率
- CPU 时间
- KV 操作数

## 备份策略

### 定期备份 KV 数据

```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d)
npx wrangler kv:key list --binding=USERS_KV > backup_users_$DATE.json
npx wrangler kv:key list --binding=RATE_LIMIT_KV > backup_rate_$DATE.json
```

### 自动备份

使用 GitHub Actions：

```yaml
# .github/workflows/backup.yml
name: Backup KV Data
on:
  schedule:
    - cron: '0 0 * * 0'  # 每周日午夜
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backup KV
        run: |
          npx wrangler kv:key list --binding=USERS_KV > backup.json
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: kv-backup
          path: backup.json
```

## 故障排除

### 问题：部署失败 - "Authentication error"

**解决方案：**

```bash
# 重新登录
npx wrangler logout
npx wrangler login
```

### 问题：KV 命名空间未找到

**解决方案：**

```bash
# 确认 KV 命名空间 ID
npx wrangler kv:namespace list

# 更新 wrangler.toml 中的 ID
```

### 问题：密钥设置失败

**解决方案：**

```bash
# 确保已登录
npx wrangler whoami

# 确保 Worker 名称正确
# 在 wrangler.toml 中检查 name 字段

# 重新设置密钥
npx wrangler secret put JWT_SECRET
```

### 问题：403 Forbidden

**原因：** Cloudflare 账号权限不足

**解决方案：**
1. 确认账号已验证邮箱
2. 检查账号是否有 Workers 权限
3. 确认是否在正确的账号下操作

### 问题：Worker 超出 CPU 限制

**解决方案：**
1. 优化加密算法（减少 PBKDF2 迭代次数）
2. 使用 Durable Objects（付费功能）
3. 减少单次请求处理的数据量

### 问题：KV 写入失败

**解决方案：**
1. 检查 KV 配额（免费版有限制）
2. 减少写入频率
3. 考虑升级到付费计划

## 性能优化

### 1. 启用压缩

在 `wrangler.toml` 中：

```toml
[build]
command = ""

[miniflare]
kv_persist = true
```

### 2. 缓存策略

```javascript
// 在 Worker 中添加缓存
const cache = caches.default;
const cacheKey = new Request(url.toString(), request);
const cachedResponse = await cache.match(cacheKey);

if (cachedResponse) {
  return cachedResponse;
}
```

### 3. 减少 KV 读取

```javascript
// 批量获取而不是多次单独获取
const keys = ['key1', 'key2', 'key3'];
const values = await Promise.all(
  keys.map(key => KV.get(key))
);
```

## 安全加固

### 1. 启用 Cloudflare Access

```bash
# 通过 Dashboard 配置
# Workers > 你的 Worker > Settings > Access Policy
```

### 2. IP 白名单

```javascript
// 在 Worker 中添加
const allowedIPs = ['1.2.3.4', '5.6.7.8'];
const clientIP = request.headers.get('CF-Connecting-IP');

if (!allowedIPs.includes(clientIP)) {
  return new Response('Forbidden', { status: 403 });
}
```

### 3. 速率限制调整

根据实际使用情况调整速率限制参数。

## 成本估算

### 免费计划限制
- 请求数: 100,000/天
- CPU 时间: 10ms/请求
- KV 读取: 100,000/天
- KV 写入: 1,000/天
- KV 存储: 1GB

### 预估使用量
- 个人使用: 完全免费
- 小团队(10人): 完全免费
- 中等规模(100人): 可能需要付费计划

## 更新和维护

### 更新 Worker

```bash
# 拉取最新代码
git pull

# 安装依赖
npm install

# 部署
npm run deploy
```

### 回滚版本

```bash
# 查看版本历史
npx wrangler deployments list

# 回滚到特定版本
npx wrangler rollback [deployment-id]
```

## 支持资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [KV 存储文档](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [项目 GitHub Issues](https://github.com/your-repo/issues)

---

如有其他问题，请查看 README.md 或提交 Issue。
