import crypto from 'node:crypto';
import { badRequest, notFound } from '../../lib/errors.mjs';
import { findProduct } from '../catalog/service.mjs';

const MAX_QTY = 20;
const carts = new Map();

export function getCart(cartId) {
  let cart = carts.get(cartId);
  if (!cart) {
    cart = { id: cartId, items: [] };
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
  return item;
}

export function removeItem(cart, itemId) {
  findItem(cart, itemId);
  cart.items = cart.items.filter((item) => item.id !== itemId);
}

export function clearCart(cart) {
  cart.items = [];
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
  return {
    items,
    count: items.reduce((acc, item) => acc + item.qty, 0),
    subtotal: sum,
    discount: 0,
    total: sum,
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
