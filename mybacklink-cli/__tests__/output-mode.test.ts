import test from 'node:test';
import assert from 'node:assert/strict';

import { renderOutput, resolveOutputFormat } from '../src/format.js';

test('默认输出模式为 json', () => {
	assert.equal(resolveOutputFormat({}), 'json');
});

test('--md 显式切换为 markdown 输出', () => {
	assert.equal(resolveOutputFormat({ md: true }), 'md');
});

test('--json 与 --md 同时出现时报错', () => {
	assert.throws(
		() => resolveOutputFormat({ json: true, md: true }),
		/--json and --md/,
	);
});

test('renderOutput 在 json 模式下返回格式化 JSON', () => {
	assert.equal(
		renderOutput({ ok: true, count: 2 }, 'json'),
		'{\n  "ok": true,\n  "count": 2\n}\n',
	);
});

test('renderOutput 在 md 模式下返回 markdown', () => {
	assert.equal(
		renderOutput({ ok: true, count: 2 }, 'md'),
		'- **ok**: yes\n- **count**: 2\n',
	);
});
