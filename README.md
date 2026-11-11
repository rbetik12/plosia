# Plosia

Интернет-магазин котиков и кошачьего корма — учебный проект для воркшопа «AI для QA-инженеров».

Монолит на Node.js + Express.

## Подготовка

Нужны Node.js 22.13+ и git.

### 1. До воркшопа: скачайте проект и установите зависимости

Сделайте это заранее: Sentry MCP-сервер весит около 130 МБ.

```bash
git clone https://github.com/rbetik12/plosia.git
cd plosia
git fetch --tags
npm install          # магазин и Sentry MCP-сервер
npm run doctor
```

Пока `.env` нет, `npm run doctor` покажет одну проблему: «в .env нет SENTRY_ACCESS_TOKEN». Это нормально, токен опубликуют в телеграм-канале воркшопа. Остальные строки должны быть зелёными.

### 2. Подключите Sentry MCP

Для задания 2 агенту нужен MCP-сервер `sentry`: через него он читает ошибки продакшена. Готового конфига в проекте нет — подключите сервер к своему агенту сами. Всё, что для этого нужно:

| Что | Значение |
|---|---|
| Сервер | npm-пакет `@sentry/mcp-server@0.42.0`. Уже установлен после `npm install` |
| Токен | `SENTRY_ACCESS_TOKEN` из вашего `.env`, только на чтение. Серверу передаётся переменной окружения с тем же именем |
| Организация и проект | `rbetik` и `plosia` — флаги `--organization-slug` и `--project-slug` |
| Инструменты | `--skills=inspect` — только поиск и чтение |

Как добавить MCP-сервер: [Claude Code](https://code.claude.com/docs/en/mcp) · [Codex](https://developers.openai.com/codex/mcp) · [Cursor](https://cursor.com/docs/context/mcp).

Официальный гайд Sentry по установке MCP: [Sentry MCP](https://mcp.sentry.dev/?transport=stdio&ide=claude-code) (OPENAI_API_KEY не нужен)

Храните токен в локальных настройках агента: у Claude Code это `.mcp.json` в проекте, у Codex — `~/.codex/config.toml`, у Cursor — `.cursor/mcp.json` в проекте.

Настройка завершена, когда агент видит сервер `sentry` и его инструменты (`/mcp` в Claude Code и Codex, Customize в Cursor), а на вопрос «сколько 500-х было в Sentry за неделю?» отвечает числами из Sentry.

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

**Cursor** — команды нет, сервер настраивается файлом: см. раздел ниже.

</details>

<details>
<summary>Настройка вручную</summary>

Для десктопных версий: Claude Desktop (вкладка Code), приложение ChatGPT с Codex, Cursor. Везде один порядок: создать файл конфига, подставить токен из `.env` вместо `<токен>`, полностью перезапустить приложение.

`npm install` всё равно нужен. Если терминала нет, попросите агента выполнить его прямо в чате.

**Claude Desktop, вкладка Code** — файл `.mcp.json` в корне проекта.

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server@0.42.0", "--skills=inspect"],
      "env": { "SENTRY_ACCESS_TOKEN": "<токен>" }
    }
  }
}
```

Если приложение спросит, разрешать ли сервер из `.mcp.json`, разрешите. Чат Claude Desktop этот файл не читает: для него та же секция `mcpServers` добавляется в `claude_desktop_config.json` (Settings → Developer → Edit Config). Сервер оттуда появится и во вкладке Code, так что второй файл не нужен.

**Codex (приложение ChatGPT, расширение для IDE)** — файл `~/.codex/config.toml`, в Windows `%USERPROFILE%\.codex\config.toml`. Он лежит вне репозитория и общий для всех клиентов Codex. Если файла нет, создайте его. Если есть, допишите в конец, не затирая остальное:

```toml
[mcp_servers.sentry]
command = "npx"
args = ["-y", "@sentry/mcp-server@0.42.0", "--skills=inspect"]
startup_timeout_sec = 30

[mcp_servers.sentry.env]
SENTRY_ACCESS_TOKEN = "<токен>"
```

**Cursor** — файл `.cursor/mcp.json` в корне проекта. Сервер берётся из `node_modules`, без скачивания:

```json
{
  "mcpServers": {
    "sentry": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/node_modules/@sentry/mcp-server/dist/index.js", "--skills=inspect"],
      "env": { "SENTRY_ACCESS_TOKEN": "<токен>" }
    }
  }
}
```

Откройте Customize в боковой панели (в старых версиях Settings → MCP) и включите `sentry`.

**Windows.** В конфигах Claude и Codex запускайте `npx` через `cmd`: `command` — `cmd`, а в начало `args` добавьте `/c` и `npx`.

**Проверка.** Спросите агента: «сколько 500-х было в Sentry за неделю?». В ответе должны быть числа из Sentry.

</details>

## Запуск магазина

Магазин можно открыть у ведущего по адресу в локальной сети или запустить у себя: `npm start` → http://localhost:3000.

## Если что-то не работает

| Симптом | Что сделать |
|---|---|
| `npm run doctor` ругается на Node.js | Нужен Node.js 22.13+ |
| Нет тегов `v2.x.x` | `git fetch --tags` |
| `npm install` долго качает или падает | Повторите на стабильной сети: больше всего весит Sentry MCP-сервер |
| `npm run doctor`: нет `SENTRY_ACCESS_TOKEN` | До воркшопа так и должно быть. На воркшопе скачайте `.env` или выполните `npm run setup` |
| `npm run doctor`: Sentry отвечает 401 или 403 | Токен в `.env` неверный — скачайте `.env` заново или попросите новый у ведущего |
| MCP-сервер `sentry` не подключается | Запустите команду сервера из своего конфига прямо в терминале, с `SENTRY_ACCESS_TOKEN`, — увидите ошибку. `npm run doctor` проверит токен и пакет, `npm run setup` — заново ввести токен |
| Агент не видит `sentry` после добавления | Перезапустите агента и проверьте `/mcp` (в Cursor — Customize) |
| Приложение не находит `npx` или `node` | Приложения, запущенные не из терминала, часто не видят `PATH` (особенно с nvm). В `command` укажите полный путь к `node` (`which node`, в Windows `where node`), а первым элементом `args` — полный путь к `node_modules/@sentry/mcp-server/dist/index.js` вместо `-y` и имени пакета |
