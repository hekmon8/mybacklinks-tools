# GitHub Pages Deployment Guide

This repository is configured to automatically deploy the documentation site to GitHub Pages using GitHub Actions.

## Overview

The documentation located in `mybacklinks-mcp/docs/` is built with Jekyll and deployed to GitHub Pages at:
**https://hekmon8.github.io/mybacklinks-tools**

## Automatic Deployment

The deployment workflow (`.github/workflows/deploy-pages.yml`) is triggered automatically when:

1. **Push to main branch** with changes in:
   - `mybacklinks-mcp/docs/**` (any documentation files)
   - `.github/workflows/deploy-pages.yml` (the workflow file itself)

2. **Manual trigger** via the GitHub Actions "workflow_dispatch" event

## How It Works

The workflow performs the following steps:

### Build Job
1. **Checkout** - Checks out the repository code
2. **Setup Pages** - Configures GitHub Pages (automatically enables it if needed)
3. **Build with Jekyll** - Builds the static site from `mybacklinks-mcp/docs`
4. **Upload artifact** - Packages the built site for deployment

### Deploy Job
1. **Deploy to GitHub Pages** - Deploys the artifact to GitHub Pages

## Configuration

### Workflow Configuration
- **Source**: `.github/workflows/deploy-pages.yml`
- **Permissions**: The workflow has `pages: write` and `id-token: write` permissions
- **Concurrency**: Only one deployment can run at a time

### Jekyll Configuration
- **Source directory**: `mybacklinks-mcp/docs/`
- **Theme**: Cayman (via `jekyll-remote-theme`)
- **Base URL**: `/mybacklinks-tools`
- **Plugins**:
  - `jekyll-remote-theme` - For using remote GitHub Pages themes
  - `jekyll-seo-tag` - For SEO optimization

## First-Time Setup

The workflow includes `enablement: true` in the `configure-pages` action, which means:
- ✅ GitHub Pages will be automatically enabled on first run
- ✅ Build source will be set to "GitHub Actions"
- ✅ No manual configuration needed

However, if you need to manually configure GitHub Pages:

1. Go to repository **Settings** → **Pages**
2. Under **Build and deployment**:
   - Source: Select **GitHub Actions**
3. Save the changes

## Monitoring Deployments

You can monitor deployment status:

1. **GitHub Actions tab**: View workflow runs and logs
2. **Deployments section**: See deployment history and status
3. **Pages settings**: View the published URL and configuration

## Troubleshooting

### Deployment Fails
- Check the workflow logs in the Actions tab
- Verify that GitHub Pages is enabled in repository settings
- Ensure the `GITHUB_TOKEN` has the required permissions

### Site Not Updating
- Check if the workflow was triggered (verify changed files match the path filters)
- Allow a few minutes for the deployment to complete
- Clear your browser cache

### Jekyll Build Errors
- Verify all Jekyll dependencies are specified in `Gemfile`
- Check for syntax errors in markdown files
- Review the build logs in the Actions tab

## Local Development

To test the site locally before deploying:

```bash
cd mybacklinks-mcp/docs
bundle install
bundle exec jekyll serve
```

Then visit `http://localhost:4000/mybacklinks-tools/` in your browser.

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
