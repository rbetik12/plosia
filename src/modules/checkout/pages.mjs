import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { layout } from '../../views/layout.mjs';

export function checkoutPage(req, { cities }) {
  const user = req.user;
  const body = html`
  <h1>Оформление заказа</h1>
  <div class="checkout" data-checkout>
    <form class="checkout__steps" data-order-form>
      <fieldset class="step">
        <legend><span class="step__num">1</span> Получатель</legend>
        <div class="form form--grid">
          <label>Имя<input name="name" value="${user.name}" autocomplete="name" required></label>
          <label>Телефон<input name="phone" type="tel" placeholder="+7 900 000-00-00" autocomplete="tel" required></label>
          <label class="form__wide">Почта для чека<input name="email" type="email" value="${user.email}" required></label>
        </div>
      </fieldset>

      <fieldset class="step">
        <legend><span class="step__num">2</span> Доставка</legend>
        <div class="form form--grid" data-courier>
          <label>Город
            <select name="city">${cities.map((city) => html`<option>${city}</option>`)}</select>
          </label>
          <label>Адрес<input name="address" placeholder="Улица, дом, квартира"></label>
          <p class="hint form__wide">Курьер — 299 ₽, от 3 000 ₽ бесплатно.</p>
        </div>
      </fieldset>

      <fieldset class="step" data-payment disabled>
        <legend><span class="step__num">3</span> Оплата</legend>
        <div class="form form--grid">
          <label class="form__wide">Номер карты<input name="number" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="cc-number"></label>
          <label>Срок<input name="expiry" placeholder="12/28" autocomplete="cc-exp"></label>
          <label>CVC<input name="cvc" inputmode="numeric" placeholder="123" autocomplete="cc-csc"></label>
          <p class="hint form__wide">Песочница MurPay: <code>4242 4242 4242 4242</code> — успех, <code>4000 0000 0000 0002</code> — отказ банка.</p>
        </div>
      </fieldset>

      <button class="btn btn--primary" type="submit" data-submit>Подтвердить заказ</button>
    </form>

    <aside class="summary" data-summary>
      <h3>Ваш заказ</h3>
      <div data-lines class="summary__lines"></div>
      <dl class="summary__rows">
        <div><dt>Товары</dt><dd data-subtotal></dd></div>
        <div class="summary__total"><dt>Итого без доставки</dt><dd data-total></dd></div>
      </dl>
    </aside>
  </div>`;
  return layout(req, { title: 'Оформление заказа', page: 'checkout', body });
}

export function successPage(req, order) {
  const body = html`
  <section class="empty">
    <div class="empty__code">🐾</div>
    <h1>Заказ ${order.id} оплачен!</h1>
    <p class="lead">Мы отправили подтверждение на почту. Сумма: ${formatPrice(order.total)}.</p>
    <a class="btn btn--primary" href="/account/orders/${order.id}">Посмотреть заказ</a>
  </section>`;
  return layout(req, { title: 'Заказ оплачен', page: 'success', body });
}
