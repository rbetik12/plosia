#!/usr/bin/env node
// Checks that your environment is ready.
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

let failed = 0;
const ok = (msg) => console.log(`  ✔ ${msg}`);
const bad = (msg, hint) => {
  failed++;
  console.log(`  ✘ ${msg}${hint ? `\n      → ${hint}` : ''}`);
};

console.log('\nChecking the Plosia environment\n');

const [major, minor] = process.versions.node.split('.').map(Number);
if (major > 22 || (major === 22 && minor >= 13)) ok(`Node.js ${process.versions.node}`);
else bad(`Node.js ${process.versions.node} — 22.13 or newer is required`, 'update Node.js: https://nodejs.org');

try {
  const tags = execFileSync('git', ['tag', '--list', 'v*'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  if (tags.length >= 3) ok(`git release tags: ${tags.join(', ')}`);
  else bad('no release tags found (v2.3.0, v2.4.0, v2.5.0)', 'run `git fetch --tags`');
} catch {
  bad('git not found, or this is not a git repository', 'clone the project with git clone');
}

if (fs.existsSync(path.join(root, 'node_modules', 'express'))) ok('dependencies installed');
else bad('dependencies not installed', 'run `npm install`');

if (fs.existsSync(path.join(root, 'node_modules', '@sentry', 'mcp-server'))) ok('Sentry MCP server installed');
else bad('Sentry MCP server not installed', 'run `npm install`');

const token = process.env.SENTRY_ACCESS_TOKEN?.trim();
if (!token || token.includes('PASTE')) {
  bad('no SENTRY_ACCESS_TOKEN in .env', 'copy .env.example to .env and paste your Sentry token');
} else {
  const host = process.env.SENTRY_HOST || 'sentry.io';
  const url = `https://${host}/api/0/organizations/${process.env.SENTRY_ORG}/projects/`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) ok(`Sentry token works (${process.env.SENTRY_ORG}/${process.env.SENTRY_PROJECT})`);
    else bad(`Sentry responds ${res.status} to a request with the token`, 'check the token in .env or generate a new one');
  } catch (err) {
    bad(`Sentry is unreachable: ${err.message}`, 'check your internet connection');
  }
  if (await mcpStarts(token)) ok('Sentry MCP starts with your token (connecting it to your agent is a separate step — see README)');
  else bad('Sentry MCP did not start', 'run `npx @sentry/mcp-server@0.42.0 --access-token=<token from .env>` and look at the error');
}

console.log(failed ? `\nProblems found: ${failed}\n` : '\nAll set, you can start writing skills!\n');
process.exit(failed ? 1 : 0);

// We start the server directly, without agent configs: this checks the package and the token, not the connection.
function mcpStarts(token) {
  return new Promise((resolve) => {
    const args = ['--skills=inspect'];
    if (process.env.SENTRY_ORG) args.push(`--organization-slug=${process.env.SENTRY_ORG}`);
    if (process.env.SENTRY_PROJECT) args.push(`--project-slug=${process.env.SENTRY_PROJECT}`);
    if (process.env.SENTRY_HOST) args.push(`--host=${process.env.SENTRY_HOST}`);
    const server = path.join(root, 'node_modules', '@sentry', 'mcp-server', 'dist', 'index.js');
    const child = spawn(process.execPath, [server, ...args], {
      cwd: root,
      env: { ...process.env, SENTRY_ACCESS_TOKEN: token },
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const send = (msg) => child.stdin.write(JSON.stringify({ jsonrpc: '2.0', ...msg }) + '\n');
    let buffer = '';
    let finished = false;
    const done = (result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      child.kill();
      resolve(result);
    };
    const timer = setTimeout(() => done(false), 20000);
    child.on('exit', () => done(false));
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      let newline;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        let msg;
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }
        if (msg.id === 1) {
          send({ method: 'notifications/initialized' });
          send({ id: 2, method: 'tools/list' });
        }
        if (msg.id === 2) done(Array.isArray(msg.result?.tools) && msg.result.tools.length > 0);
      }
    });
    send({
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'plosia-doctor', version: '1' } },
    });
  });
}
