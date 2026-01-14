# Twitter 热门内容监控

一个现代化的静态页面，用于展示Twitter上AI编程相关的热门内容。

## ✨ 特性

- 🎨 **现代化设计** - 深色主题，渐变色彩，流畅动画
- 📊 **数据可视化** - 清晰展示点赞数、浏览量等关键指标
- 📱 **响应式布局** - 完美适配桌面和移动设备
- ⚡ **性能优化** - 纯静态页面，加载速度快
- 🔄 **易于更新** - 简单修改数据即可更新内容

## 🚀 快速开始

> [!TIP]
> **DevOps Standards**: For deployment best practices and environment isolation rules, please refer to **[DEVOPS.md](./DEVOPS.md)**.


> [!IMPORTANT]
> **推文预览功能需要通过 HTTP 服务器访问！**
> 
> 由于 Twitter 嵌入式推文的跨域安全限制，直接双击打开 `index.html` 文件将无法显示推文预览。您必须通过本地 HTTP 服务器访问页面。

### 推荐方法：使用本地服务器

```bash
# 使用 Python（推荐）
cd /Users/douba/Projects/Twitter-Hot
python3 -m http.server 8888

# 使用 Node.js
npx http-server -p 8888

# 使用 PHP
php -S localhost:8888
```

然后在浏览器中访问：**http://localhost:8888/index.html**

### 备用方法：仅查看基本信息（无推文预览）

如果只想快速查看内容摘要（不需要推文预览），可以直接双击打开 `index.html` 文件。但推文预览功能将不可用。

## 📝 更新数据

### 手动更新

编辑 `script.js` 文件中的 `contentData` 数组：

```javascript
const contentData = [
    {
        rank: 1,
        author: "用户名",
        description: "推文描述",
        likes: 点赞数,
        views: "浏览量",
        url: "推文链接"
    },
    // 添加更多内容...
];
```

### 使用 Grok 生成数据

1. 在 Twitter/X 上使用 Grok 生成热门内容报告
2. 将生成的数据转换为上述格式
3. 替换 `script.js` 中的数据
4. 刷新页面查看更新

## 🎨 自定义样式

### 修改颜色主题

编辑 `styles.css` 中的 CSS 变量：

```css
:root {
    --bg-primary: #0a0e1a;        /* 主背景色 */
    --accent-primary: #3b82f6;    /* 主题色 */
    --color-likes: #f43f5e;       /* 点赞颜色 */
    --color-views: #06b6d4;       /* 浏览量颜色 */
    /* 更多颜色... */
}
```

### 调整布局

- 修改 `.stats-grid` 的 `grid-template-columns` 调整统计卡片布局
- 修改 `.container` 的 `max-width` 调整页面宽度
- 调整各种 `--spacing-*` 变量改变间距

## 📂 文件结构

```
Twitter-Hot/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 数据和交互逻辑
└── README.md          # 说明文档
```

## 🔧 技术栈

- **HTML5** - 语义化标签，SEO优化
- **CSS3** - 现代布局，动画效果
- **JavaScript (ES6+)** - 数据渲染，交互逻辑
- **Google Fonts** - Inter 字体

## 💡 使用建议

### 定期更新

建议每天或每周更新一次数据，保持内容新鲜度。

### 数据来源

- 使用 Grok AI 分析 Twitter 热门内容
- 使用 Twitter API 获取实时数据
- 手动收集整理热门推文

### 分享方式

- 部署到 GitHub Pages
- 部署到 Vercel/Netlify
- 部署到自己的服务器
- 生成 PDF 分享

## 🌐 部署到 GitHub Pages

1. 创建 GitHub 仓库
2. 上传所有文件
3. 在仓库设置中启用 GitHub Pages
4. 选择 main 分支作为源
5. 访问 `https://你的用户名.github.io/仓库名`

## 📊 数据格式说明

每条内容包含以下字段：

- `rank` - 排名（数字）
- `author` - 作者用户名（字符串）
- `description` - 推文描述（字符串）
- `likes` - 点赞数（数字）
- `views` - 浏览量（字符串，支持 "万+" 格式）
- `url` - 推文链接（字符串）

## 🎯 未来计划

- [ ] 添加数据导入功能（支持 JSON/CSV）
- [ ] 添加搜索和筛选功能
- [ ] 添加图表可视化
- [ ] 支持多日期数据对比
- [ ] 添加数据导出功能
- [ ] 集成 Twitter API 自动抓取

## 📄 许可证

MIT License - 自由使用和修改

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**Made with ❤️ for Twitter/X Content Monitoring**
