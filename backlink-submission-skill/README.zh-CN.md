# 外链提交 Skill

使用 MyBacklinks MCP 和浏览器自动化实现外链自动提交。

## 功能特点

- 🔗 **自动获取** 项目信息和可用外链资源
- 🤖 **AI 驱动** 根据 `howToSubmit` 指令自动填写表单
- 🌐 **浏览器自动化** 通过 chrome-dev-tools MCP 操作
- 📊 **进度追踪** 生成详细的提交报告
- 🆓 **仅免费资源** 自动跳过付费资源

## 安装

### 从 Marketplace 安装

```bash
# 先添加 marketplace（仅需一次）
claude plugin marketplace add mybacklinks https://raw.githubusercontent.com/hekmon8/mybacklinks-tools/main/packages/opensource/marketplace.json

# 安装 skill
claude plugin install backlink-submission-skill@mybacklinks
```

### 手动安装

克隆仓库并复制到 skills 目录：

```bash
git clone https://github.com/hekmon8/mybacklinks-tools.git
cp -r mybacklinks-tools/backlink-submission-skill ~/.claude/skills/
```

### 验证安装

```bash
claude plugin validate ~/.claude/skills/backlink-submission-skill
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

- "帮我提交外链到 [项目名]"
- "批量提交外链"
- "Submit backlinks"
- "自动化外链提交"

## 工作流程

1. **选择项目** - 列出并选择目标项目
2. **获取资源** - 获取可用的免费外链资源
3. **执行提交** - 根据 `howToSubmit` 指令逐个提交
4. **记录结果** - 更新 MyBacklinks 中的外链状态

## howToSubmit 格式

外链资源中的 `howToSubmit` 字段应使用 Markdown 格式：

```markdown
## 提交方式

1. 访问 https://example.com/submit
2. 无需登录
3. 填写表单：
   - **Website Name**: 填写网站名称
   - **URL**: 填写项目网址
   - **Description**: 填写描述
4. 点击 "Submit" 按钮

## 注意事项
- 限制条件说明
```

## 示例

查看 [examples/howto-templates.md](examples/howto-templates.md) 获取常见提交模板。

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 相关项目

- [MyBacklinks](https://mybacklinks.app) - 外链管理平台
- [MyBacklinks MCP](../mybacklinks-mcp/) - MyBacklinks MCP 服务

