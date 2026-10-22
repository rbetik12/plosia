#!/usr/bin/env node
// Готовит .env для участника воркшопа: спрашивает токен Sentry и проверяет, что он работает.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(root, '.env');
const exampleFile = path.join(root, '.env.example');

if (!fs.existsSync(envFile)) {
  fs.copyFileSync(exampleFile, envFile);
  console.log('Создал .env из .env.example');
}
process.loadEnvFile(envFile);

const current = process.env.SENTRY_ACCESS_TOKEN?.trim();
const hasToken = current && !current.includes('PASTE');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const prompt = hasToken
  ? 'Токен Sentry уже есть в .env. Enter — оставить, или вставьте новый: '
  : 'Вставьте токен Sentry от ведущего (начинается с sntryu_): ';
const answer = (await rl.question(prompt)).trim();
rl.close();

const token = answer || current;
if (!token || token.includes('PASTE')) {
  console.error('Токен не задан. Попросите его у ведущего и запустите `npm run setup` ещё раз.');
  process.exit(1);
}

if (answer) {
  const text = fs.readFileSync(envFile, 'utf8');
  const line = `SENTRY_ACCESS_TOKEN=${token}`;
  const next = /^SENTRY_ACCESS_TOKEN=.*$/m.test(text)
    ? text.replace(/^SENTRY_ACCESS_TOKEN=.*$/m, line)
    : `${text.trimEnd()}\n${line}\n`;
  fs.writeFileSync(envFile, next);
  console.log('Сохранил токен в .env (файл в .gitignore, в git он не попадёт).');
}

const org = process.env.SENTRY_ORG;
const project = process.env.SENTRY_PROJECT;
const host = process.env.SENTRY_HOST || 'sentry.io';
try {
  const res = await fetch(`https://${host}/api/0/organizations/${org}/projects/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Sentry ответил ${res.status}`);
  const projects = await res.json();
  if (!projects.some((p) => p.slug === project)) {
    throw new Error(`в организации ${org} нет проекта ${project}`);
  }
  console.log(`\nГотово: токен работает, проект ${org}/${project} доступен.`);
  console.log('С этим токеном в задании 2 вы подключите Sentry MCP к своему агенту.');
} catch (err) {
  console.error(`\nТокен сохранён, но проверить доступ не удалось: ${err.message}`);
  console.error('Проверьте токен и интернет, затем запустите `npm run doctor`.');
  process.exit(1);
}
