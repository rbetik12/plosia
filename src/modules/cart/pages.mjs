import { html } from '../../lib/html.mjs';
import { layout } from '../../views/layout.mjs';

export function cartPage(req) {
  const body = html`
  <h1>Корзина</h1>
  <div class="cart" data-cart>
    <div class="cart__items" data-items><p class="muted">Загружаем...</p></div>
    <aside class="summary" data-summary hidden>
      <h3>Ваш заказ</h3>
      <form class="promo" data-promo-form>
        <input name="code" placeholder="Промокод" autocomplete="off" aria-label="Промокод">
        <button class="btn btn--ghost btn--small" type="submit">Применить</button>
      </form>
      <p class="promo__applied" data-promo-applied hidden>
        Промокод <b data-promo-code></b> <button class="link" type="button" data-promo-remove>убрать</button>
      </p>
      <dl class="summary__rows">
        <div><dt>Товары</dt><dd data-subtotal></dd></div>
        <div data-discount-row hidden><dt>Скидка</dt><dd class="discount" data-discount></dd></div>
        <div class="summary__total"><dt>Итого</dt><dd data-total></dd></div>
      </dl>
      <a class="btn btn--primary btn--block" href="/checkout">Оформить заказ</a>
    </aside>
  </div>`;
  return layout(req, { title: 'Корзина', page: 'cart', body });
}
