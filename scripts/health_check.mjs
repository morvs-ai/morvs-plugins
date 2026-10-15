#!/usr/bin/env node
// Hourly health check for the public MORVS MCP server and the pages the
// directory listings point to. Zero dependencies (Node 20+). Exits 1 and
// prints a summary when any check fails, so the workflow can open an issue.

const MCP = 'https://api.morvs.ai/mcp';
const TIMEOUT_MS = 20_000;
const HEADERS = {
  'content-type': 'application/json',
  accept: 'application/json, text/event-stream',
  'mcp-protocol-version': '2025-06-18',
  'user-agent': 'morvs-health-check/1.0 (+https://github.com/morvs-ai/morvs-plugins)',
};

let rpcId = 0;

async function timed(fn) {
  const started = Date.now();
  const value = await fn();
  return { value, ms: Date.now() - started };
}

function parseRpc(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  const data = trimmed.split('\n').filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim());
  return JSON.parse(data.at(-1));
}

async function rpc(method, params = {}) {
  const response = await fetch(MCP, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`${method}: HTTP ${response.status}`);
  const message = parseRpc(await response.text());
  if (message.error) throw new Error(`${method}: JSON-RPC error ${message.error.code} ${message.error.message}`);
  return message.result;
}

async function call(name, args) {
  const result = await rpc('tools/call', { name, arguments: args });
  const text = (result.content ?? []).filter((part) => part.type === 'text').map((part) => part.text).join('\n');
  return { isError: result.isError === true, text };
}

async function page(url, mustContain) {
  const response = await fetch(url, { headers: { 'user-agent': HEADERS['user-agent'] }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (response.status !== 200) throw new Error(`${url}: HTTP ${response.status}`);
  const body = await response.text();
  if (mustContain && !body.includes(mustContain)) throw new Error(`${url}: missing "${mustContain}"`);
}

const checks = [
  ['initialize identifies as MORVS', async () => {
    const result = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'morvs-health-check', version: '1.0' } });
    if (result.serverInfo?.name !== 'morvs') throw new Error(`serverInfo.name is ${result.serverInfo?.name}`);
  }],
  ['ping answers', async () => { await rpc('ping'); }],
  ['tools/list has 77 read-only tools', async () => {
    const { tools } = await rpc('tools/list');
    if (tools.length < 77) throw new Error(`only ${tools.length} tools`);
    const notReadOnly = tools.filter((tool) => tool.annotations?.readOnlyHint !== true).map((tool) => tool.name);
    if (notReadOnly.length) throw new Error(`missing readOnlyHint: ${notReadOnly.join(', ')}`);
    if (!tools.some((tool) => tool.name === 'estimate_filing_dates')) throw new Error('estimate_filing_dates alias missing');
  }],
  ['resolve PFE returns Pfizer CIK', async () => {
    const { isError, text } = await call('resolve', { ticker: 'PFE' });
    if (isError || !text.includes('0000078003')) throw new Error(isError ? text.slice(0, 200) : 'CIK 0000078003 not in result');
  }],
  ['sanctions_check answers', async () => {
    const { isError, text } = await call('sanctions_check', { name: 'Pfizer' });
    if (isError) throw new Error(text.slice(0, 200));
  }],
  ['bad input returns an actionable error', async () => {
    const { isError, text } = await call('cluster_buys', { days: 'not-a-number' });
    if (!isError || !text.includes('Invalid arguments')) throw new Error('malformed arguments were accepted');
  }],
  ['OpenAI domain verification token is served', () => page('https://api.morvs.ai/.well-known/openai-apps-challenge')],
  ['MCP docs page is up', () => page('https://morvs.ai/api/mcp/', 'api.morvs.ai/mcp')],
  ['privacy policy is up', () => page('https://morvs.ai/privacy/', 'Privacy')],
  ['terms are up', () => page('https://morvs.ai/terms/', 'Terms')],
];

async function runOnce() {
  const failures = [];
  for (const [name, fn] of checks) {
    try {
      const { ms } = await timed(fn);
      console.log(`ok   ${name} (${ms} ms)`);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.log(`FAIL ${name}: ${error.message}`);
    }
  }
  return failures;
}

let failures = await runOnce();
if (failures.length) {
  // One retry after 30 seconds so a single blip does not open an issue.
  console.log('Retrying failed run in 30 s...');
  await new Promise((resolve) => setTimeout(resolve, 30_000));
  failures = await runOnce();
}
if (failures.length) {
  console.log(`\nSUMMARY: ${failures.length} check(s) failing\n${failures.map((line) => `- ${line}`).join('\n')}`);
  process.exit(1);
}
console.log('\nSUMMARY: all checks passed');
