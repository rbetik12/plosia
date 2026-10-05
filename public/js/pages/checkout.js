import { api, escapeHtml, formatPrice, showError, toast } from '../lib.js';

export function init() {
  const root = document.querySelector('[data-checkout]');
  const form = root.querySelector('[data-order-form]');
  const payment = form.querySelector('[data-payment]');
  const submit = form.querySelector('[data-submit]');
  let order = null;

  loadSummary();

  // Самовывоз: показываем пункты выдачи выбранного города.
  const points = form.querySelector('[data-pickup]');
  const deliveryType = () => new FormData(form).get('deliveryType');

  async function loadPoints() {
    const city = form.elements.city.value;
    points.innerHTML = '<p class="muted">Ищем пункты выдачи...</p>';
    try {
      const { items } = await api('GET', `/api/checkout/pickup-points?city=${encodeURIComponent(city)}`);
      points.innerHTML = items.length
        ? items
            .map(
              (p, i) => `
          <label class="point">
            <input type="radio" name="pointId" value="${p.id}" ${i === 0 ? 'checked' : ''}>
            <span><b>${escapeHtml(p.typeTitle)} · ${escapeHtml(p.title)}</b><br>
            <span class="muted">${escapeHtml(p.address)} · ${escapeHtml(p.hours)}</span></span>
          </label>`,
            )
            .join('')
        : '<p class="muted">В этом городе пока нет пунктов выдачи.</p>';
    } catch (err) {
      points.innerHTML = '<p class="muted">Не удалось загрузить пункты выдачи.</p>';
      showError(err);
    }
  }

  function toggleDelivery() {
    const pickup = deliveryType() === 'pickup';
    form.querySelectorAll('[data-courier]').forEach((el) => (el.hidden = pickup));
    points.hidden = !pickup;
    if (pickup) loadPoints();
  }

  form.querySelectorAll('[name=deliveryType]').forEach((input) => input.addEventListener('change', toggleDelivery));
  form.elements.city.addEventListener('change', () => deliveryType() === 'pickup' && loadPoints());

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submit.disabled = true;
    try {
      if (!order) {
        ({ order } = await api('POST', '/api/checkout', orderPayload()));
        form.querySelectorAll('fieldset:not([data-payment])').forEach((f) => (f.disabled = true));
        payment.disabled = false;
        submit.textContent = `Оплатить ${formatPrice(order.total)}`;
        toast(`Заказ ${order.id} создан, осталось оплатить`, 'ok');
      } else {
        const data = new FormData(form);
        await api('POST', '/api/checkout/pay', {
          orderId: order.id,
          card: { number: data.get('number'), expiry: data.get('expiry'), cvc: data.get('cvc') },
        });
        location.href = `/checkout/success?order=${order.id}`;
        return;
      }
    } catch (err) {
      showError(err);
    }
    submit.disabled = false;
  });

  function orderPayload() {
    const data = new FormData(form);
    return {
      contacts: { name: data.get('name'), phone: data.get('phone'), email: data.get('email') },
      delivery:
        data.get('deliveryType') === 'pickup'
          ? { type: 'pickup', pointId: data.get('pointId') }
          : { type: 'courier', city: data.get('city'), address: data.get('address') },
    };
  }

  async function loadSummary() {
    try {
      const cart = await api('GET', '/api/cart');
      if (!cart.items.length) {
        location.href = '/cart';
        return;
      }
      root.querySelector('[data-lines]').innerHTML = cart.items
        .map((item) => `<div class="summary__line"><span>${escapeHtml(item.title)} × ${item.qty}</span><b>${formatPrice(item.total)}</b></div>`)
        .join('');
      root.querySelector('[data-subtotal]').textContent = formatPrice(cart.subtotal);
      root.querySelector('[data-total]').textContent = formatPrice(cart.total);
      root.querySelector('[data-discount-row]').hidden = !cart.discount;
      root.querySelector('[data-discount]').textContent = `−${formatPrice(cart.discount)}`;
    } catch (err) {
      showError(err);
    }
  }
}
