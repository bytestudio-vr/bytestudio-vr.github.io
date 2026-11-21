(() => {
  const storageKey = 'bytestudio.language';
  const languageButtons = [...document.querySelectorAll('[data-language-button]')];
  const languageContent = [...document.querySelectorAll('[data-language-content]')];
  const bindings = [...document.querySelectorAll('[data-i18n]')].map(element => {
    const attribute = element.dataset.i18nAttr;
    const html = element.hasAttribute('data-i18n-html');
    const original = attribute ? element.getAttribute(attribute) : html ? element.innerHTML : element.textContent;
    return { element, attribute, html, original, key: element.dataset.i18n };
  });
  const schemaElement = document.querySelector('[data-site-schema]');
  const originalSchema = schemaElement?.textContent;
  let frenchMessages;
  let languageRequest = 0;

  function readLanguage() {
    try {
      return localStorage.getItem(storageKey) === 'fr' ? 'fr' : 'en';
    } catch {
      return 'en';
    }
  }

  function loadFrenchMessages() {
    if (!frenchMessages) {
      frenchMessages = fetch('locales/fr.json').then(response => {
        if (!response.ok) throw new Error(`Traductions : HTTP ${response.status}`);
        return response.json();
      }).catch(error => {
        frenchMessages = undefined;
        throw error;
      });
    }
    return frenchMessages;
  }

  function updateSchema(language, messages) {
    if (!schemaElement) return;
    const schema = JSON.parse(originalSchema);
    const app = schema['@graph'].find(entry => entry['@type'] === 'SoftwareApplication');
    const faq = schema['@graph'].find(entry => entry['@type'] === 'FAQPage');
    app.inLanguage = language;
    faq.inLanguage = language;
    if (language === 'fr') {
      app.description = messages['schema.description'];
      app.offers.description = messages['schema.offer'];
      app.featureList = messages['schema.features'];
    }
    faq.mainEntity = [...document.querySelectorAll('.faq details')].map(entry => ({
      '@type': 'Question',
      name: entry.querySelector('summary').textContent.trim(),
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.querySelector('p').textContent.trim().replace(/\s+/g, ' ')
      }
    }));
    schemaElement.textContent = JSON.stringify(schema, null, 2);
  }

  function renderLanguage(language, messages) {
    for (const binding of bindings) {
      const value = language === 'fr' ? messages[binding.key] ?? binding.original : binding.original;
      if (binding.attribute) binding.element.setAttribute(binding.attribute, value);
      else if (binding.html) binding.element.innerHTML = value;
      else binding.element.textContent = value;
    }
    for (const element of languageContent) {
      element.hidden = element.dataset.languageContent !== language;
    }
    for (const button of languageButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.languageButton === language));
    }
    document.documentElement.lang = language;
    updateSchema(language, messages);
    document.dispatchEvent(new Event('languagechange'));
    scrollPolicyAnchor();
  }

  function scrollPolicyAnchor() {
    if (!languageContent.length || !window.location.hash) return;
    const anchor = window.location.hash.slice(1).replace(/-fr$/, '');
    const suffix = document.documentElement.lang === 'fr' ? '-fr' : '';
    document.getElementById(anchor + suffix)?.scrollIntoView();
  }

  async function selectLanguage(language, remember = false) {
    const request = ++languageRequest;
    let messages = {};
    try {
      if (language === 'fr' && bindings.length) messages = await loadFrenchMessages();
    } catch (error) {
      if (request === languageRequest) renderLanguage('en', {});
      console.warn('La traduction française est indisponible ; le texte anglais reste accessible.', error);
      return;
    }
    if (request !== languageRequest) return;
    renderLanguage(language, messages);
    if (remember) {
      try {
        localStorage.setItem(storageKey, language);
      } catch {
        // Le choix reste utilisable lorsque le stockage du navigateur est bloqué.
      }
    }
  }

  for (const button of languageButtons) {
    button.addEventListener('click', () => selectLanguage(button.dataset.languageButton, true));
  }
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) selectLanguage(readLanguage());
  });
  window.addEventListener('hashchange', scrollPolicyAnchor);
  for (const control of document.querySelectorAll('.language-switch')) control.hidden = false;
  selectLanguage(readLanguage());
})();
