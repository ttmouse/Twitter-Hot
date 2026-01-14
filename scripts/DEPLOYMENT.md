# Twitter-Hot 部署指南

快速部署 Twitter 热门内容监控应用到服务器和 Vercel。

## 🚀 快速开始

### 1. 部署前检查

```bash
./check_deploy.sh
```

### 2. 选择部署方式

#### 方式 A：一键部署（服务器 + Vercel）
```bash
./full_deploy.exp
```

#### 方式 B：仅部署到服务器
```bash
./deploy_server.sh
```

#### 方式 C：仅部署到 Vercel
```bash
./deploy_vercel.sh
```

## 📋 配置文件

### 必需配置

1. **deploy_secrets.exp** - 服务器信息
```bash
cp deploy_secrets.example.exp deploy_secrets.exp
nano deploy_secrets.exp  # 填入服务器 IP、用户名、密码
```

2. **.env** - 数据库配置
```bash
# 已存在，确认配置正确
nano .env
```

## 📚 详细文档

- **快速部署指南**: 查看 `quick_deploy_guide.md`
- **完整部署方案**: 查看 `deployment_plan.md`

## ✅ 验证部署

### 服务器
```bash
# 访问
http://YOUR_SERVER_IP/

# 检查状态
ssh root@YOUR_SERVER_IP "cd /root/twitter-hot && docker compose ps"
```

### Vercel
```bash
# 访问
https://your-project.vercel.app/
```

## 🔧 常用命令

```bash
# 查看日志
ssh root@YOUR_SERVER_IP "cd /root/twitter-hot && docker compose logs -f"

# 重启服务
ssh root@YOUR_SERVER_IP "cd /root/twitter-hot && docker compose restart"

# 备份数据库
ssh root@YOUR_SERVER_IP "cd /root/twitter-hot && docker compose exec db pg_dump -U twitter_user twitter_hot > backup.sql"
```

## 📞 问题排查

如遇问题，请查看：
1. 运行 `./check_deploy.sh` 检查配置
2. 查看 `quick_deploy_guide.md` 中的常见问题部分
3. 检查服务器日志

---

**部署脚本说明：**
- `check_deploy.sh` - 部署前检查
- `setup_remote.sh` - 服务器环境准备
- `deploy_server.sh` - 服务器部署
- `deploy_vercel.sh` - Vercel 部署
- `full_deploy.exp` - 一键全自动部署
