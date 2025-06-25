


import { getItems } from '@directus/sdk';
import directus from '../directus';

export async function getPageNeWO(locale: 'fr' | 'en') {
  const lang = locale === 'fr' ? 'fr-FR' : 'en-US';

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/page_newoffer?fields=*,translations.*`,
    {
      next: { revalidate: 1800 },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch data from Directus. Status: ${response.status}`);
  }

  const json = await response.json();
  const rawData = Array.isArray(json.data) ? json.data[0] : json.data;

  if (!rawData) {
    throw new Error('No page data found for page_newoffer.');
  }

  const translation = rawData.translations?.find(
    (t: { languages_code: string }) => t.languages_code === lang
  );

  if (!translation) {
    throw new Error(`No translation found for locale "${locale}" (languages_code: "${lang}")`);
  }

  const { id, languages_code, ...translationData } = translation;

  return {
    ...rawData,
    ...translationData,
  };
}