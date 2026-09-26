import { bindAddToCart, refreshCartCount, refreshSession } from './header.js';

const pages = {
  catalog: () => import('./pages/catalog.js'),
  cart: () => import('./pages/cart.js'),
  login: () => import('./pages/login.js'),
  account: () => import('./pages/account.js'),
  checkout: () => import('./pages/checkout.js'),
  order: () => import('./pages/order.js'),
};

refreshSession();
bindAddToCart();
if (document.body.dataset.page !== 'cart') refreshCartCount();

const load = pages[document.body.dataset.page];
if (load) {
  load().then((mod) => mod.init());
}
