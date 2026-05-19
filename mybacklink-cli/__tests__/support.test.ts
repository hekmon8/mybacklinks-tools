import test from 'node:test';
import assert from 'node:assert/strict';

import {
	SUPPORT_ISSUE_URL,
	getSupportIssueHint,
	printSupportIssueHint,
} from '../src/support.js';

test('support hint points users to GitHub issues without embedding JSON data', () => {
	const hint = getSupportIssueHint();

	assert.match(hint, /Support:/);
	assert.match(hint, /bugs, rough edges, or feature requests/);
	assert.equal(SUPPORT_ISSUE_URL, 'https://github.com/hekmon8/ai-cf-mybacklinks/issues');
	assert.doesNotThrow(() => JSON.stringify({ ok: true }));
});

test('printSupportIssueHint writes the support hint to stderr', () => {
	let stderr = '';
	const originalWrite = process.stderr.write;

	try {
		process.stderr.write = ((chunk: string | Uint8Array) => {
			stderr += String(chunk);
			return true;
		}) as typeof process.stderr.write;

		printSupportIssueHint();
	} finally {
		process.stderr.write = originalWrite;
	}

	assert.match(stderr, /Support:/);
	assert.match(stderr, new RegExp(SUPPORT_ISSUE_URL.replace(/\./g, '\\.')));
});
