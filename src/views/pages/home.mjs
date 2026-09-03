import { html } from '../../lib/html.mjs';
import { formatPrice } from '../../lib/money.mjs';
import { formatAge } from '../../modules/catalog/dto.mjs';
import { featuredCats } from '../../modules/catalog/service.mjs';
import { layout } from '../layout.mjs';

export function homePage(req) {
  const body = html`
  <section class="hero">
    <div class="hero__text">
      <p class="eyebrow">Магазин котиков и всего, что они любят</p>
      <h1>Найдите своего <span class="accent">мурчащего</span> друга</h1>
      <p class="lead">Котята и взрослые коты из проверенных питомников и приютов-партнёров. Корм и лакомства — с доставкой по всей стране.</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="/cats">Смотреть котиков</a>
        <a class="btn btn--ghost" href="/food">Выбрать корм</a>
      </div>
    </div>
    <div class="hero__photo"><img src="/img/hero/hero-03.jpg" alt="Рыжий котёнок"></div>
  </section>

  <section class="section">
    <header class="section__head">
      <h2>Ждут вас прямо сейчас</h2>
      <a href="/cats">Все котики →</a>
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
      <h2>Корм, который одобрил Барсик</h2>
      <p>Сухой, влажный и лакомства от пяти брендов. Курьером — бесплатно от 3 000 ₽.</p>
    </div>
    <a class="btn btn--primary" href="/food">В отдел корма</a>
  </section>`;

  return layout(req, { page: 'home', body });
}
