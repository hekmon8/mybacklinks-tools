import test from 'node:test';
import assert from 'node:assert/strict';

import { parseResourceFileContent } from '../src/resource-file.js';

test('parseResourceFileContent accepts JSON arrays', () => {
	assert.deepEqual(
		parseResourceFileContent(
			JSON.stringify([
				{
					domain: 'Example.com',
					type: 'directory',
					paymentType: 'free',
					dr: 42,
				},
			]),
		),
		[
			{
				domain: 'Example.com',
				type: 'directory',
				paymentType: 'free',
				dr: 42,
			},
		],
	);
});

test('parseResourceFileContent accepts JSON objects with items', () => {
	assert.deepEqual(
		parseResourceFileContent(
			JSON.stringify({
				items: [
					{
						domain: 'forum.example.com',
						type: 'forum',
						submission_method: 'form',
					},
				],
			}),
		),
		[
			{
				domain: 'forum.example.com',
				type: 'forum',
				submissionMethod: 'form',
			},
		],
	);
});

test('parseResourceFileContent accepts CSV rows with CLI-style headers', () => {
	assert.deepEqual(
		parseResourceFileContent(
			[
				'domain,type,payment-type,submission-url,dr,traffic,notes',
				'example.com,directory,free,https://example.com/submit,65,12000,"curated, verified"',
			].join('\n'),
			'resources.csv',
		),
		[
			{
				domain: 'example.com',
				type: 'directory',
				paymentType: 'free',
				submissionUrl: 'https://example.com/submit',
				dr: 65,
				traffic: 12000,
				notes: 'curated, verified',
			},
		],
	);
});
