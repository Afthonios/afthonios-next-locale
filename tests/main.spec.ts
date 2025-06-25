import {expect, test as it} from '@playwright/test';

it('handles i18n routing', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL('/en');

  // A cookie remembers the last locale
  await page.goto('/fr');
  await page.goto('/');
  await expect(page).toHaveURL('/fr');
  await page
    .getByRole('combobox', {name: 'Changer de langue'})
    .selectOption({value: 'en'});

  await expect(page).toHaveURL('/en');
  page.getByRole('heading', {name: 'next-intl example'});
});

it('handles not found pages', async ({page}) => {
  await page.goto('/unknown');
  page.getByRole('heading', {name: 'Page not found'});

  await page.goto('/fr/unknown');
  page.getByRole('heading', {name: 'Page non trouvée'});
});

it("handles not found pages for routes that don't match the middleware", async ({
  page
}) => {
  await page.goto('/test.png');
  page.getByRole('heading', {name: 'This page could not be found.'});

  await page.goto('/api/hello');
  page.getByRole('heading', {name: 'This page could not be found.'});
});

it('sets caching headers', async ({request}) => {
  for (const pathname of ['/en', '/en/pathnames', '/fr', '/fr/noms-de-chemin']) {
    expect((await request.get(pathname)).headers()['cache-control']).toContain(
      's-maxage=31536000'
    );
  }
});

it('can be used to configure metadata', async ({page}) => {
  await page.goto('/en');
  await expect(page).toHaveTitle('next-intl example');

  await page.goto('/fr');
  await expect(page).toHaveTitle('Exemple next-intl');
});

it('can be used to localize the page', async ({page}) => {
  await page.goto('/en');
  page.getByRole('heading', {name: 'next-intl example'});

  await page.goto('/fr');
  page.getByRole('heading', {name: 'Exemple next-intl'});
});

it('sets a cookie when necessary', async ({page}) => {
  function getCookieValue() {
    return page.evaluate(() => document.cookie);
  }

  const response = await page.goto('/en');
  expect(await response?.headerValue('set-cookie')).toBe(null);

  await page
    .getByRole('combobox', {name: 'Change language'})
    .selectOption({value: 'fr'});
  await expect(page).toHaveURL('/fr');
  expect(await getCookieValue()).toBe('NEXT_LOCALE=fr');

  await page
    .getByRole('combobox', {name: 'Changer de langue'})
    .selectOption({value: 'en'});
  await expect(page).toHaveURL('/en');
  expect(await getCookieValue()).toBe('NEXT_LOCALE=en');

  // The Next.js Router cache kicks in here
  // https://nextjs.org/docs/app/building-your-application/caching#router-cache
  await page
    .getByRole('combobox', {name: 'Change language'})
    .selectOption({value: 'fr'});
  await expect(page).toHaveURL('/fr');
  expect(await getCookieValue()).toBe('NEXT_LOCALE=fr');
});

it("sets a cookie when requesting a locale that doesn't match the `accept-language` header", async ({
  page
}) => {
  const response = await page.goto('/fr');
  const value = await response?.headerValue('set-cookie');
  expect(value).toContain('NEXT_LOCALE=fr;');
  expect(value).toContain('Path=/;');
  expect(value).toContain('SameSite=lax');
});

it('serves a robots.txt', async ({page}) => {
  const response = await page.goto('/robots.txt');
  const body = await response?.body();
  expect(body?.toString()).toEqual('User-Agent: *\nAllow: *\n');
});

it('serves a sitemap.xml', async ({page}) => {
  const response = await page.goto('/sitemap.xml');
  const body = await response!.body();
  expect(body.toString()).toBe(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>http://localhost:3000/en</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en" />
<xhtml:link rel="alternate" hreflang="fr" href="http://localhost:3000/fr" />
</url>
<url>
<loc>http://localhost:3000/fr</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en" />
<xhtml:link rel="alternate" hreflang="fr" href="http://localhost:3000/fr" />
</url>
<url>
<loc>http://localhost:3000/en/pathnames</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en/pathnames" />
<xhtml:link rel="alternate" hreflang="fr" href="http://localhost:3000/fr/noms-de-chemin" />
</url>
<url>
<loc>http://localhost:3000/fr/noms-de-chemin</loc>
<xhtml:link rel="alternate" hreflang="en" href="http://localhost:3000/en/pathnames" />
<xhtml:link rel="alternate" hreflang="fr" href="http://localhost:3000/fr/noms-de-chemin" />
</url>
</urlset>
`
  );
});

it('provides a manifest', async ({page}) => {
  const response = await page.goto('/manifest.webmanifest');
  const body = await response!.json();
  expect(body).toEqual({
    name: 'next-intl example',
    start_url: '/',
    theme_color: '#101E33'
  });
});
