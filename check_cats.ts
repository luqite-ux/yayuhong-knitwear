import 'dotenv/config';
import { sql, deepParseJson } from '@/lib/db';

(async () => {
  const cats = await sql`select id, slug, name, sort from content_categories order by sort`;
  console.log('Categories:');
  cats.forEach(c => {
    const name = typeof c.name === 'string' ? JSON.parse(c.name) : c.name;
    console.log('  ', c.id, c.slug, '-', JSON.stringify(name), 'sort:', c.sort);
  });

  const prods = await sql`select id, slug, name, category_id from content_products order by created_at desc limit 15`;
  console.log('\nRecent products:');
  prods.forEach(p => {
    const name = typeof p.name === 'string' ? JSON.parse(p.name) : p.name;
    console.log('  ', p.id, p.slug, '-', JSON.stringify(name), 'cat:', p.category_id);
  });

  process.exit(0);
})();
