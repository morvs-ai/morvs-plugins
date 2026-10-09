#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const examples = JSON.parse(readFileSync(join(root, 'scripts/tool-examples.json'), 'utf8'));
const endpoint = 'https://api.morvs.ai/mcp';
const reportPath = join(root, 'submission/tool-smoke-2026-10-09.md');
const startedAt = new Date().toISOString();
let nextId = 1;
let lastRequestStart = 0;

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const compact = (value) => JSON.stringify(value);
const tableCell = (value) => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');

async function rpc(method, params) {
  const wait = 500 - (performance.now() - lastRequestStart);
  if (wait > 0) await sleep(wait);
  lastRequestStart = performance.now();
  const start = performance.now();
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
      body: compact({ jsonrpc: '2.0', id: nextId++, method, params }),
      signal: AbortSignal.timeout(30_000),
    });
    const body = await response.text();
    let message;
    try {
      if ((response.headers.get('content-type') ?? '').includes('text/event-stream')) {
        const events = body.split(/\r?\n\r?\n/);
        const event = events.find((part) => part.split(/\r?\n/).some((line) => line.startsWith('data:')));
        const data = event?.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n');
        message = JSON.parse(data ?? '');
      } else {
        message = JSON.parse(body);
      }
    } catch (error) {
      return { status: response.status, ms: Math.round(performance.now() - start), bytes: Buffer.byteLength(body), isError: true, error: `Unparseable MCP response: ${error.message}; body=${body}` };
    }
    const result = message?.result;
    const content = Array.isArray(result?.content) ? result.content : [];
    const textErrors = content.filter((part) => part?.type === 'text').map((part) => {
      const text = String(part.text ?? '');
      try {
        const parsed = JSON.parse(text);
        if (parsed?.error) return compact(parsed.error);
        if (parsed?.status === 'error') return text;
      } catch { /* ordinary prose or JSON-free content */ }
      return /^(?:error|tool error)\s*:/i.test(text) ? text : null;
    }).filter(Boolean);
    const error = !response.ok
      ? `HTTP ${response.status}: ${body}`
      : message?.error ? compact(message.error)
        : !result ? 'MCP response has no result'
          : result?.isError ? content.map((part) => part.text ?? compact(part)).join('\n') || 'MCP result.isError=true'
          : textErrors.length ? textErrors.join('\n') : null;
    return { status: response.status, ms: Math.round(performance.now() - start), bytes: Buffer.byteLength(body), isError: Boolean(error), error };
  } catch (error) {
    return { status: 'transport', ms: Math.round(performance.now() - start), bytes: 0, isError: true, error: `${error.name}: ${error.message}` };
  }
}

function invalidArguments(tool) {
  const schema = tool.inputSchema ?? {};
  if ((schema.required ?? []).length) return {};
  const first = Object.entries(schema.properties ?? {})[0];
  if (!first) return 'invalid arguments object';
  const [name, property] = first;
  if (property.enum) return { [name]: '__invalid_enum__' };
  if (property.type === 'integer' || property.type === 'number') return { [name]: 'not-a-number' };
  if (property.type === 'array') return { [name]: 'not-an-array' };
  return { [name]: { invalid: true } };
}

async function listTools() {
  const init = await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'morvs-plugin-smoke', version: '0.1.1' },
  });
  if (init.isError) throw new Error(`initialize: ${init.error}`);
  const tools = [];
  let cursor;
  for (let page = 0; page < 10; page += 1) {
    const result = await rawList(cursor);
    tools.push(...result.tools);
    cursor = result.nextCursor;
    if (!cursor) return tools;
  }
  throw new Error('tools/list exceeded ten pages');
}

async function rawList(cursor) {
  const wait = 500 - (performance.now() - lastRequestStart);
  if (wait > 0) await sleep(wait);
  lastRequestStart = performance.now();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: compact({ jsonrpc: '2.0', id: nextId++, method: 'tools/list', params: cursor ? { cursor } : {} }),
    signal: AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`tools/list HTTP ${response.status}: ${body}`);
  const message = (response.headers.get('content-type') ?? '').includes('text/event-stream')
    ? JSON.parse(body.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n'))
    : JSON.parse(body);
  if (message.error || !Array.isArray(message.result?.tools)) throw new Error(`tools/list: ${body}`);
  return message.result;
}

function render(tools, rows, missing) {
  const validFailures = rows.filter((row) => row.valid.isError);
  const invalidNoErrors = rows.filter((row) => !row.invalid.isError);
  const maxBytes = Math.max(0, ...rows.map((row) => row.valid.bytes));
  const lines = [
    '# MORVS live MCP tool smoke — 2026-10-09',
    '',
    `Run started: ${startedAt}. Endpoint: ${endpoint}. Live tools/list count: ${tools.length}.`,
    'Calls were sequential and started at least 500 ms apart (at most two requests per second). Bytes are UTF-8 response-body bytes. HTTP status, elapsed milliseconds, and MCP content/error state are recorded. A no-match data result is distinct from an MCP error.',
    '',
    `Valid-call errors: **${validFailures.length}**. Invalid calls without a signaled error: **${invalidNoErrors.length}**. Largest valid response: **${maxBytes} bytes**. Missing examples: **${missing.length}**.`,
    '',
    '| Tool | Valid arguments | HTTP | ms | bytes | Error content? | Invalid call | Invalid HTTP | Invalid error? | Invalid message |',
    '|---|---|---:|---:|---:|---|---|---:|---|---|',
  ];
  for (const row of rows) {
    lines.push(`| ${tableCell(row.name)} | \`${tableCell(compact(row.args))}\` | ${row.valid.status} | ${row.valid.ms} | ${row.valid.bytes} | ${row.valid.isError ? 'yes' : 'no'} | \`${tableCell(compact(row.badArgs))}\` | ${row.invalid.status} | ${row.invalid.isError ? 'yes' : 'no'} | ${tableCell((row.invalid.error ?? '').slice(0, 160))} |`);
  }
  if (missing.length) lines.push('', '## Missing examples', '', ...missing.map((name) => `- ${name}`));
  if (validFailures.length) {
    lines.push('', '## Exact valid-call errors', '');
    for (const row of validFailures) lines.push(`### ${row.name}`, '', '~~~text', row.valid.error ?? '(no error detail)', '~~~', '');
  }
  if (invalidNoErrors.length) lines.push('', '## Invalid calls accepted or not flagged', '', ...invalidNoErrors.map((row) => `- ${row.name}: ${compact(row.badArgs)}; HTTP ${row.invalid.status}, ${row.invalid.bytes} bytes.`));
  lines.push('', 'A passing transport response does not establish complete coverage or correct source interpretation. Reviewers should verify sampled facts and official-list status independently.');
  return `${lines.join('\n')}\n`;
}

let tools;
try {
  tools = await listTools();
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
}
const missing = tools.filter((tool) => !Object.hasOwn(examples, tool.name)).map((tool) => tool.name);
const stale = Object.keys(examples).filter((name) => !tools.some((tool) => tool.name === name));
if (stale.length) console.error(`STALE examples (not live): ${stale.join(', ')}`);
const rows = [];
for (const tool of tools) {
  if (missing.includes(tool.name)) continue;
  const args = examples[tool.name];
  const badArgs = invalidArguments(tool);
  const valid = await rpc('tools/call', { name: tool.name, arguments: args });
  const invalid = await rpc('tools/call', { name: tool.name, arguments: badArgs });
  rows.push({ name: tool.name, args, badArgs, valid, invalid });
  console.log(`${tool.name}: valid ${valid.status}/${valid.isError ? 'ERROR' : 'ok'} ${valid.ms}ms ${valid.bytes}B; invalid ${invalid.status}/${invalid.isError ? 'error' : 'accepted'}`);
}
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, render(tools, rows, missing));
const validFailures = rows.filter((row) => row.valid.isError);
console.log(`REPORT ${reportPath}: ${rows.length}/${tools.length} tools; ${validFailures.length} valid errors; ${rows.filter((row) => !row.invalid.isError).length} invalid calls accepted`);
if (missing.length || validFailures.length) process.exitCode = 1;
