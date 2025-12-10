#!/usr/bin/env node

/**
 * Backlink Submission Script
 * 
 * Usage:
 *   node submit-backlink.js --url <blogUrl> --project <projectName> --domain <projectDomain> [--email <email>] [--password <password>]
 * 
 * Example:
 *   node submit-backlink.js --url "https://blog.example.com/post" --project "AIMCP" --domain "aimcp.info" --description "AI MCP Server Directory"
 */

const { chromium } = require('playwright');
const {
  detectCommentForm,
  fillCommentForm,
  extractArticleContent,
  createCommentData,
  scrollToComments,
  takeScreenshot,
  detectPlatform,
  attemptLogin,
  detectLoginRequirement
} = require('./lib/helpers');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    url: null,
    project: null,
    domain: null,
    description: '',
    email: null,
    password: '12345678',
    submit: false,  // Whether to actually submit (default: dry run)
    output: null    // Output file path
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--url':
        params.url = args[++i];
        break;
      case '--project':
        params.project = args[++i];
        break;
      case '--domain':
        params.domain = args[++i];
        break;
      case '--description':
        params.description = args[++i];
        break;
      case '--email':
        params.email = args[++i];
        break;
      case '--password':
        params.password = args[++i];
        break;
      case '--submit':
        params.submit = true;
        break;
      case '--output':
        params.output = args[++i];
        break;
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  // Default email based on domain
  if (!params.email && params.domain) {
    params.email = `cc@${params.domain}`;
  }

  return params;
}

function printHelp() {
  console.log(`
Backlink Submission Script

Usage:
  node submit-backlink.js --url <blogUrl> --project <projectName> --domain <projectDomain> [options]

Required:
  --url <url>           Blog post URL to submit comment to
  --project <name>      Project name
  --domain <domain>     Project domain (e.g., aimcp.info)

Optional:
  --description <text>  Project description
  --email <email>       Commenter email (default: cc@<domain>)
  --password <pass>     Password for login if needed (default: 12345678)
  --submit              Actually submit (default: dry run / fill only)
  --output <file>       Save result to JSON file
  --help                Show this help

Examples:
  # Dry run (fill form but don't submit)
  node submit-backlink.js --url "https://blog.com/post" --project "AIMCP" --domain "aimcp.info"
  
  # Actually submit
  node submit-backlink.js --url "https://blog.com/post" --project "AIMCP" --domain "aimcp.info" --submit
  
  # With custom email and save result
  node submit-backlink.js --url "https://blog.com/post" --project "AIMCP" --domain "aimcp.info" --email "hello@aimcp.info" --submit --output result.json
`);
}

async function submitBacklink(params) {
  const result = {
    url: params.url,
    project: params.project,
    domain: params.domain,
    timestamp: new Date().toISOString(),
    status: 'pending',
    platform: null,
    formFound: false,
    fieldsFound: 0,
    loginRequired: false,
    submitted: false,
    comment: null,
    screenshot: null,
    error: null
  };

  console.log('🚀 Backlink Submission Script');
  console.log('━'.repeat(60));
  console.log(`📰 URL: ${params.url}`);
  console.log(`📦 Project: ${params.project} (${params.domain})`);
  console.log(`📧 Email: ${params.email}`);
  console.log(`🔄 Mode: ${params.submit ? 'SUBMIT' : 'DRY RUN'}`);
  console.log('━'.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to blog
    console.log('\n📖 Step 1: Loading page...');
    await page.goto(params.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    console.log('✅ Page loaded');

    // Step 2: Detect platform
    console.log('\n🔍 Step 2: Detecting platform...');
    result.platform = await detectPlatform(page);
    console.log(`✅ Platform: ${result.platform}`);

    // Step 3: Extract article content
    console.log('\n📝 Step 3: Extracting article content...');
    const articleContent = await extractArticleContent(page);
    console.log(`✅ Title: ${articleContent.title?.substring(0, 50)}...`);

    // Step 4: Generate comment
    console.log('\n💬 Step 4: Generating comment...');
    const commentData = createCommentData({
      projectName: params.project,
      projectUrl: `https://${params.domain}`,
      projectDescription: params.description || `Check out ${params.project} at ${params.domain}`,
      articleContent,
      commenterName: `Team ${params.project}`,
      commenterEmail: params.email
    });
    result.comment = commentData.comment;
    console.log('─'.repeat(50));
    console.log(commentData.comment);
    console.log('─'.repeat(50));

    // Step 5: Scroll to comments
    console.log('\n📜 Step 5: Scrolling to comments...');
    await scrollToComments(page);
    await page.waitForTimeout(2000);

    // Step 6: Check login requirement
    console.log('\n🔐 Step 6: Checking login requirements...');
    const loginInfo = await detectLoginRequirement(page);
    result.loginRequired = loginInfo.required;
    
    if (loginInfo.required) {
      console.log('⚠️ Login required, attempting login...');
      const loginResult = await attemptLogin(page, {
        email: params.email,
        password: params.password
      }, result.platform);
      
      if (!loginResult.success) {
        console.log(`❌ Login failed: ${loginResult.reason}`);
        result.status = 'login_required';
        result.error = `Login required but failed: ${loginResult.reason}`;
      } else {
        console.log('✅ Login successful');
        await page.waitForTimeout(2000);
      }
    } else {
      console.log('✅ No login required');
    }

    // Step 7: Detect comment form
    if (result.status !== 'login_required') {
      console.log('\n🔎 Step 7: Detecting comment form...');
      const formInfo = await detectCommentForm(page);
      result.formFound = formInfo.found;
      result.fieldsFound = Object.values(formInfo.fields).filter(f => f).length;

      console.log(`   Form found: ${formInfo.found ? '✅' : '❌'}`);
      console.log(`   Fields: ${result.fieldsFound}`);
      console.log(`   Auth required: ${formInfo.requiresAuth ? '⚠️' : '✅ No'}`);

      if (formInfo.found) {
        console.log('\n📋 Detected fields:');
        Object.entries(formInfo.fields).forEach(([k, v]) => {
          if (v) console.log(`   ✓ ${k}: ${v}`);
        });
      }

      // Step 8: Fill form
      if (formInfo.found && !formInfo.requiresAuth) {
        console.log(`\n✏️ Step 8: ${params.submit ? 'Filling and submitting' : 'Filling'} form...`);
        const fillResult = await fillCommentForm(page, formInfo, commentData, params.submit);
        
        if (fillResult.success) {
          result.status = params.submit ? 'submitted' : 'filled';
          result.submitted = params.submit;
          console.log(params.submit ? '✅ Form submitted!' : '✅ Form filled (dry run)');
        } else {
          result.status = 'failed';
          result.error = fillResult.reason;
          console.log(`❌ Fill failed: ${fillResult.reason}`);
        }
      } else if (!formInfo.found) {
        result.status = 'form_not_found';
        result.error = 'No comment form detected on page';
        console.log('❌ No comment form found');
      } else if (formInfo.requiresAuth) {
        result.status = 'auth_required';
        result.error = 'Comment form requires authentication';
        console.log('❌ Form requires authentication');
      }
    }

    // Step 9: Take screenshot
    console.log('\n📸 Step 9: Taking screenshot...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `/tmp/backlink-${params.domain.replace(/\./g, '-')}-${timestamp}.png`;
    await takeScreenshot(page, `backlink-${params.domain.replace(/\./g, '-')}`);
    result.screenshot = screenshotPath;

  } catch (error) {
    result.status = 'error';
    result.error = error.message;
    console.error(`\n❌ Error: ${error.message}`);
    await takeScreenshot(page, 'backlink-error');
  } finally {
    console.log('\n⏳ Closing browser in 3 seconds...');
    await page.waitForTimeout(3000);
    await browser.close();
  }

  // Print result summary
  console.log('\n' + '━'.repeat(60));
  console.log('📊 RESULT SUMMARY');
  console.log('━'.repeat(60));
  console.log(`Status: ${result.status}`);
  console.log(`Platform: ${result.platform}`);
  console.log(`Form Found: ${result.formFound}`);
  console.log(`Fields: ${result.fieldsFound}`);
  console.log(`Submitted: ${result.submitted}`);
  if (result.error) console.log(`Error: ${result.error}`);
  console.log('━'.repeat(60));

  // Save result to file if specified
  if (params.output) {
    fs.writeFileSync(params.output, JSON.stringify(result, null, 2));
    console.log(`\n📁 Result saved to: ${params.output}`);
  }

  return result;
}

// Main execution
const params = parseArgs();

if (!params.url || !params.project || !params.domain) {
  console.error('❌ Missing required parameters. Use --help for usage.');
  process.exit(1);
}

submitBacklink(params)
  .then(result => {
    process.exit(result.status === 'submitted' || result.status === 'filled' ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

