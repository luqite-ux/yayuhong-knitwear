'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export default function LocaleSwitcher({ isScrolled = false }: { isScrolled?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  const handleChange = (newLocale: string) => {
    if (newLocale !== locale) {
      // @ts-ignore - next-intl router replace
      router.replace(pathname || '/', { locale: newLocale });
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-white/10 backdrop-blur-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`locale-btn text-xs ${locale === loc ? 'active' : ''} ${
            !isScrolled ? locale !== loc ? '!text-white/70 hover:!bg-white/20 !text-white' : '' : ''
          }`}
          aria-label={`Switch to ${loc === 'zh' ? 'Chinese' : 'English'}`}
        >
          {loc === 'zh' ? '中文' : 'EN'}
        </button>
      ))}
    </div>
  );
}
