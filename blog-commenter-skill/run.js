#!/usr/bin/env node

/**
 * Blog Commenter Skill - Universal Executor
 * 
 * This script provides proper module resolution for Playwright automation.
 * It handles temp file creation, execution, and cleanup.
 * 
 * Usage:
 *   node run.js <script-file>
 *   node run.js --code "<inline-code>"
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Get the skill directory for module resolution
const SKILL_DIR = __dirname;
const NODE_MODULES = path.join(SKILL_DIR, 'node_modules');

// Ensure playwright is available
function checkDependencies() {
  try {
    require.resolve('playwright', { paths: [SKILL_DIR] });
    return true;
  } catch (e) {
    console.error('Playwright not found. Run: npm run setup');
    return false;
  }
}

// Create temp file for inline code
function createTempFile(code) {
  const tempDir = os.tmpdir();
  const tempFile = path.join(tempDir, `blog-commenter-${Date.now()}.js`);
  
  // Wrap code with proper module resolution
  const wrappedCode = `
// Module resolution setup
const path = require('path');
const skillDir = ${JSON.stringify(SKILL_DIR)};
module.paths.unshift(path.join(skillDir, 'node_modules'));

// Make helpers available
const helpers = require(path.join(skillDir, 'lib', 'helpers'));

// User code
${code}
`;
  
  fs.writeFileSync(tempFile, wrappedCode);
  return tempFile;
}

// Run the automation script
async function runScript(scriptPath, isTemp = false) {
  return new Promise((resolve, reject) => {
    const nodeProcess = spawn('node', [scriptPath], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_PATH: NODE_MODULES,
        SKILL_DIR: SKILL_DIR
      },
      cwd: SKILL_DIR
    });

    nodeProcess.on('close', (code) => {
      // Cleanup temp file after a delay to avoid race conditions
      if (isTemp) {
        setTimeout(() => {
          try {
            fs.unlinkSync(scriptPath);
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 1000);
      }

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    nodeProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Blog Commenter Skill - Universal Executor');
    console.log('');
    console.log('Usage:');
    console.log('  node run.js <script-file>');
    console.log('  node run.js --code "<inline-code>"');
    console.log('');
    console.log('Examples:');
    console.log('  node run.js comment-script.js');
    console.log('  node run.js --code "const { chromium } = require(\'playwright\'); ..."');
    process.exit(0);
  }

  if (!checkDependencies()) {
    process.exit(1);
  }

  try {
    if (args[0] === '--code' && args[1]) {
      // Inline code execution
      const tempFile = createTempFile(args[1]);
      await runScript(tempFile, true);
    } else {
      // Script file execution
      const scriptPath = path.resolve(args[0]);
      if (!fs.existsSync(scriptPath)) {
        console.error(`Script not found: ${scriptPath}`);
        process.exit(1);
      }
      await runScript(scriptPath, false);
    }
  } catch (error) {
    console.error('Execution failed:', error.message);
    process.exit(1);
  }
}

main();

