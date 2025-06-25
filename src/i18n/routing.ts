import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pathnames': {
      fr: '/noms-de-chemin'
    },
    // Mapping of Directus slugs
    '/course-of-the-week': {
      fr: '/cours-de-la-semaine'
    }
  }
});
