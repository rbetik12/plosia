const pages = {
  catalog: () => import('./pages/catalog.js'),
};

const load = pages[document.body.dataset.page];
if (load) {
  load().then((mod) => mod.init());
}
