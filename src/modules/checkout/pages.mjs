import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { layout } from '../../views/layout.mjs';

export function checkoutPage(req, { cities }) {
  const user = req.user;
  const body = html`
  <h1>Checkout</h1>
  <div class="checkout" data-checkout>
    <form class="checkout__steps" data-order-form>
      <fieldset class="step">
        <legend><span class="step__num">1</span> Recipient</legend>
        <div class="form form--grid">
          <label>Name<input name="name" value="${user.name}" autocomplete="name" required></label>
          <label>Phone<input name="phone" type="tel" placeholder="+7 900 000-00-00" autocomplete="tel" required></label>
          <label class="form__wide">Email for the receipt<input name="email" type="email" value="${user.email}" required></label>
        </div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="step__num">2</span> Delivery</legend>
        <div class="segmented" role="radiogroup">
          <label><input type="radio" name="deliveryType" value="courier" checked> Courier</label>
          <label><input type="radio" name="deliveryType" value="pickup"> Pickup</label>
        </div>
        <div class="form form--grid">
          <label>City
            <select name="city">${cities.map((city) => html`<option>${city}</option>`)}</select>
          </label>
          <label data-courier>Address<input name="address" placeholder="Street, building, apartment"></label>
          <p class="hint form__wide" data-courier>Courier — 299 ₽, free from 3,000 ₽.</p>
          <div class="points form__wide" data-pickup hidden></div>
        </div>
      </fieldset>

      <fieldset class="step" data-payment disabled>
        <legend><span class="step__num">3</span> Payment</legend>
        <div class="form form--grid">
          <label class="form__wide">Card number<input name="number" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="cc-number"></label>
          <label>Expiry<input name="expiry" placeholder="12/28" autocomplete="cc-exp"></label>
          <label>CVC<input name="cvc" inputmode="numeric" placeholder="123" autocomplete="cc-csc"></label>
          <p class="hint form__wide">MurPay sandbox: <code>4242 4242 4242 4242</code> — success, <code>4000 0000 0000 0002</code> — bank decline.</p>
        </div>
      </fieldset>

      <button class="btn btn--primary" type="submit" data-submit>Confirm order</button>
    </form>

    <aside class="summary" data-summary>
      <h3>Your order</h3>
      <div data-lines class="summary__lines"></div>
      <dl class="summary__rows">
        <div><dt>Items</dt><dd data-subtotal></dd></div>
        <div data-discount-row hidden><dt>Discount</dt><dd class="discount" data-discount></dd></div>
        <div class="summary__total"><dt>Total before delivery</dt><dd data-total></dd></div>
      </dl>
    </aside>
  </div>`;
  return layout(req, { title: 'Checkout', page: 'checkout', body });
}

export function successPage(req, order) {
  const body = html`
  <section class="empty">
    <div class="empty__code">🐾</div>
    <h1>Order ${order.id} is paid!</h1>
    <p class="lead">We have sent a confirmation to your email. Amount: ${formatPrice(order.total)}.</p>
    <a class="btn btn--primary" href="/account/orders/${order.id}">View order</a>
  </section>`;
  return layout(req, { title: 'Order paid', page: 'success', body });
}
