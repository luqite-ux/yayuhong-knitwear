import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'zh-TW', 'en', 'ru', 'es', 'de', 'fr', 'pt', 'ja', 'ar', 'vn'],
  defaultLocale: 'zh',
  localePrefix: 'always',
});
