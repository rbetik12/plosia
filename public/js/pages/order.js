import { api, escapeHtml, formatPrice, showError } from '../lib.js';

export function init() {
  const button = document.querySelector('[data-receipt]');
  const target = document.querySelector('[data-receipt-body]');
  if (!button) return;

  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const { receipt } = await api('GET', `/api/orders/${button.dataset.receipt}/receipt`);
      target.innerHTML = render(receipt);
      target.hidden = false;
      button.hidden = true;
    } catch (err) {
      showError(err);
      button.disabled = false;
    }
  });
}

function render(r) {
  const rows = r.lines
    .map((l) => `<tr><td>${escapeHtml(l.sku)}</td><td>${escapeHtml(l.title)}</td><td>${l.qty}</td><td>${formatPrice(l.amount)}</td><td>${l.vatRate ? `${l.vatRate}%` : 'без НДС'}</td></tr>`)
    .join('');
  return `
  <h3>Кассовый чек ${escapeHtml(r.number)}</h3>
  <p class="muted">${escapeHtml(r.seller.name)}, ИНН ${escapeHtml(r.seller.inn)} · ${new Date(r.issuedAt).toLocaleString('ru-RU')}</p>
  <table class="receipt__table">
    <thead><tr><th>Артикул</th><th>Товар</th><th>Кол-во</th><th>Сумма</th><th>НДС</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p><b>Итого: ${formatPrice(r.total)}</b>, в т. ч. НДС ${formatPrice(r.vatTotal)}</p>`;
}
