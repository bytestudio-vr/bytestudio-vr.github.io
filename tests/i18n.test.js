const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'i18n.js'), 'utf8');
const french = JSON.parse(fs.readFileSync(path.join(root, 'locales/fr.json'), 'utf8'));
const storageKey = 'bytestudio.language';

function element(dataset = {}, text = '', attributes = {}) {
  const listeners = new Map();
  return {
    dataset,
    textContent: text,
    innerHTML: text,
    hidden: false,
    getAttribute: name => attributes[name],
    setAttribute: (name, value) => { attributes[name] = value; },
    hasAttribute: name => Object.hasOwn(attributes, name),
    addEventListener: (name, callback) => { listeners.set(name, callback); },
    click: () => listeners.get('click')()
  };
}

function page({ stored, blocked = false, fetchResponse, schema = false, hash = '' } = {}) {
  const values = new Map(stored ? [[storageKey, stored]] : []);
  const buttons = ['en', 'fr'].map(language => element({ languageButton: language }));
  const articles = ['en', 'fr'].map(language => element({ languageContent: language }));
  const control = element();
  control.hidden = true;
  const title = element({ i18n: 'hero.title' }, 'Your desktop in your room.');
  const description = element({ i18n: 'index.description', i18nAttr: 'content' }, '', { content: 'English description' });
  const markup = element({ i18n: 'setup.host.description' }, '<strong>Windows:</strong> original', { 'data-i18n-html': '' });
  const question = element({ i18n: 'faq.free.question' }, 'Is the app free?');
  const answer = element({ i18n: 'faq.free.answer' }, 'English answer');
  const bindings = [title, description, markup, question, answer];
  const schemaElement = schema ? element({}, JSON.stringify({ '@graph': [
    { '@type': 'SoftwareApplication', url: 'https://bytestudio-vr.github.io/', description: 'English application', offers: { description: 'English offer' }, featureList: ['English feature'] },
    { '@type': 'FAQPage', mainEntity: [] }
  ] })) : null;
  const windowListeners = new Map();
  const scrolled = [];
  let requests = 0;
  const document = {
    documentElement: { lang: 'en' },
    querySelectorAll: selector => ({
      '[data-language-button]': buttons,
      '[data-language-content]': articles,
      '[data-i18n]': bindings,
      '.language-switch': [control],
      '.faq details': [{ querySelector: name => name === 'summary' ? question : answer }]
    })[selector],
    querySelector: () => schemaElement,
    getElementById: id => ({ scrollIntoView: () => scrolled.push(id) }),
    dispatchEvent: () => {}
  };
  const localStorage = {
    getItem: key => {
      if (blocked) throw new Error('Stockage bloqué');
      return values.get(key) ?? null;
    },
    setItem: (key, value) => {
      if (blocked) throw new Error('Stockage bloqué');
      values.set(key, value);
    }
  };
  vm.runInNewContext(source, {
    document,
    window: { location: { hash }, addEventListener: (name, callback) => windowListeners.set(name, callback) },
    localStorage,
    fetch: () => {
      requests++;
      return fetchResponse ? fetchResponse(requests) : Promise.resolve({ ok: true, json: async () => french });
    },
    Event: class { constructor(type) { this.type = type; } },
    console: { warn: () => {} }
  });
  return {
    document, title, description, markup, buttons, articles, control, values, schemaElement, scrolled,
    choose: language => buttons.find(button => button.dataset.languageButton === language).click(),
    storageEvent: key => windowListeners.get('storage')({ key }),
    requests: () => requests
  };
}

const flush = () => new Promise(setImmediate);

test('anglais par défaut, sans requête de traduction', () => {
  const fixture = page();
  assert.equal(fixture.document.documentElement.lang, 'en');
  assert.equal(fixture.requests(), 0);
  assert.equal(fixture.control.hidden, false);
  assert.equal(fixture.articles[0].hidden, false);
  assert.equal(fixture.articles[1].hidden, true);
});

test('français : texte, attributs, contenu enrichi et préférence', async () => {
  const fixture = page();
  await fixture.choose('fr');
  assert.equal(fixture.title.textContent, french['hero.title']);
  assert.equal(fixture.description.getAttribute('content'), french['index.description']);
  assert.equal(fixture.markup.innerHTML, french['setup.host.description']);
  assert.equal(fixture.buttons[1].getAttribute('aria-pressed'), 'true');
  assert.equal(fixture.articles[1].hidden, false);
  assert.equal(fixture.values.get(storageKey), 'fr');
});

test('retour anglais : restauration exacte du texte et du HTML', async () => {
  const fixture = page();
  await fixture.choose('fr');
  await fixture.choose('en');
  assert.equal(fixture.title.textContent, 'Your desktop in your room.');
  assert.equal(fixture.description.getAttribute('content'), 'English description');
  assert.equal(fixture.markup.innerHTML, '<strong>Windows:</strong> original');
  assert.equal(fixture.values.get(storageKey), 'en');
});

test('préférence restaurée sur une nouvelle page', async () => {
  const first = page();
  await first.choose('fr');
  const next = page({ stored: first.values.get(storageKey) });
  await flush();
  assert.equal(next.document.documentElement.lang, 'fr');
});

test('stockage bloqué : sélection toujours fonctionnelle', async () => {
  const fixture = page({ blocked: true });
  await fixture.choose('fr');
  assert.equal(fixture.document.documentElement.lang, 'fr');
  assert.equal(fixture.values.size, 0);
});

test('préférence inconnue : repli anglais', () => {
  assert.equal(page({ stored: 'de' }).document.documentElement.lang, 'en');
});

test('traduction indisponible : anglais conservé sans écraser la préférence', async () => {
  const fixture = page({ stored: 'fr', fetchResponse: async () => ({ ok: false, status: 503 }) });
  await flush();
  assert.equal(fixture.document.documentElement.lang, 'en');
  assert.equal(fixture.values.get(storageKey), 'fr');
});

test('nouvel essai possible après une erreur réseau', async () => {
  const fixture = page({ fetchResponse: async request => {
    if (request === 1) throw new Error('Réseau indisponible');
    return { ok: true, json: async () => french };
  } });
  await fixture.choose('fr');
  await fixture.choose('fr');
  assert.equal(fixture.document.documentElement.lang, 'fr');
  assert.equal(fixture.requests(), 2);
});

test('réponse française tardive : ne remplace pas le choix anglais', async () => {
  let resolveResponse;
  const response = new Promise(resolve => { resolveResponse = resolve; });
  const fixture = page({ fetchResponse: () => response });
  const pending = fixture.choose('fr');
  await fixture.choose('en');
  resolveResponse({ ok: true, json: async () => french });
  await pending;
  assert.equal(fixture.document.documentElement.lang, 'en');
  assert.equal(fixture.values.get(storageKey), 'en');
});

test('clics FR/EN/FR rapides : dernière sélection appliquée, un seul chargement', async () => {
  let resolveResponse;
  const response = new Promise(resolve => { resolveResponse = resolve; });
  const fixture = page({ fetchResponse: () => response });
  const first = fixture.choose('fr');
  await fixture.choose('en');
  const last = fixture.choose('fr');
  resolveResponse({ ok: true, json: async () => french });
  await Promise.all([first, last]);
  assert.equal(fixture.document.documentElement.lang, 'fr');
  assert.equal(fixture.requests(), 1);
});

test('synchronisation du stockage entre onglets et effacement de la préférence', async () => {
  const fixture = page();
  fixture.values.set(storageKey, 'fr');
  fixture.storageEvent(storageKey);
  await flush();
  assert.equal(fixture.document.documentElement.lang, 'fr');
  fixture.values.clear();
  fixture.storageEvent(null);
  await flush();
  assert.equal(fixture.document.documentElement.lang, 'en');
});

test('FAQ structurée et description suivent la langue affichée', async () => {
  const fixture = page({ schema: true });
  await fixture.choose('fr');
  const [app, faq] = JSON.parse(fixture.schemaElement.textContent)['@graph'];
  assert.equal(app.description, french['schema.description']);
  assert.deepEqual(app.featureList, french['schema.features']);
  assert.equal(app.url, 'https://bytestudio-vr.github.io/');
  assert.equal(faq.mainEntity[0].name, french['faq.free.question']);
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, french['faq.free.answer']);
  await fixture.choose('en');
  assert.equal(JSON.parse(fixture.schemaElement.textContent)['@graph'][0].description, 'English application');
});

test('ancres de la politique suivent le contenu visible', async () => {
  const fixture = page({ hash: '#deletion' });
  await fixture.choose('fr');
  assert.equal(fixture.scrolled.at(-1), 'deletion-fr');
  await fixture.choose('en');
  assert.equal(fixture.scrolled.at(-1), 'deletion');
});

test('toutes les clés des deux pages ont une traduction française', () => {
  for (const name of ['index.html', 'privacy.html']) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    for (const [, key] of html.matchAll(/data-i18n="([^"]+)"/g)) {
      assert.equal(typeof french[key], 'string', `${name} : ${key}`);
    }
  }
});

test('la politique ne charge que le script local de langue, sans tracker', () => {
  const html = fs.readFileSync(path.join(root, 'privacy.html'), 'utf8');
  assert.deepEqual([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]), ['i18n.js']);
  assert.equal(html.includes('analytics.js'), false);
  assert.equal(source.includes('umami'), false);
});
