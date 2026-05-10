import test from 'node:test';
import assert from 'node:assert/strict';

import { formatToolErrorMessage } from '../src/http.ts';

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
