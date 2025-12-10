# 外链提交 Skill（非博客类型）

使用 AI 和浏览器自动化实现**目录站、论坛等非博客资源**的外链自动提交。

> **📝 博客评论外链请使用 [blog-commenter-skill](../blog-commenter-skill/)** - 它有专门的脚本支持 WordPress、Ghost、Disqus 等博客平台。

## 支持的资源类型

| 类型 | 支持 | 示例 |
|------|-----|------|
| `directory` 目录站 | ✅ | Product Hunt, AlternativeTo, SaaSHub |
| `forum` 论坛 | ✅ | Reddit, Indie Hackers, HackerNews |
| `social` 社交平台 | ✅ | Twitter/X 主页, LinkedIn 等 |
| `other` 其他 | ✅ | 各类杂项资源 |
| `blog` 博客 | ❌ | 请使用 blog-commenter-skill |

## 功能特点

- 🔗 **自动获取** 项目信息和可用外链资源
- 🤖 **AI 驱动** 根据 `howToSubmit` 指令自动填写表单
- 🌐 **浏览器自动化** 通过 chrome-dev-tools MCP 操作
- 📊 **进度追踪** 生成详细的提交报告
- 🆓 **仅免费资源** 自动跳过付费资源

## 安装

### 从 GitHub 安装（推荐）

```bash
# 添加 marketplace
claude plugin marketplace add hekmon8/mybacklinks-tools

# 安装 skill
claude plugin install backlink-submission-skill
```

### 手动安装

```bash
git clone https://github.com/hekmon8/mybacklinks-tools.git
cp -r mybacklinks-tools/packages/opensource/backlink-submission-skill ~/.claude/skills/
```

## 前置要求

此 Skill 需要配置两个 MCP 服务：

### 1. MyBacklinks MCP

```json
{
  "mcpServers": {
    "mybacklinks": {
      "url": "https://mybacklinks.app/mcp"
    }
  }
}
```

### 2. Chrome DevTools MCP

按照你偏好的浏览器自动化 MCP 进行设置。

## 使用方法

通过以下方式触发 Skill：

- "帮我提交目录站外链到 [项目名]"
- "批量提交非博客外链"
- "Submit directory backlinks"
- "自动化论坛外链提交"

## 工作流程

1. **选择项目** - 列出并选择目标项目
2. **获取资源** - 获取可用的免费非博客外链资源
3. **执行提交** - AI 根据 `howToSubmit` 指令使用浏览器自动化提交
4. **记录结果** - 更新 MyBacklinks 中的外链状态

## 技能对比

| 特性 | backlink-submission-skill | blog-commenter-skill |
|-----|--------------------------|---------------------|
| **目标** | 目录站、论坛、社交平台 | 仅博客 |
| **方式** | AI + 浏览器自动化 | 专用脚本 |
| **howToSubmit** | 建议提供以获得最佳效果 | 可选 |
| **平台** | 任意网站 | WordPress, Ghost, Disqus |

## howToSubmit 格式

外链资源中的 `howToSubmit` 字段应使用 Markdown 格式：

```markdown
## 提交方式

1. 访问 https://example.com/submit
2. 使用 Google 登录（或无需登录）
3. 填写表单：
   - **Website Name**: 填写网站名称
   - **URL**: 填写项目网址
   - **Description**: 填写 50-100 字描述
4. 点击 "Submit" 按钮

## 注意事项
- 仅接受英文内容
- 每个账号限提交 3 个网站
```

## 示例

查看 [examples/howto-templates.md](examples/howto-templates.md) 获取常见提交模板。

## 相关项目

- [blog-commenter-skill](../blog-commenter-skill/) - 博客评论外链提交
- [mybacklinks-mcp](../../mybacklinks-mcp/) - MyBacklinks MCP 服务
- [commands](../../commands/) - 统一工作流命令

## 许可证

MIT License - 详见 [LICENSE](LICENSE)
