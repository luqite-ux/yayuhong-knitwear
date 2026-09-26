import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'zh'],
  
  // Used when no locale matches
  defaultLocale: 'zh',
  
  // Always show locale prefix for consistency with B2B site
  localePrefix: 'always',
});
