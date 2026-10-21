-- 0009_vietnam_hot_50.sql
-- 越南市场热卖 50 款针织毛衫（参照 Shopee/Lazada 热卖特征）
-- 新增分类：vn-knit-dress, vn-mens-knit

insert into content_categories (slug, name, sort, sites) values
  ('vn-knit-dress', '{"zh":"针织连衣裙","en":"Knit Dresses","vn":"Đầm Len"}', 6, '{"overseas"}'),
  ('vn-mens-knit', '{"zh":"男士针织","en":"Mens Knitwear","vn":"Áo Len Nam"}', 7, '{"overseas"}')
on conflict (slug) do nothing;

-- 1: 粉色泡泡袖短款针织开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-puff-sleeve-cropped-cardigan',
  '{"zh":"粉色泡泡袖短款针织开衫","en":"Pink Puff-Sleeve Cropped Cardigan","vn":"Áo Cardigan Len Hồng Tay Bồng Beo Croptop"}',
  'VN-HOT-001',
  '/products/vn/vn-pink-puff-sleeve-cropped-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 1, true
) on conflict (slug) do nothing;

-- 2: 奶白V领珍珠扣针织开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-vneck-pearl-button-cardigan',
  '{"zh":"奶白V领珍珠扣针织开衫","en":"Cream V-Neck Pearl Button Cardigan","vn":"Áo Cardigan Kem Cổ V Cúc Ngọc Trai"}',
  'VN-HOT-002',
  '/products/vn/vn-cream-vneck-pearl-button-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 2, true
) on conflict (slug) do nothing;

-- 3: 薄荷绿连帽拉链开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mint-hooded-zip-cardigan',
  '{"zh":"薄荷绿连帽拉链开衫","en":"Mint Hooded Zip Cardigan","vn":"Áo Cardigan Có Mũ Xanh Bạc Hà Khoá Kéo"}',
  'VN-HOT-003',
  '/products/vn/vn-mint-hooded-zip-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 3, true
) on conflict (slug) do nothing;

-- 4: 薰衣草紫绞花针织开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-lavender-cable-knit-cardigan',
  '{"zh":"薰衣草紫绞花针织开衫","en":"Lavender Cable-Knit Cardigan","vn":"Áo Cardigan Dệt Cable Màu Oải Hương"}',
  'VN-HOT-004',
  '/products/vn/vn-lavender-cable-knit-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 4, true
) on conflict (slug) do nothing;

-- 5: 婴儿蓝荷叶边针织开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-babyblue-ruffle-trim-cardigan',
  '{"zh":"婴儿蓝荷叶边针织开衫","en":"Baby Blue Ruffle Trim Cardigan","vn":"Áo Cardigan Xanh Dương Nhạt Viền Nơ Bồng"}',
  'VN-HOT-005',
  '/products/vn/vn-babyblue-ruffle-trim-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 5, true
) on conflict (slug) do nothing;

-- 6: 白色镂空网眼针织开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-white-pointelle-eyelet-cardigan',
  '{"zh":"白色镂空网眼针织开衫","en":"White Pointelle Eyelet Cardigan","vn":"Áo Cardigan Trắng Dệt Lỗ Eyelet"}',
  'VN-HOT-006',
  '/products/vn/vn-white-pointelle-eyelet-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 6, true
) on conflict (slug) do nothing;

-- 7: 米色条纹宽松针织开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-beige-striped-oversized-cardigan',
  '{"zh":"米色条纹宽松针织开衫","en":"Beige Striped Oversized Cardigan","vn":"Áo Cardigan Sọc Be Form Rộng"}',
  'VN-HOT-007',
  '/products/vn/vn-beige-striped-oversized-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 7, true
) on conflict (slug) do nothing;

-- 8: 驼色绞花保暖开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-camel-cozy-cable-cardigan',
  '{"zh":"驼色绞花保暖开衫","en":"Camel Cozy Cable Cardigan","vn":"Áo Cardigan Dệt Cable Màu Nâu Camel"}',
  'VN-HOT-008',
  '/products/vn/vn-camel-cozy-cable-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 8, true
) on conflict (slug) do nothing;

-- 9: 黑色流苏街头风开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-black-fringe-street-cardigan',
  '{"zh":"黑色流苏街头风开衫","en":"Black Fringe Street Cardigan","vn":"Áo Cardigan Đen Đính Tassel Phong Cách Đường Phố"}',
  'VN-HOT-009',
  '/products/vn/vn-black-fringe-street-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 9, true
) on conflict (slug) do nothing;

-- 10: 藏青翻领学院风开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-navy-collared-preppy-cardigan',
  '{"zh":"藏青翻领学院风开衫","en":"Navy Collared Preppy Cardigan","vn":"Áo Cardigan Có Cổ Bẻ Xanh Navy Phong Cách Học Đường"}',
  'VN-HOT-010',
  '/products/vn/vn-navy-collared-preppy-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 10, true
) on conflict (slug) do nothing;

-- 11: 粉色蝴蝶结可爱开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-bow-kawaii-cardigan',
  '{"zh":"粉色蝴蝶结可爱开衫","en":"Pink Bow Kawaii Cardigan","vn":"Áo Cardigan Hồng Đính Nơ Dễ Thương"}',
  'VN-HOT-011',
  '/products/vn/vn-pink-bow-kawaii-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 11, true
) on conflict (slug) do nothing;

-- 12: 灰色罗纹基础开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-grey-ribbed-basic-cardigan',
  '{"zh":"灰色罗纹基础开衫","en":"Grey Ribbed Basic Cardigan","vn":"Áo Cardigan Xám Dệt Gân Cơ Bản"}',
  'VN-HOT-012',
  '/products/vn/vn-grey-ribbed-basic-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 12, true
) on conflict (slug) do nothing;

-- 13: 米色钩针蕾丝开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-crochet-lace-cardigan',
  '{"zh":"米色钩针蕾丝开衫","en":"Cream Crochet Lace Cardigan","vn":"Áo Cardigan Kem Dệt Móc Ren"}',
  'VN-HOT-013',
  '/products/vn/vn-cream-crochet-lace-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 13, true
) on conflict (slug) do nothing;

-- 14: 白色拉链运动风开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-white-zipper-sporty-cardigan',
  '{"zh":"白色拉链运动风开衫","en":"White Zipper Sporty Cardigan","vn":"Áo Cardigan Trắng Khoá Kéo Phong Cách Thể Thao"}',
  'VN-HOT-014',
  '/products/vn/vn-white-zipper-sporty-cardigan.jpg',
  (select id from content_categories where slug = 'vn-cardigan'),
  '{"overseas"}', 14, true
) on conflict (slug) do nothing;

-- 15: 薰衣草紫短款针织上衣
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-lavender-cropped-knit-tee',
  '{"zh":"薰衣草紫短款针织上衣","en":"Lavender Cropped Knit Tee","vn":"Áo Len Croptop Màu Oải Hương"}',
  'VN-HOT-015',
  '/products/vn/vn-lavender-cropped-knit-tee.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 15, true
) on conflict (slug) do nothing;

-- 16: 粉色泡泡袖针织上衣
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-puff-sleeve-knit-top',
  '{"zh":"粉色泡泡袖针织上衣","en":"Pink Puff-Sleeve Knit Top","vn":"Áo Len Hồng Tay Bồng"}',
  'VN-HOT-016',
  '/products/vn/vn-pink-puff-sleeve-knit-top.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 16, true
) on conflict (slug) do nothing;

-- 17: 奶白方领针织上衣
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-square-neck-knit',
  '{"zh":"奶白方领针织上衣","en":"Cream Square Neck Knit Top","vn":"Áo Len Kem Cổ Vuông"}',
  'VN-HOT-017',
  '/products/vn/vn-cream-square-neck-knit.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 17, true
) on conflict (slug) do nothing;

-- 18: 薄荷绿荷叶边针织衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mint-ruffle-knit-blouse',
  '{"zh":"薄荷绿荷叶边针织衫","en":"Mint Ruffle Knit Blouse","vn":"Áo Len Xanh Bạc Hà Viền Nơ"}',
  'VN-HOT-018',
  '/products/vn/vn-mint-ruffle-knit-blouse.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 18, true
) on conflict (slug) do nothing;

-- 19: 白色蕾丝边针织上衣
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-white-lace-trim-knit-top',
  '{"zh":"白色蕾丝边针织上衣","en":"White Lace Trim Knit Top","vn":"Áo Len Trắng Viền Ren"}',
  'VN-HOT-019',
  '/products/vn/vn-white-lace-trim-knit-top.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 19, true
) on conflict (slug) do nothing;

-- 20: 米色罗纹针织背心
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-beige-ribbed-knit-tank',
  '{"zh":"米色罗纹针织背心","en":"Beige Ribbed Knit Tank","vn":"Áo Ba Lỗ Len Be Dệt Gân"}',
  'VN-HOT-020',
  '/products/vn/vn-beige-ribbed-knit-tank.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 20, true
) on conflict (slug) do nothing;

-- 21: 蓝色露肩针织上衣
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-blue-cold-shoulder-knit',
  '{"zh":"蓝色露肩针织上衣","en":"Blue Cold Shoulder Knit Top","vn":"Áo Len Xanh Dương Lộ Vai"}',
  'VN-HOT-021',
  '/products/vn/vn-blue-cold-shoulder-knit.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 21, true
) on conflict (slug) do nothing;

-- 22: 粉色一字肩针织衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-offshoulder-knit',
  '{"zh":"粉色一字肩针织衫","en":"Pink Off-Shoulder Knit","vn":"Áo Len Hồng Trễ Vai"}',
  'VN-HOT-022',
  '/products/vn/vn-pink-offshoulder-knit.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 22, true
) on conflict (slug) do nothing;

-- 23: 白色针织吊带衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-white-knit-camisole',
  '{"zh":"白色针织吊带衫","en":"White Knit Camisole","vn":"Áo Hai Dây Len Trắng"}',
  'VN-HOT-023',
  '/products/vn/vn-white-knit-camisole.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 23, true
) on conflict (slug) do nothing;

-- 24: 米色纽结设计针织衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-twist-front-knit',
  '{"zh":"米色纽结设计针织衫","en":"Cream Twist-Front Knit Top","vn":"Áo Len Kem Thiết Kế Xoắn Ngực"}',
  'VN-HOT-024',
  '/products/vn/vn-cream-twist-front-knit.jpg',
  (select id from content_categories where slug = 'vn-knit-tee'),
  '{"overseas"}', 24, true
) on conflict (slug) do nothing;

-- 25: 薄荷绿短袖针织POLO
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mint-shortsleeve-knit-polo',
  '{"zh":"薄荷绿短袖针织POLO","en":"Mint Short-Sleeve Knit Polo","vn":"Áo Polo Dệt Kim Xanh Bạc Hà Ngắn Tay"}',
  'VN-HOT-025',
  '/products/vn/vn-mint-shortsleeve-knit-polo.jpg',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}', 25, true
) on conflict (slug) do nothing;

-- 26: 粉色翻领针织POLO
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-collared-knit-polo',
  '{"zh":"粉色翻领针织POLO","en":"Pink Collared Knit Polo","vn":"Áo Polo Dệt Kim Hồng Cổ Bẻ"}',
  'VN-HOT-026',
  '/products/vn/vn-pink-collared-knit-polo.jpg',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}', 26, true
) on conflict (slug) do nothing;

-- 27: 藏青条纹针织POLO
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-navy-striped-knit-polo',
  '{"zh":"藏青条纹针织POLO","en":"Navy Striped Knit Polo","vn":"Áo Polo Dệt Kim Sọc Xanh Navy"}',
  'VN-HOT-027',
  '/products/vn/vn-navy-striped-knit-polo.jpg',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}', 27, true
) on conflict (slug) do nothing;

-- 28: 薰衣草紫泡泡袖POLO
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-lavender-puffsleeve-polo',
  '{"zh":"薰衣草紫泡泡袖POLO","en":"Lavender Puff-Sleeve Polo","vn":"Áo Polo Dệt Kim Oải Hương Tay Bồng"}',
  'VN-HOT-028',
  '/products/vn/vn-lavender-puffsleeve-polo.jpg',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}', 28, true
) on conflict (slug) do nothing;

-- 29: 米色蝴蝶结针织POLO
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-bow-knit-polo',
  '{"zh":"米色蝴蝶结针织POLO","en":"Cream Bow Knit Polo","vn":"Áo Polo Dệt Kim Kem Đính Nơ"}',
  'VN-HOT-029',
  '/products/vn/vn-cream-bow-knit-polo.jpg',
  (select id from content_categories where slug = 'vn-polo-knit'),
  '{"overseas"}', 29, true
) on conflict (slug) do nothing;

-- 30: 白色薄网眼针织防晒罩衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-white-sheer-mesh-coverup',
  '{"zh":"白色薄网眼针织防晒罩衫","en":"White Sheer Mesh Knit Cover-Up","vn":"Áo Len Lưới Mỏng Trắng Chống Nắng"}',
  'VN-HOT-030',
  '/products/vn/vn-white-sheer-mesh-coverup.jpg',
  (select id from content_categories where slug = 'vn-sun-protection'),
  '{"overseas"}', 30, true
) on conflict (slug) do nothing;

-- 31: 粉色长袖防晒开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-long-sleeve-sun-cardigan',
  '{"zh":"粉色长袖防晒开衫","en":"Pink Long-Sleeve Sun Cardigan","vn":"Áo Cardigan Chống Nắng Hồng Dài Tay"}',
  'VN-HOT-031',
  '/products/vn/vn-pink-long-sleeve-sun-cardigan.jpg',
  (select id from content_categories where slug = 'vn-sun-protection'),
  '{"overseas"}', 31, true
) on conflict (slug) do nothing;

-- 32: 米色UV防晒针织衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-uv-protection-knit',
  '{"zh":"米色UV防晒针织衫","en":"Cream UV Protection Knit Top","vn":"Áo Len Kem Chống Tia UV"}',
  'VN-HOT-032',
  '/products/vn/vn-cream-uv-protection-knit.jpg',
  (select id from content_categories where slug = 'vn-sun-protection'),
  '{"overseas"}', 32, true
) on conflict (slug) do nothing;

-- 33: 薄荷绿连帽防晒衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mint-hooded-sun-shirt',
  '{"zh":"薄荷绿连帽防晒衫","en":"Mint Hooded Sun Shirt","vn":"Áo Chống Nắng Có Mũ Xanh Bạc Hà"}',
  'VN-HOT-033',
  '/products/vn/vn-mint-hooded-sun-shirt.jpg',
  (select id from content_categories where slug = 'vn-sun-protection'),
  '{"overseas"}', 33, true
) on conflict (slug) do nothing;

-- 34: 蓝色轻薄防晒外套
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-blue-lightweight-sun-jacket',
  '{"zh":"蓝色轻薄防晒外套","en":"Blue Lightweight Sun Jacket","vn":"Áo Khoác Chống Nắng Mỏng Xanh Dương"}',
  'VN-HOT-034',
  '/products/vn/vn-blue-lightweight-sun-jacket.jpg',
  (select id from content_categories where slug = 'vn-sun-protection'),
  '{"overseas"}', 34, true
) on conflict (slug) do nothing;

-- 35: 粉色针织迷你连衣裙
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-knit-mini-dress',
  '{"zh":"粉色针织迷你连衣裙","en":"Pink Knit Mini Dress","vn":"Đầm Len Ngắn Màu Hồng"}',
  'VN-HOT-035',
  '/products/vn/vn-pink-knit-mini-dress.jpg',
  (select id from content_categories where slug = 'vn-knit-dress'),
  '{"overseas"}', 35, true
) on conflict (slug) do nothing;

-- 36: 黑色修身针织连衣裙
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-black-bodycon-knit-dress',
  '{"zh":"黑色修身针织连衣裙","en":"Black Bodycon Knit Dress","vn":"Đầm Len Đen Ôm Dáng"}',
  'VN-HOT-036',
  '/products/vn/vn-black-bodycon-knit-dress.jpg',
  (select id from content_categories where slug = 'vn-knit-dress'),
  '{"overseas"}', 36, true
) on conflict (slug) do nothing;

-- 37: 奶白A字针织连衣裙
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-aline-knit-dress',
  '{"zh":"奶白A字针织连衣裙","en":"Cream A-Line Knit Dress","vn":"Đầm Len Kem Dáng A"}',
  'VN-HOT-037',
  '/products/vn/vn-cream-aline-knit-dress.jpg',
  (select id from content_categories where slug = 'vn-knit-dress'),
  '{"overseas"}', 37, true
) on conflict (slug) do nothing;

-- 38: 薰衣草紫泡泡袖针织裙
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-lavender-puffsleeve-dress',
  '{"zh":"薰衣草紫泡泡袖针织裙","en":"Lavender Puff-Sleeve Knit Dress","vn":"Đầm Len Oải Hương Tay Bồng"}',
  'VN-HOT-038',
  '/products/vn/vn-lavender-puffsleeve-dress.jpg',
  (select id from content_categories where slug = 'vn-knit-dress'),
  '{"overseas"}', 38, true
) on conflict (slug) do nothing;

-- 39: 薄荷绿围裹式针织裙
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mint-wrap-knit-dress',
  '{"zh":"薄荷绿围裹式针织裙","en":"Mint Wrap Knit Dress","vn":"Đầm Len Xanh Bạc Hà Kiểu Wrap"}',
  'VN-HOT-039',
  '/products/vn/vn-mint-wrap-knit-dress.jpg',
  (select id from content_categories where slug = 'vn-knit-dress'),
  '{"overseas"}', 39, true
) on conflict (slug) do nothing;

-- 40: 粉色针织睡衣套装
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-pink-knit-pajama-set',
  '{"zh":"粉色针织睡衣套装","en":"Pink Knit Pajama Set","vn":"Bộ Đồ Ngủ Len Màu Hồng"}',
  'VN-HOT-040',
  '/products/vn/vn-pink-knit-pajama-set.jpg',
  (select id from content_categories where slug = 'vn-loungewear'),
  '{"overseas"}', 40, true
) on conflict (slug) do nothing;

-- 41: 米色华夫格家居套装
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-cream-waffle-loungewear',
  '{"zh":"米色华夫格家居套装","en":"Cream Waffle Knit Loungewear","vn":"Bộ Đồ Nhà Len Dệt Waffle Màu Kem"}',
  'VN-HOT-041',
  '/products/vn/vn-cream-waffle-loungewear.jpg',
  (select id from content_categories where slug = 'vn-loungewear'),
  '{"overseas"}', 41, true
) on conflict (slug) do nothing;

-- 42: 薰衣草紫针织短裤套装
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-lavender-knit-shorts-set',
  '{"zh":"薰衣草紫针织短裤套装","en":"Lavender Knit Shorts Set","vn":"Bộ Quần Short Len Màu Oải Hương"}',
  'VN-HOT-042',
  '/products/vn/vn-lavender-knit-shorts-set.jpg',
  (select id from content_categories where slug = 'vn-loungewear'),
  '{"overseas"}', 42, true
) on conflict (slug) do nothing;

-- 43: 薄荷绿宽松家居套装
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mint-oversized-lounge-set',
  '{"zh":"薄荷绿宽松家居套装","en":"Mint Oversized Lounge Set","vn":"Bộ Đồ Nhà Rộng Xanh Bạc Hà"}',
  'VN-HOT-043',
  '/products/vn/vn-mint-oversized-lounge-set.jpg',
  (select id from content_categories where slug = 'vn-loungewear'),
  '{"overseas"}', 43, true
) on conflict (slug) do nothing;

-- 44: 米色罗纹睡衣套装
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-beige-ribbed-pajama-set',
  '{"zh":"米色罗纹睡衣套装","en":"Beige Ribbed Pajama Set","vn":"Bộ Đồ Ngủ Len Gân Màu Be"}',
  'VN-HOT-044',
  '/products/vn/vn-beige-ribbed-pajama-set.jpg',
  (select id from content_categories where slug = 'vn-loungewear'),
  '{"overseas"}', 44, true
) on conflict (slug) do nothing;

-- 45: 男士藏青针织POLO
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mens-navy-knit-polo',
  '{"zh":"男士藏青针织POLO","en":"Mens Navy Knit Polo","vn":"Áo Polo Dệt Kim Nam Xanh Navy"}',
  'VN-HOT-045',
  '/products/vn/vn-mens-navy-knit-polo.jpg',
  (select id from content_categories where slug = 'vn-mens-knit'),
  '{"overseas"}', 45, true
) on conflict (slug) do nothing;

-- 46: 男士灰色V领针织衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mens-grey-vneck-knit',
  '{"zh":"男士灰色V领针织衫","en":"Mens Grey V-Neck Knit","vn":"Áo Len Nam Xám Cổ V"}',
  'VN-HOT-046',
  '/products/vn/vn-mens-grey-vneck-knit.jpg',
  (select id from content_categories where slug = 'vn-mens-knit'),
  '{"overseas"}', 46, true
) on conflict (slug) do nothing;

-- 47: 男士黑色圆领针织衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mens-black-crew-knit',
  '{"zh":"男士黑色圆领针织衫","en":"Mens Black Crew Neck Knit","vn":"Áo Len Nam Đen Cổ Tròn"}',
  'VN-HOT-047',
  '/products/vn/vn-mens-black-crew-knit.jpg',
  (select id from content_categories where slug = 'vn-mens-knit'),
  '{"overseas"}', 47, true
) on conflict (slug) do nothing;

-- 48: 男士蓝色条纹针织衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mens-blue-striped-knit',
  '{"zh":"男士蓝色条纹针织衫","en":"Mens Blue Striped Knit","vn":"Áo Len Nam Sọc Xanh Dương"}',
  'VN-HOT-048',
  '/products/vn/vn-mens-blue-striped-knit.jpg',
  (select id from content_categories where slug = 'vn-mens-knit'),
  '{"overseas"}', 48, true
) on conflict (slug) do nothing;

-- 49: 男士驼色针织开衫
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mens-camel-knit-cardigan',
  '{"zh":"男士驼色针织开衫","en":"Mens Camel Knit Cardigan","vn":"Áo Cardigan Len Nam Nâu Camel"}',
  'VN-HOT-049',
  '/products/vn/vn-mens-camel-knit-cardigan.jpg',
  (select id from content_categories where slug = 'vn-mens-knit'),
  '{"overseas"}', 49, true
) on conflict (slug) do nothing;

-- 50: 男士白色基础针织T恤
insert into content_products (slug, name, model, cover_url, category_id, sites, sort, is_active)
values (
  'vn-mens-white-basic-knit-tee',
  '{"zh":"男士白色基础针织T恤","en":"Mens White Basic Knit Tee","vn":"Áo Thun Len Nam Trắng Cơ Bản"}',
  'VN-HOT-050',
  '/products/vn/vn-mens-white-basic-knit-tee.jpg',
  (select id from content_categories where slug = 'vn-mens-knit'),
  '{"overseas"}', 50, true
) on conflict (slug) do nothing;

