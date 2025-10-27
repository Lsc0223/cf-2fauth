# 贡献指南

感谢你考虑为 2FA 安全管理系统做出贡献！

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议：

1. 在 Issues 中搜索，确保问题尚未被报告
2. 如果没有，创建一个新 Issue
3. 使用清晰的标题和详细的描述
4. 提供复现步骤（如果是 bug）
5. 说明你的环境信息

**Bug 报告模板：**

```markdown
### 问题描述
简要描述问题

### 复现步骤
1. 第一步
2. 第二步
3. ...

### 期望行为
应该发生什么

### 实际行为
实际发生了什么

### 环境信息
- 浏览器：Chrome 120
- 操作系统：macOS 14
- Worker 版本：1.0.0
```

### 提交代码

1. **Fork 项目**
   ```bash
   # 点击 GitHub 上的 Fork 按钮
   ```

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/your-username/2fa-manager.git
   cd 2fa-manager
   ```

3. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

4. **进行更改**
   - 遵循代码风格
   - 添加必要的注释
   - 更新相关文档

5. **测试你的更改**
   ```bash
   npm run dev
   # 测试所有功能
   ```

6. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   # 或
   git commit -m "fix: 修复某个 bug"
   ```

7. **推送到 GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建 Pull Request**
   - 访问你的 Fork 页面
   - 点击 "New Pull Request"
   - 填写详细的 PR 描述

## 提交信息规范

使用语义化提交信息：

- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式（不影响功能）
- `refactor:` - 重构（既不是新功能也不是 bug 修复）
- `perf:` - 性能优化
- `test:` - 添加测试
- `chore:` - 构建过程或辅助工具的变动

**示例：**
```
feat: 添加二维码扫描功能
fix: 修复验证码显示错误
docs: 更新部署文档
style: 格式化代码
refactor: 重构加密模块
perf: 优化 TOTP 生成性能
```

## 代码风格

### JavaScript

- 使用 ES6+ 语法
- 使用 2 空格缩进
- 使用单引号
- 行尾不加分号（除非必要）
- 函数和变量使用驼峰命名
- 常量使用大写下划线

**示例：**
```javascript
// ✅ 好
async function generateCode(secret) {
  const timestamp = Date.now()
  return await computeTOTP(secret, timestamp)
}

// ❌ 不好
async function generate_code(Secret) {
    let timestamp=Date.now();
    return await computeTOTP(Secret,timestamp);
}
```

### HTML/CSS

- HTML 使用 2 空格缩进
- CSS 使用 CSS 变量
- 使用语义化的类名
- 响应式设计优先

### 注释

- 复杂逻辑添加注释
- 公共 API 添加 JSDoc
- 避免显而易见的注释

**示例：**
```javascript
/**
 * 生成 TOTP 验证码
 * @param {string} secret - Base32 编码的密钥
 * @param {number} timestamp - 时间戳（可选）
 * @param {number} digits - 验证码位数（默认 6）
 * @returns {Promise<string>} TOTP 验证码
 */
async function generateTOTP(secret, timestamp = Date.now(), digits = 6) {
  // 计算时间计数器
  const counter = Math.floor(timestamp / 1000 / 30)
  
  // ... 实现
}
```

## 开发设置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置本地环境

```bash
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars 填入测试密钥
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 测试

```bash
# 在浏览器中测试所有功能
# 确保没有控制台错误
```

## 功能开发指南

### 添加新 API 端点

1. 在 `src/api/` 中创建或修改文件
2. 导出处理函数
3. 在 `src/index.js` 中注册路由
4. 添加速率限制（如需要）
5. 更新文档

**示例：**
```javascript
// src/api/feature.js
export async function handleNewFeature(request, env, user) {
  // 速率限制
  const rateLimit = await checkRateLimit(
    env.RATE_LIMIT_KV, 
    `feature:${user.userId}`, 
    10, 
    60
  )
  
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: '请求过于频繁' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // 实现功能
  // ...
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

// src/index.js
import { handleNewFeature } from './api/feature.js'

// 在路由中添加
if (path === '/api/feature' && method === 'POST') {
  response = await handleNewFeature(request, env, user)
}
```

### 添加前端功能

1. 在 `src/ui/index.js` 的 `<script>` 部分添加函数
2. 在适当位置添加 UI 元素
3. 添加事件处理
4. 确保响应式设计
5. 添加错误处理

### 添加工具函数

1. 在 `src/utils/` 中创建或修改文件
2. 添加详细的注释和类型说明
3. 考虑错误情况
4. 导出函数

## 测试清单

提交 PR 前请确保：

- [ ] 代码符合风格规范
- [ ] 所有功能正常工作
- [ ] 没有控制台错误或警告
- [ ] 响应式设计正常
- [ ] 更新了相关文档
- [ ] 提交信息符合规范
- [ ] 没有硬编码的密钥或敏感信息
- [ ] 代码可以成功部署

## 文档更新

如果你的更改影响到：

- 用户使用方式 → 更新 `README.md`
- 部署流程 → 更新 `DEPLOYMENT.md`
- API 接口 → 更新 API 文档部分
- 安全特性 → 更新 `SECURITY.md`

## Pull Request 流程

1. **创建 PR**
   - 使用清晰的标题
   - 填写详细的描述
   - 关联相关 Issue

2. **等待审查**
   - 维护者会审查你的代码
   - 可能会要求修改

3. **处理反馈**
   - 及时响应评论
   - 进行必要的修改
   - 推送更新

4. **合并**
   - 审查通过后会被合并
   - 你的贡献会出现在更新日志中

## 行为准则

- 尊重所有贡献者
- 保持专业和友好
- 接受建设性批评
- 关注项目最佳利益

## 获得帮助

如有疑问：

1. 查看现有文档
2. 搜索已关闭的 Issues
3. 在 Discussions 中提问
4. 创建新 Issue

## 致谢

所有贡献者都会在项目中得到认可。感谢你的贡献！

## 许可证

提交代码即表示你同意按照项目的 MIT 许可证授权你的贡献。
