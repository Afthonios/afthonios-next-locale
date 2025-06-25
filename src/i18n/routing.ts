import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'], // Removed 'de'
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pathnames': {
      fr: '/noms-de-chemin' // Removed 'de' path
    }
  }
});