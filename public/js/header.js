import { api, showError, toast } from './lib.js';

export function setCartCount(count) {
  const badge = document.querySelector('[data-cart-count]');
  if (!badge) return;
  badge.textContent = count;
  badge.hidden = !count;
}

export async function refreshCartCount() {
  try {
    const cart = await api('GET', '/api/cart');
    setCartCount(cart.count);
  } catch {
    // счётчик в шапке не критичен
  }
}

export function bindAddToCart() {
  document.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-add-to-cart]');
    if (!btn) return;
    event.preventDefault();
    btn.disabled = true;
    try {
      const cart = await api('POST', '/api/cart/items', { productId: btn.dataset.addToCart, qty: 1 });
      setCartCount(cart.count);
      toast('Добавили в корзину', 'ok');
    } catch (err) {
      showError(err);
    } finally {
      btn.disabled = false;
    }
  });
}
