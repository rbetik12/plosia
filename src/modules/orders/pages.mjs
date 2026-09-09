import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { layout } from '../../views/layout.mjs';
import { STATUS_TITLES } from './service.mjs';

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDate = (iso) => dateFormat.format(new Date(iso));

export function accountPage(req, orders) {
  const body = html`
  <section class="account">
    <header class="account__head">
      <div>
        <p class="eyebrow">Личный кабинет</p>
        <h1>${req.user.name}</h1>
        <p class="muted">${req.user.email}</p>
      </div>
      <button class="btn btn--ghost" data-logout>Выйти</button>
    </header>
    <h2>Мои заказы</h2>
    ${orders.length
      ? html`<div class="orders">${orders.map(
          (order) => html`
          <a class="order-row" href="/account/orders/${order.id}">
            <b>${order.id}</b>
            <span class="muted">${formatDate(order.createdAt)}</span>
            <span class="status status--${order.status}">${STATUS_TITLES[order.status]}</span>
            <span class="order-row__total">${formatPrice(order.total)}</span>
          </a>`,
        )}</div>`
      : html`<p class="muted">Заказов пока нет. <a href="/cats">Выбрать котика</a></p>`}
  </section>`;
  return layout(req, { title: 'Личный кабинет', page: 'account', body });
}

export function orderPage(req, order) {
  const body = html`
  <nav class="crumbs"><a href="/account">Мои заказы</a> / <span>${order.id}</span></nav>
  <section class="order">
    <header class="order__head">
      <h1>Заказ ${order.id}</h1>
      <span class="status status--${order.status}">${STATUS_TITLES[order.status]}</span>
    </header>
    <p class="muted">Оформлен ${formatDate(order.createdAt)}</p>
    <div class="order__lines">
      ${order.items.map(
        (item) => html`
        <div class="order__line">
          <span>${item.title}</span>
          <span class="muted">${item.qty} × ${formatPrice(item.price)}</span>
          <b>${formatPrice(item.price * item.qty)}</b>
        </div>`,
      )}
    </div>
    <dl class="summary__rows">
      <div><dt>Товары</dt><dd>${formatPrice(order.subtotal)}</dd></div>
      ${order.discount ? html`<div><dt>Скидка</dt><dd>−${formatPrice(order.discount)}</dd></div>` : ''}
      <div><dt>Доставка</dt><dd>${order.delivery.cost ? formatPrice(order.delivery.cost) : 'бесплатно'}</dd></div>
      <div class="summary__total"><dt>Итого</dt><dd>${formatPrice(order.total)}</dd></div>
    </dl>
  </section>`;
  return layout(req, { title: `Заказ ${order.id}`, page: 'order', body });
}
