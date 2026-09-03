import { api, escapeHtml, formatPrice, showError } from '../lib.js';

const SEX = { m: 'котик', f: 'кошечка' };

function catCard(cat) {
  return `
  <article class="card">
    <a class="card__photo" href="/cats/${cat.slug}"><img src="${cat.image}" alt="${escapeHtml(cat.name)}" loading="lazy"></a>
    <div class="card__body">
      <h3><a href="/cats/${cat.slug}">${escapeHtml(cat.name)}</a></h3>
      <p class="card__meta">${escapeHtml(cat.breed)} · ${escapeHtml(cat.age)} · ${SEX[cat.sex]}</p>
      <div class="card__foot">
        <span class="price">${formatPrice(cat.price)}</span>
      </div>
    </div>
  </article>`;
}

function foodCard(item) {
  return `
  <article class="card card--food">
    <div class="card__photo"><img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy"></div>
    <div class="card__body">
      <p class="card__brand">${escapeHtml(item.brand)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p class="card__meta">${escapeHtml(item.kind)} · ${escapeHtml(item.weight)}</p>
      <div class="card__foot">
        <span class="price">${formatPrice(item.price)}</span>
      </div>
    </div>
  </article>`;
}

export function init() {
  const root = document.querySelector('.catalog');
  const kind = root.dataset.kind;
  const grid = root.querySelector('[data-grid]');
  const sort = root.querySelector('[data-sort]');

  async function load() {
    const params = new URLSearchParams();
    if (sort.value) params.set('sort', sort.value);
    try {
      const data = await api('GET', `/api/catalog/${kind}?${params}`);
      const render = kind === 'cats' ? catCard : foodCard;
      grid.innerHTML = data.items.length
        ? data.items.map(render).join('')
        : '<p class="muted">Ничего не нашлось.</p>';
    } catch (err) {
      grid.innerHTML = '<p class="muted">Не удалось загрузить каталог.</p>';
      showError(err);
    }
  }

  sort.addEventListener('change', load);
  load();
}
