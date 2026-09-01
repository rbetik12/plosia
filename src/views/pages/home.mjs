import { html } from '../../lib/html.mjs';
import { layout } from '../layout.mjs';

export function homePage(req) {
  const body = html`
  <section class="hero">
    <div class="hero__text">
      <p class="eyebrow">Магазин котиков и всего, что они любят</p>
      <h1>Найдите своего <span class="accent">мурчащего</span> друга</h1>
      <p class="lead">Котята и взрослые коты из проверенных питомников, корм и лакомства с доставкой по всей стране.</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="/cats">Смотреть котиков</a>
        <a class="btn btn--ghost" href="/food">Выбрать корм</a>
      </div>
    </div>
  </section>`;

  return layout(req, { page: 'home', body });
}
