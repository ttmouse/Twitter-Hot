# 🛡️ DevOps 最佳实践守则 (Project Standard)

这份文档沉淀了 Twitter-Hot 项目在部署过程中踩坑总结出的**非功能性规范**。任何接手本项目的开发者（或 AI 助手）都必须遵守以下原则。

## 1. 核心铁律：环境隔离 (Environment Isolation)

> **原则**：开发环境的配置（Localhost）永远不应出现在生产环境。

*   **🚫 禁止操作**：禁止将本地 `.env` 文件提交到 Git 或通过脚本 rsync 到服务器。
*   **✅ 标准做法**：
    *   **本地开发**：使用 `.env` (被 `.gitignore` 忽略)。
    *   **生产环境**：在服务器首次部署时手动生成独立的 `.env`，或使用 CI/CD 的 Secret 注入。

## 2. 部署脚本规范 (Deployment Script Standard)

所有部署脚本（Shell/Python/Expect）必须包含**"滤网"**机制。

### rsync 标准命令模板
```bash
# 必须显式排除敏感配置和环境特定文件
rsync -avz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \   <-- 关键！绝对不能漏
  --exclude='venv' \
  --exclude='__pycache__' \
  . user@host:/remote/dir/
```

## 3. 防御性编程：启动自检 (Fail-Fast)

应用启动时**必须**校验环境配置，而不是等到运行时报错。

**Python 示例 (`config.py`)**:
```python
import os
import sys

def validate_config():
    env = os.getenv('APP_ENV', 'production')
    db_url = os.getenv('DATABASE_URL', '')
    
    # 生产环境严禁使用 localhost
    if env == 'production' and 'localhost' in db_url:
        print("🛑 致命错误：检测到生产环境配置了 localhost 数据库地址！")
        print("请检查服务器 .env 文件是否被本地配置覆盖。")
        sys.exit(1) # 立即停止，不要带病运行

validate_config()
```

## 4. 架构职责分离 (Separation of Concerns)

*   **跨域 (CORS)**：
    *   **推荐**：由后端应用层统一控制（灵活性高）。
    *   **禁止**：Nginx 和 后端同时设置 CORS（会导致浏览器报错）。
    *   **规范**：如果 Nginx 负责反向代理，请在配置中显式注释 `# CORS handled by backend application`。

## 5. 知识传递 (Knowledge Transfer)

如何让新来的 AI 或开发者知道这些？
1.  **项目根目录保留此文件**：命名为 `DevOps_Standards.md` 或 `CONTRIBUTING.md`。
2.  **Prompt 提示**：作为 User Rule 或 Context 投喂给 AI。
    *   *"在部署本项目前，请先阅读 `DevOps_Standards.md`，特别是关于环境变量隔离的章节。"*

---
**版本**: 1.0
**生效日期**: 2026-01-14
**适用范围**: 所有基于 Docker/Nginx/Python 的 Web 项目
