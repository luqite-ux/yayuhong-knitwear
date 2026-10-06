import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/guard';
import { logAudit } from '@/lib/audit';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const A = (id: string) => `https://m.media-amazon.com/images/I/${id}._AC_UL640_.jpg`;
const AE = (hash: string) => `https://ae-pic-a1.aliexpress-media.com/kf/${hash}.jpg_640x640q75.jpg_.webp`;

// SEO 优化的产品数据
// 标题模式：英文包含 wholesale, custom, OEM, factory 等关键词
// 中文包含 批发, 定制, OEM, 源头工厂 等关键词
const seedProducts = [
  // ========== 女式毛衣 ==========
  { cat: 'womens-sweater', model: 'XY-W-001', img: A('71BsfwmWb8L'), zh: '针织套头毛衣', en: 'Knit Pullover Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-002', img: A('91MnaEuJ6qL'), zh: '高领针织毛衣', en: 'Turtleneck Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-003', img: A('714sG2Nx9zL'), zh: '宽松针织开衫', en: 'Oversized Knit Cardigan' },
  { cat: 'womens-sweater', model: 'XY-W-004', img: A('71MIDEyOPEL'), zh: '圆领套头毛衣', en: 'Crew Neck Pullover Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-005', img: A('71QLU3sm3CL'), zh: '罗纹针织套头衫', en: 'Ribbed Knit Pullover' },
  { cat: 'womens-sweater', model: 'XY-W-006', img: A('71rf-YGgaoL'), zh: 'V领针织毛衣', en: 'V-Neck Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-007', img: A('71LtG1o2ILL'), zh: '条纹针织毛衣', en: 'Striped Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-008', img: A('81VKtFTaCbL'), zh: '粗针针织毛衣', en: 'Chunky Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-009', img: A('81rvZ2khfWL'), zh: '修身针织毛衣', en: 'Slim Fit Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-010', img: A('71tg-6WKPbL'), zh: '系带针织开衫', en: 'Belted Knit Cardigan' },
  { cat: 'womens-sweater', model: 'XY-W-011', img: A('71k2q2NsDAL'), zh: '拼色针织上衣', en: 'Color Block Knit Top' },
  { cat: 'womens-sweater', model: 'XY-W-012', img: A('81Rj8Gj7FML'), zh: '休闲套头毛衣', en: 'Casual Pullover Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-013', img: A('71ERv3nt+3L'), zh: '纽扣针织开衫', en: 'Button Knit Cardigan' },
  { cat: 'womens-sweater', model: 'XY-W-014', img: A('81nKsNNhG5L'), zh: '肌理感针织衫', en: 'Textured Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-015', img: A('817Ygaz9iqL'), zh: '合身版型毛衣', en: 'Fitted Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-016', img: A('71rBZ1tZF5L'), zh: '时尚套头针织衫', en: 'Trendy Pullover Knitwear' },
  { cat: 'womens-sweater', model: 'XY-W-017', img: A('71EMLE2FjpL'), zh: '宽松针织上衣', en: 'Loose Knit Top' },
  { cat: 'womens-sweater', model: 'XY-W-018', img: A('71l9N09tGUL'), zh: '半高领针织衫', en: 'Mock Neck Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-019', img: A('81opFGAsGEL'), zh: '经典针织开衫', en: 'Classic Knit Cardigan' },
  { cat: 'womens-sweater', model: 'XY-W-020', img: A('61E2I1WMn2L'), zh: '休闲针织上衣', en: 'Casual Knit Top' },
  { cat: 'womens-sweater', model: 'XY-W-021', img: AE('Sab811e739bbf4c919809910c20ca9bc5d'), zh: '针织套头衫', en: 'Knitted Pullover Top' },
  { cat: 'womens-sweater', model: 'XY-W-022', img: AE('S086494d2d6ec4f3695056364de3874b0A'), zh: '休闲针织开衫', en: 'Casual Knit Cardigan' },
  { cat: 'womens-sweater', model: 'XY-W-023', img: AE('Sc599169132fa4fb787717a6927666628H'), zh: '时尚针织毛衣', en: 'Fashion Knit Sweater' },
  { cat: 'womens-sweater', model: 'XY-W-024', img: AE('S3bf69909ca1a410184fc2f90a3f25449N'), zh: '修身针织上衣', en: 'Slim Knit Top' },

  // ========== 童装毛衣 ==========
  { cat: 'kids-sweater', model: 'XY-K-001', img: A('71VeK2OC67L'), zh: '女童针织开衫', en: 'Girls Knit Cardigan' },
  { cat: 'kids-sweater', model: 'XY-K-002', img: A('81+hZubygYL'), zh: '粗针条纹毛衣', en: 'Chunky Knit Striped Sweater' },
  { cat: 'kids-sweater', model: 'XY-K-003', img: A('719ltCK5qkL'), zh: '高领麻花针织衫', en: 'Turtleneck Cable Knit' },
  { cat: 'kids-sweater', model: 'XY-K-004', img: A('71ny6va6ONL'), zh: '长袖高领毛衣', en: 'Long Sleeve Turtleneck' },
  { cat: 'kids-sweater', model: 'XY-K-005', img: A('71lEexSFe0L'), zh: '纽扣儿童开衫', en: 'Button Kids Cardigan' },
  { cat: 'kids-sweater', model: 'XY-K-006', img: A('71P4b97PGHL'), zh: '婴儿针织套头衫', en: 'Baby Knit Pullover' },
  { cat: 'kids-sweater', model: 'XY-K-007', img: A('71VEkouw0aL'), zh: '棉质V领儿童毛衣', en: 'Cotton V-Neck Kids Sweater' },
  { cat: 'kids-sweater', model: 'XY-K-008', img: A('81WdWBvaHbL'), zh: '幼儿针织套头衫', en: 'Toddler Knit Pullover' },
  { cat: 'kids-sweater', model: 'XY-K-009', img: A('81DzFvD5GhL'), zh: '婴儿针织开衫', en: 'Baby Knit Cardigan' },
  { cat: 'kids-sweater', model: 'XY-K-010', img: A('81GIJMQPLUL'), zh: '幼儿针织毛衣', en: 'Toddler Knit Sweater' },
  { cat: 'kids-sweater', model: 'XY-K-011', img: A('81VDq73hnsL'), zh: '圣诞儿童开衫', en: 'Christmas Kids Cardigan' },
  { cat: 'kids-sweater', model: 'XY-K-012', img: A('91fXWTAna9L'), zh: '拉链儿童开衫', en: 'Zip Kids Cardigan' },
  { cat: 'kids-sweater', model: 'XY-K-013', img: A('91zJvX0ld0L'), zh: '圆领儿童套头衫', en: 'Crewneck Kids Pullover' },
  { cat: 'kids-sweater', model: 'XY-K-014', img: A('71tmEYFi23L'), zh: '麻花儿童毛衣', en: 'Cable Knit Kids Sweater' },
  { cat: 'kids-sweater', model: 'XY-K-015', img: A('81w-uTR7U+L'), zh: '粗针儿童套头衫', en: 'Chunky Kids Pullover' },
  { cat: 'kids-sweater', model: 'XY-K-016', img: A('81Ap9JW0f0L'), zh: '男童麻花开衫', en: 'Boys Cable Cardigan' },
  { cat: 'kids-sweater', model: 'XY-K-017', img: A('61TMTJpTD1L'), zh: '儿童针织毛衣裙', en: 'Kids Knit Sweater Dress' },
  { cat: 'kids-sweater', model: 'XY-K-018', img: A('714bTwpjdeL'), zh: '儿童圆领毛衣', en: 'Kids Crew Neck Sweater' },
  { cat: 'kids-sweater', model: 'XY-K-019', img: AE('S0f9b29bb9fa34ca49a1fef223929f00d1'), zh: '儿童针织毛衣', en: 'Children Knit Sweater' },
  { cat: 'kids-sweater', model: 'XY-K-020', img: A('71L-oOW1qiL'), zh: '敞襟儿童开衫', en: 'Open Front Kids Cardigan' },

  // ========== 男式毛衣 ==========
  { cat: 'mens-sweater', model: 'XY-M-001', img: A('71Pd57qe64L'), zh: '半拉链套头衫', en: 'Quarter Zip Pullover' },
  { cat: 'mens-sweater', model: 'XY-M-002', img: A('81JmpBmn0CL'), zh: '男士针织开衫', en: 'Men Knit Cardigan' },
  { cat: 'mens-sweater', model: 'XY-M-003', img: A('81kmjezerUL'), zh: '男士休闲毛衣', en: 'Men Casual Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-004', img: A('71fyxjVIVTL'), zh: '麻花套头毛衣', en: 'Cable Knit Pullover' },
  { cat: 'mens-sweater', model: 'XY-M-005', img: A('81D+bCgn8hL'), zh: '男士圆领毛衣', en: 'Men Crew Neck Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-006', img: A('81AARXiGz5L'), zh: '修身男士套头衫', en: 'Slim Fit Men Pullover' },
  { cat: 'mens-sweater', model: 'XY-M-007', img: A('71fm7+WAt4L'), zh: '男士V领毛衣', en: 'Men V-Neck Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-008', img: A('71EAeDCOQ3L'), zh: '立领针织衫', en: 'Stand Collar Knit' },
  { cat: 'mens-sweater', model: 'XY-M-009', img: A('81pmsd3S2rL'), zh: '男士套头毛衣', en: 'Men Pullover Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-010', img: A('61J7FTJaGYL'), zh: '男士休闲针织衫', en: 'Men Casual Knit' },
  { cat: 'mens-sweater', model: 'XY-M-011', img: A('61qxbX+getL'), zh: '男士合身毛衣', en: 'Men Fitted Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-012', img: A('711N-N1M08L'), zh: '男士半拉链毛衣', en: 'Men Quarter Zip Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-013', img: A('81ywc3pNK2L'), zh: '男士半高领毛衣', en: 'Men Mock Neck Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-014', img: A('71OMLQJFXBL'), zh: '男士圆领针织衫', en: 'Men Crew Neck Knit' },
  { cat: 'mens-sweater', model: 'XY-M-015', img: A('81Rzt9FBpbL'), zh: '男士休闲开衫', en: 'Men Casual Cardigan' },
  { cat: 'mens-sweater', model: 'XY-M-016', img: A('71vm5me60oL'), zh: '男士套头针织衫', en: 'Men Pullover Knit' },
  { cat: 'mens-sweater', model: 'XY-M-017', img: A('91828yo7t4L'), zh: '男士基础款毛衣', en: 'Men Essential Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-018', img: A('81zbUrUlm0L'), zh: '男士基础套头衫', en: 'Men Basic Pullover' },
  { cat: 'mens-sweater', model: 'XY-M-019', img: A('71zt76aD5DL'), zh: '男士圆领针织衫', en: 'Men Crew Neck Knitwear' },
  { cat: 'mens-sweater', model: 'XY-M-020', img: A('A1Tv-5E3lPL'), zh: '男士立领套头衫', en: 'Men Stand Collar Pullover' },
  { cat: 'mens-sweater', model: 'XY-M-021', img: AE('S7716de674d1147bb9726abbc1454c800K'), zh: '男士针织毛衣', en: 'Men Knit Sweater' },
  { cat: 'mens-sweater', model: 'XY-M-022', img: AE('S17e51289db414bb287097dfe096ac183O'), zh: '男士休闲针织', en: 'Men Casual Knitwear' },

  // ========== 家居服套装 ==========
  { cat: 'loungewear-set', model: 'XY-L-001', img: A('61sxC-eMdsL'), zh: '华夫格针织套装', en: 'Waffle Knit Lounge Set' },
  { cat: 'loungewear-set', model: 'XY-L-002', img: A('61hCX7JVNXL'), zh: '家居针织套装', en: 'Knit Loungewear Set' },
  { cat: 'loungewear-set', model: 'XY-L-003', img: A('81dB8hu1gSL'), zh: '华夫格两件套', en: '2 Piece Waffle Knit Set' },
  { cat: 'loungewear-set', model: 'XY-L-004', img: A('71j9mySqJcL'), zh: '针织睡衣套装', en: 'Knit Pajama Set' },
  { cat: 'loungewear-set', model: 'XY-L-005', img: A('71HziNRfiOL'), zh: '家居套头衫套装', en: 'Lounge Pullover Set' },
  { cat: 'loungewear-set', model: 'XY-L-006', img: A('61atE+Z9XvL'), zh: '针织两件套装', en: '2 Piece Knit Outfit' },
  { cat: 'loungewear-set', model: 'XY-L-007', img: A('81wynY6LMUL'), zh: '家居袍套装', en: 'Lounge Robe Set' },
  { cat: 'loungewear-set', model: 'XY-L-008', img: A('71IAqNRfiOL'), zh: '针织家居套装', en: 'Knitted Homewear Set' },
  { cat: 'loungewear-set', model: 'XY-L-009', img: A('71kSodT3yqL'), zh: '针织睡衣两件套', en: 'Knit Pajama 2 Piece' },
  { cat: 'loungewear-set', model: 'XY-L-010', img: A('61fX8FqSBkL'), zh: '开衫家居套装', en: 'Cardigan Loungewear Set' },
  { cat: 'loungewear-set', model: 'XY-L-011', img: A('81r9ya4kcHL'), zh: '针织家居服', en: 'Knit Loungewear' },
  { cat: 'loungewear-set', model: 'XY-L-012', img: A('81KEthz+SNL'), zh: '华夫格浴袍', en: 'Waffle Knit Robe' },
  { cat: 'loungewear-set', model: 'XY-L-013', img: A('613eYRGbCIL'), zh: '针织毛衣套装', en: 'Knit Sweater Set' },
  { cat: 'loungewear-set', model: 'XY-L-014', img: A('6120kiW-mRL'), zh: '针织运动套装', en: 'Knit Track Suit' },
  { cat: 'loungewear-set', model: 'XY-L-015', img: A('81CcCMlQEUL'), zh: '家居睡衣套装', en: 'Lounge Pajama Set' },
  { cat: 'loungewear-set', model: 'XY-L-016', img: A('71V3u+WE3JL'), zh: '柔软家居套装', en: 'Soft Loungewear Set' },
  { cat: 'loungewear-set', model: 'XY-L-017', img: A('71PU9FZG5CL'), zh: '两件套家居服', en: '2 Piece Loungewear' },
  { cat: 'loungewear-set', model: 'XY-L-018', img: A('51MXY4Z4doL'), zh: '毛衣针织套装', en: 'Sweater Knit Set' },
  { cat: 'loungewear-set', model: 'XY-L-019', img: A('71ljx+S3oSL'), zh: 'V领针织套装', en: 'V-Neck Knit Set' },
  { cat: 'loungewear-set', model: 'XY-L-020', img: A('51vk7F8zAKL'), zh: '针织睡衣家居服', en: 'Knit Pajama Loungewear' },

  // ========== 宠物服饰 ==========
  { cat: 'pet-clothes', model: 'XY-P-001', img: A('716G6O3lx5L'), zh: '圣诞狗狗毛衣', en: 'Christmas Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-002', img: A('71-aM8zq-kL'), zh: '双面狗狗外套', en: 'Reversible Dog Coat' },
  { cat: 'pet-clothes', model: 'XY-P-003', img: A('71FtD3zO7lL'), zh: '保暖狗狗毛衣', en: 'Thermal Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-004', img: A('71j5MuRSoAL'), zh: '波点宠物毛衣', en: 'Dot Pattern Pet Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-005', img: A('812dZEy3lUL'), zh: '三件装狗狗毛衣', en: '3 Pack Dog Sweaters' },
  { cat: 'pet-clothes', model: 'XY-P-006', img: A('81jS+ryE0AL'), zh: '狗狗卫衣', en: 'Dog Sweatshirt' },
  { cat: 'pet-clothes', model: 'XY-P-007', img: A('81Uwvuglm7L'), zh: '南瓜款狗狗毛衣', en: 'Pumpkin Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-008', img: A('81SLW-zJ+kL'), zh: '轻薄狗狗毛衣', en: 'Lightweight Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-009', img: A('81V8-FpMDYL'), zh: '针织狗狗毛衣', en: 'Knitted Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-010', img: A('61rXLspTGdL'), zh: '狗狗连帽衫', en: 'Dog Hoodie' },
  { cat: 'pet-clothes', model: 'XY-P-011', img: A('71YpCA9uyaL'), zh: '冬季狗狗毛衣', en: 'Winter Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-012', img: A('71S2qbS1ySL'), zh: '高领狗狗毛衣', en: 'Turtleneck Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-013', img: A('71zcm-YMLgL'), zh: '狗狗抓绒外套', en: 'Dog Fleece Jacket' },
  { cat: 'pet-clothes', model: 'XY-P-014', img: A('71odYgS6-uL'), zh: '万圣节狗狗毛衣', en: 'Halloween Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-015', img: A('81Jn9icOVJL'), zh: '高领宠物针织衫', en: 'Turtleneck Pet Knit' },
  { cat: 'pet-clothes', model: 'XY-P-016', img: A('81H6tfRRW8L'), zh: '三件装抓绒衣', en: '3 Pack Fleece Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-017', img: A('51d8Mb5RAfL'), zh: '宠物连帽衫', en: 'Pet Hoodie' },
  { cat: 'pet-clothes', model: 'XY-P-018', img: A('71ePmzG8P2L'), zh: '防风狗狗毛衣', en: 'Windproof Dog Sweater' },
  { cat: 'pet-clothes', model: 'XY-P-019', img: A('61+lpx6oIVL'), zh: '狗狗套头衫', en: 'Dog Pullover' },
  { cat: 'pet-clothes', model: 'XY-P-020', img: A('71K0baygxbL'), zh: '高领宠物毛衣', en: 'Turtleneck Pet Sweater' },

  // ========== 针织配饰 ==========
  { cat: 'knit-accessories', model: 'XY-A-001', img: A('712DRIxoFOL'), zh: '针织帽围巾套装', en: 'Knit Beanie & Scarf Set' },
  { cat: 'knit-accessories', model: 'XY-A-002', img: A('81r-DwiI0jL'), zh: '冬季帽子套装', en: 'Winter Hat Set' },
  { cat: 'knit-accessories', model: 'XY-A-003', img: A('71OUBmokiNL'), zh: '羊毛针织套装', en: 'Merino Wool Knit Set' },
  { cat: 'knit-accessories', model: 'XY-A-004', img: A('81h+2Sq-Q4L'), zh: '针织帽两件套', en: 'Knit Hat 2 Piece Set' },
  { cat: 'knit-accessories', model: 'XY-A-005', img: A('81KzhYQqmPL'), zh: '围巾帽子套装', en: 'Scarf & Hat Set' },
  { cat: 'knit-accessories', model: 'XY-A-006', img: A('71QFKSOWw+L'), zh: '帽围巾手套三件套', en: 'Beanie Scarf Gloves Set' },
  { cat: 'knit-accessories', model: 'XY-A-007', img: A('810waJjRMxL'), zh: '冬季保暖套装', en: 'Winter Warm Set' },
  { cat: 'knit-accessories', model: 'XY-A-008', img: A('81j8Bg-n1wL'), zh: '羊绒帽围巾套装', en: 'Cashmere Hat & Scarf Set' },
  { cat: 'knit-accessories', model: 'XY-A-009', img: A('814aPfdTiEL'), zh: '针织三件套', en: 'Knit 3 Piece Set' },
  { cat: 'knit-accessories', model: 'XY-A-010', img: A('71P6yWIA-aL'), zh: '帽围巾两件套', en: 'Beanie Scarf 2 Piece' },
  { cat: 'knit-accessories', model: 'XY-A-011', img: A('71F2Y8d2YJL'), zh: '毛绒袜套装', en: 'Fuzzy Socks Set' },
  { cat: 'knit-accessories', model: 'XY-A-012', img: A('71WsMNaluKL'), zh: '帽围巾托特包套装', en: 'Beanie Scarf Tote Set' },
  { cat: 'knit-accessories', model: 'XY-A-013', img: A('61f4tnQfBwL'), zh: '针织配饰套装', en: 'Knit Accessories Set' },
  { cat: 'knit-accessories', model: 'XY-A-014', img: A('81d2iczYB7L'), zh: '三件针织套装', en: '3 PCS Knitted Set' },
  { cat: 'knit-accessories', model: 'XY-A-015', img: A('81Bylmm2P0L'), zh: '冬帽围巾套装', en: 'Winter Hat Scarf Set' },
  { cat: 'knit-accessories', model: 'XY-A-016', img: A('814-qxhBEbL'), zh: '十二件冬季套装', en: '12 Pcs Winter Set' },
  { cat: 'knit-accessories', model: 'XY-A-017', img: A('81QBRiuSXvL'), zh: '帽围巾手套套装', en: 'Beanie Scarf Gloves Set' },
  { cat: 'knit-accessories', model: 'XY-A-018', img: A('81cOQRoMe0L'), zh: '抓绒围巾套装', en: 'Fleece Knit Neck Set' },
  { cat: 'knit-accessories', model: 'XY-A-019', img: A('81YEm4MQq3L'), zh: '针织帽围巾套装', en: 'Knit Hat & Scarf Set' },
  { cat: 'knit-accessories', model: 'XY-A-020', img: A('616W1UjjlsL'), zh: '冬季针织配饰', en: 'Winter Knit Accessories' },
];

// SEO 优化：生成带关键词的标题和描述
function buildSeoName(zh: string, en: string, cat: string) {
  const catKeywords: Record<string, { zh: string; en: string }> = {
    'womens-sweater': { zh: '批发定制_OEM贴牌_源头工厂', en: 'Wholesale Custom OEM Factory Direct' },
    'kids-sweater': { zh: '童装批发_定制OEM_儿童毛衣工厂', en: 'Wholesale Kids Custom OEM Manufacturer' },
    'mens-sweater': { zh: '男士毛衣批发_定制OEM_工厂直供', en: 'Wholesale Mens Custom OEM Factory' },
    'loungewear-set': { zh: '家居服批发_定制OEM_睡衣套装工厂', en: 'Wholesale Loungewear Custom OEM Manufacturer' },
    'pet-clothes': { zh: '宠物衣服批发_定制OEM_宠物服饰工厂', en: 'Wholesale Pet Clothes Custom OEM Manufacturer' },
    'knit-accessories': { zh: '针织配饰批发_定制OEM_源头工厂', en: 'Wholesale Knit Accessories Custom OEM Supplier' },
  };
  const kw = catKeywords[cat] || { zh: '批发定制_OEM工厂', en: 'Wholesale Custom OEM Factory' };
  return {
    zh: `${zh}_${kw.zh}`,
    en: `${en} - ${kw.en}`,
    ru: `${en} - Оптовый производитель на заказ`,
  };
}

function buildSeoSummary(zh: string, en: string, cat: string) {
  const templates: Record<string, { zh: string; en: string }> = {
    'womens-sweater': {
      zh: '源头工厂直供女式毛衣，支持OEM/ODM贴牌定制，来图来样加工，MOQ 50件起订，7天快速打样，月产能100万件。',
      en: 'Factory direct womens sweaters with OEM/ODM custom service. Low MOQ 50pcs, 7-day sample lead time, 1M pcs monthly capacity.',
    },
    'kids-sweater': {
      zh: '专业童装毛衣生产厂家，提供儿童针织衫OEM/ODM定制服务，安全环保面料，支持小批量定制，快速打样。',
      en: 'Professional kids sweater manufacturer with OEM/ODM custom service. Eco-friendly materials, low MOQ, fast sampling.',
    },
    'mens-sweater': {
      zh: '男士毛衣源头工厂，支持OEM贴牌定制，批发价格，品质保证，承接国内外订单，来图来样均可生产。',
      en: 'Mens sweater factory with OEM custom service. Wholesale pricing, quality guaranteed, accept custom designs and samples.',
    },
    'loungewear-set': {
      zh: '家居服睡衣套装定制工厂，针织面料柔软舒适，支持OEM/ODM贴牌，来样定制，MOQ灵活，出货快。',
      en: 'Loungewear and pajama set manufacturer with OEM/ODM custom service. Soft knit fabric, flexible MOQ, fast delivery.',
    },
    'pet-clothes': {
      zh: '宠物服饰生产厂家，狗狗毛衣猫咪衣服定制批发，支持OEM贴牌，多尺码多款式可选，源头工厂价格优势。',
      en: 'Pet clothing manufacturer offering dog sweaters and cat clothes wholesale with OEM service. Multiple sizes and styles.',
    },
    'knit-accessories': {
      zh: '针织配饰源头工厂，帽子围巾手套套装定制批发，支持OEM贴牌，冬季保暖必备，品质优良价格实惠。',
      en: 'Knit accessories factory offering hat scarf gloves sets wholesale with OEM service. Winter essential, great quality and price.',
    },
  };
  const t = templates[cat] || {
    zh: '专业针织品生产厂家，支持OEM/ODM定制。',
    en: 'Professional knitwear manufacturer with OEM/ODM custom service.',
  };
  return {
    zh: `${zh} | ${t.zh}`,
    en: `${en}. ${t.en}`,
    ru: `${en}. Профессиональный производитель трикотажа с обслуживанием OEM/ODM.`,
  };
}

export async function GET(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  return new Response(
    `<!DOCTYPE html><html><head><title>批量导入产品</title></head><body style="font-family:system-ui;padding:40px;">
      <h2>批量导入产品</h2>
      <p>点击按钮导入 126 款 SEO 优化的示例产品到数据库。</p>
      <p style="color:#666;">包含 6 个分类：女式毛衣(24)、童装毛衣(20)、男式毛衣(22)、家居服(20)、宠物服饰(20)、针织配饰(20)</p>
      <form method="POST">
        <button type="submit" id="importBtn" style="padding:12px 24px;background:#2563eb;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px;">开始导入</button>
      </form>
      <div id="result" style="margin-top:20px;white-space:pre-wrap;"></div>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function POST(req: NextRequest) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: '未登录' }, { status: 401 });

  // 获取分类映射
  const categories = await sql`
    select id, slug from content_categories where slug is not null
  `;
  const catMap = new Map(categories.map((c) => [c.slug, c.id]));

  const results: { model: string; status: string; error?: string }[] = [];
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < seedProducts.length; i++) {
    const p = seedProducts[i];
    const categoryId = catMap.get(p.cat);

    if (!categoryId) {
      results.push({ model: p.model, status: 'fail', error: `Category ${p.cat} not found` });
      failed++;
      continue;
    }

    // 检查是否已存在
    const existing = await sql`select id from content_products where model = ${p.model}`;
    if (existing.length > 0) {
      results.push({ model: p.model, status: 'skip' });
      skipped++;
      continue;
    }

    const seoName = buildSeoName(p.zh, p.en, p.cat);
    const seoSummary = buildSeoSummary(p.zh, p.en, p.cat);

    // 生成 slug
    let slug = slugify(`${p.model}-${p.en}`, { lower: true, strict: true });
    if (!slug) slug = `product-${p.model}`;

    // 确保 slug 唯一
    const slugExists = await sql`select id from content_products where slug = ${slug}`;
    if (slugExists.length > 0) {
      slug = `${slug}-${i}`;
    }

    try {
      await sql`
        insert into content_products (
          category_id, name, summary, model, slug, cover_url, gallery_urls,
          is_active, sort, sites
        ) values (
          ${categoryId},
          ${JSON.stringify(seoName)}::jsonb,
          ${JSON.stringify(seoSummary)}::jsonb,
          ${p.model},
          ${slug},
          ${p.img},
          ${[p.img]},
          true,
          ${i + 1},
          ${['global']}::text[]
        )
      `;
      results.push({ model: p.model, status: 'ok' });
      created++;
    } catch (err: any) {
      results.push({ model: p.model, status: 'fail', error: err.message });
      failed++;
    }
  }

  await logAudit('admin', 'bulk_import', 'product', { total: seedProducts.length, created, skipped, failed });

  return NextResponse.json({
    ok: true,
    total: seedProducts.length,
    created,
    skipped,
    failed,
    results: results.slice(0, 30), // 只返回前30条详情
  });
}
