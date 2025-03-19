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
    
    const elementsToTranslate = Array.from(document.querySelectorAll('[data-i18n]'));
    
    if (elementsToTranslate.length === 0) return;
    
    const elementMap = new Map();
    const keysToFetch = [];
    
    // Apply cached translations immediately and identify keys that need fetching
    for (const element of elementsToTranslate) {
      const key = element.getAttribute('data-i18n');
      
      // Group elements by key for batch processing
      if (!elementMap.has(key)) {
        elementMap.set(key, []);
      }
      elementMap.get(key).push(element);
      
      // Apply cached translation immediately if available
      if (cache[key]) {
        element.textContent = cache[key];
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
          keys: keysToFetch,
          locale: currentLocale  // Include locale in the request
        }),
      });
      
      // Handle failed requests
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const { translations } = await response.json();
      
      // Update cache with new translations
      const updatedCache = { ...cache, ...translations };
      
      // Set expiration time (24 hours)
      const cacheData = {
        translations: updatedCache,
        timestamp: Date.now(),
        locale: currentLocale
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      
      // Process translations in batches of 10 for progressive rendering
      const batchSize = 10;
      const uniqueKeys = [...new Set(keysToFetch)];
      
      for (let i = 0; i < uniqueKeys.length; i += batchSize) {
        const batch = uniqueKeys.slice(i, i + batchSize);
        
        // Use Promise.all for concurrent processing
        await Promise.all(batch.map(key => {
          return new Promise(resolve => {
            const elements = elementMap.get(key);
            const translation = translations[key] || key;
            
            // Use requestAnimationFrame to optimize DOM updates
            requestAnimationFrame(() => {
              for (const element of elements) {
                element.textContent = translation;
              }
              resolve();
            });
          });
        }));
        
        // Small delay between batches to keep UI responsive
        if (i + batchSize < uniqueKeys.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }      
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to using original keys as translation in case of error
      for (const [key, elements] of elementMap) {
        // Only update elements that weren't already translated from cache
        if (!cache[key]) {
          for (const element of elements) {
            element.textContent = key;
          }
        }
      }
    }
}  
  

document.addEventListener('DOMContentLoaded', function() {
    translatePageElements();
});