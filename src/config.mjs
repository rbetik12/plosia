import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const envFile = `${root}.env`;
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const pkg = JSON.parse(fs.readFileSync(`${root}package.json`, 'utf8'));

export const config = {
  root,
  version: pkg.version,
  env: process.env.NODE_ENV || 'development',
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT || 3000),
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
  },
};
