const pages = {};

const load = pages[document.body.dataset.page];
if (load) {
  load().then((mod) => mod.init());
}
