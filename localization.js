// Localization
const languageSelect = document.getElementById('languageSelect');

const supportedLocales = ['en', 'es'];

// Set the initial value based on cookie if available if not eng
const cookieLocale = getCookie('locale');
const currentLocale = supportedLocales.includes(cookieLocale) ? cookieLocale : 'en';
languageSelect.value = currentLocale;

languageSelect.addEventListener('change', async () => {
  const selectedLanguage = languageSelect.value;
  
  try {
    const response = await fetch('/api/change-language', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ locale: selectedLanguage })
    });
    
    if (response.ok) {
      // Reload the page to apply the new language
      window.location.reload();
    } else {
      console.error('Failed to change language');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

let buildIdPromise;
async function getBuildId() {
  if (!buildIdPromise) {
    buildIdPromise = (async () => {
      try {
        const response = await fetch('/api/build-info', { cache: 'no-store' });
        if (!response.ok) return '';
        const data = await response.json();
        return typeof data.buildId === 'string' ? data.buildId : '';
      } catch {
        return '';
      }
    })();
  }

  return buildIdPromise;
}

async function loadTranslations(locale) {
  const buildId = await getBuildId();
  const version = buildId ? `?v=${encodeURIComponent(buildId)}` : '';

  const response = await fetch(`/locales/${locale}.json${version}`, {
    cache: buildId ? 'force-cache' : 'no-cache'
  });
  if (!response.ok) {
    throw new Error(`Failed to load translations for "${locale}": ${response.status}`);
  }
  return response.json();
}

// Function to translate all elements with data-i18n attribute
async function translatePageElements() {    
  // Get current locale from cookie
  const cookieLocale = getCookie('locale');
  const currentLocale = supportedLocales.includes(cookieLocale) ? cookieLocale : 'en';

  let translations = {};
  try {
    translations = await loadTranslations(currentLocale);
  } catch (error) {
    console.error('Translation error:', error);
    return;
  }

  const contentElements = Array.from(document.querySelectorAll('[data-i18n]'));
  const placeholderElements = Array.from(document.querySelectorAll('[data-i18n-placeholder]'));

  for (const element of contentElements) {
    const key = element.getAttribute('data-i18n');
    const translation = translations[key];
    if (typeof translation === 'string') {
      element.textContent = translation;
    }
  }

  for (const element of placeholderElements) {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = translations[key];
    if (typeof translation === 'string') {
      element.setAttribute('placeholder', translation);
    }
  }
}  

document.addEventListener('DOMContentLoaded', function() {
  translatePageElements();

  // Change cv language
  const cvLink = document.getElementById('cv-download');
  cvLink.href = `files/Manuel Martínez cv_${currentLocale}.pdf`;
});