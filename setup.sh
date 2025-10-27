#!/bin/bash

# 2FA 管理系统 - 自动化设置脚本

set -e

echo "================================================"
echo "  🔐 2FA 安全管理系统 - 自动化部署脚本"
echo "================================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 16+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

# 安装依赖
echo ""
echo "📦 正在安装依赖..."
npm install

# 检查 Wrangler
echo ""
echo "🔍 检查 Wrangler CLI..."
npx wrangler --version

# 登录检查
echo ""
echo "🔐 检查 Cloudflare 登录状态..."
if npx wrangler whoami &> /dev/null; then
    echo "✅ 已登录 Cloudflare"
else
    echo "⚠️  未登录 Cloudflare，正在打开登录页面..."
    npx wrangler login
fi

# 创建 KV 命名空间
echo ""
echo "📦 创建 KV 命名空间..."
echo ""
echo "正在创建 USERS_KV..."
USERS_KV_OUTPUT=$(npx wrangler kv:namespace create "USERS_KV")
USERS_KV_ID=$(echo "$USERS_KV_OUTPUT" | grep -oP 'id = "\K[^"]+')

echo "正在创建 RATE_LIMIT_KV..."
RATE_LIMIT_KV_OUTPUT=$(npx wrangler kv:namespace create "RATE_LIMIT_KV")
RATE_LIMIT_KV_ID=$(echo "$RATE_LIMIT_KV_OUTPUT" | grep -oP 'id = "\K[^"]+')

echo ""
echo "✅ KV 命名空间创建成功！"
echo "   USERS_KV ID: $USERS_KV_ID"
echo "   RATE_LIMIT_KV ID: $RATE_LIMIT_KV_ID"

# 更新 wrangler.toml
echo ""
echo "📝 更新配置文件..."

cat > wrangler.toml << EOF
name = "2fa-manager"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "USERS_KV"
id = "$USERS_KV_ID"

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "$RATE_LIMIT_KV_ID"
EOF

echo "✅ wrangler.toml 已更新"

# 生成密钥
echo ""
echo "🔑 生成随机密钥..."

if command -v openssl &> /dev/null; then
    JWT_SECRET=$(openssl rand -base64 32)
    ENCRYPTION_KEY=$(openssl rand -base64 32)
    
    echo "✅ 密钥已生成"
    
    # 设置密钥
    echo ""
    echo "正在设置 JWT_SECRET..."
    echo "$JWT_SECRET" | npx wrangler secret put JWT_SECRET
    
    echo "正在设置 ENCRYPTION_KEY..."
    echo "$ENCRYPTION_KEY" | npx wrangler secret put ENCRYPTION_KEY
    
    echo "✅ 密钥已设置"
else
    echo "⚠️  未检测到 openssl，请手动设置密钥："
    echo ""
    echo "npx wrangler secret put JWT_SECRET"
    echo "npx wrangler secret put ENCRYPTION_KEY"
    echo ""
    echo "你可以使用任何强随机字符串作为密钥"
fi

# 创建本地开发配置
echo ""
echo "📝 创建本地开发配置..."

if [ ! -f .dev.vars ]; then
    cat > .dev.vars << EOF
JWT_SECRET=${JWT_SECRET:-your_local_jwt_secret}
ENCRYPTION_KEY=${ENCRYPTION_KEY:-your_local_encryption_key}
EOF
    echo "✅ .dev.vars 已创建"
else
    echo "⚠️  .dev.vars 已存在，跳过创建"
fi

# 部署
echo ""
echo "🚀 准备部署到 Cloudflare Workers..."
read -p "是否现在部署？(y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在部署..."
    npx wrangler deploy
    
    echo ""
    echo "================================================"
    echo "  ✅ 部署成功！"
    echo "================================================"
    echo ""
    echo "你的 2FA 管理系统已部署完成！"
    echo ""
    echo "接下来你可以："
    echo "  • 访问 Workers 提供的 URL"
    echo "  • 使用任意用户名和密码登录（演示模式）"
    echo "  • 添加你的 2FA 账户"
    echo ""
    echo "有用的命令："
    echo "  npm run dev      - 本地开发"
    echo "  npm run deploy   - 重新部署"
    echo "  npm run tail     - 查看实时日志"
    echo ""
else
    echo ""
    echo "================================================"
    echo "  ✅ 配置完成！"
    echo "================================================"
    echo ""
    echo "你可以稍后使用以下命令部署："
    echo "  npm run deploy"
    echo ""
    echo "或者先在本地测试："
    echo "  npm run dev"
    echo ""
fi

echo "📖 查看 README.md 获取更多信息"
echo ""
