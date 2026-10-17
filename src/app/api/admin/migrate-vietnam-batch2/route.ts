import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/**
 * 执行越南市场第二批产品数据迁移 (0008_vietnam_new_products.sql)
 * 43 款实拍女式薄款针织，图片位于 public/products/vn/
 * 支持两种认证方式：
 * 1. Admin session cookie
 * 2. MIGRATION_TOKEN 环境变量 + Authorization: Bearer <token>
 */
async function checkAuth(req: NextRequest): Promise<boolean> {
  // 方式1: Admin session
  try {
    const { cookies } = await import('next/headers');
    const { verifySession } = await import('@/lib/auth');
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (token && (await verifySession(token))) return true;
  } catch {}

  // 方式2: Bearer token 匹配环境变量
  const authHeader = req.headers.get('authorization');
  const migrationToken = process.env.MIGRATION_TOKEN;
  if (authHeader?.startsWith('Bearer ') && migrationToken) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === migrationToken) return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  const ok = await checkAuth(req);
  if (!ok) return NextResponse.json({ error: '未授权' }, { status: 401 });

  const migrationName = '0008_vietnam_new_products.sql';

  try {
    // 检查是否已执行
    const existing = await sql`select name from schema_migrations where name = ${migrationName}`;
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, skipped: true, message: 'Migration already applied' });
    }

    const products = [
      {
        slug: 'vn-olive-frayed-button-cardigan',
        model: 'VN-B2-001',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-olive-frayed-button-cardigan.jpg',
        sort: 16,
        name: { zh: '橄榄绿彩色扣毛边针织开衫', en: 'Olive Frayed-Edge Cardigan with Multicolor Buttons', vn: 'Áo Cardigan Len Xanh Olive Cúc Màu Viền Xù' },
        summary: { zh: '橄榄绿针织开衫，彩色纽扣配毛边流苏纹理，个性百搭。薄款针织适合越南气候，配牛仔裤或裙子皆宜。', en: 'Olive knit cardigan with multicolor buttons and frayed zigzag texture. Lightweight knit suits Vietnam weather, pairs with jeans or skirts.', vn: 'Áo cardigan dệt kim xanh olive, hàng nút nhiều màu độc đáo, viền xù cá tính. Chất len mỏng nhẹ hợp khí hậu Việt Nam, dễ phối jeans váy.' },
      },
      {
        slug: 'vn-cream-teddy-applique-sweater',
        model: 'VN-B2-002',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-cream-teddy-applique-sweater.jpg',
        sort: 17,
        name: { zh: '奶白色泰迪熊贴布针织衫', en: 'Cream Teddy Bear Applique Knit Sweater', vn: 'Áo Len Kem Hình Gấu Teddy Thêu Vải' },
        summary: { zh: '奶白色圆领针织衫，胸前泰迪熊贴布可爱减龄。柔软薄针织，适合上学和日常逛街。', en: 'Cream crew-neck sweater with a cute teddy bear chest appliqué. Soft lightweight knit, great for school and everyday wear.', vn: 'Áo len cổ tròn màu kem với hình gấu bông thêu vải dễ thương, chất len mỏng mềm mại, phù hợp mặc học đường và dạo phố.' },
      },
      {
        slug: 'vn-white-cable-zip-cardigan',
        model: 'VN-B2-003',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-cable-zip-cardigan.jpg',
        sort: 18,
        name: { zh: '白色绞花拉链针织开衫（徽章）', en: 'White Cable-Knit Zip Cardigan with Badge', vn: 'Áo Cardigan Trắng Dệt Cable Phối Kéo Khoá Huy Hiệu' },
        summary: { zh: '白色绞花针织拉链开衫，金属徽章点缀，毛边衣摆。薄款适合空调房和雨季外搭。', en: 'White cable-knit zip cardigan with metal badge and frayed hem. Light layering piece for AC rooms and rainy season.', vn: 'Áo cardigan trắng dệt hoa cable, kéo khoá kim loại phối huy hiệu ngực, lai áo xù thời trang. Len mỏng nhẹ phù hợp phòng lạnh và mùa mưa.' },
      },
      {
        slug: 'vn-pink-pointelle-scarf-sweater',
        model: 'VN-B2-004',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-pink-pointelle-scarf-sweater.jpg',
        sort: 19,
        name: { zh: '粉色镂空短款针织衫（配围巾）', en: 'Pink Pointelle Cropped Sweater with Scarf Tie', vn: 'Áo Len Hồng Dệt Lỗ Croptop Kèm Khăn Quàng' },
        summary: { zh: '粉色 pointelle 镂空短款针织衫，配同材质系带围巾。甜美年轻，配高腰下装。', en: 'Pink pointelle cropped sweater with a matching knit scarf tie. Sweet and youthful, pairs with high-waist bottoms.', vn: 'Áo len hồng phấn dệt lỗ pointelle croptop, kèm dây khăn cùng chất liệu thắt nơ. Dáng trẻ trung, phối cùng chân váy hoặc quần cao lưng.' },
      },
      {
        slug: 'vn-white-flower-pearl-cardigan',
        model: 'VN-B2-005',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-flower-pearl-cardigan.jpg',
        sort: 20,
        name: { zh: '白色立体花朵珍珠爱心扣开衫', en: 'White 3D Flower Pearl Cardigan with Heart Buttons', vn: 'Áo Cardigan Trắng Đính Hoa Nổi Ngọc Trai Cúc Tim' },
        summary: { zh: '白色开衫点缀立体花朵、珍珠与爱心纽扣，精致名媛风。适合约会、聚会和拍照。', en: 'White cardigan decorated with 3D flowers, pearls and heart buttons. Feminine dressy style for dates and photos.', vn: 'Áo cardigan trắng đính hoa 3D và ngọc trai nhân tạo, hàng cúc hình trái tim ngọt ngào. Thiết kế tiểu thư, phù hợp đi chơi, hẹn hò và chụp hình.' },
      },
      {
        slug: 'vn-white-wise-distressed-sweater',
        model: 'VN-B2-006',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-white-wise-distressed-sweater.jpg',
        sort: 21,
        name: { zh: '白色做旧字母绞花针织衫', en: 'White Distressed Cable Sweater with WISE Lettering', vn: 'Áo Len Trắng Dệt Cable In Chữ WISE Phong Cách Xù' },
        summary: { zh: '白色绞花针织衫，黑色 WISE 字母与做旧衣摆，街头风。宽松版型，薄棉针织。', en: 'White cable sweater with black WISE lettering and distressed hem. Loose streetwear cut in thin cotton knit.', vn: 'Áo len trắng dệt cable với chữ WISE thêu đen, lai áo xù cá tính. Form rộng unisex, len bông mỏng nhẹ, phù hợp phong cách streetwear.' },
      },
      {
        slug: 'vn-white-hooded-cable-cardigan',
        model: 'VN-B2-007',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-hooded-cable-cardigan.jpg',
        sort: 22,
        name: { zh: '白色连帽绞花纽扣开衫', en: 'White Hooded Cable-Knit Button Cardigan', vn: 'Áo Cardigan Trắng Có Mũ Dệt Cable Cài Cúc' },
        summary: { zh: '白色连帽绞花开衫，前排纽扣设计。休闲减龄，适合日常和旅行。', en: 'White hooded cable-knit cardigan with front buttons. Casual and youthful for daily wear and travel.', vn: 'Áo cardigan trắng có mũ dệt hoa cable, cài cúc phía trước. Dáng trẻ trung năng động, phù hợp mặc hàng ngày và du lịch.' },
      },
      {
        slug: 'vn-grey-ladder-pearl-cardigan',
        model: 'VN-B2-008',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-grey-ladder-pearl-cardigan.jpg',
        sort: 23,
        name: { zh: '灰色镂空珍珠扣针织开衫', en: 'Grey Ladder-Cutout Cardigan with Pearl Buttons', vn: 'Áo Cardigan Xám Dệt Lỗ Cúc Ngọc Trai' },
        summary: { zh: '灰色开衫，梯状镂空纹理配珍珠纽扣。薄针织透气，优雅女性化。', en: 'Grey cardigan with ladder cutout texture and pearl buttons. Breathable thin knit with an elegant feminine look.', vn: 'Áo cardigan xám với hoạ tiết dệt lỗ kiểu thang và hàng cúc ngọc trai. Chất len mỏng thoáng, phong cách nữ tính thanh lịch.' },
      },
      {
        slug: 'vn-stripe-fringe-cardigan',
        model: 'VN-B2-009',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-stripe-fringe-cardigan.jpg',
        sort: 24,
        name: { zh: '黑灰条纹流苏V领开衫', en: 'Black Grey Striped Fringe V-Neck Cardigan', vn: 'Áo Cardigan Cổ V Sọc Đen Xám Đính Tassel' },
        summary: { zh: '黑灰条纹V领开衫，多排流苏装饰。微修身版型，适合叠穿通勤。', en: 'Black-grey striped V-neck cardigan with rows of fringe. Slightly fitted, ideal for commute layering.', vn: 'Áo cardigan cổ V sọc đen xám, các hàng tassel tua rua tạo điểm nhấn. Form ôm nhẹ, phù hợp mặc đi làm và phối đồ layer.' },
      },
      {
        slug: 'vn-white-classic-zip-cardigan',
        model: 'VN-B2-010',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-classic-zip-cardigan.jpg',
        sort: 25,
        name: { zh: '白色基础圆领拉链开衫', en: 'White Basic Crew Neck Zip Cardigan', vn: 'Áo Cardigan Trắng Cơ Bản Cổ Tròn Phối Kéo Khoá' },
        summary: { zh: '纯白色圆领拉链开衫，基础百搭款。薄针织适合防晒和空调房外搭。', en: 'Plain white crew-neck zip cardigan, a versatile basic. Thin knit for sun protection and AC-room layering.', vn: 'Áo cardigan trắng trơn cổ tròn khoá kéo, dáng basic dễ mặc. Len mỏng nhẹ, phù hợp chống nắng và mặc phòng máy lạnh.' },
      },
      {
        slug: 'vn-white-hooded-zip-flower-cardigan',
        model: 'VN-B2-011',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-hooded-zip-flower-cardigan.jpg',
        sort: 26,
        name: { zh: '白色连帽罗纹拉链开衫（胸花）', en: 'White Hooded Ribbed Zip Cardigan with Flower Brooches', vn: 'Áo Cardigan Có Mũ Trắng Dệt Gân Khoá Kéo Đính Hoa' },
        summary: { zh: '白色连帽罗纹拉链开衫，点缀小花胸针。弹力针织，穿着舒适，适合街头休闲。', en: 'White hooded ribbed zip cardigan accented with small flower brooches. Stretchy knit for casual street style.', vn: 'Áo cardigan có mũ trắng dệt gân khoá kéo, đính trâm hoa nhỏ xinh. Chất len co giãn, form thoải mái, phù hợp mặc dạo phố.' },
      },
      {
        slug: 'vn-white-floral-embroidered-cardigan',
        model: 'VN-B2-012',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-floral-embroidered-cardigan.jpg',
        sort: 27,
        name: { zh: '白色V领黑色花卉刺绣开衫', en: 'White V-Neck Cardigan with Black Floral Embroidery', vn: 'Áo Cardigan Trắng Cổ V Thêu Hoa Đen' },
        summary: { zh: '白色V领开衫，黑色花卉刺绣精致优雅。配裙子或西裤皆宜，通勤轻礼服都可。', en: 'White V-neck cardigan with delicate black floral embroidery. Elegant with skirts or slacks for office and events.', vn: 'Áo cardigan trắng cổ V thêu hoa màu đen tinh tế, kiểu dáng thanh lịch. Dễ phối cùng chân váy hoặc quần tây cho đi làm và dự tiệc nhẹ.' },
      },
      {
        slug: 'vn-cream-stripe-zip-cardigan',
        model: 'VN-B2-013',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-cream-stripe-zip-cardigan.jpg',
        sort: 28,
        name: { zh: '米白条纹V领拉链开衫', en: 'Beige White Striped V-Neck Zip Cardigan', vn: 'Áo Cardigan Cổ V Sọc Kem Trắng Khoá Kéo' },
        summary: { zh: '米白横条纹V领拉链开衫，简约横条纹。微修身显瘦，通勤日常都好配。', en: 'Beige-white striped V-neck zip cardigan in a minimal stripe pattern. Slightly fitted for office or everyday looks.', vn: 'Áo cardigan cổ V sọc kem trắng khoá kéo, hoạ tiết kẻ ngang tối giản. Form hơi ôm, tôn dáng, dễ phối đồ công sở và thường ngày.' },
      },
      {
        slug: 'vn-cream-crochet-tie-top',
        model: 'VN-B2-014',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-cream-crochet-tie-top.jpg',
        sort: 29,
        name: { zh: '米色钩针系带针织上衣', en: 'Cream Crochet Tie-Front Knit Top', vn: 'Áo Kiểu Dệt Móc Kem Buộc Dây Phía Trước' },
        summary: { zh: '米色钩针网眼前系带长袖上衣，透气浪漫。夏季单穿或叠搭吊带皆宜。', en: 'Cream crochet mesh long-sleeve top with front tie, airy and romantic. Wear alone in summer or over a camisole.', vn: 'Áo kiểu dệt móc màu kem, dáng lưới thoáng mát, dây buộc phía trước dịu dàng. Phù hợp mặc mùa hè hoặc phối áo hai dây bên trong.' },
      },
      {
        slug: 'vn-white-vneck-black-button-cardigan',
        model: 'VN-B2-015',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-vneck-black-button-cardigan.jpg',
        sort: 30,
        name: { zh: '白色竖纹V领黑扣开衫', en: 'White V-Neck Cardigan with Black Buttons', vn: 'Áo Cardigan Trắng Cổ V Cúc Đen Dệt Sọc Dọc' },
        summary: { zh: '白色V领开衫配黑色纽扣和竖纹针织，法式简约。办公室百搭单品。', en: 'White V-neck cardigan with contrast black buttons and vertical knit, French minimal style. An office staple.', vn: 'Áo cardigan trắng cổ V với hàng cúc đen tương phản, bề mặt dệt sọc dọc. Thiết kế tối giản kiểu Pháp, dễ phối đồ công sở.' },
      },
      {
        slug: 'vn-black-polka-dot-cardigan',
        model: 'VN-B2-016',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-black-polka-dot-cardigan.jpg',
        sort: 31,
        name: { zh: '黑色白点波点针织开衫', en: 'Black Polka Dot Knit Cardigan', vn: 'Áo Cardigan Đen Chấm Bi Trắng' },
        summary: { zh: '黑色波点开衫，复古白点图案，短款显腰。配素色下装立刻点亮造型。', en: 'Black cardigan with classic white polka dots, cropped waist-flattering cut. Pops against plain bottoms.', vn: 'Áo cardigan đen in chấm bi trắng cổ điển, dáng hơi ngắn tôn eo. Phối cùng váy hoặc quần trơn đều nổi bật và thời trang.' },
      },
      {
        slug: 'vn-white-pointelle-vneck-sweater',
        model: 'VN-B2-017',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-white-pointelle-vneck-sweater.jpg',
        sort: 32,
        name: { zh: '白色镂空条纹V领针织衫', en: 'White Pointelle Stripe V-Neck Sweater', vn: 'Áo Len Trắng Dệt Lỗ Sọc Ngang Cổ V' },
        summary: { zh: '白色V领 pointelle 镂空横条纹针织衫，透气薄针织。微短款，适合夏秋。', en: 'White V-neck pointelle sweater with horizontal openwork stripes, airy thin knit. Slightly cropped for summer-autumn.', vn: 'Áo len trắng cổ V dệt lỗ pointelle kẻ sọc ngang, chất len mỏng thoáng khí. Form croptop nhẹ, phù hợp mùa hè và mùa thu.' },
      },
      {
        slug: 'vn-white-zipper-trim-cardigan',
        model: 'VN-B2-018',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-zipper-trim-cardigan.jpg',
        sort: 33,
        name: { zh: '白色装饰拉链V领开衫', en: 'White V-Neck Cardigan with Decorative Zippers', vn: 'Áo Cardigan Trắng Cổ V Đính Khoá Trang Trí' },
        summary: { zh: '白色V领开衫，肩部装饰拉链细节，时尚个性。弹力薄针织，全天舒适。', en: 'White V-neck cardigan with decorative zipper details at the shoulders. Stretch thin knit, comfortable all day.', vn: 'Áo cardigan trắng cổ V đính các dải khoá trang trí vai, phong cách thời trang cá tính. Chất len mỏng co giãn, dễ chịu cả ngày.' },
      },
      {
        slug: 'vn-white-hooded-letter-zip-cardigan',
        model: 'VN-B2-019',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-hooded-letter-zip-cardigan.jpg',
        sort: 34,
        name: { zh: '白色连帽字母拉链开衫', en: 'White Hooded Zip Cardigan with Letter Print', vn: 'Áo Cardigan Có Mũ Trắng Khoá Kéo In Chữ' },
        summary: { zh: '白色连帽拉链开衫，胸前字母印花，运动休闲风。微修身，日常百搭。', en: 'White hooded zip cardigan with chest letter print, sporty casual vibe. Slightly fitted for everyday outfits.', vn: 'Áo cardigan có mũ trắng khoá kéo với dòng chữ in ngực phong cách thể thao. Form hơi ôm, phù hợp mặc năng động hàng ngày.' },
      },
      {
        slug: 'vn-white-rise-shine-sweater',
        model: 'VN-B2-020',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-white-rise-shine-sweater.jpg',
        sort: 35,
        name: { zh: '白色字母标语V领针织衫', en: 'White Slogan Print V-Neck Sweater', vn: 'Áo Len Trắng Cổ V In Chữ RISE AND SHINE' },
        summary: { zh: '白色V领针织衫，胸前励志标语印花，微短款。配牛仔裤或裙子年轻有活力。', en: 'White V-neck sweater with inspirational slogan print, slightly cropped. Youthful with jeans or skirts.', vn: 'Áo len trắng cổ V in dòng chữ truyền cảm hứng, form croptop hơi ôm. Dễ phối jeans hoặc chân váy cho phong cách trẻ trung.' },
      },
      {
        slug: 'vn-white-stud-shoulder-cardigan',
        model: 'VN-B2-021',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-white-stud-shoulder-cardigan.jpg',
        sort: 36,
        name: { zh: '白色铆钉黑扣V领开衫', en: 'White V-Neck Cardigan with Studs and Black Buttons', vn: 'Áo Cardigan Trắng Cổ V Cúc Đen Đính Đinh' },
        summary: { zh: '白色V领开衫，黑色纽扣配肩部小铆钉，甜酷风。薄针织适合热带气候。', en: 'White V-neck cardigan with black buttons and small shoulder studs, sweet-edgy style. Thin knit for tropical weather.', vn: 'Áo cardigan trắng cổ V cúc đen, đính đinh nhỏ ở phần vai. Vừa nữ tính vừa cá tính, len mỏng phù hợp khí hậu nhiệt đới.' },
      },
      {
        slug: 'vn-cream-chain-embroidered-cardigan',
        model: 'VN-B2-022',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-cream-chain-embroidered-cardigan.jpg',
        sort: 37,
        name: { zh: '米色黑色链条刺绣开衫', en: 'Cream Cardigan with Black Chain Embroidery', vn: 'Áo Cardigan Kem Thêu Dây Chuyền Đen' },
        summary: { zh: '米色圆领开衫，胸前黑色链条与海星刺绣，轻奢风。通勤聚会皆宜。', en: 'Cream crew cardigan with black chain and starfish embroidery, light-luxury look. Works for office and gatherings.', vn: 'Áo cardigan kem thêu hình dây chuyền và ngôi sao đen phong cách luxury. Cổ tròn cơ bản, dễ phối đồ công sở và dự tiệc.' },
      },
      {
        slug: 'vn-oatmeal-collar-cable-cardigan',
        model: 'VN-B2-023',
        catSlug: 'vn-polo-knit',
        cover: '/products/vn/vn-oatmeal-collar-cable-cardigan.jpg',
        sort: 38,
        name: { zh: '燕麦色翻领绞花针织开衫', en: 'Oatmeal Collared Cable-Knit Cardigan', vn: 'Áo Cardigan Dệt Cable Màu Yến Mạch Có Cổ Bẻ' },
        summary: { zh: '燕麦色翻领绞花开衫，胸前小刺绣，短款。可配同色系针织裤成套穿搭。', en: 'Oatmeal collared cable cardigan with small chest embroidery, cropped. Pair with matching knit trousers.', vn: 'Áo cardigan màu yến mạch cổ bẻ, dệt hoa cable, thêu chữ nhỏ ngực. Dáng ngắn phối cùng quần cùng bộ thanh lịch.' },
      },
      {
        slug: 'vn-teal-offshoulder-crochet-sweater',
        model: 'VN-B2-024',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-teal-offshoulder-crochet-sweater.jpg',
        sort: 39,
        name: { zh: '湖绿色一字肩镂空针织衫', en: 'Teal Off-Shoulder Crochet Sweater', vn: 'Áo Len Xanh Mòng Két Dệt Lỗ Trễ Vai' },
        summary: { zh: '湖绿色钩针镂空一字肩针织衫，喇叭长袖。性感柔美，适合海边和街拍。', en: 'Teal crochet off-shoulder sweater with flared long sleeves. Feminine holiday style for the beach and city.', vn: 'Áo len xanh mòng két dệt lỗ crochet kiểu trễ vai, tay loe rộng. Thiết kế gợi cảm nữ tính, phù hợp đi biển và dạo phố.' },
      },
      {
        slug: 'vn-black-grey-stripe-cardigan',
        model: 'VN-B2-025',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-black-grey-stripe-cardigan.jpg',
        sort: 40,
        name: { zh: '黑灰杂色条纹圆领开衫', en: 'Black Grey Marled Stripe Crew Cardigan', vn: 'Áo Cardigan Cổ Tròn Sọc Đen Xám Dệt Hạt' },
        summary: { zh: '黑灰混色横条纹圆领开衫，短款利落。配西裤或裙子都合适。', en: 'Black-grey marled horizontal stripe crew cardigan, neat cropped length. Matches tailored pants or skirts.', vn: 'Áo cardigan cổ tròn sọc đen xám dệt hạt độc đáo, form ngắn gọn. Phối cùng quần âu hoặc chân váy đều hợp.' },
      },
      {
        slug: 'vn-grey-polka-polo-sweater',
        model: 'VN-B2-026',
        catSlug: 'vn-polo-knit',
        cover: '/products/vn/vn-grey-polka-polo-sweater.jpg',
        sort: 41,
        name: { zh: '浅灰波点针织POLO衫', en: 'Light Grey Polka Dot Knit Polo', vn: 'Áo Polo Dệt Kim Xám Nhạt Chấm Bi Nâu' },
        summary: { zh: '浅灰色针织POLO，深咖波点，翻领三粒扣。柔软薄针织，通勤打高尔夫都合适。', en: 'Light grey knit polo with brown polka dots and a 3-button collar. Soft thin knit for work or golf.', vn: 'Áo polo dệt kim xám nhạt in chấm bi nâu, cổ bẻ 3 cúc thanh lịch. Chất len mỏng mềm, phù hợp đi làm và chơi golf.' },
      },
      {
        slug: 'vn-olive-hooded-stripe-zip-cardigan',
        model: 'VN-B2-027',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-olive-hooded-stripe-zip-cardigan.jpg',
        sort: 42,
        name: { zh: '橄榄绿条纹连帽拉链开衫', en: 'Olive Stripe Hooded Zip Cardigan', vn: 'Áo Cardigan Có Mũ Sọc Xanh Olive Khoá Kéo' },
        summary: { zh: '橄榄绿灰条纹连帽拉链开衫，小蝴蝶结刺绣。微修身，运动甜妹风。', en: 'Olive-grey striped hooded zip cardigan with small bow embroidery. Slightly fitted, sporty-feminine style.', vn: 'Áo cardigan có mũ sọc xanh olive xám, khoá kéo và thêu hình nơ nhỏ. Form hơi ôm, phong cách thể thao nữ tính.' },
      },
      {
        slug: 'vn-white-sheer-mesh-pullover',
        model: 'VN-B2-028',
        catSlug: 'vn-sun-protection',
        cover: '/products/vn/vn-white-sheer-mesh-pullover.jpg',
        sort: 43,
        name: { zh: '白色镂空网眼圆领针织衫（防晒）', en: 'White Sheer Mesh Knit Pullover', vn: 'Áo Len Lưới Mỏng Trắng Cổ Tròn Chống Nắng' },
        summary: { zh: '白色薄网眼针织罩衫，外穿防晒又有层次感。透气清凉，适合夏天和空调房。', en: 'White sheer mesh knit layering top for sun protection with style. Breathable and cool for summer and AC rooms.', vn: 'Áo len lưới mỏng màu trắng, mặc lớp ngoài vừa chống nắng vừa thời trang. Chất liệu thoáng mát, phù hợp mùa hè và phòng máy lạnh.' },
      },
      {
        slug: 'vn-grey-cable-toggle-cardigan',
        model: 'VN-B2-029',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-grey-cable-toggle-cardigan.jpg',
        sort: 44,
        name: { zh: '灰色绞花牛角扣高领开衫', en: 'Grey Cable-Knit Toggle Button Cardigan', vn: 'Áo Cardigan Xám Dệt Cable Cúc Gỗ Cổ Cao' },
        summary: { zh: '灰色绞花针织开衫，木质牛角扣与高领设计。保暖厚实，适合大叻、沙巴或雨季凉天。', en: 'Grey cable cardigan with wooden toggle buttons and high collar. Warm and substantial for Da Lat, Sa Pa or cool rainy days.', vn: 'Áo cardigan xám dệt cable với hàng cúc khuy gỗ, cổ cao giữ ấm. Dáng áo ấm áp phù hợp Đà Lạt, Sa Pa hoặc mùa mưa lạnh.' },
      },
      {
        slug: 'vn-olive-stripe-scarf-cardigan',
        model: 'VN-B2-030',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-olive-stripe-scarf-cardigan.jpg',
        sort: 45,
        name: { zh: '橄榄绿条纹牛角扣开衫（含围巾）', en: 'Olive Stripe Cardigan with Matching Scarf', vn: 'Áo Cardigan Xanh Olive Sọc Trắng Kèm Khăn Quàng' },
        summary: { zh: '橄榄绿白条纹开衫配同材质围巾，牛角扣。优雅保暖，适合凉季和山地旅行。', en: 'Olive-white striped cardigan with a matching knit scarf and horn buttons. Elegant warmth for cool season and mountain trips.', vn: 'Bộ áo cardigan xanh olive sọc trắng kèm khăn quàng cùng chất liệu, cúc sừng. Thiết kế ấm áp thanh lịch cho mùa lạnh và miền núi.' },
      },
      {
        slug: 'vn-cream-choker-ruffle-sweater',
        model: 'VN-B2-031',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-cream-choker-ruffle-sweater.jpg',
        sort: 46,
        name: { zh: '米色围脖飘带针织衫', en: 'Cream Choker-Neck Ruffle Sweater', vn: 'Áo Len Kem Cổ Thiết Kế Dây Đeo Thắt Nơ' },
        summary: { zh: '米色针织衫，领口围脖式设计与斜裁飘带，短款利落。温柔名媛风，配裙子极佳。', en: 'Cream sweater with choker-style neckline and diagonal ruffle flap, cropped. Ladylike charm, lovely with skirts.', vn: 'Áo len kem với phần cổ thiết kế dây đeo và nơ vải cách điệu, form ngắn gọn. Phong cách tiểu thư nhẹ nhàng, dễ phối chân váy.' },
      },
      {
        slug: 'vn-olive-shortsleeve-polo-armwarmers',
        model: 'VN-B2-032',
        catSlug: 'vn-polo-knit',
        cover: '/products/vn/vn-olive-shortsleeve-polo-armwarmers.jpg',
        sort: 47,
        name: { zh: '橄榄绿短袖针织POLO（含袖套）', en: 'Olive Short-Sleeve Knit Polo with Arm Warmers', vn: 'Áo Polo Dệt Kim Xanh Olive Ngắn Tay Kèm Tất Tay' },
        summary: { zh: '橄榄绿短袖针织POLO配同色长款袖套，设计独特。一衣多穿，适合拍照和出游。', en: 'Olive short-sleeve knit polo with matching long arm warmers, a distinctive design. Multiple styling options for photos and outings.', vn: 'Áo polo dệt kim xanh olive ngắn tay kèm ống tay rời, thiết kế độc đáo. Mặc được nhiều kiểu, phù hợp chụp ảnh và đi chơi.' },
      },
      {
        slug: 'vn-cream-eyelet-cardigan',
        model: 'VN-B2-033',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-cream-eyelet-cardigan.jpg',
        sort: 48,
        name: { zh: '米色镂空圆孔针织开衫', en: 'Cream Eyelet Cutout Knit Cardigan', vn: 'Áo Cardigan Kem Dệt Lỗ Tròn Thoáng Khí' },
        summary: { zh: '米色开衫满布规则圆孔镂空，透气清凉，同色纽扣。微短款，配同色系套装很高级。', en: 'Cream cardigan with even eyelet cutouts for airflow and tonal buttons. Slightly cropped, chic with matching sets.', vn: 'Áo cardigan kem với các lỗ dệt tròn đều thoáng mát, hàng cúc cùng tông. Form hơi ngắn, phối với set đồ cùng màu rất sang.' },
      },
      {
        slug: 'vn-beige-collar-stud-zip-cardigan',
        model: 'VN-B2-034',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-beige-collar-stud-zip-cardigan.jpg',
        sort: 49,
        name: { zh: '卡其灰翻领铆钉拉链开衫', en: 'Beige Collared Studded Zip Cardigan', vn: 'Áo Cardigan Cổ Bẻ Màu Be Khoá Kéo Đính Đinh' },
        summary: { zh: '浅卡其翻领开衫，双头拉链配胸前铆钉。短款利落，酷感通勤风。', en: 'Light beige collared cardigan with double zip and chest stud rows. Cropped, cool-tailored commute style.', vn: 'Áo cardigan màu be nhạt cổ bẻ, khoá kéo hai đầu và hàng đinh trang trí trước ngực. Form ngắn gọn, phong cách cá tính mạnh mẽ.' },
      },
      {
        slug: 'vn-brown-stripe-zip-cardigan',
        model: 'VN-B2-035',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-brown-stripe-zip-cardigan.jpg',
        sort: 50,
        name: { zh: '咖啡条纹拉链针织开衫（胸针）', en: 'Brown Stripe Zip Cardigan with Brooch', vn: 'Áo Cardigan Nâu Sọc Ngang Khoá Kéo Kèm Trâm' },
        summary: { zh: '焦糖棕横条纹拉链开衫，配珍珠胸针。暖色调适合秋冬叠穿和通勤。', en: 'Caramel brown striped zip cardigan with a pearl brooch. Warm tones for autumn-winter layering and office looks.', vn: 'Áo cardigan nâu caramel sọc ngang khoá kéo, kèm trâm cài ngọc trai. Gam màu trầm ấm, phù hợp phối đồ thu đông và đi làm.' },
      },
      {
        slug: 'vn-sage-varsity-letter-sweater',
        model: 'VN-B2-036',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-sage-varsity-letter-sweater.jpg',
        sort: 51,
        name: { zh: '豆绿色字母V领针织衫', en: 'Sage Green Varsity Letter V-Neck Sweater', vn: 'Áo Len Xanh Xám Cổ V In Chữ Varsity' },
        summary: { zh: '豆绿色V领针织衫，学院风字母配小铆钉，毛边下摆。短款配运动裤或牛仔裤。', en: 'Sage green V-neck sweater with varsity lettering, small studs and frayed hem. Cropped, pairs with joggers or jeans.', vn: 'Áo len xanh xám cổ V in chữ varsity đính đinh nhỏ, lai áo xù. Form croptop năng động, phối cùng quần jogger hoặc jeans.' },
      },
      {
        slug: 'vn-grey-ribbed-letter-zip-cardigan',
        model: 'VN-B2-037',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-grey-ribbed-letter-zip-cardigan.jpg',
        sort: 52,
        name: { zh: '灰色竖纹字母贴布拉链开衫', en: 'Grey Ribbed Letter-Patch Zip Cardigan', vn: 'Áo Cardigan Xám Dệt Gân Khoá Kéo Đính Chữ Nổi' },
        summary: { zh: '灰色竖纹罗纹拉链开衫，立体字母贴布与铆钉。修身显瘦，甜酷街头风。', en: 'Grey vertical-ribbed zip cardigan with raised letter patches and studs. Fitted, sweet-edgy streetwear.', vn: 'Áo cardigan xám dệt gân dọc khoá kéo, đính chữ phối đinh trang trí. Form ôm tôn dáng, phong cách streetwear nữ tính.' },
      },
      {
        slug: 'vn-cream-stand-collar-zip-cardigan',
        model: 'VN-B2-038',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-cream-stand-collar-zip-cardigan.jpg',
        sort: 53,
        name: { zh: '米白立领双拉链口袋开衫', en: 'Cream Stand-Collar Double-Zip Cardigan', vn: 'Áo Cardigan Kem Cổ Cao Khoá Kéo Hai Đầu Có Túi' },
        summary: { zh: '米白色立领双头拉链开衫，两个铆钉胸袋。简约高级，配同色系穿搭很优雅。', en: 'Cream stand-collar double-zip cardigan with two riveted chest pockets. Minimal premium look in tonal outfits.', vn: 'Áo cardigan kem cổ đứng khoá kéo hai đầu, hai túi ngực đinh tán. Dáng basic thanh lịch, dễ phối cùng set đồ cùng tông.' },
      },
      {
        slug: 'vn-olive-stripe-vneck-cardigan',
        model: 'VN-B2-039',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-olive-stripe-vneck-cardigan.jpg',
        sort: 54,
        name: { zh: '橄榄绿条纹V领纽扣开衫', en: 'Olive Stripe V-Neck Button Cardigan', vn: 'Áo Cardigan Cổ V Sọc Xanh Olive Cài Cúc' },
        summary: { zh: '橄榄绿灰横条纹V领纽扣开衫，短款利落。薄针织多季可穿，日常百搭。', en: 'Olive-grey horizontal stripe V-neck button cardigan, neat cropped cut. Thin knit for multi-season everyday wear.', vn: 'Áo cardigan cổ V sọc ngang xanh olive phối xám, cài cúc cùng tông. Form ngắn gọn, chất len mỏng nhẹ phù hợp mặc nhiều mùa.' },
      },
      {
        slug: 'vn-cream-shawl-collar-sweater',
        model: 'VN-B2-040',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-cream-shawl-collar-sweater.jpg',
        sort: 55,
        name: { zh: '米白斜扣翻领针织衫', en: 'Cream Asymmetric Button-Collar Sweater', vn: 'Áo Len Kem Cổ Thiết Kế Cài Nút Lệch Vai' },
        summary: { zh: '米白色针织衫，斜侧纽扣翻领设计独特。宽松舒适，适合通勤和下午茶。', en: 'Cream sweater with a distinctive asymmetric buttoned collar. Relaxed fit for office and tea-time looks.', vn: 'Áo len kem với phần cổ bẻ lệch cài nút một bên, thiết kế độc bản. Form rộng thoải mái, phù hợp mặc đi làm và dự tiệc trà.' },
      },
      {
        slug: 'vn-cream-chunky-vneck-sweater',
        model: 'VN-B2-041',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-cream-chunky-vneck-sweater.jpg',
        sort: 56,
        name: { zh: '米白粗织V领针织衫', en: 'Cream Chunky V-Neck Knit Sweater', vn: 'Áo Len Dệt Thô Màu Kem Cổ V' },
        summary: { zh: '米白色粗针织V领宽松套头衫，黑色小标签点缀。柔软保暖不闷，适合雨季叠穿。', en: 'Cream chunky-knit relaxed V-neck pullover with a small black label. Soft warmth without bulk for rainy-season layering.', vn: 'Áo len kem dệt thô cổ V với nhãn đen nhỏ, form rộng oversize. Mềm ấm nhưng vẫn thoáng, phù hợp mặc layer mùa mưa.' },
      },
      {
        slug: 'vn-khaki-stripe-cropped-zip-cardigan',
        model: 'VN-B2-042',
        catSlug: 'vn-cardigan',
        cover: '/products/vn/vn-khaki-stripe-cropped-zip-cardigan.jpg',
        sort: 57,
        name: { zh: '卡其条纹短款V领拉链开衫', en: 'Khaki Stripe Cropped Zip Cardigan', vn: 'Áo Cardigan Croptop Sọc Kaki Cổ V Khoá Kéo' },
        summary: { zh: '卡其白横条纹短款V领拉链开衫，显腰显比例。配高腰裤或裙子很时尚。', en: 'Khaki-white striped cropped V-neck zip cardigan, waist-flattering. Trendy with high-waist pants or skirts.', vn: 'Áo cardigan croptop sọc kaki trắng cổ V khoá kéo, dáng ngắn tôn vòng eo. Phối cùng quần cao lưng hoặc chân váy rất trendy.' },
      },
      {
        slug: 'vn-cream-la-letter-sweater',
        model: 'VN-B2-043',
        catSlug: 'vn-knit-tee',
        cover: '/products/vn/vn-cream-la-letter-sweater.jpg',
        sort: 58,
        name: { zh: '米白LA字母铆钉针织衫', en: 'Cream Los Angeles Letter Knit Sweater', vn: 'Áo Len Kem In Chữ LOS ANGELES Đính Đinh Vai' },
        summary: { zh: '米白色针织衫，LOS ANGELES 学院字母与肩部铆钉。微短款，美式年轻风。', en: 'Cream sweater with LOS ANGELES varsity lettering and shoulder studs. Slightly cropped, youthful American style.', vn: 'Áo len kem in chữ LOS ANGELES phong cách varsity, đính đinh ở vai. Form hơi ngắn, dễ phối cho phong cách Mỹ trẻ trung.' },
      },
    ];

    const result = await sql.begin(async (tx: any) => {
      for (const p of products) {
        await tx`
          insert into content_products (slug, name, model, summary, cover_url, category_id, sites, sort, is_active)
          values (
            ${p.slug},
            ${JSON.stringify(p.name)}::jsonb,
            ${p.model},
            ${JSON.stringify(p.summary)}::jsonb,
            ${p.cover},
            (select id from content_categories where slug = ${p.catSlug}),
            '{"overseas"}',
            ${p.sort},
            true
          )
          on conflict (slug) do nothing
        `;
      }

      // 记录迁移
      await tx`insert into schema_migrations (name) values (${migrationName}) on conflict do nothing`;

      return { success: true, migration: migrationName, productsCount: products.length };
    });

    await logAudit('api', 'migrate', 'database', { migration: migrationName });

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('Vietnam batch2 migration failed:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
