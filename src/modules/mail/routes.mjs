import { Router } from 'express';
import { html } from '../../lib/html.mjs';
import { layout } from '../../views/layout.mjs';
import { listOutbox } from './service.mjs';

export const pages = Router();

// Тестовый почтовый ящик: всё, что магазин «отправил» покупателям.
pages.get('/mail', (req, res) => {
  const messages = listOutbox();
  const body = html`
  <h1>Тестовый почтовый ящик</h1>
  <p class="lead">Письма из демо-окружения. Наружу они не уходят.</p>
  ${messages.length
    ? html`<div class="mailbox">${messages.map(
        (m) => html`
        <article class="mail">
          <header><b>${m.subject}</b><span class="muted">${m.to} · ${new Date(m.sentAt).toLocaleString('ru-RU')}</span></header>
          <pre>${m.text}</pre>
        </article>`,
      )}</div>`
    : html`<p class="muted">Пока пусто. Оформите заказ — письмо появится здесь.</p>`}`;
  res.send(layout(req, { title: 'Почта', page: 'mail', body }));
});
