// src/i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'fr'], // Add 'fr' here
  defaultLocale: 'en',
  pathnames: {
    '/': '/',
    '/pathnames': {
      de: '/pfadnamen',
      fr: '/noms-de-chemin' // Optional: add a French path
    }
  }
});