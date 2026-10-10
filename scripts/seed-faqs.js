// 批量生成 FAQ 内容，通过 API Key 插入到数据库
const faqs = [
  // ===== 订单与起订量 =====
  {
    category: 'order',
    sort: 1,
    question: { zh: '最小起订量是多少？', en: 'What is your minimum order quantity (MOQ)?' },
    answer: {
      zh: '我们的起订量非常灵活。常规款式50件即可起订，特殊款式或复杂工艺可能需要适当提高起订量。对于新客户，我们鼓励小单试款，降低您的试错成本。长期合作客户可享受更灵活的起订政策。',
      en: 'Our MOQ is very flexible. Regular styles start from 50 pieces, while special styles or complex craftsmanship may require a slightly higher MOQ. For new customers, we encourage small trial orders to reduce your risk. Long-term partners enjoy even more flexible MOQ terms.',
    },
  },
  {
    category: 'order',
    sort: 2,
    question: { zh: '可以来图或来样定制吗？', en: 'Can you customize based on designs or samples?' },
    answer: {
      zh: '当然可以。我们支持来图定制、来样定制两种方式。您只需提供设计稿、参考图片或实物样衣，我们的打样团队会在3-7天内完成首样。OEM/ODM 都是我们的核心业务，每年服务超过200家品牌客户。',
      en: 'Absolutely. We support both design-based and sample-based customization. Simply provide us with design sketches, reference images, or physical samples, and our sampling team will complete the first sample within 3-7 days. OEM/ODM is our core business, serving over 200 brand clients annually.',
    },
  },
  {
    category: 'order',
    sort: 3,
    question: { zh: '你们有自己的设计团队吗？', en: 'Do you have an in-house design team?' },
    answer: {
      zh: '有的，我们拥有10人以上的专业设计团队，每月推出100+新款。我们提供 ODM 开发服务，包括趋势预测、款式设计、面料开发、工艺研发等。客户可以直接选择我们的现成款式，也可以委托我们独家开发。',
      en: 'Yes, we have a professional design team of 10+ members, launching 100+ new styles every month. We offer full ODM development services including trend forecasting, style design, fabric development, and craftsmanship R&D. Clients can choose from our ready-made styles or commission exclusive development.',
    },
  },

  // ===== 打样与交期 =====
  {
    category: 'sampling',
    sort: 4,
    question: { zh: '打样需要多长时间？费用多少？', en: 'How long does sampling take and how much does it cost?' },
    answer: {
      zh: '常规款式打样3-5天，复杂款式5-7天。打样费根据款式复杂度收取，通常在100-300元/件之间。下单大货后，达到一定数量可全额退还打样费。具体费用需根据款式详谈。',
      en: 'Regular styles take 3-5 days for sampling, while complex styles take 5-7 days. Sampling fees depend on complexity, usually ranging from $15-$50 per piece. After placing a bulk order that meets the minimum quantity, the sampling fee can be fully refunded. Exact pricing depends on the specific style.',
    },
  },
  {
    category: 'sampling',
    sort: 5,
    question: { zh: '大货生产周期是多久？', en: 'What is the bulk production lead time?' },
    answer: {
      zh: '小批量订单（50-500件）通常7-10天，中等批量（500-2000件）10-15天，大批量订单（2000件以上）15-25天。我们日产能力30,000件，可以灵活应对加急订单。具体交期根据款式复杂度和订单数量确定。',
      en: 'Small batch orders (50-500 pcs) usually take 7-10 days, medium batches (500-2000 pcs) take 10-15 days, and large volume orders (2000+ pcs) take 15-25 days. With a daily capacity of 30,000 pieces, we can flexibly handle rush orders. Exact lead time depends on style complexity and order quantity.',
    },
  },
  {
    category: 'sampling',
    sort: 6,
    question: { zh: '可以做加急订单吗？', en: 'Can you handle rush orders?' },
    answer: {
      zh: '可以。我们有专门的加急生产通道，小批量订单最快3天即可交货。加急订单需提前确认产能和加急费用，具体请联系我们的业务团队详谈。',
      en: 'Yes, we have a dedicated rush production channel. Small batch orders can be delivered in as fast as 3 days. Rush orders require prior confirmation of production capacity and expedite fees. Please contact our sales team for details.',
    },
  },

  // ===== 产品与质量 =====
  {
    category: 'quality',
    sort: 7,
    question: { zh: '你们主要生产什么类型的毛衣？', en: 'What types of sweaters do you mainly produce?' },
    answer: {
      zh: '我们专业生产各类针织服装，包括：女士毛衣、男士毛衣、童装毛衣、针织开衫、针织连衣裙、针织套装、针织家居服、宠物毛衣等。支持圆领、V领、高领、连帽等各种领型，以及提花、绞花、镂空、撞色等多种工艺。',
      en: 'We specialize in all types of knitwear, including: women\'s sweaters, men\'s sweaters, kids\' sweaters, knit cardigans, knit dresses, knit sets, knit loungewear, pet sweaters, and more. We support various necklines (crew, V-neck, turtleneck, hooded) and techniques (jacquard, cable, openwork, color-blocking, etc.).',
    },
  },
  {
    category: 'quality',
    sort: 8,
    question: { zh: '你们的质量如何保证？', en: 'How do you ensure product quality?' },
    answer: {
      zh: '我们有严格的品质管控体系：1）面料进厂全检；2）生产过程中四道巡检；3）成品100%全检包装；4）支持第三方验货。我们通过了 BSCI、ISO9001 等多项认证，产品出口欧美20年，品质稳定有保障。',
      en: 'We have a strict quality control system: 1) Full inspection of incoming fabrics; 2) Four in-process inspections during production; 3) 100% finished product inspection before packaging; 4) Third-party inspection support. We are BSCI and ISO9001 certified, with 20 years of export experience to Europe and America — quality you can trust.',
    },
  },
  {
    category: 'quality',
    sort: 9,
    question: { zh: '可以提供什么面料？', en: 'What fabrics do you offer?' },
    answer: {
      zh: '我们常用的面料包括：腈纶、涤纶、棉、羊毛、混纺、兔绒、仿貂绒、冰岛毛、雪尼尔、美利奴羊毛、羊绒等。也可以根据客户需求定制特殊面料。面料均符合欧盟 REACH 和 OEKO-TEX 标准。',
      en: 'Our commonly used fabrics include: acrylic, polyester, cotton, wool, blends, rabbit hair, faux mink, Iceland wool, chenille, merino wool, cashmere, and more. We can also customize special fabrics per client requirements. All fabrics meet EU REACH and OEKO-TEX standards.',
    },
  },
  {
    category: 'quality',
    sort: 10,
    question: { zh: '可以做哪些尺码？', en: 'What sizes can you produce?' },
    answer: {
      zh: '我们支持从童装到成人装的全尺码生产，涵盖 XS-XXXL 甚至更大尺码。也可以按照客户提供的尺码表定制生产。所有尺码都经过严格的尺寸核对，确保大货尺码准确。',
      en: 'We produce all sizes from kids to adults, covering XS-XXXL and even larger sizes. We can also produce based on custom size charts provided by clients. All sizes undergo strict measurement verification to ensure accuracy in bulk production.',
    },
  },

  // ===== 付款与物流 =====
  {
    category: 'payment',
    sort: 11,
    question: { zh: '你们接受什么付款方式？', en: 'What payment methods do you accept?' },
    answer: {
      zh: '我们支持多种付款方式：对公转账、支付宝、微信、PayPal、西联汇款、T/T、信用证等。常规付款条件：30%定金 + 70%发货前付清。长期合作客户可协商更灵活的付款条件。',
      en: 'We accept multiple payment methods: bank transfer, PayPal, Western Union, T/T, L/C, and more. Standard payment terms: 30% deposit + 70% before shipment. Flexible payment terms can be negotiated for long-term partners.',
    },
  },
  {
    category: 'payment',
    sort: 12,
    question: { zh: '你们能出口到哪些国家？', en: 'Which countries can you export to?' },
    answer: {
      zh: '我们可以出口到全球大多数国家和地区，包括美国、加拿大、欧盟各国、英国、澳大利亚、东南亚、中东、南美等。我们有丰富的外贸经验，可以协助处理报关、物流、清关等事宜。',
      en: 'We can export to most countries and regions worldwide, including the US, Canada, EU countries, UK, Australia, Southeast Asia, the Middle East, South America, and more. We have extensive foreign trade experience and can assist with customs declaration, logistics, and clearance.',
    },
  },
  {
    category: 'payment',
    sort: 13,
    question: { zh: '运输方式有哪些？运费怎么算？', en: 'What shipping methods do you offer and how is freight calculated?' },
    answer: {
      zh: '我们支持多种运输方式：海运、空运、快递（DHL/UPS/FedEx）、铁路运输等。运费根据货物重量、体积、目的地和运输方式计算。我们可以帮您推荐最具性价比的物流方案，也支持客户指定货代。',
      en: 'We offer multiple shipping methods: sea freight, air freight, express (DHL/UPS/FedEx), rail freight, and more. Freight is calculated based on weight, volume, destination, and shipping method. We can recommend the most cost-effective logistics solution, or you can use your own forwarder.',
    },
  },

  // ===== 合作与服务 =====
  {
    category: 'service',
    sort: 14,
    question: { zh: '可以提供包装和吊牌定制吗？', en: 'Can you provide custom packaging and hangtags?' },
    answer: {
      zh: '可以。我们提供完整的贴牌服务，包括：定制吊牌、洗水标、主唛、包装袋、礼盒等。您只需提供设计稿，我们负责打样和生产。也可以使用中性包装，满足不同客户的需求。',
      en: 'Yes. We offer complete private label services including: custom hangtags, care labels, main labels, packaging bags, gift boxes, and more. Simply provide your design files and we handle sampling and production. We also offer neutral packaging to meet different client needs.',
    },
  },
  {
    category: 'service',
    sort: 15,
    question: { zh: '你们工厂在哪里？可以验厂吗？', en: 'Where is your factory located? Can we visit?' },
    answer: {
      zh: '我们的工厂位于广东省汕头市澄海区，是中国著名的针织毛衣产业带。工厂面积5000平方米，员工200余人。我们非常欢迎客户来厂参观考察，提前预约即可。也支持视频验厂。',
      en: 'Our factory is located in Chenghai District, Shantou City, Guangdong Province — a renowned knitwear manufacturing hub in China. The factory spans 5,000 sqm with over 200 employees. We warmly welcome client visits — just book an appointment in advance. Virtual factory tours via video call are also available.',
    },
  },
  {
    category: 'service',
    sort: 16,
    question: { zh: '产品出现质量问题怎么办？', en: 'What if there are quality issues with the products?' },
    answer: {
      zh: '我们承诺：收到货后7天内如发现质量问题，经核实后我们将免费返修或退换。我们有专业的售后团队，第一时间响应您的问题，确保您的权益得到保障。',
      en: 'We promise: if quality issues are found within 7 days of receiving the goods, we will repair or replace them free of charge after verification. Our professional after-sales team responds promptly to ensure your rights and interests are protected.',
    },
  },
];

const API_KEY = 'yyk_ac667c31c8a4b2ccb2c9438a31ae9028';
const BASE_URL = 'https://yayuhong-knitwear.vercel.app';

async function createFaq(faq) {
  const res = await fetch(`${BASE_URL}/api/admin/faqs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      sort: faq.sort,
      is_active: true,
      sites: ['global'],
    }),
  });
  const data = await res.json();
  if (!data.ok) {
    throw new Error(`创建失败: ${data.error}`);
  }
  return data.id;
}

async function main() {
  console.log(`开始创建 ${faqs.length} 条 FAQ...`);
  let success = 0;
  for (let i = 0; i < faqs.length; i++) {
    const faq = faqs[i];
    try {
      const id = await createFaq(faq);
      console.log(`[${i + 1}/${faqs.length}] ✓ ${faq.question.en} -> ${id}`);
      success++;
    } catch (e) {
      console.log(`[${i + 1}/${faqs.length}] ✗ ${faq.question.en} -> ${e.message}`);
    }
  }
  console.log(`\n完成！成功创建 ${success}/${faqs.length} 条 FAQ`);
}

main().catch(console.error);
