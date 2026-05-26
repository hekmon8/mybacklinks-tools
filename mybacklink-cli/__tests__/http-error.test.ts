import test from 'node:test';
import assert from 'node:assert/strict';

import {
	NetworkRequestError,
	formatToolErrorMessage,
	invokeTool,
} from '../src/http.ts';

test('formatToolErrorMessage includes field-level validation details', () => {
	assert.equal(
		formatToolErrorMessage(422, {
			error: {
				code: 'validation_error',
				message: 'Invalid request body',
				details: {
					fieldErrors: {
						status: [
							'Invalid option: expected one of "pending"|"submitted"|"indexed"|"rejected"|"removed"',
						],
					},
				},
			},
		}),
		'Invalid request body: status: Invalid option: expected one of "pending"|"submitted"|"indexed"|"rejected"|"removed"',
	);
});

test('invokeTool preserves safe network failure diagnostics', async () => {
	const originalFetch = globalThis.fetch;
	const cause = Object.assign(new Error('connect ETIMEDOUT 203.0.113.10:443'), {
		code: 'ETIMEDOUT',
		errno: -60,
		syscall: 'connect',
		address: '203.0.113.10',
		port: 443,
	});
	const fetchError = Object.assign(new TypeError('fetch failed'), { cause });

	globalThis.fetch = (async () => {
		throw fetchError;
	}) as typeof fetch;

	try {
		await assert.rejects(
			() =>
				invokeTool({
					commandName: 'fetch-project-info',
					input: { domain: 'example.com' },
					credentials: {
						version: 1,
						profile: 'default',
						baseUrl: 'https://mybacklinks.app',
						authMode: 'api_key',
						apiKey: 'mb_live_should_not_leak',
					},
				}),
			(error: unknown) => {
				assert.ok(error instanceof NetworkRequestError);
				assert.match(error.message, /fetch-project-info/);
				assert.match(error.message, /https:\/\/mybacklinks\.app/);
				assert.match(error.message, /ETIMEDOUT/);
				assert.equal(error.path, '/api/mcp/tools/projects/get');
				assert.equal(error.timeoutMs, 120000);
				assert.equal(error.retryable, true);
				assert.equal(error.causeSummary.code, 'ETIMEDOUT');
				assert.equal(error.causeSummary.address, '203.0.113.10');
				assert.doesNotMatch(error.message, /mb_live_should_not_leak/);
				return true;
			},
		);
	} finally {
		globalThis.fetch = originalFetch;
	}
});
