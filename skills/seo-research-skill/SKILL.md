---
name: SEO Research with MyBacklinks CLI
description: Use the MyBacklinks CLI to inspect account status, project backlinks, and domain SEO metrics from a reproducible command line workflow
version: 1.0.0
author: MyBacklinks
triggers:
  - seo cli
  - seo research skill
  - backlinks by domain
  - domain rating lookup
  - traffic by domain
  - project backlink audit
dependencies:
  - @mybacklinks/cli
---

# SEO Research Skill

这个 Skill 把一组高频 SEO 研究动作统一到 `@mybacklinks/cli`，适合在终端、Agent 工作流和自动化脚本中复用。

## 适用场景

- 查询当前账号订阅、额度和认证状态
- 拉取项目列表和项目详情
- 审计某个项目的外链状态、锚文本和目标页
- 调研任意域名的外链、DR 和自然流量
- 把结果沉淀到团队 SOP，而不是零散地在网页里点来点去

## 前置要求

```bash
npm install -g @mybacklinks/cli
mybacklinks login
```

如果运行环境不支持 OAuth 浏览器登录，可以改用 API Key:

```bash
mybacklinks login --api-key mbk_xxxxx
```

## 推荐工作流

### 1. 检查账号状态

```bash
mybacklinks status
```

重点确认：

- 当前认证方式是否正确
- 当前 subscription 是否可用
- 当前 credit 是否足够执行域名研究

### 2. 拉取项目上下文

```bash
mybacklinks list-projects
mybacklinks fetch-project-info --project-id <project-id>
```

如果要排查某个项目的外链问题：

```bash
mybacklinks fetch-project-backlinks \
  --project-id <project-id> \
  --status indexed \
  --resource-domain example.com
```

### 3. 域名研究

拉取外链列表：

```bash
mybacklinks fetch-backlinks-by-domain \
  --domain competitor.com \
  --limit 100 \
  --dofollow \
  --min-dr 40
```

只看 DR：

```bash
mybacklinks fetch-dr-by-domain --domain competitor.com
```

只看流量：

```bash
mybacklinks fetch-traffic-by-domain --domain competitor.com
```

## 分析建议

- 先看 `status`，确认额度，再跑高成本域名查询
- 先跑 `fetch-dr-by-domain` / `fetch-traffic-by-domain` 做粗筛，再决定要不要拉完整外链列表
- 对项目内问题优先用 `fetch-project-backlinks`，因为它不消耗域名研究 credit
- 输出给团队时优先保留命令和参数，保证结果可复现

## 可组合命令

```bash
mybacklinks list-backlink-resources --type directory --payment-type free
mybacklinks update-project-backlinks --file backlinks-update.json
mybacklinks update-project-info --project-id <project-id> --status archived
```

## 结果记录模板

建议把每次研究记录成以下结构：

```markdown
# SEO Research Note

- Query date: 2026-03-18
- Account: default
- Domain: competitor.com
- DR:
- Traffic:
- Backlink count returned:
- Key referring domains:
- Follow-up action:
```
