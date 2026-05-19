import test from 'node:test';
import assert from 'node:assert/strict';

import { buildCreateProjectInput } from '../src/create-project-input.js';

test('buildCreateProjectInput maps create-project flags to server payload', () => {
	assert.deepEqual(
		buildCreateProjectInput({
			name: 'Example',
			url: 'https://example.com',
			type: 'website',
			description: 'Example project',
			'contact-emails': 'hello@example.com, ops@example.com',
			'long-descriptions': 'Long copy,Alternate copy',
			'comment-template': 'Great product',
			'social-urls': 'https://x.com/example,https://github.com/example',
			'sitemap-url': 'https://example.com/sitemap.xml',
			'llms-txt-url': 'https://example.com/llms.txt',
			'robots-txt-url': 'https://example.com/robots.txt',
			status: 'active',
			'group-name': 'Growth',
			pinned: true,
		}),
		{
			name: 'Example',
			url: 'https://example.com',
			type: 'website',
			description: 'Example project',
			contactEmails: ['hello@example.com', 'ops@example.com'],
			longDescriptions: ['Long copy', 'Alternate copy'],
			commentTemplates: ['Great product'],
			socialUrls: ['https://x.com/example', 'https://github.com/example'],
			sitemapUrl: 'https://example.com/sitemap.xml',
			llmsTxtUrl: 'https://example.com/llms.txt',
			robotsTxtUrl: 'https://example.com/robots.txt',
			status: 'active',
			groupName: 'Growth',
			pinned: true,
		},
	);
});

test('buildCreateProjectInput fails locally when required flags are missing', () => {
	assert.throws(
		() =>
			buildCreateProjectInput({
				name: 'Example',
				type: 'website',
			}),
		/Missing required option --url/,
	);
});
