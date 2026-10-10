-- 0007_vietnam_products.sql
-- 越南市场产品数据：适合热带气候的薄款针织产品
-- 基于Shopee/Lazada越南热卖品调研(2025-2026)
-- 在 www.xiuyuknit.com/vn 路径下展示，products.sites = {overseas}

-- 越南专属产品分类
insert into content_categories (slug, name, sort, sites)
values
  ('vn-cardigan', '{"zh":"薄款开衫","en":"Lightweight Cardigans","vn":"Áo Cardigan Mỏng"}', 1, '{"overseas"}'),
  ('vn-knit-tee', '{"zh":"针织T恤","en":"Summer Knit Tees","vn":"Áo Thun Dệt Kim"}', 2, '{"overseas"}'),
  ('vn-polo-knit', '{"zh":"针织POLO","en":"Knit Polo Shirts","vn":"Áo Polo Dệt Kim"}', 3, '{"overseas"}'),
  ('vn-sun-protection', '{"zh":"防晒针织","en":"Sun Protection Knit","vn":"Áo Dệt Kim Chống Nắng"}', 4, '{"overseas"}'),
  ('vn-loungewear', '{"zh":"薄款家居服","en":"Lightweight Loungewear","vn":"Đồ Mặc Nhà Mỏng"}', 5, '{"overseas"}')
on conflict (slug) do update set
  name = excluded.name,
  sort = excluded.sort,
  sites = excluded.sites;

-- 产品1: Tencel防晒长袖针织开衫 (CatKaiser热卖款, 9色, Polyester80.2%+Lyocell19.8%)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-tencel-sun-protection-cardigan',
  '{"zh":"Tencel防晒长袖针织开衫","en":"Tencel Sun Protection Long Sleeve Knit Cardigan","vn":"Áo Len Chống Nắng Plain Feel Tencel Dài Tay"}',
  'VN-CD-001',
  '{"zh":"Tencel混纺防晒长袖开衫，9色可选。凉感透气，V领宽松版型，适合越南夏季防晒通勤。Polyester 80.2% + Lyocell 19.8%。","en":"Tencel blend sun protection long sleeve cardigan, 9 colors. Cooling and breathable, V-neck loose fit, perfect for Vietnam summer sun protection and commute. Polyester 80.2% + Lyocell 19.8%.","vn":"Áo len chống nắng Plain Feel Tencel dài tay, 9 màu. Mát lạnh thoáng khí, cổ V form rộng, phù hợp chống nắng đi làm mùa hè. Polyester 80.2% + Lyocell 19.8%."}',
  '',
  (select id from content_categories where slug = 'vn-sun-protection'),
  '{"overseas"}',
  1,
  true
)
on conflict (slug) do nothing;

-- 产品2: 薄款网眼针织开衫 (ForGirl FG063, Shopee销量32,500+件, 61,000₫)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mesh-knit-cardigan-fg063',
  '{"zh":"薄款网眼针织开衫","en":"Lightweight Mesh Knit Cardigan","vn":"Áo Cardigan Lưới Dệt Kim Mỏng"}',
  'VN-CD-002',
  '{"zh":"薄款网眼针织开衫，宽松版型，白/米/棕3色。Shopee同款热卖32,500+件。四季可穿，可机洗。","en":"Lightweight mesh knit cardigan, loose fit, white/beige/brown 3 colors. Shopee similar style sold 32,500+ pcs. All-season, machine washable.","vi":"Áo cardigan lưới dệt kim mỏng, form rộng, trắng/kem/nâu 3 màu. Shopee cùng mẫu bán 32,500+ chiếc. Mặc 4 mùa, giặt máy được."}',
  '',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}',
  2,
  true
)
on conflict (slug) do nothing;

-- 产品3: 半高领薄款针织衫 (mmoutfit热卖, 299,000₫, 100% Cotton, 修身)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-half-turtleneck-cotton-knit',
  '{"zh":"半高领纯棉薄款针织衫","en":"Half Turtleneck Cotton Thin Knit","vn":"Áo Len Mỏng Cổ 3 Phân"}',
  'VN-KT-003',
  '{"zh":"半高领纯棉薄款针织衫，修身版型，粉/绿/灰3色。100% Cotton，适合春秋通勤和叠穿。","en":"Half turtleneck 100% cotton thin knit, slim fit, pink/green/gray 3 colors. Perfect for spring/autumn commute and layering.","vn":"Áo len mỏng cổ 3 phân 100% cotton, form ôm, hồng/xanh/xám 3 màu. Phù hợp đi làm xuân thu và mặc lớp."}',
  '',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}',
  3,
  true
)
on conflict (slug) do nothing;

-- 产品4: 抽褶长款针织开衫 (mmoutfit热卖, 469,000₫, 棉质薄针织, 长款)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-gathered-long-cardigan',
  '{"zh":"抽褶长款薄针织开衫","en":"Gathered Long Thin Knit Cardigan","vn":"Áo Cardigan Dài Tay Rút Nhún Dáng Dài"}',
  'VN-CD-004',
  '{"zh":"抽褶长款薄针织开衫，棉质薄针织面料，黑/红2色。弹性好显瘦，适合通勤叠穿。","en":"Gathered long thin knit cardigan, cotton blend thin knit, black/red 2 colors. Stretchy and slimming, perfect for commute layering.","vn":"Áo cardigan dài tay rút nhún dáng dài, vải cotton dệt mỏng, đen/đỏ 2 màu. Co giãn tốt tôn dáng, phù hợp mặc lớp đi làm."}',
  '',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}',
  4,
  true
)
on conflict (slug) do nothing;

-- 产品5: 蓝条纹薄款针织衫 (sonamu.vn高端款, 1,150,000₫, 100% Cotton, 盒型宽松)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-blue-stripe-cotton-knit',
  '{"zh":"蓝条纹纯棉薄针织衫","en":"Blue Stripe Cotton Thin Knit","vn":"Áo Len Mỏng Kẻ Xanh"}',
  'VN-KT-005',
  '{"zh":"蓝白条纹纯棉薄针织衫，盒型宽松版型，100% Cotton。柔软轻量，休闲舒适。","en":"Blue-white stripe 100% cotton thin knit, boxy loose fit. Soft and lightweight, casual comfort.","vn":"Áo len mỏng kẻ xanh trắng 100% cotton, dáng rộng boxy. Mềm nhẹ, thoải mái thường ngày."}',
  '',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}',
  5,
  true
)
on conflict (slug) do nothing;

-- 产品6: 3cm高领罗纹针织衫 (Shopee BO STORE热卖, 69,000₫, 多色, 修身)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-ribbed-turtleneck-basic',
  '{"zh":"3cm高领罗纹薄针织衫","en":"3cm High Neck Ribbed Thin Knit","vn":"Áo Len Nữ Gân Tăm Cổ Cao 3cm"}',
  'VN-KT-006',
  '{"zh":"3cm高领罗纹薄针织衫，多色可选，修身版型。轻薄基础款，适合内搭和叠穿。","en":"3cm high neck ribbed thin knit, multi-color, slim fit. Lightweight basic style, perfect for inner layer and layering.","vn":"Áo len nữ gân tăm cổ cao 3cm, nhiều màu, form ôm. Mỏng nhẹ mẫu cơ bản, phù hợp mặc trong và mặc lớp."}',
  '',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}',
  6,
  true
)
on conflict (slug) do nothing;

-- 产品7: 雪纺防晒针织开衫 (Shopee热卖, 雪纺面料, 薄款长袖)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-chiffon-sun-cardigan',
  '{"zh":"雪纺防晒针织开衫","en":"Chiffon Sun Protection Knit Cardigan","vn":"Áo Khoác Cardigan Voan Chống Nắng"}',
  'VN-CD-007',
  '{"zh":"雪纺面料防晒针织开衫，薄款长袖。轻盈飘逸，适合夏季防晒和空调房叠穿。","en":"Chiffon sun protection knit cardigan, thin long sleeve. Light and flowy, perfect for summer sun protection and AC room layering.","vn":"Áo khoác cardigan voan chống nắng, mỏng tay dài. Nhẹ bay bổng, phù hợp chống nắng mùa hè và mặc phòng máy lạnh."}',
  '',
  (select id from content_categories where slug = 'vn-sun-protection'),
  '{"overseas"}',
  7,
  true
)
on conflict (slug) do nothing;

-- 产品8: 粉色短袖薄针织开衫 (Lazada热卖, 169,000₫, 粉/米白)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-short-sleeve-cardigan',
  '{"zh":"粉色短袖薄针织开衫","en":"Pink Short Sleeve Thin Knit Cardigan","vn":"Cardigan Nữ Áo Dệt Kim Ngắn Tay Len Mỏng"}',
  'VN-CD-008',
  '{"zh":"粉色短袖薄针织开衫，粉/米白2色。短袖设计，适合夏季通勤和休闲。","en":"Pink short sleeve thin knit cardigan, pink/beige 2 colors. Short sleeve design, perfect for summer commute and casual.","vn":"Cardigan nữ áo dệt kim ngắn tay len mỏng, hồng/kem 2 màu. Thiết kế tay ngắn, phù hợp đi làm và thường ngày mùa hè."}',
  '',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}',
  8,
  true
)
on conflict (slug) do nothing;

-- 产品9: Croptop短款针织开衫 (Shopee TD09热卖, Pastel色, 薄款长袖纽扣)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-croptop-pastel-cardigan',
  '{"zh":"Pastel色短款针织开衫","en":"Pastel Croptop Knit Cardigan","vn":"Áo Cardigan Croptop Mỏng Nhẹ Màu Pastel"}',
  'VN-CD-009',
  '{"zh":"Pastel色短款针织开衫，薄款长袖纽扣设计。年轻时尚，搭配高腰裤显腿长。","en":"Pastel croptop knit cardigan, thin long sleeve button design. Youthful and trendy, pairs with high-waist pants to elongate legs.","vn":"Áo cardigan croptop mỏng nhẹ màu pastel, tay dài đính nút. Trẻ thời, phối quần cao lưng tôn chân dài."}',
  '',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}',
  9,
  true
)
on conflict (slug) do nothing;

-- 产品10: Micro Knit针织POLO衫 (By Cotton品牌, 615,000₫, 细针织)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-micro-knit-polo',
  '{"zh":"Micro Knit细针织POLO衫","en":"Micro Knit Polo Sweater","vn":"Áo Polo Dệt Kim Micro Knit"}',
  'VN-PL-010',
  '{"zh":"Micro Knit细针织POLO衫，多色可选。质感通勤风，细针织面料显高级。","en":"Micro knit polo sweater, multi-color. Textured commute style, fine knit fabric looks premium.","vn":"Áo polo dệt kim micro knit, nhiều màu. Chất đi làm, vải dệt kim mịn trông cao cấp."}',
  '',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}',
  10,
  true
)
on conflict (slug) do nothing;

-- 产品11: Cable Knit绞花针织POLO衫 (By Cotton品牌, 650,000₫)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cable-knit-polo',
  '{"zh":"Cable Knit绞花针织POLO衫","en":"Cable Knit Polo Sweater","vn":"Áo Polo Dệt Kim Cable Knit"}',
  'VN-PL-011',
  '{"zh":"Cable Knit绞花针织POLO衫，多色可选。经典绞花纹理，质感通勤。","en":"Cable knit polo sweater, multi-color. Classic cable texture, textured commute style.","vn":"Áo polo dệt kim cable knit, nhiều màu. Hoạ tiết cable cổ điển, chất đi làm."}',
  '',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}',
  11,
  true
)
on conflict (slug) do nothing;

-- 产品12: 竖条纹针织POLO衫 (mrsimple.vn热卖, 729,000₫, 灰/棕)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-rib-stripe-polo',
  '{"zh":"竖条纹针织POLO衫","en":"Vertical Rib Knit Polo","vn":"Áo Thun Có Cổ Dệt Kim"}',
  'VN-PL-012',
  '{"zh":"竖条纹针织POLO衫，灰/棕2色。竖条纹肌理，质感通勤休闲两不误。","en":"Vertical rib knit polo, gray/brown 2 colors. Vertical stripe texture, perfect for both commute and casual.","vn":"Áo thun có cổ dệt kim, xám/nâu 2 màu. Hoạ tiết sổ dọc, phù hợp đi làm và thường ngày."}',
  '',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}',
  12,
  true
)
on conflict (slug) do nothing;

-- 产品13: 圆领基础薄款针织衫 (Lazada搜索热卖, 100,000-200,000₫)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-basic-crew-neck-knit',
  '{"zh":"圆领基础薄款针织衫","en":"Basic Crew Neck Thin Knit","vn":"Áo Len Mỏng Cổ Tròn Basic"}',
  'VN-KT-013',
  '{"zh":"圆领基础薄款针织衫，多色可选。基础百搭款，适合通勤叠穿和日常休闲。","en":"Basic crew neck thin knit, multi-color. Versatile basic style, perfect for commute layering and daily casual.","vn":"Áo len mỏng cổ tròn basic, nhiều màu. Mẫu cơ bản dễ mix match, phù hợp đi làm và thường ngày."}',
  '',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}',
  13,
  true
)
on conflict (slug) do nothing;

-- 产品14: 苔藓绿条纹薄针织衫 (Shopee热卖, 苔藓绿条纹, 通勤优雅)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-moss-green-stripe-knit',
  '{"zh":"苔藓绿条纹薄针织衫","en":"Moss Green Stripe Thin Knit","vn":"Áo Len Mỏng Dải Xanh Rêu"}',
  'VN-KT-014',
  '{"zh":"苔藓绿条纹薄针织衫，优雅通勤风。清新自然色调，适合春秋叠穿。","en":"Moss green stripe thin knit, elegant commute style. Fresh natural tone, perfect for spring/autumn layering.","vn":"Áo len mỏng dải xanh rêu, phong cách đi làm thanh lịch. Tông màu tươi tự nhiên, phù hợp mặc lớp xuân thu."}',
  '',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}',
  14,
  true
)
on conflict (slug) do nothing;

-- 产品15: 薄款针织家居服套装 (热带气候居家穿着)
insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
values (
  'vn-lightweight-loungewear-set',
  '{"zh":"薄款针织家居服套装","en":"Lightweight Knit Loungewear Set","vn":"Set Đồ Mặc Nhà Dệt Kim Mỏng"}',
  'VN-LW-015',
  '{"zh":"薄款针织家居服套装，短袖+短裤组合。柔软亲肤，透气不闷热，适合热带气候居家穿着。","en":"Lightweight knit loungewear set, short sleeve + shorts combo. Soft skin-friendly, breathable and non-stuffy, suitable for tropical home wear.","vn":"Set đồ mặc nhà dệt kim mỏng, combo áo ngắn + quần đùi. Mềm thân thiện da, thoáng khí không bí, phù hợp mặc nhà khí hậu nhiệt đới."}',
  '',
  (select id from content_categories where slug = 'vn-loungewear'),
  '{"overseas"}',
  15,
  true
)
on conflict (slug) do nothing;
