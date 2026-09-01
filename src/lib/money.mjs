const formatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });

export function formatPrice(amount) {
  return `${formatter.format(amount)} ₽`;
}
