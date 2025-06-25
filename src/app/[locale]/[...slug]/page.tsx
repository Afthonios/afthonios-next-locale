import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getPageContentBySlug } from '@/lib/pages';
import PageLayout from '@/components/PageLayout';

type Props = {
  params: {
    locale: 'en' | 'fr';
    // The slug is now an array of path segments, e.g., ['course-of-the-week']
    slug: string[];
  };
};

/**
 * This function generates all possible page routes at build time.
 * It's now more robust with error checking.
 */
export async function generateStaticParams() {
  try {
    const pages = await getAllPages();
    
    // Defensive check to ensure we have a valid array of pages from Directus
    if (!Array.isArray(pages) || pages.length === 0) {
      console.error("generateStaticParams: Failed to fetch pages or no pages were returned. Response:", pages);
      return [];
    }

    const params = pages.flatMap(page => {
      if (!page.translations || !Array.isArray(page.translations)) {
        return [];
      }
      
      return page.translations.map(translation => {
        if (!translation.languages_code || !translation.slug) {
          return null;
        }
        
        return {
          locale: translation.languages_code.split('-')[0],
          slug: [translation.slug],
        };
      });
    }).filter(Boolean); // Remove any null entries from invalid translations

    return params;

  } catch (error) {
    console.error("generateStaticParams: An unexpected error occurred.", error);
    return []; // Return empty on error to prevent the entire build from failing
  }
}

export default async function CatchAllPage({ params }: { params: Promise<{ locale: 'en' | 'fr'; slug: string[] }> }) {
  // Next 15 returns params as a Promise; await it first
  const { locale, slug } = await params;
  
  // The slug from the URL is an array, e.g., ['course-of-the-week']. We need the first item.
  const pageSlug = slug[0];

  setRequestLocale(locale);

  try {
    const page = await getPageContentBySlug(pageSlug, locale);

    return (
      <PageLayout title={page.title}>
        <div className="max-w-[590px]">
          <p
            dangerouslySetInnerHTML={{ __html: page.description }}
          ></p>
          <span className="mt-4 inline-block rounded bg-primary px-2 py-1 text-sm font-semibold text-white">
            {page.label}
          </span>
        </div>
      </PageLayout>
    );
  } catch (error) {
    console.error(`Failed to render page for slug "${pageSlug}" and locale "${locale}"`, error);
    notFound();
  }
}
