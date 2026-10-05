import fs from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';

const readFile = fs.readFile;
fs.readFile = async (path, ...args) => {
  if (String(path).endsWith('/.config/mybacklinks/credentials.json')) {
    return JSON.stringify({ version: 1, profile: 'default', authMode: 'api_key', apiKey: 'test-only-key', baseUrl: 'https://test.invalid' });
  }
  return readFile(path, ...args);
};
syncBuiltinESMExports();

globalThis.fetch = async (url, options) => {
  if (String(url).includes('registry.npmjs.org')) return new Response('', { status: 404 });
  const input = JSON.parse(options.body);
  const data = process.env.CLI_TEST_RESULT === 'echo' ? input : JSON.parse(process.env.CLI_TEST_RESULT || 'null');
  return new Response(JSON.stringify({ data }), { headers: { 'content-type': 'application/json' } });
};
