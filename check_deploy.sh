#!/bin/bash
# Pre-deployment checklist script
set -e

echo "=== Twitter-Hot 部署前检查 ==="
echo ""

ERRORS=0
WARNINGS=0

# Check 1: deploy_secrets.exp
echo "✓ 检查 deploy_secrets.exp..."
if [ ! -f "deploy_secrets.exp" ]; then
    echo "  ❌ deploy_secrets.exp 不存在"
    echo "     请运行: cp deploy_secrets.example.exp deploy_secrets.exp"
    echo "     然后编辑文件填入服务器信息"
    ERRORS=$((ERRORS + 1))
else
    # Check if it's still the example file
    if grep -q "YOUR_SERVER_IP" deploy_secrets.exp; then
        echo "  ⚠️  deploy_secrets.exp 仍包含示例值"
        echo "     请编辑文件填入真实的服务器信息"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "  ✅ deploy_secrets.exp 已配置"
    fi
fi

# Check 2: .env file
echo "✓ 检查 .env..."
if [ ! -f ".env" ]; then
    echo "  ❌ .env 不存在"
    echo "     请创建 .env 文件并配置数据库信息"
    ERRORS=$((ERRORS + 1))
else
    # Check for required variables
    if ! grep -q "POSTGRES_USER" .env || ! grep -q "POSTGRES_PASSWORD" .env; then
        echo "  ⚠️  .env 缺少必要的数据库配置"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "  ✅ .env 已配置"
    fi
fi

# Check 3: Docker files
echo "✓ 检查 Docker 配置..."
if [ ! -f "Dockerfile" ]; then
    echo "  ❌ Dockerfile 不存在"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ Dockerfile 存在"
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "  ❌ docker-compose.yml 不存在"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ docker-compose.yml 存在"
fi

# Check 4: Vercel configuration
echo "✓ 检查 Vercel 配置..."
if [ ! -f "vercel.json" ]; then
    echo "  ⚠️  vercel.json 不存在（如果不使用 Vercel 可忽略）"
    WARNINGS=$((WARNINGS + 1))
else
    echo "  ✅ vercel.json 存在"
fi

# Check 5: Required scripts
echo "✓ 检查部署脚本..."
MISSING_SCRIPTS=0
for script in setup_remote.sh deploy_server.sh deploy_vercel.sh full_deploy.exp; do
    if [ ! -f "$script" ]; then
        echo "  ⚠️  $script 不存在"
        MISSING_SCRIPTS=$((MISSING_SCRIPTS + 1))
    fi
done

if [ $MISSING_SCRIPTS -eq 0 ]; then
    echo "  ✅ 所有部署脚本存在"
else
    echo "  ⚠️  缺少 $MISSING_SCRIPTS 个部署脚本"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 6: Server files
echo "✓ 检查服务器文件..."
if [ ! -d "server" ]; then
    echo "  ❌ server 目录不存在"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ server 目录存在"
fi

if [ ! -f "server.py" ]; then
    echo "  ❌ server.py 不存在"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ server.py 存在"
fi

# Check 7: Frontend files
echo "✓ 检查前端文件..."
if [ ! -f "index.html" ]; then
    echo "  ❌ index.html 不存在"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ index.html 存在"
fi

# Check 8: SSH connectivity (optional)
echo "✓ 检查服务器连接..."
if [ -f "deploy_secrets.exp" ] && ! grep -q "YOUR_SERVER_IP" deploy_secrets.exp; then
    SERVER_IP=$(grep "set host" deploy_secrets.exp | cut -d'"' -f2)
    SERVER_USER=$(grep "set user" deploy_secrets.exp | cut -d'"' -f2)
    
    if timeout 5 ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "echo 'Connection test'" &>/dev/null; then
        echo "  ✅ 可以连接到服务器 $SERVER_IP"
    else
        echo "  ⚠️  无法连接到服务器 $SERVER_IP"
        echo "     请检查服务器 IP、SSH 凭证和网络连接"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ⏭️  跳过（服务器信息未配置）"
fi

# Summary
echo ""
echo "=== 检查完成 ==="
echo "错误: $ERRORS"
echo "警告: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ 发现 $ERRORS 个错误，请修复后再部署"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  发现 $WARNINGS 个警告，建议检查后再部署"
    echo ""
    read -p "是否继续部署？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消部署"
        exit 1
    fi
else
    echo "✅ 所有检查通过，可以开始部署！"
    echo ""
    echo "部署选项："
    echo "  1. 一键部署（服务器 + Vercel）: ./full_deploy.exp"
    echo "  2. 仅部署到服务器: ./deploy_server.sh"
    echo "  3. 仅部署到 Vercel: ./deploy_vercel.sh"
fi
