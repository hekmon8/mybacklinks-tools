---
name: Backlink Submission
description: Automate backlink submission workflow using MyBacklinks MCP and browser automation
version: 1.0.0
author: MyBacklinks
triggers:
  - submit backlinks
  - 提交外链
  - 批量提交外链
  - backlink submission
dependencies:
  - mybacklinks
  - chrome-dev-tools
---

# Backlink Submission Skill

自动化外链提交流程，遍历项目的免费外链资源，根据 `howToSubmit` 指令自动完成提交。

## 触发条件

当用户请求以下内容时触发此 Skill：
- "提交外链"
- "submit backlinks"
- "批量提交外链到 [项目名]"
- "自动化外链提交"

## 依赖工具

| MCP 工具 | 用途 |
|---------|------|
| `mybacklinks` | 获取项目信息、外链资源、记录提交结果 |
| `chrome-dev-tools` | 浏览器自动化操作 |

## 执行流程

### Phase 1: 获取项目信息

1. 调用 `listProjects` 获取用户所有项目
2. 展示项目列表，让用户选择目标项目
3. 调用 `getProjectDetail` 获取项目详情：
   - 项目名称 (name)
   - 项目描述 (description)
   - 项目域名 (domain)
   - 项目网址 (url)

**示例输出：**
```
项目: MyBacklinks
网址: https://mybacklinks.app
描述: Backlink management platform for indie hackers
```

### Phase 2: 获取可提交资源

1. 调用 `listAvailableResources` 获取可用外链资源：
   ```json
   {
     "projectId": "<selected_project_id>",
     "filter": {
       "payment": "free"
     },
     "limit": 50
   }
   ```

2. 筛选条件：
   - `paymentType = "free"` (仅免费资源)
   - `howToSubmit` 字段非空

3. 展示资源列表供用户确认：
   ```
   找到 X 个可提交的免费外链资源：
   1. example-directory.com (DR: 45) - directory
   2. startup-forum.com (DR: 38) - forum
   ...
   是否继续提交？
   ```

### Phase 3: 执行提交

对每个资源执行以下步骤：

#### 3.1 解析 howToSubmit

读取资源的 `howToSubmit` 字段（Markdown 格式），理解提交步骤。

**howToSubmit 示例：**
```markdown
## 提交方式

1. 访问 https://example.com/submit
2. 无需登录
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

#### 3.2 生成提交内容

根据项目信息生成提交内容：

| 字段 | 生成规则 |
|------|----------|
| **Website Name** | 项目名称 |
| **URL** | 项目网址 |
| **Description** | 基于项目描述生成 50-100 字英文简介 |
| **Anchor Text** | 选择以下之一：品牌名、关键词、URL |

**锚文本生成策略：**
- **品牌锚文本**: 项目名称 (如 "MyBacklinks")
- **URL锚文本**: 域名 (如 "mybacklinks.app")
- **关键词锚文本**: 从描述提取核心关键词 (如 "backlink management")
- **混合锚文本**: "项目名 - 功能" (如 "MyBacklinks - SEO Tool")

#### 3.3 浏览器自动化

使用 `chrome-dev-tools` MCP 执行操作：

1. **导航**: 打开 `submissionUrl` 或 howToSubmit 中的 URL
2. **截图**: 保存初始页面状态
3. **填写表单**: 按照 howToSubmit 步骤填写
4. **提交**: 点击提交按钮
5. **验证**: 检查提交结果

**操作示例：**
```
→ 导航到 https://example.com/submit
→ 等待页面加载完成
→ 填写 "Website Name": MyBacklinks
→ 填写 "URL": https://mybacklinks.app
→ 填写 "Description": [生成的描述]
→ 选择 "Category": Tools
→ 点击 "Submit" 按钮
→ 检查提交成功提示
```

#### 3.4 记录结果

调用 `upsertProjectBacklink` 记录提交结果：

```json
{
  "projectId": "<project_id>",
  "resourceId": "<resource_id>",
  "targetUrl": "<project_url>",
  "backlinkUrl": "<submission_url>",
  "anchor": "<generated_anchor>",
  "status": "submitted",
  "notes": "Auto-submitted via Skill at 2024-01-15"
}
```

### Phase 4: 汇总报告

提交完成后，生成汇总报告：

```
## 外链提交报告

**项目**: MyBacklinks
**提交时间**: 2024-01-15 10:30

### 统计
- ✅ 成功提交: 8
- ⏳ 等待审核: 3
- ❌ 提交失败: 1
- ⏭️ 跳过: 2 (需要登录)

### 详情

| 资源 | 状态 | 说明 |
|------|------|------|
| example-directory.com | ✅ 已提交 | 等待邮件确认 |
| startup-forum.com | ✅ 已提交 | - |
| paid-directory.com | ⏭️ 跳过 | 付费资源 |
| login-required.com | ⏭️ 跳过 | 需要登录 |

### 下一步
1. 检查邮箱确认提交
2. 3 天后检查收录状态
3. 继续添加更多外链资源
```

## 错误处理

| 错误类型 | 处理方式 |
|---------|----------|
| 页面加载失败 | 重试 3 次，仍失败则跳过并记录 |
| 登录要求 | 跳过，标记为 "需要手动处理" |
| 表单提交失败 | 截图保存，标记 status=pending |
| 付费检测 | 跳过付费资源，仅处理 free |
| CAPTCHA | 跳过，提示用户手动处理 |

## howToSubmit 格式规范

`howToSubmit` 字段应使用 Markdown 格式，包含以下内容：

```markdown
## 提交方式

1. 访问 [提交URL]
2. [登录要求说明]
3. 填写表单：
   - **字段名**: 填写说明
   - ...
4. [提交按钮说明]
5. [后续操作说明]

## 注意事项
- [限制条件]
- [特殊要求]
```

## 使用示例

**用户请求：**
```
帮我提交外链到 MyBacklinks 项目
```

**AI 执行：**
1. 获取 MyBacklinks 项目信息
2. 查找可用的免费外链资源
3. 展示资源列表请求确认
4. 逐个执行提交
5. 生成汇总报告

## 安全说明

- 此 Skill 仅操作用户授权的 MCP 工具
- 不会存储任何敏感信息
- 所有操作可追溯（记录到 projectBacklinks）

