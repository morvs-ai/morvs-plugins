#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pluginRoot = join(root, 'plugins/morvs');
const snapshotPath = join(root, 'scripts/tools-2026-10-25c.json');
const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isString = (value) => typeof value === 'string' && value.trim().length > 0;

function checkBundleFiles() {
  const readme = join(pluginRoot, 'README.md');
  const license = join(pluginRoot, 'LICENSE');
  assert(existsSync(readme), 'plugins/morvs/README.md is required');
  assert(existsSync(license), 'plugins/morvs/LICENSE is required');
  if (existsSync(readme)) {
    const prose = readFileSync(readme, 'utf8').replace(/^\s*```[\s\S]*?^\s*```/gm, '');
    const words = prose.match(/[\p{L}\p{N}][\p{L}\p{N}'’/-]*/gu) ?? [];
    assert(words.length >= 40, `plugins/morvs/README.md needs at least 40 non-code words; found ${words.length}`);
  }
  if (existsSync(license)) {
    assert(readFileSync(license, 'utf8') === readFileSync(join(root, 'LICENSE'), 'utf8'), 'Plugin LICENSE must match root LICENSE');
  }
  const walk = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, item.name);
      const relative = path.slice(pluginRoot.length + 1);
      assert(!['.DS_Store', 'Thumbs.db', 'desktop.ini', '__MACOSX'].includes(item.name), `System file in plugin bundle: ${relative}`);
      if (item.isDirectory()) walk(path);
      else if (item.isFile()) {
        if (!/\.(?:png|jpe?g|gif|webp|svg|ico)$/i.test(item.name)) {
          assert(statSync(path).size < 256 * 1024, `Plugin file exceeds 256 KiB: ${relative}`);
        }
      } else errors.push(`Unsupported plugin bundle entry: ${relative}`);
    }
  };
  walk(pluginRoot);
}

function readJson(relativePath) {
  const path = join(root, relativePath);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function checkString(object, key, label) {
  assert(isString(object?.[key]), `${label}.${key} must be a nonempty string`);
}

function checkManifest() {
  const claudeMarket = readJson('.claude-plugin/marketplace.json');
  const codexMarket = readJson('.agents/plugins/marketplace.json');
  const claudePlugin = readJson('plugins/morvs/.claude-plugin/plugin.json');
  const codexPlugin = readJson('plugins/morvs/.codex-plugin/plugin.json');
  const mcp = readJson('plugins/morvs/.mcp.json');

  if (claudeMarket) {
    assert(claudeMarket.name === 'morvs', 'Claude marketplace name must be morvs');
    assert(Array.isArray(claudeMarket.plugins) && claudeMarket.plugins.length === 1, 'Claude marketplace must contain one plugin');
    const item = claudeMarket.plugins?.[0];
    assert(item?.name === 'morvs', 'Claude marketplace plugin name must be morvs');
    assert(item?.source === './plugins/morvs', 'Claude marketplace source must be ./plugins/morvs');
    checkString(item, 'description', 'Claude marketplace plugin');
    assert(item?.category === 'data', 'Claude marketplace category must be data');
    assert(item?.homepage === 'https://morvs.ai/api/', 'Claude marketplace homepage must link to the API');
    assert(isObject(claudeMarket.owner) && isString(claudeMarket.owner.name) && isString(claudeMarket.owner.email), 'Claude marketplace owner must have name and email');
  }

  if (codexMarket) {
    assert(codexMarket.name === 'morvs', 'Codex marketplace name must be morvs');
    assert(codexMarket.interface?.displayName === 'MORVS', 'Codex marketplace displayName must be MORVS');
    assert(Array.isArray(codexMarket.plugins) && codexMarket.plugins.length === 1, 'Codex marketplace must contain one plugin');
    const item = codexMarket.plugins?.[0];
    assert(item?.name === 'morvs', 'Codex marketplace plugin name must be morvs');
    assert(item?.source?.source === 'local' && item?.source?.path === './plugins/morvs', 'Codex marketplace source must be the local plugin path');
    assert(item?.policy?.installation === 'AVAILABLE' && item?.policy?.authentication === 'ON_INSTALL', 'Codex marketplace policy is incomplete');
    assert(item?.category === 'Data & Analytics', 'Codex marketplace category must be Data & Analytics');
  }

  for (const [label, manifest] of [['Claude plugin', claudePlugin], ['Codex plugin', codexPlugin]]) {
    if (!manifest) continue;
    for (const field of ['name', 'version', 'description', 'homepage', 'repository', 'license']) checkString(manifest, field, label);
    assert(manifest.name === 'morvs' && /^\d+\.\d+\.\d+$/.test(manifest.version ?? ''), `${label} name/version must be morvs and a semantic version`);
    assert(manifest.homepage === 'https://morvs.ai/api/', `${label} homepage must link to the API`);
    assert(manifest.repository === 'https://github.com/morvs-ai/morvs-plugins', `${label} repository is incorrect`);
    assert(manifest.license === 'MIT', `${label} license must be MIT`);
    assert(manifest.author?.name === 'MORVS' && manifest.author?.email === 'info@morvs.ai' && manifest.author?.url === 'https://morvs.ai/', `${label} author is incomplete`);
    assert(Array.isArray(manifest.keywords) && manifest.keywords.length > 0 && manifest.keywords.every(isString), `${label} keywords must be a nonempty string array`);
  }

  if (claudePlugin && codexPlugin) {
    assert(claudePlugin.version === codexPlugin.version, 'Claude and Codex plugin versions must match');
  }

  if (codexPlugin) {
    assert(codexPlugin.mcpServers === './.mcp.json', 'Codex plugin mcpServers must point to ./.mcp.json');
    const ui = codexPlugin.interface;
    for (const field of ['displayName', 'shortDescription', 'longDescription', 'developerName', 'category', 'websiteURL', 'privacyPolicyURL', 'termsOfServiceURL', 'brandColor', 'brandColorDark', 'composerIcon', 'logo', 'logoDark']) checkString(ui, field, `Codex plugin interface`);
    assert(ui?.displayName === 'MORVS' && ui?.developerName === 'MORVS' && ui?.category === 'Data & Analytics' && ui?.supportURL === 'https://morvs.ai/contact/', 'Codex plugin interface identity is incorrect');
    assert(ui?.capabilities?.includes('Read'), 'Codex plugin must advertise Read capability');
    assert(ui?.websiteURL === 'https://morvs.ai/' && ui?.privacyPolicyURL === 'https://morvs.ai/privacy/' && ui?.termsOfServiceURL === 'https://morvs.ai/terms/', 'Codex plugin policy links are incorrect');
    assert(ui?.brandColor === '#050607' && ui?.brandColorDark === '#EDF1F2', 'Codex plugin brand colors are incorrect');
    assert(Array.isArray(ui?.defaultPrompt) && ui.defaultPrompt.length === 3 && ui.defaultPrompt.every(isString), 'Codex plugin must have three short default prompts');
    for (const field of ['composerIcon', 'logo', 'logoDark']) {
      if (isString(ui?.[field])) assert(existsSync(join(pluginRoot, ui[field])), `Codex plugin ${field} target is missing`);
    }
  }

  if (mcp) {
    assert(mcp.mcpServers?.morvs?.type === 'http', 'MCP transport must be http');
    assert(mcp.mcpServers?.morvs?.url === 'https://api.morvs.ai/mcp', 'MCP URL is incorrect');
  }
}

function frontmatter(markdown, label) {
  const lines = markdown.split(/\r?\n/);
  if (lines[0] !== '---') {
    errors.push(`${label}: missing YAML frontmatter`);
    return {};
  }
  const end = lines.indexOf('---', 1);
  if (end < 0) {
    errors.push(`${label}: unclosed YAML frontmatter`);
    return {};
  }
  const fields = {};
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (match) fields[match[1]] = match[2].trim().replace(/^(?:"(.*)"|'(.*)')$/, (_, double, single) => double ?? single);
  }
  return fields;
}

function checkMarkdown() {
  const contents = [];
  const skillsRoot = join(pluginRoot, 'skills');
  const expectedSkills = ['public-records-research', 'compliance-screening', 'market-signals', 'dataset-finder'];
  for (const name of expectedSkills) {
    const label = `plugins/morvs/skills/${name}/SKILL.md`;
    try {
      const body = readFileSync(join(root, label), 'utf8');
      const fields = frontmatter(body, label);
      assert(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(fields.name ?? ''), `${label}: name must be kebab-case`);
      assert(fields.name === name, `${label}: name must equal its directory name`);
      assert(isString(fields.description) && fields.description.length <= 1024, `${label}: description must be 1–1024 characters`);
      assert(body.split(/\r?\n/).length <= 150, `${label}: skill exceeds 150 lines`);
      contents.push([label, body]);
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  }
  if (existsSync(skillsRoot)) {
    for (const item of readdirSync(skillsRoot, { withFileTypes: true })) {
      if (item.isDirectory()) assert(expectedSkills.includes(item.name), `Unexpected skill directory: ${item.name}`);
    }
  }

  const commandsRoot = join(pluginRoot, 'commands');
  const expectedCommands = ['entity.md', 'screen.md', 'datasets.md'];
  for (const name of expectedCommands) {
    const label = `plugins/morvs/commands/${name}`;
    try {
      const body = readFileSync(join(root, label), 'utf8');
      const fields = frontmatter(body, label);
      assert(isString(fields.description), `${label}: description is required`);
      contents.push([label, body]);
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  }
  if (existsSync(commandsRoot)) {
    for (const name of readdirSync(commandsRoot)) assert(expectedCommands.includes(name), `Unexpected command file: ${name}`);
  }
  return contents;
}

async function rpc(method, params, id) {
  const response = await fetch('https://api.morvs.ai/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`MCP ${method} returned HTTP ${response.status}`);
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  let data;
  if (contentType.includes('text/event-stream')) {
    const event = text.split(/\r?\n\r?\n/).find((part) => part.split(/\r?\n/).some((line) => line.startsWith('data:')));
    data = JSON.parse(event?.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('\n') ?? '');
  } else {
    data = JSON.parse(text);
  }
  if (data.error) throw new Error(`MCP ${method} error: ${JSON.stringify(data.error)}`);
  if (!isObject(data.result)) throw new Error(`MCP ${method} returned no result`);
  return data.result;
}

async function toolsFromServer() {
  let initialized = false;
  try {
    const result = await rpc('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'morvs-plugin-validator', version: '0.1.0' },
    }, 1);
    assert(result.serverInfo?.name === 'morvs', 'MCP initialize serverInfo.name must be morvs');
    initialized = true;
    const names = new Set();
    let cursor;
    for (let page = 0; page < 10; page += 1) {
      const result = await rpc('tools/list', cursor ? { cursor } : {}, page + 2);
      if (!Array.isArray(result.tools)) throw new Error('MCP tools/list returned no tools array');
      for (const tool of result.tools) {
        if (!isString(tool?.name)) throw new Error('MCP tools/list contains an unnamed tool');
        if (names.has(tool.name)) throw new Error(`MCP tools/list repeats ${tool.name}`);
        names.add(tool.name);
      }
      cursor = result.nextCursor;
      if (!cursor) {
        console.log(`LIVE MCP: initialize morvs; ${names.size} tools from tools/list`);
        return names;
      }
    }
    throw new Error('MCP tools/list exceeded 10 pages');
  } catch (error) {
    const offline = error instanceof TypeError || error?.name === 'TimeoutError' || /HTTP 50[234]/.test(error.message);
    if (!offline) throw error;
    const snapshot = readJson('scripts/tools-2026-10-25c.json');
    const tools = snapshot?.result?.tools;
    if (!Array.isArray(tools) || !tools.every((tool) => isString(tool?.name))) throw new Error('Bundled tools snapshot is invalid');
    console.log(`LIVE MCP UNAVAILABLE (${error.message}); using bundled 2026-10-25c tools/list snapshot (${tools.length} tools).${initialized ? '' : ' Initialize not verified live.'}`);
    return new Set(tools.map((tool) => tool.name));
  }
}

checkBundleFiles();
checkManifest();
const markdown = checkMarkdown();
let tools;
try {
  tools = await toolsFromServer();
} catch (error) {
  errors.push(error.message);
}
if (tools) {
  for (const [label, body] of markdown) {
    for (const match of body.matchAll(/`([a-z][a-z0-9_]*)`/g)) {
      assert(tools.has(match[1]), `${label}: backticked identifier ${match[1]} is not a live MCP tool`);
    }
  }
}
if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exitCode = 1;
} else {
  console.log(`PASS: plugin README, LICENSE and bundle files; 5 JSON manifests/configs, 4 skills, 3 commands, and all referenced MCP tools`);
}
