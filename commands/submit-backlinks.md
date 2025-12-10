# Submit Backlinks Workflow

自动外链提交工作流，AI 根据资源类型智能选择合适的技能执行提交。

## Usage

```
/submit-backlinks <domain> [type]
```

**Parameters:**
- `domain` (required): 项目域名 (e.g., `aimcp.info`, `lovemoney.app`)
- `type` (optional): 资源类型过滤 (`blog`, `directory`, `forum`, `social`, `all`). Default: `all`

**Examples:**
```
/submit-backlinks aimcp.info
/submit-backlinks lovemoney.app blog
/submit-backlinks myproject.com directory
```

## 技能分工

| 资源类型 | 推荐技能 | 说明 |
|---------|---------|------|
| `blog` | **blog-commenter-skill** | 脚本自动化，支持 WordPress/Ghost/Disqus 等 |
| `directory` | **backlink-submission-skill** | AI + 浏览器自动化 |
| `forum` | **backlink-submission-skill** | AI + 浏览器自动化 |
| `social` | **backlink-submission-skill** | AI + 浏览器自动化 |
| `other` | **backlink-submission-skill** | AI + 浏览器自动化 |

---

## Workflow

### Step 1: 获取项目信息

调用 MCP `getProjectDetail`:
```
获取域名 {domain} 的项目详情
```

记录：projectId, name, description

### Step 2: 发现外链机会

调用 MCP `discoverBacklinkOpportunities`:
```
发现 {domain} 的外链机会，类型过滤: {type}
```

### Step 3: 按类型分组处理

将外链机会按 `type` 分组：
- **Blog 类型** → 使用 blog-commenter-skill
- **非 Blog 类型** → 使用 backlink-submission-skill

---

## Blog 类型处理 (blog-commenter-skill)

> 使用专门的博客评论脚本，支持表单检测和自动填写

### 执行脚本

```bash
cd packages/opensource/skills/blog-commenter-skill

node submit-backlink.js \
  --url "{submissionUrl}" \
  --project "{projectName}" \
  --domain "{projectDomain}" \
  --description "{projectDescription}" \
  --email "cc@{projectDomain}" \
  --password "12345678" \
  --submit \
  --output /tmp/result-{resourceDomain}.json
```

### 脚本参数

| 参数 | 必须 | 默认值 | 说明 |
|-----|------|-------|------|
| `--url` | ✅ | - | 博客文章 URL |
| `--project` | ✅ | - | 项目名称 |
| `--domain` | ✅ | - | 项目域名 |
| `--description` | ❌ | - | 项目描述 |
| `--email` | ❌ | `cc@{domain}` | 评论者邮箱 |
| `--password` | ❌ | `12345678` | 登录密码 |
| `--submit` | ❌ | false | 实际提交（不加则为测试模式） |
| `--output` | ❌ | - | 保存结果到 JSON 文件 |

### 支持平台

| 平台 | 支持度 | 登录要求 |
|-----|--------|---------|
| WordPress | ✅ 完全支持 | 通常无需登录 |
| Ghost | ✅ 完全支持 | 视主题而定 |
| Custom PHP | ✅ 完全支持 | 视站点而定 |
| Disqus | ⚠️ 部分支持 | 需要 OAuth/Email 登录 |
| Dev.to | ⚠️ 部分支持 | 需要 OAuth |
| Medium | ⚠️ 部分支持 | 需要 OAuth |

### 处理逻辑

1. **无 howToSubmit 说明** → 直接执行脚本
2. **有 howToSubmit 说明** → 阅读说明判断是否可用脚本
   - 可用 → 执行脚本
   - 有特殊要求 → 切换到 backlink-submission-skill 处理

---

## 非 Blog 类型处理 (backlink-submission-skill)

> 使用 AI + chrome-devtools 浏览器自动化，根据 howToSubmit 指令执行提交

### 加载技能

```bash
openskills read chrome-devtools
```

### 执行流程

#### 1. 获取资源详情

调用 MCP `getBacklinkResourceDetail`:
```
获取资源 {resourceId} 的详情
```

关键字段：
- `domain`: 资源域名
- `type`: directory, forum, social, other
- `submissionUrl`: 提交 URL
- `howToSubmit`: 提交说明（Markdown 格式）

#### 2. 解析 howToSubmit

阅读资源的 `howToSubmit` 字段，理解提交步骤：

```markdown
## 提交方式

1. 访问 https://example.com/submit
2. 无需登录 / 使用 Google 登录
3. 填写表单：
   - **Website Name**: 填写网站名称
   - **URL**: 填写项目网址
   - **Description**: 填写 50-100 字英文描述
   - **Category**: 选择 "Tools" 或 "SaaS"
4. 点击 "Submit" 按钮
5. 等待邮件确认（通常 1-3 天）

## 注意事项
- 不接受中文内容
- 每个账号限提交 3 个网站
```

#### 3. 浏览器自动化执行

使用 chrome-devtools 执行：

1. **导航** → 打开 submissionUrl
2. **截图** → 保存页面初始状态
3. **登录处理**：
   - 优先使用 Google OAuth（如已登录）
   - 或使用 `cc@{domain}` / `12345678` 登录
   - 登录失败则跳过，标记为 `login_required`
4. **填写表单** → 按 howToSubmit 指令填写
5. **提交** → 点击提交按钮
6. **验证** → 检查提交结果
7. **截图** → 保存提交后状态

#### 4. 更新 howToSubmit（首次提交成功后）

如果是首次成功提交或发现更好的流程，调用 MCP `updateBacklinkResource`:

```
更新资源 {resourceId}:
- howToSubmit: |
  ## 如何在 {resourceDomain} 提交

  1. 访问 {submissionUrl}
  2. {登录说明}
  3. 填写表单: {表单字段}
  4. 点击提交

  **注意事项:** {特殊要求}
```

---

## 结果记录

### 本地记录

保存到 `tasks/backlink-submission/{domain}-{timestamp}.json`:

```json
{
  "domain": "{projectDomain}",
  "submittedAt": "ISO timestamp",
  "results": [
    {
      "resourceId": "{id}",
      "resourceDomain": "{domain}",
      "type": "blog|directory|forum|social|other",
      "status": "submitted|failed|skipped|login_required",
      "method": "blog-commenter-skill|backlink-submission-skill",
      "notes": "提交备注"
    }
  ]
}
```

### 远程记录

调用 MCP `upsertProjectBacklink`:
```
添加外链到项目:
- projectId: {projectId}
- resourceId: {resourceId}
- targetUrl: https://{domain}
- status: submitted
- notes: "通过自动化工作流提交于 {date}"
```

---

## 最终报告

```markdown
# 外链提交报告

**项目:** {projectName} ({domain})
**时间:** {timestamp}
**类型:** {type}

## 汇总

| 状态 | 数量 |
|------|------|
| ✅ 已提交 | {n} |
| ❌ 失败 | {n} |
| 🔐 需登录 | {n} |
| ⏭️ 跳过 | {n} |

## 按技能分组

### blog-commenter-skill (博客评论)
- {blog1.com} - ✅ 评论已发布
- {blog2.com} - ⚠️ 需要登录

### backlink-submission-skill (目录/论坛等)
- {directory1.com} - ✅ 已提交，待审核
- {forum1.com} - ❌ CAPTCHA 阻止

## 需要手动处理
- {domain} - 原因: {reason}
```

---

## 默认配置

```javascript
// 默认凭据
email: "cc@{projectDomain}"
password: "12345678"
```

## Skills 依赖

| 技能 | 用途 | 适用类型 |
|-----|------|---------|
| **blog-commenter-skill** | 博客评论自动提交 | blog |
| **backlink-submission-skill** | AI + 浏览器自动化 | directory, forum, social, other |
| **chrome-devtools** | 浏览器操作底层支持 | 被 backlink-submission-skill 调用 |

## 相关链接

- [blog-commenter-skill](../skills/blog-commenter-skill/) - 博客评论技能
- [backlink-submission-skill](../skills/backlink-submission-skill/) - 通用外链提交技能
- [mybacklinks-mcp](../mybacklinks-mcp/) - MCP 服务器
