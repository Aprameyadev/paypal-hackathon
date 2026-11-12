import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../lib/http.ts', import.meta.url), 'utf8');
const compiled = ts.transpile(source, {
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
});
const { readJsonObject } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`
);

test('readJsonObject returns JSON objects', async () => {
  const request = new Request('http://localhost/api', {
    method: 'POST',
    body: JSON.stringify({ customerId: 'customer-1' }),
  });

  assert.deepEqual(await readJsonObject(request), { customerId: 'customer-1' });
});

test('readJsonObject rejects arrays and null', async () => {
  for (const body of ['[]', 'null']) {
    const request = new Request('http://localhost/api', { method: 'POST', body });
    assert.equal(await readJsonObject(request), null);
  }
});

test('readJsonObject returns null for malformed JSON', async () => {
  const request = new Request('http://localhost/api', { method: 'POST', body: '{' });
  assert.equal(await readJsonObject(request), null);
});
