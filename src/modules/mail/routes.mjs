import { Router } from 'express';
import { html } from '../../lib/html.mjs';
import { layout } from '../../views/layout.mjs';
import { listOutbox } from './service.mjs';

export const pages = Router();

// Test mailbox: everything the shop has "sent" to customers.
pages.get('/mail', (req, res) => {
  const messages = listOutbox();
  const body = html`
  <h1>Test mailbox</h1>
  <p class="lead">Emails from the demo environment. They do not leave the system.</p>
  ${messages.length
    ? html`<div class="mailbox">${messages.map(
        (m) => html`
        <article class="mail">
          <header><b>${m.subject}</b><span class="muted">${m.to} · ${new Date(m.sentAt).toLocaleString('en-US')}</span></header>
          <pre>${m.text}</pre>
        </article>`,
      )}</div>`
    : html`<p class="muted">Empty for now. Place an order — the email will appear here.</p>`}`;
  res.send(layout(req, { title: 'Mail', page: 'mail', body }));
});
