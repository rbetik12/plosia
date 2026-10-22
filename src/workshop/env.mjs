// Раздача готового .env участникам воркшопа.
import fs from 'node:fs';
import { Router } from 'express';
import { config } from '../config.mjs';
import { notFound } from '../lib/errors.mjs';

export const pages = Router();

// Ведущий кладёт готовый .env для участников в public/.env (в git он не попадает),
// участники забирают его по сети: curl -o .env http://<адрес ведущего>:3000/env
const sharedEnv = `${config.root}public/.env`;

pages.get('/env', (req, res, next) => {
  if (!fs.existsSync(sharedEnv)) return next(notFound('Ведущий ещё не выложил .env: положите его в public/.env'));
  res.download(sharedEnv, '.env', { dotfiles: 'allow' });
});
