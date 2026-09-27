import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en', 'ru', 'es', 'de', 'fr', 'pt', 'ja', 'ar'],
  defaultLocale: 'zh',
  localePrefix: 'always',
});
