import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { layout } from '../../views/layout.mjs';
import { STATUS_TITLES } from './service.mjs';

const dateFormat = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
const formatDate = (iso) => dateFormat.format(new Date(iso));

export function accountPage(req, orders) {
  const body = html`
  <section class="account">
    <header class="account__head">
      <div>
        <p class="eyebrow">My account</p>
        <h1>${req.user.name}</h1>
        <p class="muted">${req.user.email}</p>
      </div>
      <button class="btn btn--ghost" data-logout>Log out</button>
    </header>
    <h2>My orders</h2>
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
      : html`<p class="muted">No orders yet. <a href="/cats">Pick a cat</a></p>`}
  </section>`;
  return layout(req, { title: 'My account', page: 'account', body });
}

export function orderPage(req, order) {
  const body = html`
  <nav class="crumbs"><a href="/account">My orders</a> / <span>${order.id}</span></nav>
  <section class="order">
    <header class="order__head">
      <h1>Order ${order.id}</h1>
      <span class="status status--${order.status}">${STATUS_TITLES[order.status]}</span>
    </header>
    <p class="muted">Placed on ${formatDate(order.createdAt)}</p>
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
      <div><dt>Items</dt><dd>${formatPrice(order.subtotal)}</dd></div>
      ${order.discount ? html`<div><dt>Discount</dt><dd>−${formatPrice(order.discount)}</dd></div>` : ''}
      <div><dt>Delivery</dt><dd>${order.delivery.cost ? formatPrice(order.delivery.cost) : 'free'}</dd></div>
      <div class="summary__total"><dt>Total</dt><dd>${formatPrice(order.total)}</dd></div>
    </dl>
    ${order.status === 'awaiting_payment'
      ? ''
      : html`<button class="btn btn--ghost" data-receipt="${order.id}">Show receipt</button>
        <div class="receipt" data-receipt-body hidden></div>`}
  </section>`;
  return layout(req, { title: `Order ${order.id}`, page: 'order', body });
}
