// Страница для ведущего воркшопа: адрес магазина в сети, как подключиться, задания.
import fs from 'node:fs';
import os from 'node:os';
import { Router } from 'express';
import { config } from '../config.mjs';
import { notFound } from '../lib/errors.mjs';
import { html } from '../lib/html.mjs';
import { layout } from '../views/layout.mjs';

export const pages = Router();

// Ведущий кладёт готовый .env для участников в public/.env (в git он не попадает),
// участники забирают его по сети: curl -o .env http://<адрес ведущего>:3000/env
const sharedEnv = `${config.root}public/.env`;

pages.get('/env', (req, res, next) => {
  if (!fs.existsSync(sharedEnv)) return next(notFound('Ведущий ещё не выложил .env: положите его в public/.env'));
  res.download(sharedEnv, '.env', { dotfiles: 'allow' });
});

pages.get('/workshop', (req, res) => {
  const urls = lanAddresses().map((ip) => `http://${ip}:${config.port}`);
  const envUrl = `${urls[0] ?? `http://localhost:${config.port}`}/env`;
  const repo = config.workshop.repoUrl;
  const body = html`
  <section class="workshop">
    <div class="hero">
      <div class="hero__text">
        <p class="eyebrow">Воркшоп «AI для QA-инженеров»</p>
        <h1>Пишем QA-скиллы на <span class="accent">Plosia</span></h1>
        <p class="lead">Магазин котиков — монолит на Node.js. В нём есть релизы, коммиты и живые ошибки в Sentry. Всё, что нужно для двух скиллов.</p>
      </div>
      <div class="hero__photo"><img src="/img/hero/hero-02.jpg" alt="Котята играют"></div>
    </div>

    <div class="ws-grid">
      <article class="ws-card">
        <h2>1. Откройте магазин</h2>
        ${urls.length
          ? urls.map((url) => html`<p class="ws-url"><a href="${url}">${url}</a></p>`)
          : html`<p class="ws-url">http://localhost:${config.port}</p>`}
        <p class="muted">Демо-аккаунт: <code>qa@plosia.dev</code> / <code>qa123456</code></p>
      </article>

      <article class="ws-card">
        <h2>2. Возьмите проект</h2>
        <pre class="ws-code">git clone ${repo}.git
cd plosia
npm install
${fs.existsSync(sharedEnv) ? `curl -o .env ${envUrl}` : 'npm run setup   # токен Sentry — у ведущего'}
npm run doctor</pre>
      </article>

      <article class="ws-card">
        <h2>3. Задание 1 — regression-plan</h2>
        <p>Скилл составляет план регресса по реальным коммитам релиза.</p>
        <pre class="ws-code">git log v2.4.0..v2.5.0 --stat</pre>
        <p class="muted">Зоны риска, затронутые модули, кейсы P1–P3, что можно не проверять.</p>
      </article>

      <article class="ws-card">
        <h2>4. Задание 2 — sentry-500-report</h2>
        <p>Сначала подключите Sentry MCP к своему агенту — сами, токен лежит в <code>.env</code>.</p>
        <pre class="ws-code">npx @sentry/mcp-server@0.42.0
SENTRY_ACCESS_TOKEN — из .env
org rbetik · project plosia</pre>
        <p>Потом скилл собирает отчёт о 5xx: эндпоинт, события, пользователи, приоритет.</p>
        <p class="muted">Бонус: найти виновный коммит и написать баг-репорты для топ-3.</p>
      </article>
    </div>

    <p class="muted">Подробности — в <code>README.md</code> в репозитории.</p>
  </section>`;
  res.send(layout(req, { title: 'Воркшоп', page: 'workshop', body }));
});

function lanAddresses() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => i.address);
}
