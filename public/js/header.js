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

// Access-токен короткий. Если сервер сказал, что сессия истекла, — обновляем её по refresh-токену.
export async function refreshSession() {
  if (!document.body.dataset.authExpired) return;
  try {
    await api('POST', '/api/auth/refresh');
    location.reload();
  } catch {
    // refresh тоже истёк — пользователь просто войдёт заново
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
