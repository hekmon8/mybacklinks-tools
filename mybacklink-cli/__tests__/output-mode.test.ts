import test from 'node:test';
import assert from 'node:assert/strict';

import { renderOutput, resolveOutputFormat } from '../src/format.js';

test('默认输出模式为 json', () => {
	assert.equal(resolveOutputFormat({}), 'json');
});

test('--md 显式切换为 markdown 输出', () => {
	assert.equal(resolveOutputFormat({ md: true }), 'md');
});

test('--csv 显式切换为 CSV 输出', () => {
	assert.equal(resolveOutputFormat({ csv: true }), 'csv');
});

test('多个输出格式同时出现时报错', () => {
	assert.throws(
		() => resolveOutputFormat({ json: true, md: true, csv: true }),
		/--json, --md, and --csv/,
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

test('renderOutput 在 csv 模式下返回表格数据', () => {
	assert.equal(
		renderOutput(
			{
				resources: [
					{ domain: 'example.com', dr: 42 },
					{ domain: 'directory.example', dr: 18 },
				],
			},
			'csv',
		),
		'domain,dr\nexample.com,42\ndirectory.example,18\n',
	);
});

test('renderOutput 在 md 模式下对齐并截断表格单元格', () => {
	const output = renderOutput(
		[
			{ domain: 'example.com', notes: 'short' },
			{ domain: 'directory.example', notes: 'x'.repeat(100) },
		],
		'md',
	);

	assert.match(output, /\| domain\s+\| notes\s+\|/);
	assert.match(output, /\| -{3,}\s+\| -{3,}\s+\|/);
	assert.match(output, /xxx\.\.\./);
});
