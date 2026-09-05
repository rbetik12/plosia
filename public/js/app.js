import { bindAddToCart, refreshCartCount } from './header.js';

const pages = {
  catalog: () => import('./pages/catalog.js'),
  cart: () => import('./pages/cart.js'),
};

bindAddToCart();
if (document.body.dataset.page !== 'cart') refreshCartCount();

const load = pages[document.body.dataset.page];
if (load) {
  load().then((mod) => mod.init());
}
