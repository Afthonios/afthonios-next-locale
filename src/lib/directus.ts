import { createDirectus, rest } from '@directus/sdk';

// This is where we initialize the Directus client.
// It reads the URL from the environment variables you've set up.
const directus = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(rest());

export default directus;

---

export async function getPageNeWO(locale: 'fr' | 'en') {
  const lang = locale === 'fr' ? 'fr-FR' : 'en-US';
  const url = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/page_newoffer?fields=*,translations.*`;

  const res = await fetch(url, {
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data from Directus. Status: ${res.status}`);
  }

  const json = await res.json();
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