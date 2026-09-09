// Исторические заказы демо-покупателей.
const delivered = (id, userId, createdAt, items, delivery) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return {
    id,
    userId,
    status: 'delivered',
    createdAt,
    items,
    subtotal,
    discount: 0,
    delivery,
    total: subtotal + delivery.cost,
    contacts: null,
  };
};

const courier = (city, address, cost = 0) => ({ type: 'courier', city, address, cost });

export const SEED_ORDERS = [
  delivered('PL-10301', 'u-1001', '2026-07-14T11:20:00+03:00', [
    { productId: 'food-02', title: 'Лосось и рис', price: 1190, qty: 2 },
    { productId: 'food-08', title: 'Хрустики с треской', price: 190, qty: 3 },
  ], courier('Москва', 'ул. Мясницкая, 24, кв. 7')),
  delivered('PL-10377', 'u-1003', '2026-08-02T18:45:00+03:00', [
    { productId: 'food-14', title: 'Классик', price: 990, qty: 2 },
    { productId: 'food-04', title: 'Паштет с кроликом', price: 780, qty: 1 },
  ], courier('Казань', 'ул. Пушкина, 10', 299)),
  delivered('PL-10398', 'u-1002', '2026-08-19T09:10:00+03:00', [
    { productId: 'food-15', title: 'Рагу из утки', price: 840, qty: 3 },
  ], courier('Санкт-Петербург', 'Лиговский пр-т, 50, кв. 12', 299)),
  delivered('PL-10412', 'u-1001', '2026-08-27T20:30:00+03:00', [
    { productId: 'food-06', title: 'Нежный мусс для котят', price: 760, qty: 2 },
    { productId: 'food-14', title: 'Классик', price: 990, qty: 1 },
    { productId: 'food-11', title: 'Мятные подушечки', price: 210, qty: 2 },
  ], courier('Москва', 'ул. Мясницкая, 24, кв. 7')),
  delivered('PL-10420', 'u-1004', '2026-09-01T13:00:00+03:00', [
    { productId: 'food-09', title: 'Говядина, большой мешок', price: 4990, qty: 1 },
  ], courier('Екатеринбург', 'ул. Вайнера, 9')),
];
