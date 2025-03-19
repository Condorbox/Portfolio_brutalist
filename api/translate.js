import i18n from './i18n-config.js';
import { parse } from 'cookie';

export default async function handler(req, res) { 
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { keys, locale: requestLocale } = req.body;
  
  if (!Array.isArray(keys) || keys.length === 0) {
    return res.status(400).json({ error: 'Translation keys are required' });
  }
 
  try {
    // First try locale from request body (set by our frontend)
    let locale = requestLocale;
    
    // If not provided in request, fall back to cookie
    if (!locale && req.headers.cookie) {
      const cookies = parse(req.headers.cookie);
      if (cookies.locale && i18n.getLocales().includes(cookies.locale)) {
        locale = cookies.locale;
      }
    }
    
    // Final fallback to default locale
    if (!locale) {
      locale = i18n.getLocale ? i18n.getLocale() : 'en';
    }
   
    // Deduplicate keys before translation
    const uniqueKeys = [...new Set(keys)];
    
    // Translate all keys at once    
    // Use Promise.all to potentially parallelize translations if i18n library supports it
    const translationEntries = await Promise.all(
      uniqueKeys.map(async key => {
        try {
          return [key, i18n.__({ phrase: key, locale })];
        } catch (err) {
          console.warn(`Failed to translate key "${key}":`, err);
          return [key, key]; // Fallback to key itself
        }
      })
    );
    
    const translations = Object.fromEntries(translationEntries);

    // Add cache control headers
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour
    res.status(200).json({ 
      translations,
      locale, // Return used locale for client awareness
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
