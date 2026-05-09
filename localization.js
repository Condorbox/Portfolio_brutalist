const SUPPORTED_LOCALES = ['en', 'es'];
const DEFAULT_LOCALE = 'en';
const COOKIE_NAME = 'locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function setCookie(name, value, maxAge) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

function getLocaleFromPath(pathname) {
  if (pathname === '/es' || pathname.startsWith('/es/')) return 'es';
  return 'en';
}

function getBrowserLocale() {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of languages) {
    // Match 'es-ES', 'es', 'en-US', 'en'
    const prefix = lang.split('-')[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(prefix)) return prefix;
  }
  return DEFAULT_LOCALE;
}

function getTargetPath(locale, search, hash) {
  const base = locale === 'en' ? '/' : `/${locale}/`;
  return `${base}${search}${hash}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('languageSelect');
  if (!languageSelect) return;

  const { pathname, search, hash } = window.location;
  const currentLocale = getLocaleFromPath(pathname);

  languageSelect.value = currentLocale;

  const cookieLocale = getCookie(COOKIE_NAME);

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    if (cookieLocale !== currentLocale) {
      window.location.replace(getTargetPath(cookieLocale, search, hash));
      return;
    }
  } else {
    const browserLocale = getBrowserLocale();
    setCookie(COOKIE_NAME, browserLocale, COOKIE_MAX_AGE);
    if (browserLocale !== currentLocale) {
      window.location.replace(getTargetPath(browserLocale, search, hash));
      return;
    }
  }

  languageSelect.addEventListener('change', () => {
    const selectedLocale = languageSelect.value;
    if (!SUPPORTED_LOCALES.includes(selectedLocale)) return;
    if (selectedLocale === currentLocale) return;

    setCookie(COOKIE_NAME, selectedLocale, COOKIE_MAX_AGE);
    window.location.assign(getTargetPath(selectedLocale, search, hash));
  });
});