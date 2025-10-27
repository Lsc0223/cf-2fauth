# 2FA 管理系统 - Windows PowerShell 自动化设置脚本

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🔐 2FA 安全管理系统 - 自动化部署脚本" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Node.js
Write-Host "检查 Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ 未检测到 Node.js，请先安装 Node.js 16+" -ForegroundColor Red
    exit 1
}

# 检查 npm
Write-Host "检查 npm..." -ForegroundColor Yellow
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $npmVersion = npm --version
    Write-Host "✅ npm 版本: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ 未检测到 npm" -ForegroundColor Red
    exit 1
}

# 安装依赖
Write-Host ""
Write-Host "📦 正在安装依赖..." -ForegroundColor Yellow
npm install

# 检查 Wrangler
Write-Host ""
Write-Host "🔍 检查 Wrangler CLI..." -ForegroundColor Yellow
npx wrangler --version

# 登录检查
Write-Host ""
Write-Host "🔐 检查 Cloudflare 登录状态..." -ForegroundColor Yellow
$whoami = npx wrangler whoami 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 已登录 Cloudflare" -ForegroundColor Green
} else {
    Write-Host "⚠️  未登录 Cloudflare，正在打开登录页面..." -ForegroundColor Yellow
    npx wrangler login
}

# 创建 KV 命名空间
Write-Host ""
Write-Host "📦 创建 KV 命名空间..." -ForegroundColor Yellow

Write-Host "正在创建 USERS_KV..." -ForegroundColor Yellow
$usersKvOutput = npx wrangler kv:namespace create "USERS_KV" 2>&1 | Out-String
$usersKvId = [regex]::Match($usersKvOutput, 'id = "([^"]+)"').Groups[1].Value

Write-Host "正在创建 RATE_LIMIT_KV..." -ForegroundColor Yellow
$rateLimitKvOutput = npx wrangler kv:namespace create "RATE_LIMIT_KV" 2>&1 | Out-String
$rateLimitKvId = [regex]::Match($rateLimitKvOutput, 'id = "([^"]+)"').Groups[1].Value

Write-Host ""
Write-Host "✅ KV 命名空间创建成功！" -ForegroundColor Green
Write-Host "   USERS_KV ID: $usersKvId" -ForegroundColor Cyan
Write-Host "   RATE_LIMIT_KV ID: $rateLimitKvId" -ForegroundColor Cyan

# 更新 wrangler.toml
Write-Host ""
Write-Host "📝 更新配置文件..." -ForegroundColor Yellow

$wranglerConfig = @"
name = "2fa-manager"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "USERS_KV"
id = "$usersKvId"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "$rateLimitKvId"
"@

$wranglerConfig | Out-File -FilePath "wrangler.toml" -Encoding UTF8
Write-Host "✅ wrangler.toml 已更新" -ForegroundColor Green

# 生成密钥
Write-Host ""
Write-Host "🔑 生成随机密钥..." -ForegroundColor Yellow

$jwtSecret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
$encryptionKey = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

Write-Host "✅ 密钥已生成" -ForegroundColor Green

# 设置密钥
Write-Host ""
Write-Host "正在设置 JWT_SECRET..." -ForegroundColor Yellow
$jwtSecret | npx wrangler secret put JWT_SECRET

Write-Host "正在设置 ENCRYPTION_KEY..." -ForegroundColor Yellow
$encryptionKey | npx wrangler secret put ENCRYPTION_KEY

Write-Host "✅ 密钥已设置" -ForegroundColor Green

# 创建本地开发配置
Write-Host ""
Write-Host "📝 创建本地开发配置..." -ForegroundColor Yellow

if (-not (Test-Path ".dev.vars")) {
    $devVars = @"
JWT_SECRET=$jwtSecret
ENCRYPTION_KEY=$encryptionKey
"@
    $devVars | Out-File -FilePath ".dev.vars" -Encoding UTF8
    Write-Host "✅ .dev.vars 已创建" -ForegroundColor Green
} else {
    Write-Host "⚠️  .dev.vars 已存在，跳过创建" -ForegroundColor Yellow
}

# 部署
Write-Host ""
Write-Host "🚀 准备部署到 Cloudflare Workers..." -ForegroundColor Yellow
$deploy = Read-Host "是否现在部署？(y/N)"

if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host "正在部署..." -ForegroundColor Yellow
    npx wrangler deploy
    
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✅ 部署成功！" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "你的 2FA 管理系统已部署完成！" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "接下来你可以：" -ForegroundColor Yellow
    Write-Host "  • 访问 Workers 提供的 URL" -ForegroundColor White
    Write-Host "  • 使用任意用户名和密码登录（演示模式）" -ForegroundColor White
    Write-Host "  • 添加你的 2FA 账户" -ForegroundColor White
    Write-Host ""
    Write-Host "有用的命令：" -ForegroundColor Yellow
    Write-Host "  npm run dev      - 本地开发" -ForegroundColor White
    Write-Host "  npm run deploy   - 重新部署" -ForegroundColor White
    Write-Host "  npm run tail     - 查看实时日志" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✅ 配置完成！" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "你可以稍后使用以下命令部署：" -ForegroundColor Yellow
    Write-Host "  npm run deploy" -ForegroundColor White
    Write-Host ""
    Write-Host "或者先在本地测试：" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
}

Write-Host "📖 查看 README.md 获取更多信息" -ForegroundColor Cyan
Write-Host ""
