import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { formatAge } from '../../modules/catalog/dto.mjs';
import { featuredCats } from '../../modules/catalog/service.mjs';
import { layout } from '../layout.mjs';

export function homePage(req) {
  const body = html`
  <section class="hero">
    <div class="hero__text">
      <p class="eyebrow">A shop for cats and everything they love</p>
      <h1>Find your <span class="accent">purring</span> friend</h1>
      <p class="lead">Kittens and adult cats from trusted breeders and partner shelters. Food and treats — delivered across the country.</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="/cats">Browse cats</a>
        <a class="btn btn--ghost" href="/food">Choose food</a>
      </div>
    </div>
    <div class="hero__photo"><img src="/img/hero/hero-03.jpg" alt="Ginger kitten"></div>
  </section>

  <section class="section">
    <header class="section__head">
      <h2>Waiting for you right now</h2>
      <a href="/cats">All cats →</a>
    </header>
    <div class="grid">
      ${featuredCats().map(
        (cat) => html`
        <article class="card">
          <a class="card__photo" href="/cats/${cat.slug}"><img src="${cat.image}" alt="${cat.title}" loading="lazy"></a>
          <div class="card__body">
            <h3><a href="/cats/${cat.slug}">${cat.title}</a></h3>
            <p class="card__meta">${cat.breed.title} · ${formatAge(cat.ageMonths)}</p>
            <div class="card__foot"><span class="price">${formatPrice(cat.price)}</span></div>
          </div>
        </article>`,
      )}
    </div>
  </section>

  <section class="section promo-strip">
    <div>
      <h2>Food approved by Barsik</h2>
      <p>Dry, wet and treats from five brands. Courier delivery is free from 3,000 ₽.</p>
    </div>
    <a class="btn btn--primary" href="/food">To the food aisle</a>
  </section>`;

  return layout(req, { page: 'home', body });
}
