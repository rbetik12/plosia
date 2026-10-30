import { api, escapeHtml, formatPrice, showError } from '../lib.js';

const SEX = { m: 'male', f: 'female' };

function catCard(cat) {
  return `
  <article class="card">
    <a class="card__photo" href="/cats/${cat.slug}">
      <img src="${cat.image}" alt="${escapeHtml(cat.name)}" loading="lazy">
      ${cat.isNew ? '<span class="badge">New</span>' : ''}
    </a>
    <div class="card__body">
      <h3><a href="/cats/${cat.slug}">${escapeHtml(cat.name)}</a></h3>
      <p class="card__meta">${escapeHtml(cat.breed)} · ${escapeHtml(cat.age)} · ${SEX[cat.sex]}</p>
      <div class="card__foot">
        <span class="price">${formatPrice(cat.price)}</span>
        <button class="btn btn--primary btn--small" data-add-to-cart="${cat.id}">Take me home</button>
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
        <button class="btn btn--primary btn--small" data-add-to-cart="${item.id}">Add to cart</button>
      </div>
    </div>
  </article>`;
}

export function init() {
  const root = document.querySelector('.catalog');
  const kind = root.dataset.kind;
  const grid = root.querySelector('[data-grid]');
  const sort = root.querySelector('[data-sort]');
  const filters = root.querySelector('[data-filters]');

  // Filters live in the page URL so that a link can be shared.
  const initial = new URLSearchParams(location.search);
  for (const field of [...filters.elements, sort]) {
    if (field.name && initial.has(field.name)) field.value = initial.get(field.name);
  }

  async function load() {
    const params = new URLSearchParams();
    for (const [name, value] of new FormData(filters)) {
      if (value) params.set(name, value);
    }
    if (sort.value) params.set('sort', sort.value);
    history.replaceState(null, '', params.size ? `?${params}` : location.pathname);
    try {
      const data = await api('GET', `/api/catalog/${kind}?${params}`);
      const render = kind === 'cats' ? catCard : foodCard;
      grid.innerHTML = data.items.length
        ? data.items.map(render).join('')
        : '<p class="muted">Nothing found.</p>';
    } catch (err) {
      grid.innerHTML = '<p class="muted">Could not load the catalog.</p>';
      showError(err);
    }
  }

  sort.addEventListener('change', load);
  filters.addEventListener('change', load);
  filters.addEventListener('reset', () => setTimeout(load));
  load();
}
