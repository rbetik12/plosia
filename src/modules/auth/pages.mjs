import { html } from '../../lib/html.mjs';
import { layout } from '../../views/layout.mjs';

export function loginPage(req, { next }) {
  const body = html`
  <section class="auth" data-next="${next}">
    <div class="auth__card">
      <div class="tabs" role="tablist">
        <button class="tabs__btn is-active" data-tab="login" role="tab">Вход</button>
        <button class="tabs__btn" data-tab="register" role="tab">Регистрация</button>
      </div>

      <form class="form" data-form="login">
        <label>Почта<input name="email" type="email" autocomplete="email" required></label>
        <label>Пароль<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn btn--primary btn--block" type="submit">Войти</button>
        <p class="hint">Демо-аккаунт: <code>qa@plosia.dev</code> / <code>qa123456</code></p>
      </form>

      <form class="form" data-form="register" hidden>
        <label>Как вас зовут<input name="name" autocomplete="name" required></label>
        <label>Почта<input name="email" type="email" autocomplete="email" required></label>
        <label>Пароль<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
        <button class="btn btn--primary btn--block" type="submit">Зарегистрироваться</button>
      </form>
    </div>
  </section>`;
  return layout(req, { title: 'Вход', page: 'login', body });
}
