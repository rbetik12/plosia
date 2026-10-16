// Все суммы в магазине — в целых рублях.
const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

export function formatPrice(amount) {
  return `${formatter.format(amount)} ₽`;
}

export function percentOf(amount, percent) {
  return Math.round((amount * percent) / 100);
}

// НДС, который уже включён в цену.
export function vatIncluded(amount, rate) {
  return Math.round((amount * rate) / (100 + rate));
}
