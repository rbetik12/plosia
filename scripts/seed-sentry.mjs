#!/usr/bin/env node
// Наполняет Sentry реалистичной историей ошибок для воркшопа.
//
// Скрипт поднимает настоящий сервер Plosia в «режиме посева» и гоняет через него
// сценарии сотен виртуальных покупателей. Ошибки возникают в реальном коде магазина,
// поэтому в Sentry попадают настоящие стектрейсы, маршруты и пользователи.
// Время событий разносится по последним дням, релиз — по дате выкатки 2.5.0.
//
//   npm run seed:sentry                 # стандартный объём (~500 событий)
//   npm run seed:sentry -- --scale=0.5  # вдвое меньше
//
// Запускайте утром в день воркшопа, чтобы запросы «за последние сутки/неделю» были содержательными.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envFile = path.join(root, '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

if (!process.env.SENTRY_DSN) {
  console.error('Нужен SENTRY_DSN в .env — без него событиям некуда уходить.');
  process.exit(1);
}

const scale = Number(process.argv.find((a) => a.startsWith('--scale='))?.split('=')[1] ?? 1);
const DAY = 24 * 60 * 60;
const now = Math.floor(Date.now() / 1000);
const WINDOW_START = now - 10 * DAY; // история за 10 дней
const RELEASE_25 = now - 7 * DAY; // 2.5.0 выкатили неделю назад
const OLD_RELEASE = 'plosia@2.4.0';
const NEW_RELEASE = 'plosia@2.5.0';

// ---------- случайности (детерминированные, чтобы прогоны были похожи) ----------
let seed = 20261022;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const n = (count) => Math.max(1, Math.round(count * scale));

// Время визита: днём и вечером по Москве покупают чаще, ночью — редко.
function visitTime(from, to = now - 15 * 60) {
  for (;;) {
    const ts = from + Math.floor(rand() * (to - from));
    const hourMsk = new Date((ts + 3 * 3600) * 1000).getUTCHours();
    const weight = hourMsk < 7 ? 0.15 : hourMsk < 10 ? 0.6 : hourMsk < 19 ? 0.9 : 1;
    if (rand() < weight) return ts;
  }
}

const FIRST = ['anna', 'ivan', 'olga', 'pavel', 'maria', 'dmitry', 'elena', 'sergey', 'nastya', 'artem', 'ksenia', 'egor', 'vera', 'kirill', 'alina', 'roman', 'daria', 'nikita', 'polina', 'gleb'];
const LAST = ['koshkina', 'murzin', 'pushkova', 'barsikov', 'kotov', 'usova', 'hvostov', 'lapkina', 'mirkin', 'sokolova', 'tigrov', 'ryzhova'];
const NAMES = ['Анна', 'Иван', 'Ольга', 'Павел', 'Мария', 'Дмитрий', 'Елена', 'Сергей', 'Настя', 'Артём', 'Ксения', 'Егор'];

// ---------- сервер в режиме посева ----------
const port = await freePort();
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['--import', './src/instrument.mjs', 'src/server.mjs'], {
  cwd: root,
  env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', PLOSIA_SEED_MODE: '1', SENTRY_ENVIRONMENT: 'production' },
  stdio: ['ignore', 'ignore', 'pipe'],
});
let serverErr = '';
server.stderr.on('data', (d) => (serverErr += d));
await waitForServer();

// ---------- HTTP-клиент «покупателя» с куками ----------
class Visitor {
  constructor(ts) {
    this.ts = ts;
    this.cookies = {};
  }

  release() {
    return this.ts < RELEASE_25 ? OLD_RELEASE : NEW_RELEASE;
  }

  async req(method, url, body) {
    this.ts = Math.min(this.ts + int(2, 25), now - 60); // между действиями проходит немного времени, но не в будущее
    const res = await fetch(base + url, {
      method,
      headers: {
        'content-type': 'application/json',
        cookie: Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; '),
        'x-seed-ts': String(this.ts),
        'x-seed-release': this.release(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(';');
      const eq = pair.indexOf('=');
      const value = pair.slice(eq + 1);
      if (value) this.cookies[pair.slice(0, eq)] = value;
      else delete this.cookies[pair.slice(0, eq)];
    }
    const data = await res.json().catch(() => ({}));
    stats.requests++;
    if (res.status >= 500) stats.errors5xx++;
    return { status: res.status, data };
  }

  async register() {
    const first = pick(FIRST);
    const email = `${first}.${pick(LAST)}${int(1, 999)}@example.com`;
    const r = await this.req('POST', '/api/auth/register', { email, password: 'meow-meow-1', name: pick(NAMES) });
    if (r.status !== 201) return this.req('POST', '/api/auth/login', { email, password: 'meow-meow-1' });
    return r;
  }

  login(email, password = 'meow1234') {
    return this.req('POST', '/api/auth/login', { email, password });
  }
}

const stats = { requests: 0, errors5xx: 0 };

// ---------- каталог: для подбора товаров ----------
const catalog = {
  cats: (await (await fetch(`${base}/api/catalog/cats`)).json()).items,
  food: (await (await fetch(`${base}/api/catalog/food`)).json()).items,
};
const filters = await (await fetch(`${base}/api/catalog/filters`)).json();

async function browse(v, kind, params) {
  const qs = new URLSearchParams(params).toString();
  return v.req('GET', `/api/catalog/${kind}${qs ? `?${qs}` : ''}`);
}

// Просмотр каталога с фильтрами, которые есть только в одном разделе.
async function browseSafely(v) {
  if (chance(0.5)) await browse(v, 'cats', { breed: pick(filters.cats.breeds).id });
  else await browse(v, 'food', { kind: pick(filters.food.kinds).id });
}

async function fillCart(v, { foodCount = int(1, 3), withCat = chance(0.25) } = {}) {
  for (let i = 0; i < foodCount; i++) await v.req('POST', '/api/cart/items', { productId: pick(catalog.food).id, qty: int(1, 3) });
  if (withCat) await v.req('POST', '/api/cart/items', { productId: pick(catalog.cats).id });
  return (await v.req('GET', '/api/cart')).data;
}

const CONTACTS = () => ({ name: pick(NAMES), phone: `+7 9${int(10, 99)} ${int(100, 999)}-${int(10, 99)}-${int(10, 99)}`, email: `buyer${int(1, 9999)}@example.com` });
const CARD = { number: '4242 4242 4242 4242', expiry: '12/29', cvc: '123' };

async function checkoutCourier(v) {
  const order = await v.req('POST', '/api/checkout', {
    contacts: CONTACTS(),
    delivery: { type: 'courier', city: pick(['Москва', 'Санкт-Петербург', 'Екатеринбург']), address: `ул. Кошачья, ${int(1, 99)}` },
  });
  if (order.status !== 201) return order;
  return v.req('POST', '/api/checkout/pay', { orderId: order.data.order.id, card: CARD });
}

// ---------- сценарии ----------
const scenarios = {
  // Обычная покупка с курьером. Иногда шлюз оплаты не отвечает вовремя, иногда сбоит почта.
  // До 2.5.0 оплату не прогоняем: таймаут шлюза тогда был другим, и сообщения об ошибке не совпали бы.
  async purchase(ts) {
    const v = new Visitor(ts);
    await browseSafely(v);
    await v.register();
    await fillCart(v);
    if (ts >= RELEASE_25) await checkoutCourier(v);
  },

  // Промокод, введённый маленькими буквами, и смена количества в корзине.
  async promoLowercaseQty(ts) {
    const v = new Visitor(ts);
    const cart = await fillCart(v, { foodCount: int(2, 3), withCat: chance(0.3) });
    await v.req('POST', '/api/cart/promo', { code: pick(['meow10', 'Meow10', 'kitten50', 'murr15', 'fish300']) });
    const food = cart.items.find((i) => i.type === 'food');
    if (!food) return;
    for (let i = 0, tries = int(1, 3); i < tries; i++) {
      await v.req('PATCH', `/api/cart/items/${food.id}`, { qty: Math.min(food.qty + i + 1, 20) });
    }
  },

  // Тот же путь с кодом заглавными — ошибок нет, нужен для правдоподобного фона.
  async promoUppercaseQty(ts) {
    const v = new Visitor(ts);
    const cart = await fillCart(v, { foodCount: 2, withCat: false });
    await v.req('POST', '/api/cart/promo', { code: pick(['MEOW10', 'KITTEN50']) });
    const food = cart.items.find((i) => i.type === 'food');
    if (food) await v.req('PATCH', `/api/cart/items/${food.id}`, { qty: food.qty + 1 });
  },

  // Промокоды с ошибками ввода — 4xx, которые маркетинг попросил слать в Sentry.
  async promoRejected(ts) {
    const v = new Visitor(ts);
    await fillCart(v, { foodCount: 1, withCat: false });
    await v.req('POST', '/api/cart/promo', { code: pick(['AUTUMN25', 'AUTUMN25', 'MURR15', 'FISH300', 'CATS2026', 'MEOW100']) });
  },

  // Самовывоз: Казань и Новосибирск.
  async pickupBroken(ts) {
    const v = new Visitor(ts);
    await v.register();
    await fillCart(v, { foodCount: int(1, 2) });
    const city = pick(['Казань', 'Казань', 'Новосибирск']);
    for (let i = 0, tries = int(1, 2); i < tries; i++) {
      await v.req('GET', `/api/checkout/pickup-points?city=${encodeURIComponent(city)}`);
    }
    if (chance(0.5)) await checkoutCourier(v); // часть людей сдаётся и выбирает курьера
  },

  // Самовывоз там, где всё работает.
  async pickupOk(ts) {
    const v = new Visitor(ts);
    await v.register();
    await fillCart(v, { foodCount: 1 });
    const city = pick(['Москва', 'Санкт-Петербург', 'Екатеринбург']);
    const points = await v.req('GET', `/api/checkout/pickup-points?city=${encodeURIComponent(city)}`);
    const point = points.data.items?.[0];
    if (!point) return;
    const order = await v.req('POST', '/api/checkout', { contacts: CONTACTS(), delivery: { type: 'pickup', city, pointId: point.id } });
    if (order.status === 201) await v.req('POST', '/api/checkout/pay', { orderId: order.data.order.id, card: CARD });
  },

  // Фильтр, общий для котиков и корма, в обоих разделах в течение минуты.
  async sharedFilter(ts) {
    const v = new Visitor(ts);
    const params = chance(0.6) ? { age: pick(['kitten', 'adult', 'senior']) } : { price_max: pick(['3000', '5000', '50000']) };
    const [first, second] = chance(0.65) ? ['food', 'cats'] : ['cats', 'food'];
    await browse(v, first, params);
    await browse(v, second, params);
  },

  // Покупатель, вошедший до выкатки 2.5.0: старый refresh-токен.
  async staleSession(ts) {
    const v = new Visitor(ts);
    v.cookies.plosia_rt = legacyRefreshToken(`u-${int(2000, 2400)}`);
    await v.req('POST', '/api/auth/refresh');
    if (chance(0.2)) await v.req('POST', '/api/auth/refresh');
    await browseSafely(v);
  },

  // Покупатели, у которых в старых заказах есть снятый с продажи корм, открывают чек.
  async oldReceipt(ts) {
    const v = new Visitor(ts);
    const [email, orderId] = pick([
      ['murka@plosia.dev', 'PL-10412'],
      ['barsik@plosia.dev', 'PL-10398'],
      ['sonya@plosia.dev', 'PL-10377'],
    ]);
    await v.login(email);
    await v.req('GET', '/api/orders');
    await v.req('GET', `/api/orders/${orderId}/receipt`);
  },
};

// Старые refresh-токены выпускались без kid в заголовке и подписывались JWT_SECRET.
function legacyRefreshToken(sub) {
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const iat = RELEASE_25 - int(1, 20) * DAY;
  const data = `${enc({ alg: 'HS256', typ: 'JWT' })}.${enc({ sub, type: 'refresh', iat, exp: iat + 30 * DAY })}`;
  const secret = process.env.JWT_SECRET || 'plosia-dev-secret';
  return `${data}.${crypto.createHmac('sha256', secret).update(data).digest('base64url')}`;
}

// ---------- план прогона ----------
// [сценарий, сколько визитов, период]
const plan = [
  ['purchase', n(40), 'before'],
  ['oldReceipt', n(4), 'before'],
  ['purchase', n(170), 'after'],
  ['promoLowercaseQty', n(72), 'after'],
  ['promoUppercaseQty', n(30), 'after'],
  ['promoRejected', n(45), 'after'],
  ['pickupBroken', n(42), 'after'],
  ['pickupOk', n(25), 'after'],
  ['sharedFilter', n(28), 'after'],
  ['staleSession', n(80), 'after'],
  ['oldReceipt', n(6), 'after'],
];

const jobs = [];
for (const [name, count, period] of plan) {
  for (let i = 0; i < count; i++) {
    const ts = period === 'before' ? visitTime(WINDOW_START, RELEASE_25 - 600) : visitTime(RELEASE_25 + 1800);
    jobs.push({ name, ts });
  }
}
// sharedFilter опирается на общий кэш, поэтому прогоняем его отдельно, по одному.
const sequential = jobs.filter((j) => j.name === 'sharedFilter');
const parallel = jobs.filter((j) => j.name !== 'sharedFilter').sort(() => rand() - 0.5);

console.log(`Plosia → Sentry: ${jobs.length} визитов, ~10 дней истории, релиз 2.5.0 — ${new Date(RELEASE_25 * 1000).toLocaleString('ru-RU')}`);

const started = Date.now();
let done = 0;
const progress = () => process.stdout.write(`\r  визитов: ${done}/${jobs.length}, запросов: ${stats.requests}, 5xx: ${stats.errors5xx}`);

await runPool(parallel, 6, async (job) => {
  await scenarios[job.name](job.ts);
  done++;
  progress();
});
for (const job of sequential) {
  await scenarios[job.name](job.ts);
  done++;
  progress();
}

console.log('\n  Отправляем события в Sentry...');
const { flushed } = await (await fetch(`${base}/__seed/flush`, { method: 'POST' })).json();
server.kill();
if (!flushed) console.warn('  Не все события успели уйти в Sentry — проверьте интернет и запустите ещё раз.');
console.log(`Готово за ${Math.round((Date.now() - started) / 1000)} с. Ответов 5xx: ${stats.errors5xx}.`);
console.log('События появятся в Sentry в течение минуты.');
process.exit(0);

// ---------- утилиты ----------
async function runPool(items, size, worker) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) await worker(queue.shift());
    }),
  );
}

function freePort() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port: p } = srv.address();
      srv.close(() => resolve(p));
    });
  });
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`${base}/healthz`);
      if (res.ok) return;
    } catch {
      // ещё стартует
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  console.error('Сервер не поднялся:\n' + serverErr);
  server.kill();
  process.exit(1);
}
