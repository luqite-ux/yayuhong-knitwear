const { sql } = require('./src/lib/db');

(async () => {
  const cats = await sql`select id, slug, name, sort from content_categories order by sort`;
  console.log('Categories:');
  cats.forEach(c => console.log('  ', c.id, c.slug, '-', JSON.stringify(c.name), 'sort:', c.sort));

  const prods = await sql`select id, slug, name, category_id from content_products order by created_at desc limit 15`;
  console.log('\nRecent products:');
  prods.forEach(p => console.log('  ', p.id, p.slug, '-', JSON.stringify(p.name), 'cat:', p.category_id));

  process.exit(0);
})();
