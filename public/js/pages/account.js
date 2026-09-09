import { api, showError } from '../lib.js';

export function init() {
  document.querySelector('[data-logout]')?.addEventListener('click', async () => {
    try {
      await api('POST', '/api/auth/logout');
      location.href = '/';
    } catch (err) {
      showError(err);
    }
  });
}
