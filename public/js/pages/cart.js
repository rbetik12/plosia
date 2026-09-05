import { api, escapeHtml, formatPrice, showError } from '../lib.js';
import { setCartCount } from '../header.js';

function row(item) {
  const qty = item.type === 'cat'
    ? '<span class="qty qty--single">1 шт.</span>'
    : `<div class="qty" data-id="${item.id}">
         <button class="qty__btn" data-qty="${item.qty - 1}" ${item.qty <= 1 ? 'disabled' : ''} aria-label="Меньше">−</button>
         <span>${item.qty}</span>
         <button class="qty__btn" data-qty="${item.qty + 1}" aria-label="Больше">+</button>
       </div>`;
  return `
  <div class="line">
    <img class="line__img" src="${item.image}" alt="">
    <div class="line__title">
      <b>${escapeHtml(item.title)}</b>
      <span class="muted">${formatPrice(item.price)} за шт.</span>
    </div>
    ${qty}
    <span class="line__total">${formatPrice(item.total)}</span>
    <button class="line__remove" data-remove="${item.id}" aria-label="Удалить">✕</button>
  </div>`;
}

export function init() {
  const root = document.querySelector('[data-cart]');
  const items = root.querySelector('[data-items]');
  const summary = root.querySelector('[data-summary]');

  function render(cart) {
    setCartCount(cart.count);
    if (!cart.items.length) {
      items.innerHTML = `
        <div class="empty">
          <h2>Корзина пуста</h2>
          <p class="lead">Котики сами себя не заберут.</p>
          <a class="btn btn--primary" href="/cats">К котикам</a>
        </div>`;
      summary.hidden = true;
      return;
    }
    items.innerHTML = cart.items.map(row).join('');
    summary.hidden = false;
    summary.querySelector('[data-subtotal]').textContent = formatPrice(cart.subtotal);
    summary.querySelector('[data-total]').textContent = formatPrice(cart.total);
  }

  async function run(method, url, body) {
    try {
      render(await api(method, url, body));
    } catch (err) {
      showError(err);
    }
  }

  items.addEventListener('click', (event) => {
    const qtyBtn = event.target.closest('[data-qty]');
    if (qtyBtn) {
      const id = qtyBtn.closest('.qty').dataset.id;
      run('PATCH', `/api/cart/items/${id}`, { qty: Number(qtyBtn.dataset.qty) });
    }
    const removeBtn = event.target.closest('[data-remove]');
    if (removeBtn) run('DELETE', `/api/cart/items/${removeBtn.dataset.remove}`);
  });

  run('GET', '/api/cart');
}
