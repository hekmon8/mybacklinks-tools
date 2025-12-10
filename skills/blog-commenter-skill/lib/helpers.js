/**
 * Blog Commenter Skill - Helper Functions
 * 
 * Provides utilities for detecting and interacting with blog comment forms
 * across various platforms (WordPress, Ghost, Disqus, etc.)
 */

/**
 * Comment form selectors for various platforms
 */
const PLATFORM_SELECTORS = {
  wordpress: {
    form: '#commentform, .comment-form, #respond form, .comment-respond form',
    name: '#author, input[name="author"], input[name="name"]',
    email: '#email, input[name="email"]',
    website: '#url, input[name="url"], input[name="website"]',
    comment: '#comment, textarea[name="comment"], .comment-form-comment textarea',
    submit: '#submit, input[type="submit"], button[type="submit"]'
  },
  ghost: {
    form: '.gh-comments, [data-ghost-comments], .comments-section form',
    comment: 'textarea, [contenteditable="true"]',
    submit: 'button[type="submit"], .submit-button'
  },
  disqus: {
    iframe: 'iframe[src*="disqus.com"], #disqus_thread iframe',
    form: '#comment-box, .textarea-wrapper',
    comment: 'textarea, [contenteditable="true"]',
    submit: 'button[type="submit"], .post-action'
  },
  generic: {
    form: [
      'form[action*="comment"]',
      'form[id*="comment"]',
      'form[class*="comment"]',
      '.comment-form',
      '.comments form',
      '#comments form',
      'form[action*="reply"]',
      '.reply-form',
      '[data-testid*="comment"]'
    ].join(', '),
    name: [
      'input[name*="name"]',
      'input[placeholder*="name" i]',
      'input[id*="name"]',
      'input[aria-label*="name" i]'
    ].join(', '),
    email: [
      'input[name*="email"]',
      'input[type="email"]',
      'input[placeholder*="email" i]',
      'input[id*="email"]'
    ].join(', '),
    website: [
      'input[name*="url"]',
      'input[name*="website"]',
      'input[placeholder*="website" i]',
      'input[placeholder*="url" i]',
      'input[type="url"]'
    ].join(', '),
    comment: [
      'textarea[name*="comment"]',
      'textarea[name*="message"]',
      'textarea[name*="content"]',
      'textarea[placeholder*="comment" i]',
      'textarea[placeholder*="message" i]',
      'textarea[id*="comment"]',
      '.comment-textarea',
      '[contenteditable="true"]'
    ].join(', '),
    submit: [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[class*="submit"]',
      'button[class*="post"]',
      'button:has-text("Post")',
      'button:has-text("Submit")',
      'button:has-text("Comment")',
      'button:has-text("Reply")'
    ].join(', ')
  }
};

/**
 * Detect the blog platform based on page content
 * @param {import('playwright').Page} page 
 * @returns {Promise<string>}
 */
async function detectPlatform(page) {
  // Check for WordPress indicators
  const isWordPress = await page.evaluate(() => {
    return !!(
      document.querySelector('meta[name="generator"][content*="WordPress"]') ||
      document.querySelector('.wp-block') ||
      document.querySelector('#commentform') ||
      window.wp !== undefined
    );
  });
  if (isWordPress) return 'wordpress';

  // Check for Ghost
  const isGhost = await page.evaluate(() => {
    return !!(
      document.querySelector('meta[name="generator"][content*="Ghost"]') ||
      document.querySelector('.gh-') ||
      document.querySelector('[data-ghost-comments]')
    );
  });
  if (isGhost) return 'ghost';

  // Check for Disqus
  const hasDisqus = await page.evaluate(() => {
    return !!(
      document.querySelector('#disqus_thread') ||
      document.querySelector('iframe[src*="disqus.com"]')
    );
  });
  if (hasDisqus) return 'disqus';

  return 'generic';
}

/**
 * Detect comment form on the page
 * @param {import('playwright').Page} page 
 * @returns {Promise<Object>}
 */
async function detectCommentForm(page) {
  const platform = await detectPlatform(page);
  const selectors = PLATFORM_SELECTORS[platform] || PLATFORM_SELECTORS.generic;
  
  const result = {
    found: false,
    platform,
    formSelector: null,
    fields: {
      name: null,
      email: null,
      website: null,
      comment: null,
      submit: null
    },
    requiresAuth: false,
    iframe: null
  };

  // Handle Disqus iframe
  if (platform === 'disqus') {
    const disqusFrame = await page.$(PLATFORM_SELECTORS.disqus.iframe);
    if (disqusFrame) {
      result.iframe = PLATFORM_SELECTORS.disqus.iframe;
      result.requiresAuth = true;
    }
  }

  // Advanced form detection - find actual comment forms, not login forms
  const formInfo = await page.evaluate(() => {
    // Selectors to exclude (login, search, newsletter forms)
    const excludePatterns = ['login', 'signin', 'signup', 'register', 'search', 'newsletter', 'subscribe', 'password'];
    
    // Find all forms
    const allForms = Array.from(document.querySelectorAll('form'));
    
    // Score each form for "comment-likeness"
    const scoredForms = allForms.map(form => {
      let score = 0;
      const formId = (typeof form.id === 'string' ? form.id : '').toLowerCase();
      const formClass = (typeof form.className === 'string' ? form.className : '').toLowerCase();
      const formAction = (typeof form.action === 'string' ? form.action : '').toLowerCase();
      const formText = formId + ' ' + formClass + ' ' + formAction;
      
      // Exclude login/search forms
      if (excludePatterns.some(p => formText.includes(p))) {
        return { form, score: -100, reason: 'excluded pattern' };
      }
      
      // Check for comment indicators in form attributes
      if (formText.includes('comment')) score += 10;
      if (formText.includes('reply')) score += 8;
      if (formText.includes('respond')) score += 8;
      
      // Check for textarea (required for comments)
      const textarea = form.querySelector('textarea');
      if (textarea) {
        score += 15;
        const taId = (textarea.id || textarea.name || '').toLowerCase();
        if (taId.includes('comment') || taId.includes('message') || taId.includes('content')) {
          score += 10;
        }
      } else {
        // No textarea = probably not a comment form
        score -= 20;
      }
      
      // Check for name/email fields (common in comment forms)
      const hasName = form.querySelector('input[name*="name"], input[name*="author"], input[id*="name"], input[id*="author"]');
      const hasEmail = form.querySelector('input[type="email"], input[name*="email"], input[id*="email"]');
      if (hasName) score += 5;
      if (hasEmail) score += 5;
      
      // Check if form is visible
      const rect = form.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) {
        score -= 50;
      }
      
      // Check location - comment forms usually at bottom of page
      if (rect.top > window.innerHeight * 0.3) score += 3;
      
      return { 
        form, 
        score, 
        selector: form.id ? `#${form.id}` : (form.className ? `.${form.className.split(' ')[0]}` : null),
        hasTextarea: !!textarea
      };
    });
    
    // Sort by score and get the best match
    scoredForms.sort((a, b) => b.score - a.score);
    const best = scoredForms.find(f => f.score > 0 && f.hasTextarea);
    
    if (best) {
      return {
        found: true,
        selector: best.selector,
        score: best.score
      };
    }
    
    // Fallback: look for standalone textareas with comment-related attributes
    const standaloneTextareas = document.querySelectorAll('textarea');
    for (const ta of standaloneTextareas) {
      const taId = (ta.id || ta.name || ta.placeholder || '').toLowerCase();
      if (taId.includes('comment') || taId.includes('message') || taId.includes('koment')) {
        // Find parent form or container
        const parentForm = ta.closest('form');
        return {
          found: true,
          selector: parentForm ? (parentForm.id ? `#${parentForm.id}` : 'form') : null,
          textareaSelector: ta.id ? `#${ta.id}` : `textarea[name="${ta.name}"]`,
          isStandalone: !parentForm
        };
      }
    }
    
    return { found: false };
  });

  if (formInfo.found) {
    result.found = true;
    result.formSelector = formInfo.selector;

    // Detect fields
    const fieldSelectors = platform === 'wordpress' ? PLATFORM_SELECTORS.wordpress : PLATFORM_SELECTORS.generic;
    
    // If we have a standalone textarea, use it directly
    if (formInfo.textareaSelector) {
      result.fields.comment = formInfo.textareaSelector;
    }

    // Name field
    const nameField = await page.$(fieldSelectors.name);
    if (nameField) {
      const isVisible = await nameField.isVisible().catch(() => false);
      if (isVisible) result.fields.name = await getElementSelector(nameField);
    }

    // Email field  
    const emailField = await page.$(fieldSelectors.email);
    if (emailField) {
      const isVisible = await emailField.isVisible().catch(() => false);
      if (isVisible) result.fields.email = await getElementSelector(emailField);
    }

    // Website field
    const websiteField = await page.$(fieldSelectors.website);
    if (websiteField) {
      const isVisible = await websiteField.isVisible().catch(() => false);
      if (isVisible) result.fields.website = await getElementSelector(websiteField);
    }

    // Comment field (if not already set)
    if (!result.fields.comment) {
      const commentField = await page.$(fieldSelectors.comment);
      if (commentField) {
        const isVisible = await commentField.isVisible().catch(() => false);
        if (isVisible) result.fields.comment = await getElementSelector(commentField);
      }
    }

    // Submit button
    const submitButton = await page.$(fieldSelectors.submit);
    if (submitButton) {
      const isVisible = await submitButton.isVisible().catch(() => false);
      if (isVisible) result.fields.submit = await getElementSelector(submitButton);
    }
  }

  // Check if login is required
  result.requiresAuth = await page.evaluate(() => {
    const loginPrompts = document.querySelectorAll(
      '[class*="login"], [class*="signin"], a[href*="login"], a[href*="signin"]'
    );
    const commentForm = document.querySelector('form[id*="comment"], .comment-form');
    
    for (const prompt of loginPrompts) {
      const rect = prompt.getBoundingClientRect();
      if (rect.top > 0 && rect.top < window.innerHeight) {
        const text = prompt.textContent?.toLowerCase() || '';
        if (text.includes('log in') || text.includes('sign in') || text.includes('zaloguj')) {
          return true;
        }
      }
    }
    return false;
  });

  return result;
}

/**
 * Get a unique selector for an element
 * @param {import('playwright').ElementHandle} element 
 * @returns {Promise<string>}
 */
async function getElementSelector(element) {
  return element.evaluate(el => {
    if (el.id) return `#${el.id}`;
    if (el.name) return `[name="${el.name}"]`;
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.trim().split(/\s+/).filter(c => c);
      if (classes.length) return `.${classes.join('.')}`;
    }
    // Fallback to tag name with attributes
    const tag = el.tagName.toLowerCase();
    if (el.type) return `${tag}[type="${el.type}"]`;
    return tag;
  });
}

/**
 * Fill a detected comment form with data
 * @param {import('playwright').Page} page 
 * @param {Object} formInfo - Result from detectCommentForm
 * @param {Object} data - Comment data
 * @param {string} [data.name]
 * @param {string} [data.email]
 * @param {string} [data.website]
 * @param {string} data.comment
 * @param {boolean} [submit=false] - Whether to submit the form
 */
async function fillCommentForm(page, formInfo, data, submit = false) {
  if (!formInfo.found) {
    throw new Error('No comment form detected');
  }

  const { fields } = formInfo;
  const delay = 100; // Delay between actions for reliability

  // Handle iframe-based forms
  let context = page;
  if (formInfo.iframe) {
    const frame = page.frameLocator(formInfo.iframe);
    // Note: For iframe contexts, we need different handling
    console.log('Disqus/iframe comment forms require authentication');
    return { success: false, reason: 'iframe-auth-required' };
  }

  try {
    // Scroll to comment form
    if (formInfo.formSelector) {
      await page.locator(formInfo.formSelector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    // Fill name field
    if (fields.name && data.name) {
      await page.fill(fields.name, '');
      await page.type(fields.name, data.name, { delay: 30 });
      await page.waitForTimeout(delay);
    }

    // Fill email field
    if (fields.email && data.email) {
      await page.fill(fields.email, '');
      await page.type(fields.email, data.email, { delay: 30 });
      await page.waitForTimeout(delay);
    }

    // Fill website field
    if (fields.website && data.website) {
      await page.fill(fields.website, '');
      await page.type(fields.website, data.website, { delay: 30 });
      await page.waitForTimeout(delay);
    }

    // Fill comment field
    if (fields.comment && data.comment) {
      await page.fill(fields.comment, '');
      await page.type(fields.comment, data.comment, { delay: 20 });
      await page.waitForTimeout(delay);
    }

    // Submit if requested
    if (submit && fields.submit) {
      await page.click(fields.submit);
      await page.waitForTimeout(2000);
    }

    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Extract main article content from the page
 * @param {import('playwright').Page} page 
 * @returns {Promise<Object>}
 */
async function extractArticleContent(page) {
  return page.evaluate(() => {
    // Try to find the main article content
    const articleSelectors = [
      'article',
      '[class*="article"]',
      '[class*="post-content"]',
      '[class*="entry-content"]',
      '.content',
      'main',
      '[role="main"]'
    ];

    let articleElement = null;
    for (const selector of articleSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        articleElement = el;
        break;
      }
    }

    // Extract title
    const titleEl = document.querySelector('h1, [class*="title"]');
    const title = titleEl ? titleEl.textContent.trim() : '';

    // Extract content
    let content = '';
    if (articleElement) {
      // Get paragraphs
      const paragraphs = articleElement.querySelectorAll('p');
      content = Array.from(paragraphs)
        .map(p => p.textContent.trim())
        .filter(t => t.length > 50) // Filter out short paragraphs
        .slice(0, 5) // Take first 5 substantial paragraphs
        .join('\n\n');
    }

    // Extract tags/categories
    const tagElements = document.querySelectorAll(
      '[class*="tag"], [class*="category"], [rel="tag"]'
    );
    const tags = Array.from(tagElements)
      .map(el => el.textContent.trim())
      .filter(t => t.length > 0 && t.length < 30)
      .slice(0, 5);

    return {
      title,
      content: content || document.body.innerText.slice(0, 2000),
      tags,
      url: window.location.href
    };
  });
}

/**
 * Generate a contextual marketing comment based on article content and project info
 * This function creates a natural, contextual comment that promotes the project
 * 
 * @param {Object} articleContent - Result from extractArticleContent
 * @param {Object} projectInfo - Project information
 * @param {string} projectInfo.name - Project name
 * @param {string} projectInfo.url - Project URL
 * @param {string} projectInfo.description - Project description
 * @param {string} [projectInfo.customComment] - Optional custom comment to use directly
 * @returns {string}
 */
function generateMarketingComment(articleContent, projectInfo) {
  // If custom comment is provided, use it directly
  if (projectInfo.customComment) {
    return projectInfo.customComment;
  }

  const { title, content, tags } = articleContent;
  const { name, url, description } = projectInfo;

  // Analyze content for relevant topics
  const contentLower = (title + ' ' + content).toLowerCase();
  
  // Detect content categories - order matters! More specific categories first
  const categories = [
    { name: 'sports', keywords: ['sport', 'game', 'team', 'player', 'score', 'win', 'loss', 'season', 'nfl', 'nba', 'mlb', 'football', 'basketball', 'soccer', 'dolphins', 'patriots', 'quarterback', 'touchdown', 'yards', 'coach', 'playoff'] },
    { name: 'tech', keywords: ['ai', 'technology', 'software', 'digital', 'tool', 'app', 'platform', 'automation', 'mcp', 'claude', 'gpt', 'llm', 'machine learning', 'developer', 'programming', 'api'] },
    { name: 'business', keywords: ['business', 'startup', 'entrepreneur', 'market', 'investment', 'company', 'revenue', 'ceo', 'funding'] },
    { name: 'news', keywords: ['news', 'report', 'update', 'breaking', 'latest', 'today', 'announced'] }
  ];

  // Count keyword matches for each category to find best match
  let detectedCategory = 'general';
  let maxMatches = 0;
  
  for (const { name, keywords } of categories) {
    const matches = keywords.filter(keyword => contentLower.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedCategory = name;
    }
  }

  // Extract key topic from title for more natural comment
  const titleWords = title.split(' ').filter(w => w.length > 4).slice(0, 3).join(' ');

  // Generate contextual comment based on content type
  // These templates are designed to be natural and not overly promotional
  const templates = {
    tech: [
      `Great article about ${titleWords}! I've been working on ${name} (${url}) which helps developers discover MCP servers and AI integrations. ${description} - would love feedback from this community!`,
      `Interesting insights! This relates to what we're building at ${name} (${url}). ${description}`,
      `Thanks for this informative piece! Speaking of developer tools, ${name} at ${url} might be useful - ${description}`
    ],
    sports: [
      `Tough loss for the Dolphins! As a fan who also works in tech, I've been building ${name} (${url}) - ${description}. Always interesting to see how AI is changing how we consume sports content!`,
      `Great analysis of the game! Side note: for any tech-minded sports fans here, I'm working on ${name} at ${url}. ${description} - always appreciate feedback from fellow enthusiasts!`,
      `The Dolphins really need to turn things around. On a completely different topic, I run ${name} (${url}) for those interested in AI/tech tools. ${description}`
    ],
    business: [
      `Insightful article! This got me thinking about how AI is changing business. I'm building ${name} at ${url} - ${description}. Would love to connect with others interested in this space!`,
      `Great business insights! For those exploring AI tools, I run ${name} (${url}). ${description}`,
      `Thanks for sharing! I've been working on ${name} at ${url} which helps discover AI integrations. ${description}`
    ],
    news: [
      `Thanks for the update! Speaking of staying informed, I run ${name} at ${url} - ${description}. Always looking for feedback!`,
      `Great reporting! For those interested in tech news and tools, check out ${name} (${url}). ${description}`,
      `Informative piece! I've been building ${name} at ${url} to help track AI developments. ${description}`
    ],
    general: [
      `Great article! I've been working on ${name} at ${url} - ${description}. Would love to hear what this community thinks!`,
      `Thanks for sharing! For anyone interested in AI and developer tools, I run ${name} at ${url}. ${description}`,
      `Enjoyed reading this! On a related note, I'm building ${name} (${url}) - ${description}. Always appreciate community feedback!`
    ]
  };

  // Select appropriate template category
  const categoryTemplates = templates[detectedCategory] || templates.general;
  const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];

  return template;
}

/**
 * Create a comment data object with AI-generated content
 * This is the main function to call for generating marketing comments
 * 
 * @param {Object} options
 * @param {string} options.projectName - Name of the project to promote
 * @param {string} options.projectUrl - URL of the project
 * @param {string} options.projectDescription - Description of what the project does
 * @param {Object} options.articleContent - Article content from extractArticleContent
 * @param {string} [options.commenterName] - Name to use for comment
 * @param {string} [options.commenterEmail] - Email for comment form
 * @param {string} [options.customComment] - Optional: provide your own comment text
 * @returns {Object} - Ready-to-use comment data
 */
function createCommentData(options) {
  const {
    projectName,
    projectUrl,
    projectDescription,
    articleContent,
    commenterName = 'AI Tools Explorer',
    commenterEmail = 'contact@example.com',
    customComment = null
  } = options;

  const projectInfo = {
    name: projectName,
    url: projectUrl,
    description: projectDescription,
    customComment
  };

  const generatedComment = generateMarketingComment(articleContent, projectInfo);

  return {
    name: commenterName,
    email: commenterEmail,
    website: projectUrl,
    comment: generatedComment
  };
}

/**
 * Wait for comment form to be ready
 * @param {import('playwright').Page} page 
 * @param {number} timeout - Max wait time in ms
 * @returns {Promise<boolean>}
 */
async function waitForCommentForm(page, timeout = 10000) {
  const selectors = [
    '#commentform',
    '.comment-form',
    '#respond',
    '#comments form',
    'form[action*="comment"]',
    '#disqus_thread'
  ];

  try {
    await page.waitForSelector(selectors.join(', '), { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Scroll to comments section
 * @param {import('playwright').Page} page 
 */
async function scrollToComments(page) {
  await page.evaluate(() => {
    const commentSelectors = ['#comments', '.comments', '#respond', '#disqus_thread', '[class*="comment"]'];
    for (const selector of commentSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    // Fallback: scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  await page.waitForTimeout(1000);
}

/**
 * Take a screenshot with timestamp
 * @param {import('playwright').Page} page 
 * @param {string} prefix - Filename prefix
 * @returns {Promise<string>} - Screenshot path
 */
async function takeScreenshot(page, prefix = 'screenshot') {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const path = `/tmp/${prefix}-${timestamp}.png`;
    await page.screenshot({ path, fullPage: true, timeout: 10000 });
    console.log(`Screenshot saved: ${path}`);
    return path;
  } catch (error) {
    console.log(`⚠️ Screenshot failed: ${error.message}`);
    return null;
  }
}

/**
 * Login selectors for various comment systems
 */
const LOGIN_SELECTORS = {
  disqus: {
    loginButton: '[data-action="login"], .login-container button',
    emailInput: 'input[name="email"], input[type="email"]',
    passwordInput: 'input[name="password"], input[type="password"]',
    submitButton: 'button[type="submit"]'
  },
  wordpress: {
    loginLink: 'a[href*="wp-login"], .login-link',
    usernameInput: '#user_login, input[name="log"]',
    passwordInput: '#user_pass, input[name="pwd"]',
    submitButton: '#wp-submit, input[type="submit"]'
  },
  generic: {
    loginLink: 'a[href*="login"], a[href*="signin"], button:has-text("Log in")',
    emailInput: 'input[type="email"], input[name="email"], input[name="username"]',
    passwordInput: 'input[type="password"]',
    submitButton: 'button[type="submit"], input[type="submit"]'
  }
};

/**
 * Attempt to login to a comment system
 * @param {import('playwright').Page} page
 * @param {Object} credentials - { email, password } or { username, password }
 * @param {string} platform - 'disqus', 'wordpress', 'generic'
 * @returns {Promise<{success: boolean, reason?: string}>}
 */
async function attemptLogin(page, credentials, platform = 'generic') {
  const selectors = LOGIN_SELECTORS[platform] || LOGIN_SELECTORS.generic;
  
  try {
    // Click login button/link if exists
    const loginButton = await page.$(selectors.loginLink || selectors.loginButton);
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(2000);
    }

    // Fill email/username
    const emailField = await page.$(selectors.emailInput);
    if (emailField) {
      await emailField.fill(credentials.email || credentials.username);
      await page.waitForTimeout(300);
    }

    // Fill password
    const passwordField = await page.$(selectors.passwordInput);
    if (passwordField) {
      await passwordField.fill(credentials.password);
      await page.waitForTimeout(300);
    }

    // Submit
    const submitButton = await page.$(selectors.submitButton);
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(3000);
    }

    // Check if login successful
    const stillHasLogin = await page.$(selectors.loginLink || selectors.loginButton);
    if (!stillHasLogin) {
      return { success: true };
    }

    return { success: false, reason: 'Login button still visible after submit' };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Save browser authentication state for reuse
 * @param {import('playwright').BrowserContext} context
 * @param {string} path - Path to save state file
 */
async function saveAuthState(context, path = './auth-state.json') {
  await context.storageState({ path });
  console.log(`Auth state saved to ${path}`);
}

/**
 * Load saved authentication state
 * @param {import('playwright').Browser} browser
 * @param {string} path - Path to state file
 * @returns {Promise<import('playwright').BrowserContext>}
 */
async function loadAuthState(browser, path = './auth-state.json') {
  const fs = require('fs');
  if (fs.existsSync(path)) {
    return await browser.newContext({ storageState: path });
  }
  return await browser.newContext();
}

/**
 * Handle OAuth login popup (for social logins)
 * @param {import('playwright').Page} page
 * @param {string} provider - 'google', 'facebook', 'twitter', 'github'
 * @param {Object} credentials - Provider-specific credentials
 */
async function handleOAuthLogin(page, provider, credentials) {
  const context = page.context();
  
  // Listen for popup
  const popupPromise = context.waitForEvent('page');
  
  // Click OAuth button (find by provider name)
  const oauthButton = await page.$(`button:has-text("${provider}"), a:has-text("${provider}"), [data-provider="${provider}"]`);
  if (oauthButton) {
    await oauthButton.click();
  }

  const popup = await popupPromise;
  await popup.waitForLoadState();

  // Handle based on provider
  if (provider.toLowerCase() === 'google') {
    await popup.fill('input[type="email"]', credentials.email);
    await popup.click('button:has-text("Next")');
    await popup.waitForTimeout(2000);
    await popup.fill('input[type="password"]', credentials.password);
    await popup.click('button:has-text("Next")');
  } else if (provider.toLowerCase() === 'github') {
    await popup.fill('#login_field', credentials.username);
    await popup.fill('#password', credentials.password);
    await popup.click('input[type="submit"]');
  }

  // Wait for popup to close
  await popup.waitForEvent('close').catch(() => {});
  
  return { success: true };
}

/**
 * Check if the page requires login for commenting
 * @param {import('playwright').Page} page
 * @returns {Promise<{required: boolean, type: string, providers?: string[]}>}
 */
async function detectLoginRequirement(page) {
  return page.evaluate(() => {
    const result = {
      required: false,
      type: 'none',
      providers: []
    };

    // Check for login prompts
    const loginIndicators = [
      'log in to comment',
      'sign in to comment',
      'login to post',
      'please login',
      'must be logged in',
      'zaloguj się',  // Polish
      'войти',        // Russian
      'connexion'     // French
    ];

    const pageText = document.body.innerText.toLowerCase();
    for (const indicator of loginIndicators) {
      if (pageText.includes(indicator)) {
        result.required = true;
        break;
      }
    }

    // Detect OAuth providers
    const oauthButtons = document.querySelectorAll(
      '[data-provider], button[class*="google"], button[class*="facebook"], button[class*="twitter"], button[class*="github"]'
    );
    oauthButtons.forEach(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      const classes = btn.className?.toLowerCase() || '';
      if (text.includes('google') || classes.includes('google')) result.providers.push('google');
      if (text.includes('facebook') || classes.includes('facebook')) result.providers.push('facebook');
      if (text.includes('twitter') || classes.includes('twitter')) result.providers.push('twitter');
      if (text.includes('github') || classes.includes('github')) result.providers.push('github');
    });

    if (result.providers.length > 0) {
      result.type = 'oauth';
    } else if (result.required) {
      result.type = 'form';
    }

    return result;
  });
}

module.exports = {
  detectCommentForm,
  fillCommentForm,
  extractArticleContent,
  generateMarketingComment,
  createCommentData,
  waitForCommentForm,
  scrollToComments,
  takeScreenshot,
  detectPlatform,
  attemptLogin,
  saveAuthState,
  loadAuthState,
  handleOAuthLogin,
  detectLoginRequirement,
  PLATFORM_SELECTORS,
  LOGIN_SELECTORS
};

