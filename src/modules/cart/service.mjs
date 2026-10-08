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
  if (!product) throw notFound('Такого товара нет', 'product_not_found');

  const existing = cart.items.find((item) => item.productId === productId);
  if (product.type === 'cat') {
    if (existing) throw badRequest('Этот котик уже в корзине', 'cat_already_in_cart');
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
    throw badRequest('Каждый котик у нас в единственном экземпляре', 'cat_qty');
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
    throw conflict(`Уже применён промокод ${cart.promoCode.toUpperCase()}. Одна скидка на заказ.`, 'promo_already_applied');
  }
  const code = String(rawCode || '').trim();
  const promo = findPromo(code.toUpperCase());
  const sum = subtotal(cart);
  validatePromo(promo, sum);
  // Храним только код: условия промокода берём актуальные при каждом пересчёте.
  cart.promoCode = code;
  cart.discount = calcDiscount(promo, sum);
}

export function removePromo(cart) {
  cart.promoCode = null;
  cart.discount = 0;
}

// Скидка зависит от суммы корзины, поэтому при смене количества пересчитываем её.
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
    throw badRequest(`Количество — от 1 до ${MAX_QTY}`, 'bad_qty');
  }
}

function findItem(cart, itemId) {
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) throw notFound('Такой позиции в корзине нет', 'item_not_found');
  return item;
}
