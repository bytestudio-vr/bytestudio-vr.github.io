(() => {
  const websiteId = '6d7e105a-1398-488f-ab37-1308674ce08d';
  const domains = ['bytestudio-vr.github.io'];
  const doNotTrack = navigator.doNotTrack === '1' || window.doNotTrack === '1';

  if (
    !websiteId ||
    !domains.includes(window.location.hostname) ||
    doNotTrack ||
    navigator.globalPrivacyControl === true
  ) return;

  const script = document.createElement('script');
  script.src = 'https://cloud.umami.is/script.js';
  script.async = true;
  script.dataset.websiteId = websiteId;
  script.dataset.domains = domains.join(',');
  script.dataset.doNotTrack = 'true';
  script.dataset.excludeSearch = 'true';
  script.dataset.excludeHash = 'true';
  document.head.appendChild(script);
})();
