import { getPageNeWO } from '@/lib/directus/pages/new-offer';

export async function getPageContentBySlug(slug: string, locale: 'en' | 'fr') {
  if (slug === 'course-of-the-week') {
    return await getPageNeWO(locale);
  }

  throw new Error(`No data fetcher implemented for slug: ${slug}`);
}