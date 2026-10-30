import crypto from 'node:crypto';
import { badRequest, conflict, notFound } from '../../lib/errors.mjs';
import { findProduct } from '../catalog/service.mjs';
import { calcDiscount, findPromo, validatePromo } from './promo.mjs';

const MAX_QTY = 20;
const carts = new Map();

export function getCart(cartId) {
  let cart = carts.get(cartId);
  if (!cart) {
    cart = { id: cartId, items: [], promoCode: null, discount: 0 };
    carts.set(cartId, cart);
  }
  return cart;
}

export function addItem(cart, productId, qty = 1) {
  const product = findProduct(productId);
  if (!product) throw notFound('No such product', 'product_not_found');

  const existing = cart.items.find((item) => item.productId === productId);
  if (product.type === 'cat') {
    if (existing) throw badRequest('This cat is already in your cart', 'cat_already_in_cart');
    qty = 1;
  }
  checkQty(qty);

  if (existing) {
    checkQty(existing.qty + qty);
    existing.qty += qty;
    return existing;
  }
  const item = { id: crypto.randomUUID().slice(0, 8), productId, qty };
  cart.items.push(item);
  return item;
}

export function updateQty(cart, itemId, qty) {
  const item = findItem(cart, itemId);
  const product = findProduct(item.productId);
  if (product.type === 'cat' && qty !== 1) {
    throw badRequest('Every cat here is one of a kind', 'cat_qty');
  }
  checkQty(qty);
  item.qty = qty;
  recalcDiscount(cart);
  return item;
}

export function removeItem(cart, itemId) {
  findItem(cart, itemId);
  cart.items = cart.items.filter((item) => item.id !== itemId);
}

export function clearCart(cart) {
  cart.items = [];
  removePromo(cart);
}

export function applyPromo(cart, rawCode) {
  if (cart.promoCode) {
    throw conflict(`Promo code ${cart.promoCode.toUpperCase()} is already applied. One discount per order.`, 'promo_already_applied');
  }
  const code = String(rawCode || '').trim();
  const promo = findPromo(code.toUpperCase());
  const sum = subtotal(cart);
  validatePromo(promo, sum);
  // We store only the code: the promo's current terms are used on every recalculation.
  cart.promoCode = code;
  cart.discount = calcDiscount(promo, sum);
}

export function removePromo(cart) {
  cart.promoCode = null;
  cart.discount = 0;
}

// The discount depends on the cart total, so we recalculate it when a quantity changes.
function recalcDiscount(cart) {
  if (!cart.promoCode) return;
  cart.discount = calcDiscount(findPromo(cart.promoCode), subtotal(cart));
}

export function subtotal(cart) {
  return cart.items.reduce((sum, item) => sum + findProduct(item.productId).price * item.qty, 0);
}

export function summarize(cart) {
  const items = cart.items.map((item) => {
    const product = findProduct(item.productId);
    return {
      id: item.id,
      productId: product.id,
      type: product.type,
      title: product.title,
      image: product.image,
      price: product.price,
      qty: item.qty,
      total: product.price * item.qty,
    };
  });
  const sum = items.reduce((acc, item) => acc + item.total, 0);
  const discount = cart.promoCode ? Math.min(cart.discount, sum) : 0;
  return {
    items,
    count: items.reduce((acc, item) => acc + item.qty, 0),
    subtotal: sum,
    promo: cart.promoCode ? { code: cart.promoCode.toUpperCase() } : null,
    discount,
    total: sum - discount,
  };
}

function checkQty(qty) {
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    throw badRequest(`Quantity must be between 1 and ${MAX_QTY}`, 'bad_qty');
  }
}

function findItem(cart, itemId) {
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw notFound('No such item in the cart', 'item_not_found');
  return item;
}
