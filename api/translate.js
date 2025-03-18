import i18n from './i18n-config.js';
import { parse } from 'cookie';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Translation key is required' });
  }

  try {
    // Get default locale
    let locale = i18n.getLocale ? i18n.getLocale() : 'en';

    // Check locale in cookies
    if (req.headers.cookie) {
      const cookies = parse(req.headers.cookie);
      if (cookies.locale && i18n.getLocales().includes(cookies.locale)) {
        locale = cookies.locale;
      }
    }
    
    const translation = i18n.__({ phrase: key, locale });
    res.status(200).json({ translation });
  } catch (error) {
    console.error('Error fetching translation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}