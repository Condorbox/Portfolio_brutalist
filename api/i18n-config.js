import i18n from "i18n";
import path from 'path';

i18n.configure({
    locales: ['en', 'es', 'fr', 'de', 'zh'],
    directory: path.join(process.cwd(), 'locales'),
    defaultLocale: 'en',
    cookie: 'locale',
    objectNotation: true
});
  
export default i18n;
