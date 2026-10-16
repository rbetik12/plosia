import { conflict } from '../../lib/errors.mjs';
import { vatIncluded } from '../../lib/money.mjs';
import { findProduct } from '../catalog/service.mjs';

const SELLER = { name: 'ООО «Плосия»', inn: '7701234567', address: 'Москва, ул. Покровка, 17' };

// Живые животные продаются без НДС, корм и лакомства — 20%.
const VAT_RATES = { cat: 0, food: 20 };

export function buildReceipt(order) {
  if (!['paid', 'shipped', 'delivered'].includes(order.status)) {
    throw conflict('Чек появится после оплаты заказа', 'receipt_not_ready');
  }

  const lines = order.items.map((item) => {
    const product = findProduct(item.productId);
    const vatRate = VAT_RATES[product.type];
    const amount = item.price * item.qty;
    return {
      sku: product.sku,
      title: item.title,
      qty: item.qty,
      price: item.price,
      amount,
      vatRate,
      vat: vatIncluded(amount, vatRate),
    };
  });

  return {
    number: `R-${order.id.replace('PL-', '')}`,
    orderId: order.id,
    issuedAt: order.paidAt ?? order.createdAt,
    seller: SELLER,
    lines,
    discount: order.discount,
    delivery: order.delivery.cost,
    total: order.total,
    vatTotal: lines.reduce((sum, line) => sum + line.vat, 0),
  };
}
