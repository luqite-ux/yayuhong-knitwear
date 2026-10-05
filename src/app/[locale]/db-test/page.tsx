import { sql, deepParseJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function DbTestPage() {
  try {
    const result = await sql`select count(*)::int as total from content_products`;
    const total = result[0]?.total ?? 0;
    
    const cats = await sql`select id, slug, name from content_categories order by sort limit 5`;
    const parsedCats = cats.map(c => ({
      id: c.id,
      slug: c.slug,
      name: deepParseJson(c.name),
    }));
    
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui' }}>
        <h1>DB Test Page</h1>
        <p>Products count: {total}</p>
        <h2>Categories:</h2>
        <pre>{JSON.stringify(parsedCats, null, 2)}</pre>
        <h2>Raw name type:</h2>
        <p>Type of name field: {typeof cats[0]?.name}</p>
        <p>Raw name value: {String(cats[0]?.name)}</p>
      </div>
    );
  } catch (err: any) {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui', color: 'red' }}>
        <h1>Error</h1>
        <pre>{err?.message || String(err)}</pre>
        <pre>{err?.stack || ''}</pre>
      </div>
    );
  }
}
