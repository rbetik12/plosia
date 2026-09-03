import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { layout } from '../../views/layout.mjs';
import { formatAge } from './dto.mjs';

const TITLES = {
  cats: { title: 'Котики', lead: 'Каждый привит, приучен к лотку и ждёт свою семью.' },
  food: { title: 'Корм и лакомства', lead: 'Сухой и влажный корм, вкусняшки для дрессировки и просто так.' },
};

export function catalogPage(req, kind) {
  const { title, lead } = TITLES[kind];
  const body = html`
  <section class="catalog" data-kind="${kind}">
    <header class="catalog__head">
      <div>
        <h1>${title}</h1>
        <p class="lead">${lead}</p>
      </div>
      <label class="select">
        <span>Сортировка</span>
        <select name="sort" data-sort>
          <option value="">Сначала популярные</option>
          <option value="price_asc">Сначала дешевле</option>
          <option value="price_desc">Сначала дороже</option>
        </select>
      </label>
    </header>
    <div class="catalog__body">
      <div class="grid" data-grid aria-live="polite"><p class="muted">Загружаем...</p></div>
    </div>
  </section>`;
  return layout(req, { title, page: 'catalog', body });
}

export function catPage(req, cat) {
  const body = html`
  <nav class="crumbs"><a href="/cats">Котики</a> / <span>${cat.title}</span></nav>
  <article class="pet">
    <div class="pet__photo"><img src="${cat.image}" alt="${cat.title}, ${cat.breed.title}"></div>
    <div class="pet__info">
      <p class="eyebrow">${cat.breed.title}</p>
      <h1>${cat.title}</h1>
      <ul class="facts">
        <li><b>Возраст</b><span>${formatAge(cat.ageMonths)}</span></li>
        <li><b>Пол</b><span>${cat.sex === 'f' ? 'Кошечка' : 'Котик'}</span></li>
        <li><b>Окрас</b><span>${cat.colorTitle}</span></li>
      </ul>
      <p>${cat.description}</p>
      <ul class="tags">${cat.traits.map((t) => html`<li>${t}</li>`)}</ul>
      <div class="pet__buy">
        <span class="price price--big">${formatPrice(cat.price)}</span>
      </div>
    </div>
  </article>`;
  return layout(req, { title: cat.title, page: 'cat', body });
}
