import { serialize } from 'cookie';
import i18n from './i18n-config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { locale } = req.body;
  
  if (!i18n.getLocales().includes(locale)) {
    return res.status(400).json({ success: false, message: 'Invalid locale' });
  }

  // Set cookie that will be used for subsequent requests
  res.setHeader('Set-Cookie', serialize('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'strict',
    httpOnly: false
  }));

    res.status(200).json({ success: true, message: 'Language changed successfully: ' + locale });
}