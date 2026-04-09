// Language switcher (URL-based, SSG pages: / and /es/)
document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('languageSelect');
  if (!languageSelect) return;

  const supportedLocales = ['en', 'es'];
  const pathname = window.location.pathname || '/';
  const currentLocale =
    pathname === '/es' || pathname.startsWith('/es/') ? 'es' : 'en';

  if (supportedLocales.includes(currentLocale)) {
    languageSelect.value = currentLocale;
  }

  languageSelect.addEventListener('change', () => {
    const selectedLocale = languageSelect.value;
    if (!supportedLocales.includes(selectedLocale)) return;
    if (selectedLocale === currentLocale) return;

    const targetPath = selectedLocale === 'es' ? '/es/' : '/';
    window.location.assign(`${targetPath}${window.location.search}${window.location.hash}`);
  });
});
