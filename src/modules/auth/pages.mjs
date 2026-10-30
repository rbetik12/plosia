import { html } from '../../lib/html.mjs';
import { layout } from '../../views/layout.mjs';

export function loginPage(req, { next }) {
  const body = html`
  <section class="auth" data-next="${next}">
    <div class="auth__card">
      <div class="tabs" role="tablist">
        <button class="tabs__btn is-active" data-tab="login" role="tab">Log in</button>
        <button class="tabs__btn" data-tab="register" role="tab">Sign up</button>
      </div>

      <form class="form" data-form="login">
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn btn--primary btn--block" type="submit">Log in</button>
        <p class="hint">Demo account: <code>qa@plosia.dev</code> / <code>qa123456</code></p>
      </form>

      <form class="form" data-form="register" hidden>
        <label>What is your name<input name="name" autocomplete="name" required></label>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
        <button class="btn btn--primary btn--block" type="submit">Sign up</button>
      </form>
    </div>
  </section>`;
  return layout(req, { title: 'Log in', page: 'login', body });
}
