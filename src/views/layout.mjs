import { html } from '../lib/html.mjs';

const logo = html`<svg class="logo__mark" viewBox="0 0 48 48" aria-hidden="true">
  <path d="M8 40V12l10 8h12l10-8v28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4Z" fill="currentColor"/>
  <circle cx="18" cy="29" r="2.6" fill="#fff"/><circle cx="30" cy="29" r="2.6" fill="#fff"/>
  <path d="M21.5 34.5c1.5 1.4 3.5 1.4 5 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;

export function layout(req, { title, page = 'page', body }) {
  return html`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title ? `${title} — Plosia` : 'Plosia — cats and everything for them'}</title>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap">
  <link rel="stylesheet" href="/css/style.css">
</head>
<body data-page="${page}" data-auth-expired="${req.authExpired ? '1' : ''}">
  <header class="topbar">
    <div class="topbar__inner container">
      <a class="logo" href="/">${logo}<span>Plosia</span></a>
      <nav class="nav">
        <a href="/cats">Cats</a>
        <a href="/food">Food</a>
      </nav>
      <div class="topbar__actions">
        ${req.user
          ? html`<a class="user-link" href="/account">${req.user.name.split(' ')[0]}</a>`
          : html`<a class="user-link" href="/login">Log in</a>`}
        <a class="cart-link" href="/cart">Cart <span class="cart-link__count" data-cart-count hidden>0</span></a>
      </div>
    </div>
  </header>
  <main class="container main">${body}</main>
  <footer class="footer">
    <div class="container footer__inner">
      <span>© ${new Date().getFullYear()} Plosia. Purring with love.</span>
      <span class="footer__muted">All the cats are real. The food too.</span>
    </div>
  </footer>
  <div class="toast" id="toast" role="status" hidden></div>
  <script type="module" src="/js/app.js"></script>
</body>
</html>`.toString();
}
