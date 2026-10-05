import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

function run(args: string[], result: unknown | 'echo') {
  return spawnSync(process.execPath, ['--import', 'tsx', '--import', fileURLToPath(new URL('./fixtures/cli-offline-preload.mjs', import.meta.url)), fileURLToPath(new URL('../src/index.ts', import.meta.url)), ...args, '--json'], {
    cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8',
    env: { ...process.env, CLI_TEST_RESULT: result === 'echo' ? 'echo' : JSON.stringify(result) },
  });
}

test('actual CLI exits unsuccessfully for malformed traffic results', () => {
  for (const result of [null, false, 0, 'bad', {}]) {
    const command = run(['fetch-traffic-by-domain', '--domain', 'google.com'], result);
    assert.equal(command.status, 1, command.stderr);
    assert.match(command.stderr, /data_quality_error/);
    assert.equal(command.stdout.trim(), '');
  }
});

test('actual CLI preserves confirmed traffic and explicit ID/icon request payloads', () => {
  const traffic = run(['fetch-traffic-by-domain', '--domain', 'example.com'], { metrics: { traffic: 0 }, availability: { traffic: true } });
  assert.equal(traffic.status, 0, traffic.stderr);
  assert.equal(JSON.parse(traffic.stdout).data.traffic, 0);
  const icon = run(['update-project-info', '--project-id', 'p1', '--icon', 'https://example.com/logo.svg'], 'echo');
  assert.equal(icon.status, 0, icon.stderr);
  assert.equal(JSON.parse(icon.stdout).data.icon, 'https://example.com/logo.svg');
  const pair = run(['update-project-backlinks', '--project-id', 'p1', '--backlink-id', 'b1', '--resource-id', 'r1', '--target-url', 'https://example.com/new'], 'echo');
  assert.equal(pair.status, 0, pair.stderr);
  assert.deepEqual(JSON.parse(pair.stdout).data, { projectId: 'p1', backlinkId: 'b1', resourceId: 'r1', targetUrl: 'https://example.com/new' });
});
