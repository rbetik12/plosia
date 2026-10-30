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
    // the counter in the header is not critical
  }
}

// The access token is short-lived. If the server says the session has expired, we renew it with the refresh token.
export async function refreshSession() {
  if (!document.body.dataset.authExpired) return;
  try {
    await api('POST', '/api/auth/refresh');
    location.reload();
  } catch {
    // the refresh token has expired too — the user will simply log in again
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
      toast('Added to cart', 'ok');
    } catch (err) {
      showError(err);
    } finally {
      btn.disabled = false;
    }
  });
}
