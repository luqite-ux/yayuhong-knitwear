import { sql } from '@/lib/db';
import { pick } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://xiuyuknit.com';

  const products = await sql<{ name: Record<string, string>; slug: string; summary: Record<string, string> }[]>`
    select name, slug, summary
    from content_products
    where is_active = true
    order by sort, created_at
  `;

  const articles = await sql<{ title: Record<string, string>; slug: string }[]>`
    select title, slug
    from content_articles
    where status = 'published'
    order by published_at desc
  `;

  const profile = await sql<{ site_name: Record<string, string>; intro: Record<string, string> | null }[]>`
    select site_name, intro from site_profile order by created_at limit 1
  `;

  const p = profile[0];
  const siteName = p ? pick(p.site_name, 'en') : 'Yayuhong Knitwear';
  const intro = p?.intro ? pick(p.intro, 'en') : 'OEM/ODM knitwear manufacturer specializing in sweaters, loungewear, and accessories.';

  let txt = `# ${siteName}\n\n`;
  txt += `> ${intro}\n\n`;
  txt += `Base URL: ${baseUrl}\n\n`;

  if (products.length > 0) {
    txt += `## Products\n\n`;
    for (const prod of products) {
      const name = pick(prod.name, 'en');
      const summary = pick(prod.summary, 'en');
      txt += `- [${name}](${baseUrl}/en/products): ${summary}\n`;
    }
    txt += `\n`;
  }

  if (articles.length > 0) {
    txt += `## Articles\n\n`;
    for (const art of articles) {
      const title = pick(art.title, 'en');
      txt += `- [${title}](${baseUrl}/en/articles/${art.slug})\n`;
    }
    txt += `\n`;
  }

  txt += `## Links\n\n`;
  txt += `- [Home](${baseUrl}/en)\n`;
  txt += `- [Products](${baseUrl}/en/products)\n`;
  txt += `- [Factory](${baseUrl}/en/factory)\n`;
  txt += `- [Services](${baseUrl}/en/services)\n`;
  txt += `- [Contact](${baseUrl}/en/contact)\n`;

  return new Response(txt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
