import { readItems } from '@directus/sdk';
import directus from './directus';

// --- For General Pages ---

export interface PageTranslation {
  languages_code: string; // e.g., 'en-US', 'fr-FR'
  slug: string;
  title: string;
  description: string;
  label: string;
}

export interface Page {
  translations: PageTranslation[];
}

/**
 * Fetches all pages with all their translations.
 * Now handles the case where Directus returns a single object.
 */
export async function getAllPages(): Promise<Page[]> {
  const result = await directus.request(readItems('page_freecourse', {
    fields: ['translations.*'],
  }));

  // If Directus returns a single object (when there's only one item),
  // wrap it in an array to ensure consistency.
  if (result && !Array.isArray(result)) {
    return [result as unknown as Page];
  }

  return (result as Page[]) || [];
}

/**
 * Fetches a single page that has a specific slug in a specific language.
 */
export function getPageBySlug(slug: string, locale: 'en' | 'fr'): Promise<Page[]> {
  return directus.request(readItems('page_freecourse', {
    filter: {
      translations: {
        _some: {
          slug: { _eq: slug },
          // Match language codes like 'en-US' with locale 'en'
          languages_code: { _starts_with: locale }, 
        },
      },
    },
    fields: ['translations.*'],
    limit: 1,
  }));
}
