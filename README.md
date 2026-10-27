# Plosia

Интернет-магазин котиков и кошачьего корма — учебный проект для воркшопа «AI для QA-инженеров».

Монолит на Node.js + Express. В репозитории есть настоящие релизы с историей коммитов, ошибки продакшена в Sentry и токен для Sentry MCP — всё, чтобы писать QA-скиллы для Claude Code, Codex или Cursor.

## Как начать

Нужны Node.js 22.13+ и git. Сделайте `npm install` заранее, до воркшопа: Sentry MCP-сервер весит около 130 МБ, на общем Wi-Fi это будет долго.

### 1. Установка

```bash
git clone https://github.com/rbetik12/plosia.git
cd plosia
git fetch --tags
npm install          # магазин и Sentry MCP-сервер
```

### 2. Конфигурация

Готовый `.env` с доступом к Sentry лежит на сервере ведущего. Скачайте его в корень проекта:

```
http://<адрес ведущего>:3000/env
```

Адрес ведущий покажет на экране — он же есть на странице `http://<адрес ведущего>:3000/workshop`.

### 3. Проверка

```bash
npm run doctor       # всё должно быть зелёным
```

Откройте папку `plosia` в своём агенте. Sentry MCP вы подключите сами в задании 2 — токен уже лежит в `.env`. Задания и подсказки ниже.
Магазин можно открыть у ведущего по адресу в локальной сети.

## Что внутри
```
src/
  modules/      catalog, cart, checkout, auth, orders, mail — модули монолита
  lib/          общий код: ошибки, JWT, деньги, html-шаблоны
  data/         котики, корм, промокоды, пункты выдачи, демо-заказы
  workshop/     страница /workshop и режим посева ошибок для Sentry
public/         стили, JS и фотографии
scripts/        setup, doctor, seed-sentry
docs/qa/        правила QA-команды: severity, приоритеты, зоны риска
```

Релизы — git-теги `v2.3.0`, `v2.4.0`, `v2.5.0`. В продакшене — 2.5.0.

# Воркшоп: пишем QA-скиллы на Plosia

Команды по 3–4 человека. Один за клавиатурой, остальные пишут правила, готовят входные данные и проверяют результат. Инструмент — любой: Claude Code, Codex, Cursor или другой агент.

Откройте папку `plosia` в своём агенте.

Магазин можно открыть у ведущего (адрес покажут на экране).

Скиллы должны быть в папке для соотвествующего агента. Например, для Claude Code скилл нужно положить в `.claude/skills/<название скилла>/SKILL.md`.

Шаблон для написания скилла находится в файле [SKILL_TEMPLATE.md](SKILL_TEMPLATE.md)

## Задание 1. Скилл `regression-plan` (45 минут)

Необоходимо сделать скилл, который составляет план регрисионного тестирования по коммитам из последнего релиза.

Опирайтесь на правила команды: `docs/qa/risk-zones.md`, `docs/qa/severity.md`.

**Результат работы скилла:**

- **Зоны риска** — что может сломаться в релизе и почему
- **Затронутые модули** — куда в монолите попадают изменения
- **Кейсы с приоритетом** — P1 обязательно, P3 если останется время


## Задание 2. Скилл `sentry-500-report` (45 минут)

### Часть 1. Подключите Sentry MCP (10 минут)

Готового конфига в проекте нет — подключите сервер к своему агенту сами. Всё, что для этого нужно:

| Что | Значение |
|---|---|
| Сервер | npm-пакет `@sentry/mcp-server@0.42.0`. Уже установлен после `npm install` |
| Токен | `SENTRY_ACCESS_TOKEN` из вашего `.env`, только на чтение. Серверу передаётся переменной окружения с тем же именем |
| Организация и проект | `rbetik` и `plosia` — флаги `--organization-slug` и `--project-slug` |
| Инструменты | `--skills=inspect` — только поиск и чтение |

Как добавить MCP-сервер: [Claude Code](https://code.claude.com/docs/en/mcp) · [Codex](https://developers.openai.com/codex/mcp) · [Cursor](https://cursor.com/docs/context/mcp).

Официальный гайд Sentry по установке MCP: [Sentry MCP](https://mcp.sentry.dev/?transport=stdio&ide=claude-code) (OPENAI_API_KEY не нужен)

Токен не должен попасть в git. Храните его в локальных настройках агента: у Claude Code это scope `local` (он по умолчанию), у Codex — `~/.codex/config.toml`, у Cursor — `.cursor/mcp.json` в проекте (он в `.gitignore`).

**Готово, когда** агент видит сервер `sentry` и его инструменты (`/mcp` в Claude Code и Codex, Settings → MCP в Cursor), а на вопрос «сколько 500-х было в Sentry за неделю?» отвечает числами из Sentry.

<details>
<summary>Застряли? Готовые команды</summary>

Подставьте токен из `.env` вместо `<токен>`. Команды запускайте из корня проекта — тогда `npx` возьмёт уже установленный пакет.

**Claude Code**

```bash
claude mcp add sentry -e SENTRY_ACCESS_TOKEN=<токен> -- npx -y @sentry/mcp-server@0.42.0 --skills=inspect --organization-slug=rbetik --project-slug=plosia
```

Перезапустите `claude`, проверьте — `/mcp`.

**Codex**

```bash
codex mcp add sentry --env SENTRY_ACCESS_TOKEN=<токен> -- npx -y @sentry/mcp-server@0.42.0 --skills=inspect --organization-slug=rbetik --project-slug=plosia
```

Перезапустите `codex`, проверьте — `/mcp`. Если сервер не успевает стартовать, добавьте `startup_timeout_sec = 30` в секцию `[mcp_servers.sentry]` файла `~/.codex/config.toml`.

**Cursor** — файл `.cursor/mcp.json` в корне проекта (сервер берётся из `node_modules`, без скачивания):

```json
{
  "mcpServers": {
    "sentry": {
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@sentry/mcp-server/dist/index.js", "--skills=inspect", "--organization-slug=rbetik", "--project-slug=plosia"],
      "env": { "SENTRY_ACCESS_TOKEN": "<токен>" }
    }
  }
}
```

Settings → MCP → включите `sentry`.

</details>

### Часть 2. Напишите скилл (35 минут)

**Вход:** issues с 5xx из Sentry за период — через подключённый Sentry MCP, доступ только на чтение.

**Результат:**

- **Сводка** — сколько ошибок и что горит
- **Таблица** — эндпоинт, события, пользователи, приоритет P1–P3
- **Бонус:** по коммитам найти вероятного виновника каждой ошибки

Подсказки по Sentry:

- `search_issues` — список issue с числом пользователей; `search_events` — подсчёты и группировки (dataset `errors`).
- Синтаксис запросов: `http.status_code:500`, `level:error`, `release:plosia@2.5.0`, `firstSeen:-7d`, `environment:production`.
- У событий есть теги `http.status_code` и `endpoint`.

## Куда класть скиллы

```
Claude Code:                  Codex:
.claude/skills/               .agents/skills/
└── regression-plan/          └── regression-plan/
    └── SKILL.md                  └── SKILL.md
```

Скелет — [`SKILL_TEMPLATE.md`](SKILL_TEMPLATE.md).

## Скилл готов, если…

На прогонах:

- [ ] срабатывает на обычной фразе, без имени скилла
- [ ] прогнан на 2–3 разных входах
- [ ] со скиллом заметно лучше, чем без

В SKILL.md:

- [ ] description: что делает и когда включать
- [ ] есть шаги, формат и пример результата
- [ ] сказано, что делать при нехватке данных

## Защита (3–4 минуты на команду)

1. Покажите SKILL.md: description, шаги, формат — почему именно так.
2. Запустите вживую обычной фразой, на данных Plosia.
3. Расскажите о провалах: где модель ошибалась и какое правило это исправило.

## Если что-то не работает

| Симптом | Что сделать |
|---|---|
| `npm run doctor` ругается на Node.js | Нужен Node.js 22.13+ |
| MCP-сервер `sentry` не подключается | Запустите команду сервера из своего конфига прямо в терминале, с `SENTRY_ACCESS_TOKEN`, — увидите ошибку. `npm run doctor` проверит токен и пакет, `npm run setup` — заново ввести токен |
| Агент не видит `sentry` после добавления | Перезапустите агента и проверьте `/mcp` (в Cursor — Settings → MCP) |
| Windows: сервер через `npx` не стартует | Запускайте через `cmd /c`: `cmd /c npx -y @sentry/mcp-server@0.42.0 …` |
| Нет тегов `v2.x.x` | `git fetch --tags` |
| В Sentry пусто | Проверьте период: события за последние 10 дней |

