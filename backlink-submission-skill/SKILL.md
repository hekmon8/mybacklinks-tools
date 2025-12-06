---
name: Backlink Submission
description: Automate backlink submission workflow using MyBacklinks MCP and browser automation
version: 1.0.0
author: MyBacklinks
triggers:
  - submit backlinks
  - backlink submission
  - batch submit backlinks
  - automate backlink outreach
dependencies:
  - mybacklinks
  - chrome-dev-tools
---

# Backlink Submission Skill

Automate backlink submission workflow by iterating through free backlink resources from [MyBacklinks.app](https://mybacklinks.app) and completing submissions based on `howToSubmit` instructions.

## Trigger Conditions

This Skill activates when users request:
- "Submit backlinks"
- "Batch submit backlinks to [project name]"
- "Automate backlink submission"

## Required Tools

| MCP Tool | Purpose |
|----------|---------|
| `mybacklinks` | Fetch projects, backlink resources, and record submission results via MyBacklinks.app |
| `chrome-dev-tools` | Browser automation for form filling and submission |

## Execution Workflow

### Phase 1: Fetch Project Information

1. Call `listProjects` to retrieve all projects from MyBacklinks.app
2. Display project list for user selection
3. Call `getProjectDetail` to fetch:
   - Project name
   - Project description
   - Project domain
   - Project URL

**Example Output:**
```
Project: MyBacklinks
URL: https://mybacklinks.app
Description: Backlink management platform for indie hackers
```

### Phase 2: Retrieve Available Resources

1. Call `listAvailableResources` to get backlink resources:
   ```json
   {
     "projectId": "<selected_project_id>",
     "filter": {
       "payment": "free"
     },
     "limit": 50
   }
   ```

2. Filter criteria:
   - `paymentType = "free"` (free resources only)
   - `howToSubmit` field is not empty

3. Display resource list for confirmation:
   ```
   Found X submittable free backlink resources:
   1. example-directory.com (DR: 45) - directory
   2. startup-forum.com (DR: 38) - forum
   ...
   Proceed with submission?
   ```

### Phase 3: Execute Submissions

For each resource:

#### 3.1 Parse howToSubmit

Read the resource's `howToSubmit` field (Markdown format) to understand submission steps.

**howToSubmit Example:**
```markdown
## Submission Method

1. Navigate to https://example.com/submit
2. No login required
3. Fill out the form:
   - **Website Name**: Enter your website name
   - **URL**: Enter your project URL
   - **Description**: Write a 50-100 word English description
   - **Category**: Select "Tools" or "SaaS"
4. Click the "Submit" button
5. Wait for email confirmation (typically 1-3 days)

## Important Notes
- Chinese content not accepted
- Each account limited to 3 website submissions
```

#### 3.2 Generate Submission Content

| Field | Generation Rule |
|-------|-----------------|
| **Website Name** | Project name |
| **URL** | Project URL |
| **Description** | Generate 50-100 word description based on project info |
| **Anchor Text** | Brand name, keyword, or URL |

**Anchor Text Strategy:**
- **Brand Anchor**: Project name (e.g., "MyBacklinks")
- **URL Anchor**: Domain (e.g., "mybacklinks.app")
- **Keyword Anchor**: Core keywords (e.g., "backlink management")
- **Mixed Anchor**: "Name - Feature" (e.g., "MyBacklinks - SEO Tool")

#### 3.3 Browser Automation

Use `chrome-dev-tools` MCP:

1. **Navigate**: Open submission URL
2. **Screenshot**: Save initial page state
3. **Fill Form**: Complete form per howToSubmit
4. **Submit**: Click submit button
5. **Verify**: Check result

**Example:**
```
→ Navigate to https://example.com/submit
→ Wait for page load
→ Fill "Website Name": MyBacklinks
→ Fill "URL": https://mybacklinks.app
→ Fill "Description": [generated description]
→ Select "Category": Tools
→ Click "Submit" button
→ Check for success confirmation
```

#### 3.4 Record Results

Call `upsertProjectBacklink` to record results:

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

### Phase 4: Summary Report

```
## Backlink Submission Report

**Project**: MyBacklinks
**Time**: 2024-01-15 10:30

### Statistics
- ✅ Successfully Submitted: 8
- ⏳ Pending Review: 3
- ❌ Failed: 1
- ⏭️ Skipped: 2 (login required)

### Details

| Resource | Status | Notes |
|----------|--------|-------|
| example-directory.com | ✅ Submitted | Awaiting confirmation |
| startup-forum.com | ✅ Submitted | - |
| paid-directory.com | ⏭️ Skipped | Paid resource |

### Next Steps
1. Check inbox for confirmation emails
2. Check indexing status after 3 days
3. Add more backlink resources
```

## Error Handling

| Error Type | Handling |
|------------|----------|
| Page load failure | Retry 3 times, skip if still failing |
| Login required | Skip, mark as "requires manual handling" |
| Form submission failed | Save screenshot, mark status=pending |
| Paid resource | Skip, only process free resources |
| CAPTCHA | Skip, prompt user for manual handling |

## howToSubmit Format

```markdown
## Submission Method

1. Navigate to [Submission URL]
2. [Login requirements]
3. Fill out the form:
   - **Field Name**: Instructions
   - ...
4. [Submit button instructions]
5. [Post-submission steps]

## Important Notes
- [Restrictions]
- [Special requirements]
```

## Usage Example

**User Request:**
```
Help me submit backlinks for my project
```

**AI Execution:**
1. Fetch project info from MyBacklinks.app
2. Query available free backlink resources
3. Display list and request confirmation
4. Execute submissions
5. Generate summary report

## Security Notes

- Only operates through user-authorized MCP tools
- No sensitive information stored externally
- All operations traceable in MyBacklinks.app
