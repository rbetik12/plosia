import { html } from '../../lib/html.mjs';
import { layout } from '../../views/layout.mjs';

export function cartPage(req) {
  const body = html`
  <h1>Cart</h1>
  <div class="cart" data-cart>
    <div class="cart__items" data-items><p class="muted">Loading...</p></div>
    <aside class="summary" data-summary hidden>
      <h3>Your order</h3>
      <form class="promo" data-promo-form>
        <input name="code" placeholder="Promo code" autocomplete="off" aria-label="Promo code">
        <button class="btn btn--ghost btn--small" type="submit">Apply</button>
      </form>
      <p class="promo__applied" data-promo-applied hidden>
        Promo code <b data-promo-code></b> <button class="link" type="button" data-promo-remove>remove</button>
      </p>
      <dl class="summary__rows">
        <div><dt>Items</dt><dd data-subtotal></dd></div>
        <div data-discount-row hidden><dt>Discount</dt><dd class="discount" data-discount></dd></div>
        <div class="summary__total"><dt>Total</dt><dd data-total></dd></div>
      </dl>
      <a class="btn btn--primary btn--block" href="/checkout">Checkout</a>
    </aside>
  </div>`;
  return layout(req, { title: 'Cart', page: 'cart', body });
}
