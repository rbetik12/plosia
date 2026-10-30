import { html } from '../../lib/html.mjs';
import { layout } from '../layout.mjs';

export function errorPage(req, { status, message }) {
  const body = html`
  <section class="empty">
    <div class="empty__code">${status}</div>
    <h1>${status === 404 ? 'Nobody here' : 'A cat knocked over the server'}</h1>
    <p class="lead">${message}</p>
    <a class="btn btn--primary" href="/">Back to home</a>
  </section>`;

  return layout(req, { title: String(status), page: 'error', body });
}
