import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { layout } from '../../views/layout.mjs';
import { formatAge } from './dto.mjs';

const TITLES = {
  cats: { title: 'Cats', lead: 'Every cat is vaccinated, litter-trained and waiting for a family.' },
  food: { title: 'Food and treats', lead: 'Dry and wet food, treats for training and just because.' },
};

const FILTER_FIELDS = {
  cats: [
    ['breed', 'Breed', 'breeds'],
    ['color', 'Color', 'colors'],
    ['age', 'Age', 'ages'],
  ],
  food: [
    ['kind', 'Type', 'kinds'],
    ['brand', 'Brand', 'brands'],
    ['age', 'For', 'ages'],
  ],
};

const PRICE_STEPS = {
  cats: [3000, 10000, 30000, 50000],
  food: [500, 1000, 2000, 5000],
};

function filtersPanel(kind, options) {
  return html`
  <form class="filters" data-filters>
    ${FILTER_FIELDS[kind].map(
      ([name, label, key]) => html`
      <label class="select">
        <span>${label}</span>
        <select name="${name}">
          <option value="">All</option>
          ${options[key].map((o) => html`<option value="${o.id}">${o.title}</option>`)}
        </select>
      </label>`,
    )}
    ${kind === 'cats'
      ? html`<label class="select"><span>Sex</span>
          <select name="sex"><option value="">All</option><option value="m">Male</option><option value="f">Female</option></select>
        </label>`
      : ''}
    <label class="select">
      <span>Price up to</span>
      <select name="price_max">
        <option value="">Any</option>
        ${PRICE_STEPS[kind].map((p) => html`<option value="${p}">${formatPrice(p)}</option>`)}
      </select>
    </label>
    <button class="btn btn--ghost btn--small" type="reset">Reset</button>
  </form>`;
}

export function catalogPage(req, kind, options) {
  const { title, lead } = TITLES[kind];
  const body = html`
  <section class="catalog" data-kind="${kind}">
    <header class="catalog__head">
      <div>
        <h1>${title}</h1>
        <p class="lead">${lead}</p>
      </div>
      <label class="select">
        <span>Sort by</span>
        <select name="sort" data-sort>
          <option value="">Most popular first</option>
          <option value="price_asc">Cheapest first</option>
          <option value="price_desc">Most expensive first</option>
          ${kind === 'cats' ? html`<option value="new">New arrivals first</option>` : ''}
        </select>
      </label>
    </header>
    <div class="catalog__body">
      ${filtersPanel(kind, options)}
      <div class="grid" data-grid aria-live="polite"><p class="muted">Loading...</p></div>
    </div>
  </section>`;
  return layout(req, { title, page: 'catalog', body });
}

export function catPage(req, cat) {
  const body = html`
  <nav class="crumbs"><a href="/cats">Cats</a> / <span>${cat.title}</span></nav>
  <article class="pet">
    <div class="pet__photo"><img src="${cat.image}" alt="${cat.title}, ${cat.breed.title}"></div>
    <div class="pet__info">
      <p class="eyebrow">${cat.breed.title}</p>
      <h1>${cat.title}</h1>
      <ul class="facts">
        <li><b>Age</b><span>${formatAge(cat.ageMonths)}</span></li>
        <li><b>Sex</b><span>${cat.sex === 'f' ? 'Female' : 'Male'}</span></li>
        <li><b>Color</b><span>${cat.colorTitle}</span></li>
      </ul>
      <p>${cat.description}</p>
      <ul class="tags">${cat.traits.map((t) => html`<li>${t}</li>`)}</ul>
      <div class="pet__buy">
        <span class="price price--big">${formatPrice(cat.price)}</span>
        <button class="btn btn--primary" data-add-to-cart="${cat.id}">Take me home</button>
      </div>
    </div>
  </article>`;
  return layout(req, { title: cat.title, page: 'cat', body });
}
