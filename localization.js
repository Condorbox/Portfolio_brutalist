// Localization
const languageSelect = document.getElementById('languageSelect');

// Set the initial value based on cookie if available if not eng
const currentLocale = getCookie('locale') || 'en';
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

// Function to translate all elements with data-i18n attribute
async function translatePageElements() {    
  // Get current locale from cookie
  const currentLocale = getCookie('locale') || 'en';
 
  // Use locale-specific cache key
  const cacheKey = `translationCache_${currentLocale}`;
  const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
 
  // Get both regular elements and placeholder attributes
  const contentElements = Array.from(document.querySelectorAll('[data-i18n]'));
  const placeholderElements = Array.from(document.querySelectorAll('[data-i18n-placeholder]'));
  
  // Combine both types into a single array with metadata
  const elementsToProcess = [
    ...contentElements.map(el => ({
      element: el,
      key: el.getAttribute('data-i18n'),
      type: 'content'
    })),
    ...placeholderElements.map(el => ({
      element: el,
      key: el.getAttribute('data-i18n-placeholder'),
      type: 'placeholder'
    }))
  ];
 
  if (elementsToProcess.length === 0) return;
 
  const elementMap = new Map();
  const keysToFetch = [];
 
  // Apply cached translations immediately and identify keys that need fetching
  for (const item of elementsToProcess) {
    const { element, key, type } = item;
    
    if (!elementMap.has(key)) {
      elementMap.set(key, []);
    }
    elementMap.get(key).push({ element, type });
    
    // Apply cached translation immediately if available
    if (cache[key]) {
      if (type === 'content') {
        element.textContent = cache[key];
      } else if (type === 'placeholder') {
        element.setAttribute('placeholder', cache[key]);
      }
    } else {
      keysToFetch.push(key);
    }
  }
 
  // No need to make API call if all translations are cached
  if (keysToFetch.length === 0) {
    return;
  }
 
  try {
    const response = await fetch(`/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keys: [...new Set(keysToFetch)], // Remove duplicates
        locale: currentLocale
      }),
    });
   
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
   
    const { translations } = await response.json();
   
    // Update cache with new translations
    const updatedCache = { ...cache, ...translations };
    localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
   
    // Process translations in batches
    const batchSize = 10;
    const uniqueKeys = [...new Set(keysToFetch)];
   
    for (let i = 0; i < uniqueKeys.length; i += batchSize) {
      const batch = uniqueKeys.slice(i, i + batchSize);
      
      // Use Promise.all for concurrent processing
      await Promise.all(batch.map(key => {
        return new Promise(resolve => {
          const elementInfos = elementMap.get(key);
          const translation = translations[key] || key;
          
          // Use requestAnimationFrame to optimize DOM updates
          requestAnimationFrame(() => {
            for (const { element, type } of elementInfos) {
              if (type === 'content') {
                element.textContent = translation;
              } else if (type === 'placeholder') {
                element.setAttribute('placeholder', translation);
              }
            }
            resolve();
          });
        });
      }));
     
      if (i + batchSize < uniqueKeys.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }      
  } catch (error) {
    console.error('Translation error:', error);
   
    // Fallback handling
    for (const [key, elementInfos] of elementMap) {
      // Only update elements that weren't already translated from cache
      if (!cache[key]) {
        for (const { element, type } of elementInfos) {
          if (type === 'content') {
            element.textContent = key;
          } else if (type === 'placeholder') {
            element.setAttribute('placeholder', key);
          }
        }
      }
    }
  }
}  

document.addEventListener('DOMContentLoaded', function() {
  translatePageElements();

  // Change cv language
  const cvLink = document.getElementById('cv-download');
  cvLink.href = `files/Manuel Martínez cv_${currentLocale}.pdf`;
});