// 全站种子数据 - FAQ / 工厂设备 / 生产流程 / 服务 / 首页内容 / ReadyStock
// 全部中英俄三语，导入后可在后台管理修改

export interface SeedFaq {
  category: string;
  question: { zh: string; en: string; ru: string };
  answer: { zh: string; en: string; ru: string };
  sort: number;
}

export interface SeedEquipment {
  name: { zh: string; en: string; ru: string };
  quantity: number;
  icon_key: string;
  sort: number;
}

export interface SeedProcess {
  title: { zh: string; en: string; ru: string };
  description: { zh: string; en: string; ru: string };
  step_number: number;
  icon_key: string;
  sort: number;
}

export interface SeedService {
  title: { zh: string; en: string; ru: string };
  summary: { zh: string; en: string; ru: string };
  description: { zh: string; en: string; ru: string };
  highlights: { zh: string[]; en: string[]; ru: string[] };
  icon_key: string;
  gradient_from: string;
  gradient_to: string;
  sort: number;
}

export interface SeedFeature {
  category: string;
  title: { zh: string; en: string; ru: string };
  description: { zh: string; en: string; ru: string };
  icon_key: string;
  sort: number;
}

export interface SeedReadyStock {
  name: { zh: string; en: string; ru: string };
  model: string;
  cover_url: string;
  price_range: string;
  sort: number;
}

// ========== FAQ 数据 ==========
export const faqSeed: SeedFaq[] = [
  {
    category: 'general',
    question: {
      zh: '你们是工厂还是贸易公司？',
      en: 'Are you a factory or a trading company?',
      ru: 'Вы фабрика или торговая компания?',
    },
    answer: {
      zh: '我们是一家拥有20年历史的专业针织服装工厂，位于广东汕头。工厂占地面积8000平方米，拥有200多名熟练工人，月产能100万件。我们提供从设计、打样到大货生产的一站式服务，欢迎随时来厂参观考察。',
      en: 'We are a professional knitwear factory with 20 years of experience, located in Shantou, Guangdong. Our factory covers 8,000 square meters with over 200 skilled workers and a monthly capacity of 1 million pieces. We offer one-stop service from design, sampling to bulk production. Welcome to visit our factory anytime.',
      ru: 'Мы профессиональная трикотажная фабрика с 20-летним опытом, находящаяся в Шаньтоу, Гуандун. Наша фабрика занимает 8000 квадратных метров, у нас более 200 квалифицированных рабочих и месячная производительность 1 миллион изделий. Мы предлагаем комплексное обслуживание от дизайна и образцов до массового производства. Приглашаем посетить нашу фабрику в любое время.',
    },
    sort: 1,
  },
  {
    category: 'general',
    question: {
      zh: '最小起订量（MOQ）是多少？',
      en: 'What is your minimum order quantity (MOQ)?',
      ru: 'Каково минимальное количество заказа (MOQ)?',
    },
    answer: {
      zh: '我们的常规MOQ是每款50件。对于新客户首单，我们可以灵活调整至30件起订，帮助您测试市场。量大从优，数量越多价格越有竞争力。部分现货款式可以更低起订量，具体请咨询我们的销售团队。',
      en: 'Our regular MOQ is 50 pieces per style. For first-time customers, we can be flexible with 30 pieces per style to help you test the market. Better prices for larger quantities - the more you order, the more competitive the price. Some ready-stock styles have even lower MOQs. Please contact our sales team for details.',
      ru: 'Наш стандартный MOQ составляет 50 штук на модель. Для новых клиентов мы можем быть гибкими и начать с 30 штук на модель, чтобы помочь вам протестировать рынок. Лучшие цены при больших заказах — чем больше вы заказываете, тем конкурентоспособнее цена. У некоторых моделей из наличия еще ниже MOQ. Пожалуйста, свяжитесь с нашей командой продаж для получения подробной информации.',
    },
    sort: 2,
  },
  {
    category: 'general',
    question: {
      zh: '打样需要多长时间？费用是多少？',
      en: 'How long does sampling take and how much does it cost?',
      ru: 'Сколько времени занимает изготовление образцов и сколько это стоит?',
    },
    answer: {
      zh: '常规款式打样周期为5-7天，复杂款式或需要特殊纱线的款式可能需要7-10天。打样费根据款式复杂度一般在50-200元/款之间。下大货订单后，打样费可全额退还。我们提供免费修改2次，超过次数酌情收费。',
      en: 'Regular style sampling takes 5-7 days. Complex styles or those requiring special yarns may take 7-10 days. Sample fees range from $10-$50 per style depending on complexity. Sample fees are fully refundable when you place a bulk order. We offer 2 free revisions; additional revisions may incur extra charges.',
      ru: 'Изготовление образцов обычных моделей занимает 5-7 дней. Сложные модели или требующие специальной пряжи могут занять 7-10 дней. Стоимость образцов составляет от 10 до 50 долларов за модель в зависимости от сложности. Плата за образцы полностью возвращается при размещении оптового заказа. Мы предлагаем 2 бесплатные доработки; дополнительные доработки могут потребовать дополнительной оплаты.',
    },
    sort: 3,
  },
  {
    category: 'general',
    question: {
      zh: '你们支持OEM/ODM吗？可以定制设计吗？',
      en: 'Do you support OEM/ODM? Can you customize designs?',
      ru: 'Вы поддерживаете OEM/ODM? Можно ли заказать индивидуальный дизайн?',
    },
    answer: {
      zh: '当然支持！我们有专业的设计和研发团队，每年推出500多款新品。OEM服务：按照您的设计稿或样衣进行生产。ODM服务：根据您的品牌定位和目标市场，提供从趋势分析、款式设计到成品生产的全套解决方案。我们可以定制面料、颜色、尺码、logo等，满足您的品牌需求。',
      en: 'Absolutely! We have a professional design and R&D team that launches over 500 new styles every year. OEM service: produce according to your design sketches or sample garments. ODM service: provide full solutions from trend analysis, style design to finished production based on your brand positioning and target market. We can customize fabrics, colors, sizes, logos, etc. to meet your brand needs.',
      ru: 'Конечно! У нас есть профессиональная команда дизайнеров и разработчиков, которая выпускает более 500 новых моделей каждый год. OEM-сервис: производство по вашим эскизам или образцам одежды. ODM-сервис: предоставление полных решений от анализа трендов, дизайна моделей до готового производства на основе позиционирования вашего бренда и целевого рынка. Мы можем настроить ткани, цвета, размеры, логотипы и т.д. для удовлетворения потребностей вашего бренда.',
    },
    sort: 4,
  },
  {
    category: 'general',
    question: {
      zh: '你们的质量控制流程是怎样的？',
      en: 'What is your quality control process?',
      ru: 'Как у вас организован контроль качества?',
    },
    answer: {
      zh: '我们实行严格的全流程质量控制：1）来料检验：纱线和辅料入库前100%检验；2）产前样确认：大货前先做产前样，客户确认后才投产；3）中期检验：生产过程中IPQC巡检，确保工艺规范；4）尾期检验：成品100%全检后包装；5）出厂抽检：按AQL2.5标准进行抽检。我们通过了ISO9001和BSCI认证。',
      en: 'We implement strict full-process quality control: 1) Incoming inspection: 100% inspection of yarns and accessories before warehousing; 2) Pre-production sample confirmation: PP samples made and approved by customers before production; 3) In-process inspection: IPQC patrol inspections during production; 4) Final inspection: 100% inspection of finished products before packaging; 5) Outgoing inspection: random inspection per AQL 2.5 standard. We are ISO9001 and BSCI certified.',
      ru: 'Мы осуществляем строгий контроль качества на всех этапах: 1) Входной контроль: 100% проверка пряжи и комплектующих перед поступлением на склад; 2) Подтверждение образца перед производством: изготовление ПП-образцов и утверждение клиентом до начала производства; 3) Промежуточный контроль: проверки IPQC во время производства; 4) Финальный контроль: 100% проверка готовой продукции перед упаковкой; 5) Выходной контроль: выборочная проверка по стандарту AQL 2.5. У нас есть сертификаты ISO9001 и BSCI.',
    },
    sort: 5,
  },
  {
    category: 'shipping',
    question: {
      zh: '大货生产周期是多久？',
      en: 'What is the bulk production lead time?',
      ru: 'Каков срок производства оптовой партии?',
    },
    answer: {
      zh: '常规款式大货生产周期为20-30天，具体取决于订单数量和款式复杂度。旺季（9月-次年2月）可能需要30-45天。我们建议客户提前下单，确保交期。如果您有紧急订单，我们可以安排加急生产，最快7-15天交货（视款式和数量而定），可能会有加急费用。',
      en: 'Regular bulk production takes 20-30 days, depending on order quantity and style complexity. Peak season (September to February) may require 30-45 days. We recommend customers place orders in advance to ensure delivery time. For urgent orders, we can arrange rush production with delivery in as fast as 7-15 days (depending on style and quantity), possibly with rush fees.',
      ru: 'Стандартное оптовое производство занимает 20-30 дней, в зависимости от количества заказа и сложности моделей. В пиковый сезон (сентябрь — февраль) может потребоваться 30-45 дней. Мы рекомендуем клиентам размещать заказы заранее, чтобы гарантировать сроки поставки. Для срочных заказов мы можем организовать ускоренное производство с доставкой всего за 7-15 дней (в зависимости от модели и количества), возможно с дополнительной платой за срочность.',
    },
    sort: 6,
  },
  {
    category: 'shipping',
    question: {
      zh: '支持哪些付款方式？',
      en: 'What payment methods do you accept?',
      ru: 'Какие способы оплаты вы принимаете?',
    },
    answer: {
      zh: '我们支持多种付款方式：T/T银行转账（30%定金，70%发货前付清）、L/C信用证（仅限大额订单）、西联汇款、支付宝、微信支付、PayPal（样品单）。新客户首单通常要求30%定金，大货生产完成后验货合格再付70%尾款。长期合作客户可洽谈更灵活的付款条件。',
      en: 'We accept multiple payment methods: T/T bank transfer (30% deposit, 70% balance before shipment), L/C (for large orders only), Western Union, Alipay, WeChat Pay, PayPal (sample orders only). For new customers, we typically require 30% deposit with 70% balance paid after inspection and before shipment. Long-term partners can negotiate more flexible payment terms.',
      ru: 'Мы принимаем различные способы оплаты: банковский перевод T/T (30% предоплата, 70% остаток перед отгрузкой), аккредитив L/C (только для крупных заказов), Western Union, Alipay, WeChat Pay, PayPal (только для образцов). Для новых клиентов мы обычно требуем 30% предоплаты, а 70% остаток оплачивается после проверки и перед отгрузкой. Постоянным партнерам мы можем предложить более гибкие условия оплаты.',
    },
    sort: 7,
  },
  {
    category: 'shipping',
    question: {
      zh: '你们发货到哪些国家？运费怎么算？',
      en: 'Which countries do you ship to? How is shipping cost calculated?',
      ru: 'В какие страны вы доставляете? Как рассчитывается стоимость доставки?',
    },
    answer: {
      zh: '我们发货到全球100多个国家和地区，包括美国、欧洲、俄罗斯、中东、东南亚、南美等。运费根据货物重量、体积、目的地和运输方式计算。我们提供多种运输方式：海运（最经济，适合大货）、空运（快速，适合中小批量）、快递（DHL/FedEx/UPS，适合样品和小批量）、铁路运输（到欧洲和俄罗斯）。我们会为您推荐最具性价比的运输方案。',
      en: 'We ship to over 100 countries and regions worldwide, including the US, Europe, Russia, Middle East, Southeast Asia, South America, etc. Shipping costs are calculated based on weight, volume, destination, and shipping method. We offer multiple options: Sea freight (most economical for bulk), Air freight (fast for medium-small orders), Express (DHL/FedEx/UPS for samples and small orders), Rail (to Europe and Russia). We will recommend the most cost-effective shipping solution for you.',
      ru: 'Мы доставляем в более чем 100 стран и регионов по всему миру, включая США, Европу, Россию, Ближний Восток, Юго-Восточную Азию, Южную Америку и т.д. Стоимость доставки рассчитывается на основе веса, объема, пункта назначения и способа доставки. Мы предлагаем несколько вариантов: морская перевозка (самая экономичная для оптовых партий), авиаперевозка (быстро для средних и малых заказов), экспресс-доставка (DHL/FedEx/UPS для образцов и малых заказов), железнодорожная перевозка (в Европу и Россию). Мы порекомендуем вам наиболее экономичное решение для доставки.',
    },
    sort: 8,
  },
  {
    category: 'products',
    question: {
      zh: '你们主要生产哪些产品？',
      en: 'What products do you mainly manufacture?',
      ru: 'Какую продукцию вы в основном производите?',
    },
    answer: {
      zh: '我们专注于针织服装生产，主要产品包括：1）毛衣系列：男女童毛衣、开衫、套头衫、背心等；2）家居服系列：睡衣套装、睡袍、连体家居服、保暖内衣等；3）童装系列：儿童毛衣、儿童套装、婴儿针织服等；4）宠物服饰：宠物毛衣、宠物外套、宠物配饰等；5）配饰系列：围巾、帽子、手套、袜子、发带等。支持来图来样定制。',
      en: 'We specialize in knitwear production, main products include: 1) Sweater series: men\'s, women\'s and kids\' sweaters, cardigans, pullovers, vests, etc.; 2) Loungewear series: pajama sets, robes, onesie loungewear, thermal underwear, etc.; 3) Kidswear series: children\'s sweaters, kids\' sets, baby knitwear, etc.; 4) Pet apparel: pet sweaters, pet coats, pet accessories, etc.; 5) Accessories: scarves, hats, gloves, socks, headbands, etc. Customization from sketches or samples is welcome.',
      ru: 'Мы специализируемся на производстве трикотажной одежды, основная продукция включает: 1) Серия свитеров: мужские, женские и детские свитера, кардиганы, пуловеры, жилеты и т.д.; 2) Серия домашней одежды: пижамные комплекты, халаты, комбинезоны для дома, термобелье и т.д.; 3) Серия детской одежды: детские свитера, детские комплекты, вязаная одежда для младенцев и т.д.; 4) Одежда для домашних животных: свитера для питомцев, пальто для питомцев, аксессуары для питомцев и т.д.; 5) Аксессуары: шарфы, шапки, перчатки, носки, повязки на голову и т.д. Принимаем заказы на индивидуальное изготовление по эскизам или образцам.',
    },
    sort: 9,
  },
  {
    category: 'products',
    question: {
      zh: '可以提供什么样的面料选择？',
      en: 'What fabric options do you offer?',
      ru: 'Какие варианты ткани вы предлагаете?',
    },
    answer: {
      zh: '我们提供丰富的面料选择：1）毛纱类：羊毛、羊绒、兔毛、马海毛、羊驼毛等；2）化纤类：腈纶、涤纶、锦纶、人造棉、粘胶等；3）混纺类：棉腈混纺、羊毛腈纶混纺、莫代尔混纺等；4）特殊面料：金银线、羽毛纱、圈圈纱、冰岛毛、水貂绒等；5）功能面料：发热纤维、抗菌防臭、抗起球、速干等。所有面料都可以提供检测报告，符合欧盟REACH和美国CPSIA标准。',
      en: 'We offer a wide range of fabric options: 1) Wool yarns: wool, cashmere, rabbit hair, mohair, alpaca, etc.; 2) Synthetic: acrylic, polyester, nylon, rayon, viscose, etc.; 3) Blends: cotton-acrylic, wool-acrylic, modal blends, etc.; 4) Special fabrics: lurex, feather yarn, loop yarn, Icelandic wool, mink cashmere, etc.; 5) Functional fabrics: thermal fibers, antibacterial, anti-pilling, quick-dry, etc. All fabrics come with test reports and meet EU REACH and US CPSIA standards.',
      ru: 'Мы предлагаем широкий выбор тканей: 1) Шерстяные пряжи: шерсть, кашемир, кроличий пух, мохер, альпака и т.д.; 2) Синтетические: акрил, полиэстер, нейлон, район, вискоза и т.д.; 3) Смесовые: хлопок-акрил, шерсть-акрил, модальные смеси и т.д.; 4) Специальные ткани: люрекс, перьевая пряжа, петлевая пряжа, исландская шерсть, норковый кашемир и т.д.; 5) Функциональные ткани: тепловолокна, антибактериальные, антипилинговые, быстросохнущие и т.д. На все ткани предоставляются протоколы испытаний, они соответствуют стандартам EU REACH и US CPSIA.',
    },
    sort: 10,
  },
  {
    category: 'custom',
    question: {
      zh: '可以加我们自己的品牌logo吗？',
      en: 'Can you add our own brand logo?',
      ru: 'Можно ли нанести наш фирменный логотип?',
    },
    answer: {
      zh: '当然可以！我们支持多种品牌定制方式：1）织唛/布标：定制领标、洗水标、主标等；2）刺绣：胸前、袖口、后背等位置刺绣logo；3）印花：胶印、水印、热转印、数码印花等；4）吊牌/包装袋：定制品牌吊牌、拉链袋、无纺布袋等；5）挂卡/条码：UPC条码、价格标签等。您只需提供logo矢量图（AI/CDR/EPS格式），我们会先做效果图确认，满意后再大货生产。',
      en: 'Absolutely! We support various brand customization methods: 1) Woven labels: custom neck labels, care labels, main labels, etc.; 2) Embroidery: logo embroidery on chest, cuff, back, etc.; 3) Printing: rubber print, water-based print, heat transfer, digital print, etc.; 4) Hang tags/packaging: custom hang tags, zipper bags, non-woven bags, etc.; 5) Hang tags/barcodes: UPC barcodes, price tags, etc. Just provide your logo in vector format (AI/CDR/EPS), and we\'ll create mockups for confirmation before bulk production.',
      ru: 'Конечно! Мы поддерживаем различные способы персонализации бренда: 1) Тканевые этикетки: индивидуальные воротничные этикетки, этикетки по уходу, основные этикетки и т.д.; 2) Вышивка: вышивка логотипа на груди, манжете, спинке и т.д.; 3) Печать: резиновая печать, водная печать, термоперенос, цифровая печать и т.д.; 4) Бирки/упаковка: индивидуальные бирки, пакеты на молнии, нетканые сумки и т.д.; 5) Бирки/штрихкоды: штрихкоды UPC, ценники и т.д. Просто предоставьте ваш логотип в векторном формате (AI/CDR/EPS), и мы создадим макеты для утверждения перед массовым производством.',
    },
    sort: 11,
  },
  {
    category: 'custom',
    question: {
      zh: '你们可以做什么尺码？有大码吗？',
      en: 'What sizes can you make? Do you offer plus sizes?',
      ru: 'Какие размеры вы можете изготовить? Есть ли большие размеры?',
    },
    answer: {
      zh: '我们支持全尺码定制：1）童装：80-160cm，或按年龄分1-12岁；2）女装：XS-XXL，也可以做加大码XXXL-XXXXL；3）男装：S-XXXL，大码可到5XL；4）宠物服：XS-XXL，适合茶杯犬到大型犬。我们可以按照您提供的尺码表生产，也可以根据目标市场调整版型（欧美版偏宽松，亚洲版偏修身）。所有尺码都有详细的公差表，确保尺寸稳定。',
      en: 'We support full size customization: 1) Kidswear: 80-160cm, or by age 1-12 years; 2) Women\'s: XS-XXL, plus sizes XXXL-XXXXL available; 3) Men\'s: S-XXXL, up to 5XL for plus sizes; 4) Pet apparel: XS-XXL, suitable for teacup dogs to large breeds. We can produce according to your size chart, or adjust the fit based on your target market (looser fit for EU/US, slimmer fit for Asia). All sizes come with detailed tolerance charts to ensure size consistency.',
      ru: 'Мы поддерживаем индивидуальные размеры во всем диапазоне: 1) Детская одежда: 80-160 см или по возрасту 1-12 лет; 2) Женская: XS-XXL, доступны большие размеры XXXL-XXXXL; 3) Мужская: S-XXXL, до 5XL для больших размеров; 4) Одежда для питомцев: XS-XXL, подходит для собак самых маленьких до крупных пород. Мы можем производить по вашей размерной сетке или корректировать крой в зависимости от целевого рынка (свободный крой для ЕС/США, облегающий для Азии). На все размеры предоставляются подробные таблицы допусков для гарантии размерной стабильности.',
    },
    sort: 12,
  },
];

// ========== 工厂设备数据 ==========
export const equipmentSeed: SeedEquipment[] = [
  { name: { zh: '电脑横机', en: 'Computerized Flat Knitting Machines', ru: 'Компьютерные плосковязальные машины' }, quantity: 80, icon_key: 'knitting-machine', sort: 1 },
  { name: { zh: '半自动横机', en: 'Semi-automatic Flat Knitting Machines', ru: 'Полуавтоматические плосковязальные машины' }, quantity: 50, icon_key: 'semi-auto-machine', sort: 2 },
  { name: { zh: '无缝内衣机', en: 'Seamless Underwear Machines', ru: 'Машины для бесшовного белья' }, quantity: 30, icon_key: 'seamless-machine', sort: 3 },
  { name: { zh: '锁边机/拷克机', en: 'Overlock / Serger Machines', ru: 'Оверлочные машины' }, quantity: 40, icon_key: 'overlock-machine', sort: 4 },
  { name: { zh: '平缝机/平车', en: 'Lockstitch Sewing Machines', ru: 'Прямострочные швейные машины' }, quantity: 60, icon_key: 'sewing-machine', sort: 5 },
  { name: { zh: '四针六线拼缝机', en: '4-Needle 6-Thread Flatseamer', ru: 'Четырехигольная шестинитевая плоскошовная машина' }, quantity: 20, icon_key: 'flatseamer', sort: 6 },
  { name: { zh: '套口机/缝合机', en: 'Linking Machines', ru: 'Сшивочные машины' }, quantity: 25, icon_key: 'linking-machine', sort: 7 },
  { name: { zh: '整烫设备', en: 'Ironing & Pressing Equipment', ru: 'Оборудование для глажки и прессования' }, quantity: 15, icon_key: 'ironing', sort: 8 },
  { name: { zh: '绣花机', en: 'Embroidery Machines', ru: 'Вышивальные машины' }, quantity: 8, icon_key: 'embroidery', sort: 9 },
  { name: { zh: '检针机/验布机', en: 'Needle Detector & Fabric Inspection', ru: 'Детектор игл и инспекция ткани' }, quantity: 6, icon_key: 'inspection', sort: 10 },
];

// ========== 生产流程数据 ==========
export const processSeed: SeedProcess[] = [
  {
    step_number: 1,
    title: { zh: '需求沟通 & 设计确认', en: 'Requirement Discussion & Design Confirmation', ru: 'Обсуждение требований и утверждение дизайна' },
    description: {
      zh: '深入了解您的产品需求、目标市场、品牌定位。我们的设计团队提供专业建议，确认款式、面料、颜色、尺码等细节，最终确定设计方案。',
      en: 'Thorough understanding of your product requirements, target market, and brand positioning. Our design team provides professional advice, confirming style, fabric, color, size and other details to finalize the design plan.',
      ru: 'Тщательное изучение ваших требований к продукту, целевого рынка и позиционирования бренда. Наша команда дизайнеров предоставляет профессиональные консультации, утверждает модель, ткань, цвет, размеры и другие детали для окончательного согласования дизайна.',
    },
    icon_key: 'design',
    sort: 1,
  },
  {
    step_number: 2,
    title: { zh: '打样 & 样品确认', en: 'Sampling & Sample Approval', ru: 'Изготовление образцов и утверждение' },
    description: {
      zh: '根据确认的设计方案制作样品，通常5-7天完成。样品完成后寄送给您确认，提供2次免费修改。确认后封样，作为大货生产的标准。',
      en: 'Sample production based on the confirmed design plan, usually completed in 5-7 days. Finished samples are sent to you for approval with 2 free revisions. After confirmation, samples are sealed as the standard for bulk production.',
      ru: 'Изготовление образцов на основе утвержденного дизайна, обычно занимает 5-7 дней. Готовые образцы отправляются вам на утверждение с 2 бесплатными доработками. После утверждения образцы запечатываются как эталон для массового производства.',
    },
    icon_key: 'sampling',
    sort: 2,
  },
  {
    step_number: 3,
    title: { zh: '原料采购 & 检验', en: 'Raw Material Sourcing & Inspection', ru: 'Закупка и проверка сырья' },
    description: {
      zh: '根据确认的订单采购纱线和辅料。所有原料入库前经过严格的来料检验，包括色牢度、成分、克重、幅宽等指标，确保符合质量标准和客户要求。',
      en: 'Yarn and accessories sourcing based on the confirmed order. All raw materials undergo strict incoming inspection before warehousing, including color fastness, composition, weight, width and other indicators to ensure they meet quality standards and customer requirements.',
      ru: 'Закупка пряжи и комплектующих на основе подтвержденного заказа. Все сырье проходит строгий входной контроль перед поступлением на склад, включая цветостойкость, состав, вес, ширину и другие показатели для гарантии соответствия стандартам качества и требованиям клиента.',
    },
    icon_key: 'materials',
    sort: 3,
  },
  {
    step_number: 4,
    title: { zh: '编织生产', en: 'Knitting Production', ru: 'Вязальное производство' },
    description: {
      zh: '使用电脑横机或半自动横机进行衣片编织。生产过程中IPQC全程巡检，确保每一片衣片的针数、行数、密度、尺寸都符合工艺标准。',
      en: 'Garment panels are knitted using computerized or semi-automatic flat knitting machines. IPQC patrol inspections are conducted throughout production to ensure every panel meets standards for stitch count, row count, tension, and dimensions.',
      ru: 'Детали изделия вяжутся на компьютерных или полуавтоматических плосковязальных машинах. На протяжении всего производства проводятся проверки IPQC для гарантии соответствия каждой детали стандартам по количеству петель, рядов, плотности и размерам.',
    },
    icon_key: 'knitting',
    sort: 4,
  },
  {
    step_number: 5,
    title: { zh: '缝合 & 整烫', en: 'Linking & Pressing', ru: 'Сшивка и прессование' },
    description: {
      zh: '经验丰富的工人使用套口机将衣片缝合，然后进行整烫定型，确保产品外观平整、尺寸精准。每道工序都有质量检验，不合格产品及时返工。',
      en: 'Experienced workers link the panels using linking machines, followed by pressing and shaping to ensure a smooth appearance and precise sizing. Quality inspection is performed at each stage, with defective products sent back for rework promptly.',
      ru: 'Опытные рабочие сшивают детали на сшивочных машинах, затем проводят прессование и формовку для гарантии гладкого внешнего вида и точных размеров. Контроль качества осуществляется на каждом этапе, бракованные изделия своевременно отправляются на доработку.',
    },
    icon_key: 'sewing',
    sort: 5,
  },
  {
    step_number: 6,
    title: { zh: '成品检验 & 包装', en: 'Final Inspection & Packaging', ru: 'Финальный контроль и упаковка' },
    description: {
      zh: '成品100%全检，包括外观、尺寸、做工、色差等。合格产品按照客户要求进行包装（吊牌、胶袋、纸箱等），并进行最终抽检，确保大货质量。',
      en: '100% inspection of finished products, including appearance, size, workmanship, color difference, etc. Qualified products are packaged according to customer requirements (hang tags, poly bags, cartons, etc.), with final random inspection to ensure bulk quality.',
      ru: '100% проверка готовой продукции, включая внешний вид, размеры, качество пошива, разницу в цвете и т.д. Годные изделия упаковываются в соответствии с требованиями клиента (бирки, полиэтиленовые пакеты, картонные коробки и т.д.), проводится финальная выборочная проверка для гарантии качества оптовой партии.',
    },
    icon_key: 'inspection',
    sort: 6,
  },
  {
    step_number: 7,
    title: { zh: '出货 & 售后跟踪', en: 'Shipping & After-sales Follow-up', ru: 'Отгрузка и послепродажное сопровождение' },
    description: {
      zh: '安排物流发货，提供运单号和预计到达时间。收到货后我们会跟进您的反馈，如有任何问题及时处理。长期客户享受专属客服和优先排单服务。',
      en: 'Arranging logistics and shipment, providing tracking numbers and estimated arrival times. After receipt, we follow up on your feedback and promptly address any issues. Long-term customers enjoy dedicated customer service and priority production scheduling.',
      ru: 'Организация логистики и отгрузки, предоставление трек-номеров и ориентировочных сроков прибытия. После получения мы отслеживаем ваши отзывы и оперативно решаем любые вопросы. Постоянные клиенты пользуются персональным обслуживанием и приоритетной постановкой в график производства.',
    },
    icon_key: 'shipping',
    sort: 7,
  },
];

// ========== 服务内容数据 ==========
export const serviceSeed: SeedService[] = [
  {
    title: { zh: 'OEM 贴牌生产', en: 'OEM Manufacturing', ru: 'OEM-производство' },
    summary: { zh: '按照您的设计或样衣进行生产，贴您的品牌', en: 'Produce according to your designs or samples with your brand', ru: 'Производство по вашим дизайнам или образцам с вашим брендом' },
    description: {
      zh: '提供完整的OEM贴牌生产服务，您提供设计稿、技术图纸或样衣，我们负责从原料采购到成品出货的全部生产流程。支持定制面料、颜色、尺码、logo、包装等，完全按照您的品牌标准生产。',
      en: 'Complete OEM private label manufacturing service. You provide design sketches, technical drawings, or sample garments, and we handle the entire production process from raw material sourcing to finished product delivery. Custom fabrics, colors, sizes, logos, packaging — all produced to your brand standards.',
      ru: 'Полный комплекс услуг OEM-производства с частной маркой. Вы предоставляете эскизы дизайна, технические чертежи или образцы одежды, а мы берем на себя весь производственный процесс от закупки сырья до поставки готовой продукции. Индивидуальные ткани, цвета, размеры, логотипы, упаковка — все производится по стандартам вашего бренда.',
    },
    highlights: {
      zh: ['100%按您的标准生产', '支持全品类针织产品', '可定制全部辅料和包装', '严格保密您的设计'],
      en: ['100% produced to your standards', 'All knitwear categories supported', 'Custom accessories and packaging', 'Strict design confidentiality'],
      ru: ['100% производство по вашим стандартам', 'Поддерживаются все категории трикотажа', 'Индивидуальные комплектующие и упаковка', 'Строгая конфиденциальность дизайна'],
    },
    icon_key: 'oem',
    gradient_from: '#667eea',
    gradient_to: '#764ba2',
    sort: 1,
  },
  {
    title: { zh: 'ODM 设计开发', en: 'ODM Design & Development', ru: 'ODM-дизайн и разработка' },
    summary: { zh: '从趋势到成品，我们提供全套设计开发方案', en: 'From trend to finished product — full design & development solutions', ru: 'От тренда до готового изделия — комплексные решения по дизайну и разработке' },
    description: {
      zh: '我们的设计团队紧跟国际流行趋势，每年推出500多款新品。根据您的品牌定位和目标市场，提供从趋势分析、款式设计、面料开发、工艺研究到样品制作的全套ODM服务，帮助您打造有竞争力的产品线。',
      en: 'Our design team closely follows international fashion trends, launching over 500 new styles annually. Based on your brand positioning and target market, we provide full ODM services from trend analysis, style design, fabric development, and process research to sample creation — helping you build a competitive product line.',
      ru: 'Наша команда дизайнеров внимательно следит за международными модными трендами, выпуская более 500 новых моделей ежегодно. На основе позиционирования вашего бренда и целевого рынка мы предоставляем полный комплекс ODM-услуг — от анализа трендов, дизайна моделей, разработки тканей и исследования технологий до создания образцов — помогая вам создать конкурентоспособную продуктовую линейку.',
    },
    highlights: {
      zh: ['专业设计团队', '年开发500+新款', '趋势预测&市场分析', '快速打样7天出样'],
      en: ['Professional design team', '500+ new styles developed yearly', 'Trend forecasting & market analysis', 'Fast 7-day sampling'],
      ru: ['Профессиональная команда дизайнеров', 'Более 500 новых моделей в год', 'Прогнозирование трендов и анализ рынка', 'Быстрое изготовление образцов за 7 дней'],
    },
    icon_key: 'odm',
    gradient_from: '#f093fb',
    gradient_to: '#f5576c',
    sort: 2,
  },
  {
    title: { zh: '小批量定制', en: 'Small Batch Customization', ru: 'Малосерийная индивидуализация' },
    summary: { zh: '低至30件起订，帮您测试市场风险', en: 'As low as 30 pcs MOQ to help test the market', ru: 'MOQ от 30 штук для тестирования рынка' },
    description: {
      zh: '特别适合初创品牌和电商卖家。最低30件起订，支持多色多码组合。我们提供灵活的小批量生产方案，帮助您以最低成本测试市场反应，降低创业风险。爆款后可快速翻单扩大生产。',
      en: 'Perfect for startup brands and e-commerce sellers. Minimum 30 pcs MOQ, supporting multi-color and multi-size combinations. We offer flexible small-batch production solutions to help you test market response at minimum cost and reduce startup risks. Quick reorder and production scaling available when styles become bestsellers.',
      ru: 'Идеально для стартап-брендов и продавцов электронной коммерции. Минимальный MOQ от 30 штук, поддержка комбинаций нескольких цветов и размеров. Мы предлагаем гибкие решения для малосерийного производства, чтобы помочь вам протестировать реакцию рынка при минимальных затратах и снизить риски при запуске. Возможно быстрое повторное производство и масштабирование при росте популярности моделей.',
    },
    highlights: {
      zh: ['MOQ低至30件', '多色多码混批', '快速交付15天', '爆款可快速翻单'],
      en: ['MOQ as low as 30 pcs', 'Mixed colors & sizes', 'Fast 15-day delivery', 'Quick reorder for hits'],
      ru: ['MOQ от 30 штук', 'Смешанные цвета и размеры', 'Быстрая доставка за 15 дней', 'Быстрый повторный заказ для хитов'],
    },
    icon_key: 'small-batch',
    gradient_from: '#4facfe',
    gradient_to: '#00f2fe',
    sort: 3,
  },
  {
    title: { zh: '现货批发', en: 'Ready Stock Wholesale', ru: 'Оптовая продажа из наличия' },
    summary: { zh: '精选热销款式现货，当天发货', en: 'Hot-selling styles in stock, same-day shipping', ru: 'Хитовые модели в наличии, отгрузка в день заказа' },
    description: {
      zh: '常备50+热销款式现货库存，涵盖毛衣、家居服、童装、配饰等。1件起批，支持混批。现货订单48小时内发货，适合补货、快闪活动、紧急订单等场景。每月更新现货款式，紧跟市场潮流。',
      en: '50+ hot-selling styles always in stock, covering sweaters, loungewear, kidswear, accessories and more. MOQ 1 piece, mixed batches supported. In-stock orders ship within 48 hours — perfect for replenishment, pop-up events, urgent orders, etc. Stock styles updated monthly to follow market trends.',
      ru: 'Более 50 хитовых моделей всегда в наличии, включая свитера, домашнюю одежду, детскую одежду, аксессуары и многое другое. MOQ от 1 штуки, поддерживаются смешанные партии. Заказы из наличия отгружаются в течение 48 часов — идеально для пополнения запасов, поп-ап мероприятий, срочных заказов и т.д. Модели из наличия обновляются ежемесячно в соответствии с рыночными трендами.',
    },
    highlights: {
      zh: ['50+款式常备现货', '1件起批支持混批', '48小时内发货', '每月更新新款'],
      en: ['50+ styles always in stock', '1 pc MOQ mixed batch', 'Ship within 48 hours', 'New styles monthly'],
      ru: ['50+ моделей всегда в наличии', 'MOQ от 1 шт., смешанная партия', 'Отгрузка в течение 48 часов', 'Новые модели каждый месяц'],
    },
    icon_key: 'ready-stock',
    gradient_from: '#43e97b',
    gradient_to: '#38f9d7',
    sort: 4,
  },
  {
    title: { zh: '品牌定制包装', en: 'Branded Packaging', ru: 'Брендированная упаковка' },
    summary: { zh: '全套品牌包装方案，提升产品形象', en: 'Complete branded packaging to elevate product image', ru: 'Комплексные решения по брендированной упаковке для提升 имиджа продукта' },
    description: {
      zh: '提供完整的品牌包装定制服务，包括：织唛领标/主标/洗水标、吊牌/纸牌、不干胶贴纸、塑料包装袋/拉链袋、无纺布袋、纸盒/礼品盒、条形码/UPC码等。您只需提供品牌设计稿，我们负责全部制作和装配。',
      en: 'Complete branded packaging customization services, including: woven neck labels/main labels/care labels, hang tags/paper tags, stickers, plastic bags/zipper bags, non-woven bags, paper boxes/gift boxes, barcodes/UPC codes, etc. Just provide your brand design files, and we handle all production and assembly.',
      ru: 'Полный комплекс услуг по индивидуальной брендированной упаковке, включая: тканевые воротничные/основные/по уходу этикетки, бумажные бирки, наклейки, пластиковые пакеты/пакеты на молнии, нетканые сумки, картонные/подарочные коробки, штрихкоды/коды UPC и т.д. Просто предоставьте файлы дизайна вашего бренда, и мы возьмем на себя все производство и сборку.',
    },
    highlights: {
      zh: ['织唛/印唛/吊牌', '塑料袋/无纺布袋', '纸盒/礼品盒定制', '条码/价格标签'],
      en: ['Woven/printed labels & hang tags', 'Plastic / non-woven bags', 'Custom paper / gift boxes', 'Barcode / price tags'],
      ru: ['Тканевые/печатные этикетки и бирки', 'Пластиковые / нетканые сумки', 'Индивидуальные картонные / подарочные коробки', 'Штрихкоды / ценники'],
    },
    icon_key: 'packaging',
    gradient_from: '#fa709a',
    gradient_to: '#fee140',
    sort: 5,
  },
  {
    title: { zh: '一件代发', en: 'Dropshipping Service', ru: 'Услуга дропшиппинга' },
    summary: { zh: '无需囤货，我们直接发货给您的客户', en: 'No inventory needed — we ship directly to your customers', ru: 'Не нужен склад — отгружаем напрямую вашим клиентам' },
    description: {
      zh: '专为电商卖家和跨境卖家设计的一件代发服务。您在店铺接单，我们直接发货给您的最终客户，包裹上不会出现我们的任何信息。支持自定义面单、包装。低门槛、零库存、零风险，适合独立站、亚马逊、速卖通等平台卖家。',
      en: 'Dropshipping service designed for e-commerce and cross-border sellers. You receive orders in your store, and we ship directly to your end customers — with no trace of our company on the package. Custom waybills and packaging supported. Low threshold, zero inventory, zero risk — perfect for independent sites, Amazon, AliExpress and other platform sellers.',
      ru: 'Услуга дропшиппинга, разработанная для продавцов электронной коммерции и трансграничной торговли. Вы получаете заказы в своем магазине, а мы отгружаем напрямую вашим конечным клиентам — без каких-либо упоминаний о нашей компании в упаковке. Поддерживаются индивидуальные накладные и упаковка. Низкий порог входа, нулевые запасы, нулевой риск — идеально для независимых сайтов, Amazon, AliExpress и других платформ.',
    },
    highlights: {
      zh: ['零库存零风险', '一件也代发', '自定义面单包装', '24小时内发货'],
      en: ['Zero inventory & zero risk', 'Even 1 pc dropshipping', 'Custom waybill & packaging', 'Ship within 24 hours'],
      ru: ['Нулевые запасы и нулевой риск', 'Дропшиппинг даже от 1 шт.', 'Индивидуальная накладная и упаковка', 'Отгрузка в течение 24 часов'],
    },
    icon_key: 'dropshipping',
    gradient_from: '#a8edea',
    gradient_to: '#fed6e3',
    sort: 6,
  },
];

// ========== 首页优势数据 ==========
export const featureSeed: SeedFeature[] = [
  {
    category: 'home',
    title: { zh: '20年工厂经验', en: '20 Years Factory Experience', ru: '20 лет опыта фабрики' },
    description: {
      zh: '始于2004年，专注针织服装生产20年，服务全球500+品牌客户，品质值得信赖。',
      en: 'Established in 2004, 20 years focused on knitwear production, serving 500+ brand clients worldwide — quality you can trust.',
      ru: 'Основана в 2004 году, 20 лет специализируемся на производстве трикотажной одежды, обслуживаем более 500 брендовых клиентов по всему миру — качество, которому можно доверять.',
    },
    icon_key: 'experience',
    sort: 1,
  },
  {
    category: 'home',
    title: { zh: '月产能100万件', en: '1M Pcs Monthly Capacity', ru: 'Производительность 1 млн шт. в месяц' },
    description: {
      zh: '8000㎡现代化厂房，200+熟练工人，80台电脑横机，月产能达100万件，交货有保障。',
      en: '8,000㎡ modern factory, 200+ skilled workers, 80 computerized flat knitting machines, 1M pcs monthly capacity — on-time delivery guaranteed.',
      ru: 'Современная фабрика 8000 м², 200+ квалифицированных рабочих, 80 компьютерных плосковязальных машин, производительность 1 млн шт. в месяц — гарантия своевременной поставки.',
    },
    icon_key: 'capacity',
    sort: 2,
  },
  {
    category: 'home',
    title: { zh: '50件起订', en: 'MOQ from 50 Pcs', ru: 'MOQ от 50 штук' },
    description: {
      zh: '行业领先的低起订量政策，新客户首单可低至30件，帮您轻松起步，降低试错成本。',
      en: 'Industry-leading low MOQ policy. First order for new customers can be as low as 30 pcs — helping you start easily with reduced trial costs.',
      ru: 'Передовая в отрасли политика низкого MOQ. Первый заказ для новых клиентов может быть всего от 30 штук — помогаем вам легко начать с сниженными затратами на пробу.',
    },
    icon_key: 'low-moq',
    sort: 3,
  },
  {
    category: 'home',
    title: { zh: '7天快速打样', en: '7-Day Fast Sampling', ru: 'Быстрое изготовление образцов за 7 дней' },
    description: {
      zh: '专业打样团队，常规款式5-7天出样，加急3天可出样。2次免费修改，直到您满意为止。',
      en: 'Professional sampling team. Regular styles ready in 5-7 days, rush samples in 3 days. 2 free revisions until you\'re satisfied.',
      ru: 'Профессиональная команда по изготовлению образцов. Обычные модели готовы за 5-7 дней, срочные образцы — за 3 дня. 2 бесплатные доработки до вашего полного удовлетворения.',
    },
    icon_key: 'fast-sampling',
    sort: 4,
  },
  {
    category: 'home',
    title: { zh: 'ISO9001品质', en: 'ISO9001 Quality', ru: 'Качество ISO9001' },
    description: {
      zh: '通过ISO9001和BSCI认证，全流程质量控制，100%成品检验，确保每件产品品质如一。',
      en: 'ISO9001 and BSCI certified. Full-process quality control with 100% finished product inspection — ensuring consistent quality for every piece.',
      ru: 'Сертификаты ISO9001 и BSCI. Контроль качества на всех этапах с 100% проверкой готовой продукции — гарантия стабильного качества для каждого изделия.',
    },
    icon_key: 'quality',
    sort: 5,
  },
  {
    category: 'home',
    title: { zh: '一对一服务', en: 'One-on-One Service', ru: 'Персональный сервис 1 на 1' },
    description: {
      zh: '专属客户经理一对一服务，从询盘到售后全程跟进。快速响应，2小时内回复，7x12小时在线支持。',
      en: 'Dedicated account manager with one-on-one service, full follow-up from inquiry to after-sales. Fast response — reply within 2 hours, 7x12 online support.',
      ru: 'Персональный менеджер с обслуживанием 1 на 1, полное сопровождение от запроса до послепродажного обслуживания. Быстрый ответ — ответ в течение 2 часов, онлайн-поддержка 7 дней в неделю по 12 часов.',
    },
    icon_key: 'service',
    sort: 6,
  },
];

// ========== Ready Stock 数据 ==========
export const readyStockSeed: SeedReadyStock[] = [
  { name: { zh: '经典圆领毛衣', en: 'Classic Crewneck Sweater', ru: 'Классический свитер с круглым вырезом' }, model: 'RS-001', cover_url: '/images/ready-stock/style-01.jpg', price_range: '$8.5 - $12.0', sort: 1 },
  { name: { zh: 'V领针织开衫', en: 'V-Neck Knit Cardigan', ru: 'Вязаный кардиган с V-образным вырезом' }, model: 'RS-002', cover_url: '/images/ready-stock/style-02.jpg', price_range: '$10.0 - $15.0', sort: 2 },
  { name: { zh: '高领保暖毛衣', en: 'Turtleneck Thermal Sweater', ru: 'Теплый свитер с высоким воротом' }, model: 'RS-003', cover_url: '/images/ready-stock/style-03.jpg', price_range: '$9.5 - $14.0', sort: 3 },
  { name: { zh: '条纹针织衫', en: 'Striped Knit Top', ru: 'Полосатый вязаный топ' }, model: 'RS-004', cover_url: '/images/ready-stock/style-04.jpg', price_range: '$7.0 - $10.0', sort: 4 },
  { name: { zh: '宽松慵懒风毛衣', en: 'Oversized Slouchy Sweater', ru: 'Оверсайз свободный свитер' }, model: 'RS-005', cover_url: '/images/ready-stock/style-05.jpg', price_range: '$11.0 - $16.0', sort: 5 },
  { name: { zh: '短款针织上衣', en: 'Cropped Knit Top', ru: 'Укороченный вязаный топ' }, model: 'RS-006', cover_url: '/images/ready-stock/style-06.jpg', price_range: '$6.5 - $9.0', sort: 6 },
  { name: { zh: '家居服套装 款A', en: 'Loungewear Set Style A', ru: 'Комплект домашней одежды, стиль А' }, model: 'RS-007', cover_url: '/images/products/loungewear/loungewear00.jpg', price_range: '$12.0 - $18.0', sort: 7 },
  { name: { zh: '宠物毛衣 经典款', en: 'Classic Pet Sweater', ru: 'Классический свитер для питомца' }, model: 'RS-008', cover_url: '/images/products/pet/pet01.jpg', price_range: '$3.5 - $6.0', sort: 8 },
];
