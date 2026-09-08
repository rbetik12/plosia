import { api, showError } from '../lib.js';

export function init() {
  const root = document.querySelector('.auth');
  const next = root.dataset.next || '/';
  const forms = root.querySelectorAll('[data-form]');

  root.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      root.querySelectorAll('[data-tab]').forEach((t) => t.classList.toggle('is-active', t === tab));
      forms.forEach((form) => (form.hidden = form.dataset.form !== tab.dataset.tab));
    });
  });

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type=submit]');
      button.disabled = true;
      try {
        await api('POST', `/api/auth/${form.dataset.form}`, Object.fromEntries(new FormData(form)));
        location.href = next;
      } catch (err) {
        showError(err);
        button.disabled = false;
      }
    });
  });
}
