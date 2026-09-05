import type {
  Category,
  Inquiry,
  Order,
  Post,
  Product,
  Seller,
  User,
} from './types'

/* ══════════════════════════════════════════════════════════════
   دیتای نمونه — تا وقتی VITE_API_URL تنظیم نشده، اپ از این
   استفاده می‌کند. ساختار دقیقاً همان چیزی است که بک‌اند باید
   برگرداند، پس جایگزینی آن هیچ تغییری در رابط کاربری نمی‌خواهد.
   ══════════════════════════════════════════════════════════════ */

export const PROVINCES = [
  'تهران', 'اصفهان', 'خراسان رضوی', 'فارس', 'آذربایجان شرقی', 'البرز',
  'خوزستان', 'قم', 'گیلان', 'مازندران', 'کرمان', 'یزد', 'مرکزی', 'قزوین',
]

/* ── دسته‌بندی‌ها + تعریف ویژگی‌های هر دسته ──────────────────── */
export const categories: Category[] = [
  {
    id: 'c1', slug: 'motor', name: 'موتور و گیربکس', icon: 'motor', parentId: null, productCount: 248,
    attributes: [
      { key: 'power', label: 'توان', type: 'number', unit: 'کیلووات', required: true, filterable: true },
      { key: 'drive', label: 'نوع محرک', type: 'select', options: ['گیرلس', 'گیربکسی', 'هیدرولیک'], required: true, filterable: true },
      { key: 'capacity', label: 'ظرفیت مجاز', type: 'number', unit: 'کیلوگرم', required: true, filterable: true },
      { key: 'speed', label: 'سرعت نامی', type: 'number', unit: 'm/s', required: false, filterable: true },
    ],
  },
  {
    id: 'c2', slug: 'door', name: 'درب و اپراتور', icon: 'door', parentId: null, productCount: 185,
    attributes: [
      { key: 'width', label: 'عرض بازشو', type: 'number', unit: 'میلی‌متر', required: true, filterable: true },
      { key: 'opening', label: 'نوع بازشو', type: 'select', options: ['تلسکوپی', 'سانترال', 'لولایی'], required: true, filterable: true },
      { key: 'material', label: 'جنس', type: 'select', options: ['استنلس استیل', 'ورق رنگی', 'شیشه'], required: false, filterable: true },
    ],
  },
  {
    id: 'c3', slug: 'panel', name: 'تابلو فرمان و درایو', icon: 'panel', parentId: null, productCount: 132,
    attributes: [
      { key: 'stops', label: 'تعداد ایستگاه', type: 'number', unit: 'توقف', required: true, filterable: true },
      { key: 'control', label: 'نوع کنترل', type: 'select', options: ['VVVF', 'دو سرعته', 'هیدرولیک'], required: true, filterable: true },
      { key: 'group', label: 'قابلیت گروهی', type: 'boolean', required: false, filterable: true },
    ],
  },
  {
    id: 'c4', slug: 'rail', name: 'ریل و راهنما', icon: 'rail', parentId: null, productCount: 97,
    attributes: [
      { key: 'profile', label: 'پروفیل', type: 'select', options: ['T-70', 'T-89', 'T-114', 'T-127'], required: true, filterable: true },
      { key: 'length', label: 'طول شاخه', type: 'number', unit: 'متر', required: true, filterable: true },
    ],
  },
  {
    id: 'c5', slug: 'safety', name: 'ایمنی، ترمز و گاورنر', icon: 'safety', parentId: null, productCount: 74,
    attributes: [
      { key: 'tripSpeed', label: 'سرعت عملکرد', type: 'number', unit: 'm/s', required: true, filterable: true },
      { key: 'kind', label: 'نوع', type: 'select', options: ['آنی', 'تدریجی'], required: true, filterable: true },
    ],
  },
  {
    id: 'c6', slug: 'rope', name: 'سیم‌بکسل و زنجیر', icon: 'rope', parentId: null, productCount: 63,
    attributes: [
      { key: 'diameter', label: 'قطر', type: 'number', unit: 'میلی‌متر', required: true, filterable: true },
      { key: 'construction', label: 'ساختار', type: 'select', options: ['8×19', '6×19', '9×19'], required: false, filterable: true },
    ],
  },
  {
    id: 'c7', slug: 'cabin', name: 'کابین و دکوراسیون', icon: 'cabin', parentId: null, productCount: 156,
    attributes: [
      { key: 'capacity', label: 'ظرفیت', type: 'number', unit: 'نفر', required: true, filterable: true },
      { key: 'finish', label: 'روکش', type: 'select', options: ['استیل خش‌دار', 'استیل طلایی', 'MDF', 'آینه'], required: false, filterable: true },
    ],
  },
  {
    id: 'c8', slug: 'electric', name: 'شاسی، نمایشگر و روشنایی', icon: 'button', parentId: null, productCount: 211,
    attributes: [
      { key: 'voltage', label: 'ولتاژ', type: 'number', unit: 'ولت', required: false, filterable: true },
      { key: 'display', label: 'نوع نمایشگر', type: 'select', options: ['سگمنت', 'دات ماتریس', 'TFT'], required: false, filterable: true },
    ],
  },
  {
    id: 'c9', slug: 'service', name: 'خدمات نصب و سرویس', icon: 'service', parentId: null, productCount: 209,
    attributes: [
      { key: 'scope', label: 'دامنه خدمت', type: 'select', options: ['نصب کامل', 'سرویس دوره‌ای', 'بازسازی', 'بازرسی'], required: true, filterable: true },
      { key: 'coverage', label: 'پوشش جغرافیایی', type: 'text', required: false, filterable: false },
    ],
  },
]

/* ── فروشندگان ──────────────────────────────────────────────── */
export const sellers: Seller[] = [
  {
    id: 's1', slug: 'arya-lift', name: 'آریا لیفت', legalName: 'مهندسی آسانسور آریا لیفت پارس',
    logoColor: '#1e2a38', province: 'تهران', city: 'تهران', phone: '۰۲۱-۸۸۴۵۲۲۱۰',
    group: 'manufacturer', licensed: true,
    status: 'approved', verified: true, rating: 4.8, reviewCount: 412, productCount: 86,
    responseHours: 3, commissionRate: 6, memberSince: '۱۳۹۸',
    about: 'واردکننده و تولیدکننده تجهیزات آسانسور با بیش از ۲۰ سال سابقه. نمایندگی رسمی چند برند اروپایی.',
  },
  {
    id: 's2', slug: 'sanat-farazan', name: 'صنعت فرازان', legalName: 'گروه صنعتی فرازان اصفهان',
    logoColor: '#37495c', province: 'اصفهان', city: 'اصفهان', phone: '۰۳۱-۳۶۶۴۱۱۸۰',
    group: 'manufacturer', licensed: true,
    status: 'approved', verified: true, rating: 4.6, reviewCount: 238, productCount: 64,
    responseHours: 5, commissionRate: 7, memberSince: '۱۳۹۹',
    about: 'تولید ریل، یوک و قطعات فلزی آسانسور با خط تولید داخلی.',
  },
  {
    id: 's3', slug: 'pars-derakhshan', name: 'پارس درخشان', legalName: 'بازرگانی پارس درخشان',
    logoColor: '#4b6178', province: 'تهران', city: 'ری', phone: '۰۲۱-۵۵۹۰۳۳۴۱',
    group: 'trading', licensed: true,
    status: 'approved', verified: true, rating: 4.4, reviewCount: 157, productCount: 91,
    responseHours: 8, commissionRate: 8, memberSince: '۱۴۰۰',
    about: 'تأمین قطعات یدکی و لوازم مصرفی آسانسور، ارسال سریع به سراسر کشور.',
  },
  {
    id: 's4', slug: 'behsaz-tabriz', name: 'بهساز تبریز', legalName: 'شرکت بهساز صعود تبریز',
    logoColor: '#283747', province: 'آذربایجان شرقی', city: 'تبریز', phone: '۰۴۱-۳۳۳۴۵۵۶۷',
    group: 'contractor', licensed: true,
    status: 'approved', verified: false, rating: 4.2, reviewCount: 64, productCount: 33,
    responseHours: 12, commissionRate: 8, memberSince: '۱۴۰۱',
    about: 'خدمات نصب، بازسازی و سرویس دوره‌ای آسانسور در شمال غرب کشور.',
  },
  {
    id: 's5', slug: 'mehr-sanat', name: 'مهر صنعت', legalName: 'مهر صنعت آسانبر',
    logoColor: '#6b8098', province: 'خراسان رضوی', city: 'مشهد', phone: '۰۵۱-۳۷۶۵۴۳۲۱',
    group: 'trading', licensed: false,
    status: 'pending', verified: false, rating: 0, reviewCount: 0, productCount: 12,
    responseHours: 24, commissionRate: 8, memberSince: '۱۴۰۳',
    about: 'تازه‌وارد؛ عرضه شاسی، نمایشگر و متعلقات برقی آسانسور.',
  },
  {
    id: 's6', slug: 'kavir-yazd', name: 'کویر یزد', legalName: 'صنایع آسانبر کویر یزد',
    logoColor: '#9aabbb', province: 'یزد', city: 'یزد', phone: '۰۳۵-۳۵۲۲۸۸۹۰',
    group: 'manufacturer', licensed: true,
    status: 'approved', verified: true, rating: 4.7, reviewCount: 96, productCount: 41,
    responseHours: 6, commissionRate: 6.5, memberSince: '۱۳۹۹',
    about: 'تولید کابین و دکوراسیون داخلی آسانسور به‌صورت سفارشی.',
  },
]

/* ── محصولات ────────────────────────────────────────────────── */
const P = (p: Partial<Product> & Pick<Product, 'id' | 'name' | 'brand' | 'sellerId' | 'categoryId' | 'partNumber'>): Product => ({
  slug: p.id,
  shortDescription: '',
  description: '',
  images: [],
  pricingMode: 'fixed',
  price: null,
  minOrderQty: 1,
  stockState: 'in_stock',
  stockQty: 10,
  specs: [],
  attributes: {},
  rating: 4.5,
  reviewCount: 12,
  soldCount: 30,
  status: 'approved',
  isService: false,
  createdAt: '۱۴۰۳/۰۸/۱۲',
  ...p,
} as Product)

export const products: Product[] = [
  P({
    id: 'p1', name: 'موتور کشش گیرلس ۶۳۰ کیلوگرم – سری WYJ', brand: 'مونتاناری', sellerId: 's1', categoryId: 'c1',
    partNumber: 'MNT-WYJ-630',
    shortDescription: 'موتور آهنربای دائم بدون گیربکس، مناسب آسانسور مسافربر ۸ نفره با سرعت تا ۱٫۶ متر بر ثانیه.',
    description: 'موتور گیرلس با روتور آهنربای دائم و ترمز دیسکی دوگانه. بدنه چدنی، بلبرینگ SKF و انکودر مطلق ۱۷ بیت. مصرف انرژی تا ۴۰٪ کمتر از موتورهای گیربکسی هم‌ظرفیت و صدای زیر ۵۵ دسی‌بل در بار نامی.',
    partnerDiscount: 12,
    pricingMode: 'fixed', price: 486_000_000, compareAtPrice: 552_000_000,
    stockState: 'in_stock', stockQty: 4, rating: 4.9, reviewCount: 42, soldCount: 118,
    datasheetUrl: '#',
    specs: [
      { key: 'power', label: 'توان', value: '۵٫۵', unit: 'kW', highlight: true },
      { key: 'capacity', label: 'ظرفیت', value: '۶۳۰', unit: 'kg', highlight: true },
      { key: 'speed', label: 'سرعت نامی', value: '۱٫۶', unit: 'm/s', highlight: true },
      { key: 'traction', label: 'قطر فلکه', value: '۳۲۰', unit: 'mm' },
      { key: 'rope', label: 'شیار سیم‌بکسل', value: '۵ × ۱۰', unit: 'mm' },
      { key: 'brake', label: 'ترمز', value: 'دیسکی دوگانه ۱۱۰V DC' },
      { key: 'encoder', label: 'انکودر', value: 'مطلق ۱۷ بیت (EnDat)' },
      { key: 'weight', label: 'وزن', value: '۲۴۰', unit: 'kg' },
    ],
    attributes: { power: 5.5, drive: 'گیرلس', capacity: 630, speed: 1.6 },
  }),
  P({
    id: 'p2', name: 'موتور گیربکسی ۱۰۰۰ کیلوگرم دو سرعته', brand: 'ساسی', sellerId: 's1', categoryId: 'c1',
    partNumber: 'SAS-VVVF-1000',
    shortDescription: 'موتور حلزونی با گیربکس روغنی، انتخاب اقتصادی برای پروژه‌های مسکونی پرترافیک.',
    description: 'گیربکس حلزونی برنزی با روغن‌کاری غوطه‌ور، مناسب کارکرد پیوسته. قابل استفاده با تابلو فرمان دو سرعته یا VVVF.',
    partnerDiscount: 10,
    pricingMode: 'tiered', price: 312_000_000,
    tiers: [
      { minQty: 1, maxQty: 4, price: 312_000_000 },
      { minQty: 5, maxQty: 9, price: 297_000_000 },
      { minQty: 10, price: null },
    ],
    stockState: 'low', stockQty: 2, rating: 4.5, reviewCount: 28, soldCount: 64,
    specs: [
      { key: 'power', label: 'توان', value: '۷٫۵', unit: 'kW', highlight: true },
      { key: 'capacity', label: 'ظرفیت', value: '۱۰۰۰', unit: 'kg', highlight: true },
      { key: 'speed', label: 'سرعت نامی', value: '۱٫۰', unit: 'm/s', highlight: true },
      { key: 'ratio', label: 'نسبت گیربکس', value: '۱ : ۵۲' },
      { key: 'oil', label: 'حجم روغن', value: '۴٫۵', unit: 'L' },
    ],
    attributes: { power: 7.5, drive: 'گیربکسی', capacity: 1000, speed: 1 },
  }),
  P({
    id: 'p3', name: 'پاور یونیت هیدرولیک ۱۶۰۰ کیلوگرم', brand: 'جی‌ام‌وی', sellerId: 's3', categoryId: 'c1',
    partNumber: 'GMV-3010-1600',
    shortDescription: 'واحد قدرت هیدرولیک با شیر برقی نرم‌شونده، مناسب آسانسور باری کم‌توقف.',
    description: 'پاور یونیت با پمپ اسکرو کم‌صدا و بلوک شیر NGV-A3. مجهز به شیر اطمینان، شیر دستی پایین‌آور و فیلتر برگشت.',
    pricingMode: 'quote', price: null,
    stockState: 'on_order', stockQty: 0, leadTimeDays: 21, rating: 4.6, reviewCount: 9, soldCount: 14,
    specs: [
      { key: 'capacity', label: 'ظرفیت', value: '۱۶۰۰', unit: 'kg', highlight: true },
      { key: 'pressure', label: 'فشار کاری', value: '۴۵', unit: 'bar', highlight: true },
      { key: 'flow', label: 'دبی', value: '۲۵۰', unit: 'L/min' },
      { key: 'tank', label: 'مخزن روغن', value: '۱۸۰', unit: 'L' },
    ],
    attributes: { power: 15, drive: 'هیدرولیک', capacity: 1600, speed: 0.63 },
  }),
  P({
    id: 'p4', name: 'درب اتوماتیک تلسکوپی ۹۰۰ میلی‌متر استنلس', brand: 'فرماتور', sellerId: 's1', categoryId: 'c2',
    partNumber: 'FRM-TL2-900',
    shortDescription: 'درب طبقه تلسکوپی دو لنگه با ورق استنلس خش‌دار و ریل آلومینیومی.',
    description: 'درب طبقه تلسکوپی با کشویی نایلونی خودروان و قفل ایمنی مطابق EN 81-20. قابل تنظیم برای بازشو راست یا چپ.',
    partnerDiscount: 14,
    pricingMode: 'fixed', price: 128_000_000,
    stockState: 'in_stock', stockQty: 18, rating: 4.7, reviewCount: 51, soldCount: 210,
    specs: [
      { key: 'width', label: 'عرض بازشو', value: '۹۰۰', unit: 'mm', highlight: true },
      { key: 'height', label: 'ارتفاع بازشو', value: '۲۱۰۰', unit: 'mm', highlight: true },
      { key: 'opening', label: 'نوع بازشو', value: 'تلسکوپی دو لنگه', highlight: true },
      { key: 'material', label: 'جنس ورق', value: 'استنلس ۳۰۴ خش‌دار' },
      { key: 'fireRating', label: 'مقاومت حریق', value: 'E30' },
    ],
    attributes: { width: 900, opening: 'تلسکوپی', material: 'استنلس استیل' },
  }),
  P({
    id: 'p5', name: 'اپراتور درب کابین VVVF سانترال', brand: 'فرماتور', sellerId: 's1', categoryId: 'c2',
    partNumber: 'FRM-OPR-C4',
    shortDescription: 'اپراتور درب با درایو اختصاصی و یادگیری خودکار مسیر، بازشو مرکزی.',
    description: 'اپراتور با موتور DC بدون جاروبک و کنترلر داخلی. تشخیص مانع بدون نیاز به میکروسوییچ و منوی تنظیم روی برد.',
    partnerDiscount: 12,
    pricingMode: 'fixed', price: 74_500_000,
    stockState: 'in_stock', stockQty: 9, rating: 4.6, reviewCount: 34, soldCount: 96,
    specs: [
      { key: 'opening', label: 'نوع بازشو', value: 'سانترال', highlight: true },
      { key: 'width', label: 'بازه عرض', value: '۷۰۰–۱۲۰۰', unit: 'mm', highlight: true },
      { key: 'voltage', label: 'تغذیه', value: '۲۲۰', unit: 'V AC' },
      { key: 'openTime', label: 'زمان بازشو', value: '۲٫۲', unit: 's' },
    ],
    attributes: { width: 1200, opening: 'سانترال', material: 'استنلس استیل' },
  }),
  P({
    id: 'p6', name: 'تابلو فرمان میکروپروسسوری ۸ توقف VVVF', brand: 'آرکل', sellerId: 's1', categoryId: 'c3',
    partNumber: 'ARK-ADR-08',
    shortDescription: 'تابلو کامل با درایو یاسکاوا، مانیتورینگ اینترنتی و بازگشت اضطراری.',
    description: 'تابلو فرمان سریال با برد اصلی ARL-500، درایو مجزا و ماژول ARV. دارای صفحه نمایش تنظیمات، لاگ خطا و اتصال به پنل مانیتورینگ.',
    partnerDiscount: 15,
    pricingMode: 'fixed', price: 96_800_000, compareAtPrice: 108_000_000,
    stockState: 'in_stock', stockQty: 6, rating: 4.8, reviewCount: 65, soldCount: 143,
    datasheetUrl: '#',
    specs: [
      { key: 'stops', label: 'تعداد ایستگاه', value: '۸', unit: 'توقف', highlight: true },
      { key: 'control', label: 'نوع کنترل', value: 'VVVF سریال', highlight: true },
      { key: 'power', label: 'توان درایو', value: '۷٫۵', unit: 'kW', highlight: true },
      { key: 'group', label: 'کارکرد گروهی', value: 'تا ۴ دستگاه' },
      { key: 'arv', label: 'بازگشت اضطراری', value: 'دارد (ARV داخلی)' },
      { key: 'protection', label: 'درجه حفاظت', value: 'IP54' },
    ],
    attributes: { stops: 8, control: 'VVVF', group: true },
  }),
  P({
    id: 'p7', name: 'تابلو فرمان هیدرولیک ۴ توقف', brand: 'آریا لیفت', sellerId: 's1', categoryId: 'c3',
    partNumber: 'ARY-HYD-04',
    shortDescription: 'تابلو ساده و مقرون‌به‌صرفه برای آسانسورهای هیدرولیک کم‌توقف.',
    partnerDiscount: 10,
    pricingMode: 'fixed', price: 41_200_000,
    stockState: 'in_stock', stockQty: 14, rating: 4.3, reviewCount: 19, soldCount: 58,
    specs: [
      { key: 'stops', label: 'تعداد ایستگاه', value: '۴', unit: 'توقف', highlight: true },
      { key: 'control', label: 'نوع کنترل', value: 'هیدرولیک ستاره-مثلث', highlight: true },
      { key: 'softStart', label: 'راه‌انداز نرم', value: 'دارد' },
    ],
    attributes: { stops: 4, control: 'هیدرولیک', group: false },
  }),
  P({
    id: 'p8', name: 'ریل راهنمای کابین T-89/B شاخه ۵ متری', brand: 'صنعت فرازان', sellerId: 's2', categoryId: 'c4',
    partNumber: 'FRZ-T89B-5000',
    shortDescription: 'ریل ماشین‌کاری‌شده با تلورانس کلاس B، سطح براده‌برداری‌شده.',
    description: 'ریل فولادی St37 کشش سرد با سطح ماشین‌کاری‌شده و سوراخ‌کاری استاندارد. بسته‌بندی ضدزنگ و بارگیری مستقیم از کارخانه.',
    partnerDiscount: 8,
    pricingMode: 'tiered', price: 34_800_000,
    tiers: [
      { minQty: 1, maxQty: 9, price: 34_800_000 },
      { minQty: 10, maxQty: 29, price: 32_500_000 },
      { minQty: 30, price: null },
    ],
    minOrderQty: 2,
    stockState: 'in_stock', stockQty: 240, rating: 4.7, reviewCount: 110, soldCount: 1420,
    specs: [
      { key: 'profile', label: 'پروفیل', value: 'T-89/B', highlight: true },
      { key: 'length', label: 'طول شاخه', value: '۵', unit: 'm', highlight: true },
      { key: 'tolerance', label: 'کلاس دقت', value: 'B (ماشین‌کاری‌شده)', highlight: true },
      { key: 'weight', label: 'وزن هر شاخه', value: '۸۹', unit: 'kg' },
      { key: 'steel', label: 'آلیاژ', value: 'St37-2' },
    ],
    attributes: { profile: 'T-89', length: 5 },
  }),
  P({
    id: 'p9', name: 'ریل وزنه تعادل T-70 شاخه ۵ متری', brand: 'صنعت فرازان', sellerId: 's2', categoryId: 'c4',
    partNumber: 'FRZ-T70-5000',
    shortDescription: 'ریل سبک وزنه تعادل با سطح سرد نورد، اقتصادی برای پروژه‌های مسکونی.',
    partnerDiscount: 8,
    pricingMode: 'tiered', price: 21_400_000,
    tiers: [
      { minQty: 1, maxQty: 9, price: 21_400_000 },
      { minQty: 10, maxQty: 29, price: 19_900_000 },
      { minQty: 30, price: null },
    ],
    minOrderQty: 2,
    stockState: 'in_stock', stockQty: 180, rating: 4.5, reviewCount: 73, soldCount: 980,
    specs: [
      { key: 'profile', label: 'پروفیل', value: 'T-70/A', highlight: true },
      { key: 'length', label: 'طول شاخه', value: '۵', unit: 'm', highlight: true },
      { key: 'weight', label: 'وزن هر شاخه', value: '۴۰', unit: 'kg' },
    ],
    attributes: { profile: 'T-70', length: 5 },
  }),
  P({
    id: 'p10', name: 'براکت ریل قابل تنظیم گالوانیزه', brand: 'صنعت فرازان', sellerId: 's2', categoryId: 'c4',
    partNumber: 'FRZ-BRK-ADJ',
    shortDescription: 'براکت دو تکه با تنظیم ۸۰ میلی‌متری، گالوانیزه گرم.',
    partnerDiscount: 18,
    pricingMode: 'fixed', price: 1_850_000, minOrderQty: 10,
    stockState: 'in_stock', stockQty: 600, rating: 4.4, reviewCount: 41, soldCount: 3200,
    specs: [
      { key: 'adjust', label: 'بازه تنظیم', value: '۸۰', unit: 'mm', highlight: true },
      { key: 'coating', label: 'پوشش', value: 'گالوانیزه گرم', highlight: true },
      { key: 'load', label: 'بار مجاز', value: '۲۵', unit: 'kN' },
    ],
    attributes: { profile: 'T-89', length: 0 },
  }),
  P({
    id: 'p11', name: 'پاراشوت تدریجی دوطرفه تا ۱٫۶ متر بر ثانیه', brand: 'دیناتک', sellerId: 's3', categoryId: 'c5',
    partNumber: 'DYN-PB-16',
    shortDescription: 'ترمز ایمنی تدریجی با فنر بشقابی، تأییدیه اروپایی EN 81-20.',
    description: 'پاراشوت تدریجی دوطرفه با کفشک‌های سرامیکی و فنر تنظیم‌شونده. مناسب کابین و وزنه تعادل، دارای گواهی تأیید نوع.',
    partnerDiscount: 13,
    pricingMode: 'fixed', price: 58_600_000, compareAtPrice: 64_000_000,
    stockState: 'in_stock', stockQty: 7, rating: 4.8, reviewCount: 33, soldCount: 87,
    datasheetUrl: '#',
    specs: [
      { key: 'tripSpeed', label: 'حداکثر سرعت', value: '۱٫۶', unit: 'm/s', highlight: true },
      { key: 'kind', label: 'نوع عملکرد', value: 'تدریجی دوطرفه', highlight: true },
      { key: 'mass', label: 'بازه جرم مجاز', value: '۶۰۰–۱۸۰۰', unit: 'kg', highlight: true },
      { key: 'rail', label: 'ریل سازگار', value: 'T-89 / T-114' },
      { key: 'cert', label: 'گواهی', value: 'EN 81-20 / 50' },
    ],
    attributes: { tripSpeed: 1.6, kind: 'تدریجی' },
  }),
  P({
    id: 'p12', name: 'گاورنر سرعت با فلکه ۲۰۰ میلی‌متر', brand: 'دیناتک', sellerId: 's3', categoryId: 'c5',
    partNumber: 'DYN-OSG-200',
    shortDescription: 'محدودکننده سرعت با کنتاکت الکتریکی و پلمب کارخانه‌ای.',
    partnerDiscount: 11,
    pricingMode: 'fixed', price: 19_400_000,
    stockState: 'in_stock', stockQty: 11, rating: 4.6, reviewCount: 24, soldCount: 71,
    specs: [
      { key: 'tripSpeed', label: 'سرعت تنظیم', value: '۱٫۰ تا ۱٫۷۵', unit: 'm/s', highlight: true },
      { key: 'sheave', label: 'قطر فلکه', value: '۲۰۰', unit: 'mm', highlight: true },
      { key: 'rope', label: 'سیم گاورنر', value: '۶٫۵ یا ۸', unit: 'mm' },
    ],
    attributes: { tripSpeed: 1.75, kind: 'آنی' },
  }),
  P({
    id: 'p13', name: 'بافر روغنی ۱٫۶ متر بر ثانیه', brand: 'دیناتک', sellerId: 's3', categoryId: 'c5',
    partNumber: 'DYN-OB-160',
    shortDescription: 'ضربه‌گیر روغنی چاه با کنتاکت بازگشت، مناسب سرعت‌های بالا.',
    pricingMode: 'quote', price: null,
    stockState: 'on_order', stockQty: 0, leadTimeDays: 14, rating: 4.4, reviewCount: 8, soldCount: 22,
    specs: [
      { key: 'stroke', label: 'کورس', value: '۱۵۰', unit: 'mm', highlight: true },
      { key: 'speed', label: 'حداکثر سرعت', value: '۱٫۶', unit: 'm/s', highlight: true },
      { key: 'mass', label: 'بازه جرم', value: '۵۰۰–۲۵۰۰', unit: 'kg' },
    ],
    attributes: { tripSpeed: 1.6, kind: 'تدریجی' },
  }),
  P({
    id: 'p14', name: 'سیم‌بکسل فولادی ۱۰ میلی‌متر ۸×۱۹ سیل', brand: 'گوستاو ولف', sellerId: 's3', categoryId: 'c6',
    partNumber: 'GW-819S-10',
    shortDescription: 'سیم‌بکسل مغز کنفی با روانکاری کارخانه‌ای، فروش متری.',
    description: 'سیم‌بکسل مخصوص آسانسور با ساختار ۸×۱۹ سیل و مغز الیاف طبیعی. کشش گسیختگی حداقل ۵۴ کیلونیوتن.',
    partnerDiscount: 7,
    pricingMode: 'tiered', price: 1_240_000, minOrderQty: 30,
    tiers: [
      { minQty: 30, maxQty: 149, price: 1_240_000 },
      { minQty: 150, maxQty: 499, price: 1_150_000 },
      { minQty: 500, price: null },
    ],
    stockState: 'in_stock', stockQty: 2400, rating: 4.7, reviewCount: 88, soldCount: 5600,
    specs: [
      { key: 'diameter', label: 'قطر', value: '۱۰', unit: 'mm', highlight: true },
      { key: 'construction', label: 'ساختار', value: '۸×۱۹ سیل', highlight: true },
      { key: 'breaking', label: 'بار گسیختگی', value: '۵۴', unit: 'kN', highlight: true },
      { key: 'core', label: 'مغزی', value: 'الیاف طبیعی (FC)' },
      { key: 'unit', label: 'واحد فروش', value: 'متر' },
    ],
    attributes: { diameter: 10, construction: '8×19' },
  }),
  P({
    id: 'p15', name: 'سیم‌بکسل ۱۳ میلی‌متر ۹×۱۹ برای سرعت بالا', brand: 'گوستاو ولف', sellerId: 's3', categoryId: 'c6',
    partNumber: 'GW-919-13',
    shortDescription: 'سیم‌بکسل با مقاومت خستگی بالا برای آسانسورهای پرسرعت و پرتردد.',
    partnerDiscount: 7,
    pricingMode: 'tiered', price: 1_960_000, minOrderQty: 30,
    tiers: [
      { minQty: 30, maxQty: 149, price: 1_960_000 },
      { minQty: 150, price: null },
    ],
    stockState: 'in_stock', stockQty: 1100, rating: 4.8, reviewCount: 37, soldCount: 2100,
    specs: [
      { key: 'diameter', label: 'قطر', value: '۱۳', unit: 'mm', highlight: true },
      { key: 'construction', label: 'ساختار', value: '۹×۱۹', highlight: true },
      { key: 'breaking', label: 'بار گسیختگی', value: '۹۲', unit: 'kN', highlight: true },
    ],
    attributes: { diameter: 13, construction: '9×19' },
  }),
  P({
    id: 'p16', name: 'زنجیر جبران‌کننده روکش‌دار', brand: 'پارس درخشان', sellerId: 's3', categoryId: 'c6',
    partNumber: 'PD-CCH-24',
    shortDescription: 'زنجیر جبران وزن با روکش پلیمری کم‌صدا، فروش متری.',
    pricingMode: 'quote', price: null,
    stockState: 'in_stock', stockQty: 800, rating: 4.2, reviewCount: 11, soldCount: 340,
    specs: [
      { key: 'weight', label: 'وزن خطی', value: '۲٫۴', unit: 'kg/m', highlight: true },
      { key: 'coating', label: 'روکش', value: 'PVC کم‌صدا', highlight: true },
    ],
    attributes: { diameter: 0, construction: '6×19' },
  }),
  P({
    id: 'p17', name: 'کابین استنلس ۶ نفره با سقف کاذب LED', brand: 'کویر یزد', sellerId: 's6', categoryId: 'c7',
    partNumber: 'KVR-CAB-6P',
    shortDescription: 'کابین کامل با بدنه استیل خش‌دار، کف سنگ و سقف نورمخفی.',
    description: 'کابین آماده نصب شامل بدنه، سقف کاذب، هندریل، آینه نیم‌قد و کفپوش سنگ گرانیت. ابعاد قابل سفارشی‌سازی.',
    pricingMode: 'quote', price: null,
    stockState: 'on_order', stockQty: 0, leadTimeDays: 25, rating: 4.9, reviewCount: 47, soldCount: 132,
    specs: [
      { key: 'capacity', label: 'ظرفیت', value: '۶', unit: 'نفر', highlight: true },
      { key: 'dimensions', label: 'ابعاد داخلی', value: '۱۱۰ × ۱۴۰', unit: 'cm', highlight: true },
      { key: 'finish', label: 'روکش بدنه', value: 'استیل ۳۰۴ خش‌دار', highlight: true },
      { key: 'floor', label: 'کفپوش', value: 'گرانیت ۲ سانتی' },
      { key: 'ceiling', label: 'سقف', value: 'کاذب با نور مخفی LED' },
    ],
    attributes: { capacity: 6, finish: 'استیل خش‌دار' },
  }),
  P({
    id: 'p18', name: 'هندریل استیل گرد ۵۰ میلی‌متر', brand: 'کویر یزد', sellerId: 's6', categoryId: 'c7',
    partNumber: 'KVR-HR-50',
    shortDescription: 'دستگیره کابین با پایه مخفی، برش در طول دلخواه.',
    partnerDiscount: 16,
    pricingMode: 'fixed', price: 4_600_000,
    stockState: 'in_stock', stockQty: 60, rating: 4.5, reviewCount: 22, soldCount: 410,
    specs: [
      { key: 'diameter', label: 'قطر لوله', value: '۵۰', unit: 'mm', highlight: true },
      { key: 'finish', label: 'روکش', value: 'استیل ۳۰۴ براق', highlight: true },
    ],
    attributes: { capacity: 0, finish: 'استیل خش‌دار' },
  }),
  P({
    id: 'p19', name: 'فن تهویه کابین ۲۴ ولت کم‌صدا', brand: 'مهر صنعت', sellerId: 's5', categoryId: 'c7',
    partNumber: 'MS-FAN-24',
    shortDescription: 'فن سقفی با یاتاقان ژورنالی، صدای زیر ۳۵ دسی‌بل.',
    pricingMode: 'fixed', price: 2_180_000,
    stockState: 'in_stock', stockQty: 45, rating: 4.1, reviewCount: 14, soldCount: 260, status: 'pending',
    specs: [
      { key: 'voltage', label: 'ولتاژ', value: '۲۴', unit: 'V DC', highlight: true },
      { key: 'airflow', label: 'دبی هوا', value: '۳۲۰', unit: 'm³/h', highlight: true },
      { key: 'noise', label: 'صدا', value: '۳۵', unit: 'dB' },
    ],
    attributes: { capacity: 0, finish: 'MDF' },
  }),
  P({
    id: 'p20', name: 'نمایشگر طبقه TFT هفت اینچ عمودی', brand: 'آرکل', sellerId: 's1', categoryId: 'c8',
    partNumber: 'ARK-TFT-70V',
    shortDescription: 'نمایشگر رنگی با انیمیشن جهت حرکت و پخش پیام سفارشی.',
    description: 'نمایشگر TFT با قاب استیل توکار، ورودی سریال CANopen و امکان بارگذاری لوگو و پیام از طریق USB.',
    partnerDiscount: 14,
    pricingMode: 'fixed', price: 8_900_000,
    stockState: 'in_stock', stockQty: 32, rating: 4.7, reviewCount: 39, soldCount: 520,
    specs: [
      { key: 'display', label: 'نوع نمایشگر', value: 'TFT رنگی', highlight: true },
      { key: 'size', label: 'اندازه', value: '۷', unit: 'اینچ', highlight: true },
      { key: 'protocol', label: 'پروتکل', value: 'CANopen سریال', highlight: true },
      { key: 'voltage', label: 'تغذیه', value: '۲۴', unit: 'V DC' },
    ],
    attributes: { voltage: 24, display: 'TFT' },
  }),
  P({
    id: 'p21', name: 'شاسی طبقه استیل ضد خرابکاری', brand: 'شیندلر', sellerId: 's3', categoryId: 'c8',
    partNumber: 'SCH-LOP-V2',
    shortDescription: 'باکس شاسی توکار با دکمه‌های میکروسوییچی و نمایشگر سگمنت.',
    partnerDiscount: 20,
    pricingMode: 'fixed', price: 3_450_000, compareAtPrice: 3_900_000,
    stockState: 'in_stock', stockQty: 120, rating: 4.4, reviewCount: 58, soldCount: 1340,
    specs: [
      { key: 'display', label: 'نمایشگر', value: 'سگمنت قرمز', highlight: true },
      { key: 'buttons', label: 'تعداد دکمه', value: '۲', highlight: true },
      { key: 'material', label: 'قاب', value: 'استیل ۱٫۵ میلی‌متر' },
    ],
    attributes: { voltage: 24, display: 'سگمنت' },
  }),
  P({
    id: 'p22', name: 'پنل روشنایی LED کابین ۲۴ ولت با باتری اضطراری', brand: 'مهر صنعت', sellerId: 's5', categoryId: 'c8',
    partNumber: 'MS-LED-EM24',
    shortDescription: 'روشنایی سقفی با باتری پشتیبان ۹۰ دقیقه‌ای و تست خودکار.',
    partnerDiscount: 17,
    pricingMode: 'fixed', price: 1_720_000,
    stockState: 'in_stock', stockQty: 88, rating: 4.3, reviewCount: 26, soldCount: 640,
    specs: [
      { key: 'voltage', label: 'ولتاژ', value: '۲۴', unit: 'V DC', highlight: true },
      { key: 'backup', label: 'زمان پشتیبان', value: '۹۰', unit: 'دقیقه', highlight: true },
      { key: 'lumen', label: 'شدت نور', value: '۱۲۰۰', unit: 'lm' },
    ],
    attributes: { voltage: 24, display: 'سگمنت' },
  }),
  P({
    id: 'p23', name: 'نصب کامل آسانسور کششی تا ۸ توقف', brand: 'بهساز تبریز', sellerId: 's4', categoryId: 'c9',
    partNumber: 'BHZ-INS-TR8',
    shortDescription: 'نصب چاه تا تحویل، شامل داربست، ریل‌گذاری، سیم‌کشی و تست بار.',
    description: 'خدمت نصب کامل توسط تیم دارای پروانه. شامل داربست‌بندی، نصب ریل و براکت، مونتاژ کابین و وزنه، سیم‌کشی، تنظیم درایو و تست بار نهایی. تحویل با گزارش بازرسی.',
    pricingMode: 'quote', price: null, isService: true,
    stockState: 'in_stock', stockQty: 99, leadTimeDays: 30, rating: 4.6, reviewCount: 17, soldCount: 34,
    specs: [
      { key: 'scope', label: 'دامنه خدمت', value: 'نصب کامل', highlight: true },
      { key: 'duration', label: 'مدت اجرا', value: '۲۱ تا ۳۰', unit: 'روز', highlight: true },
      { key: 'coverage', label: 'پوشش', value: 'آذربایجان شرقی و غربی، اردبیل', highlight: true },
      { key: 'warranty', label: 'گارانتی اجرا', value: '۱۲ ماه' },
    ],
    attributes: { scope: 'نصب کامل', coverage: 'شمال غرب' },
  }),
  P({
    id: 'p24', name: 'قرارداد سرویس دوره‌ای سالانه (۱۲ بازدید)', brand: 'بهساز تبریز', sellerId: 's4', categoryId: 'c9',
    partNumber: 'BHZ-SRV-A12',
    shortDescription: 'بازدید ماهانه، روانکاری، تنظیم ترمز و گزارش وضعیت.',
    partnerDiscount: 9,
    pricingMode: 'tiered', price: 28_800_000, isService: true,
    tiers: [
      { minQty: 1, maxQty: 4, price: 28_800_000 },
      { minQty: 5, maxQty: 19, price: 25_900_000 },
      { minQty: 20, price: null },
    ],
    stockState: 'in_stock', stockQty: 99, rating: 4.5, reviewCount: 29, soldCount: 88,
    specs: [
      { key: 'scope', label: 'دامنه خدمت', value: 'سرویس دوره‌ای', highlight: true },
      { key: 'visits', label: 'تعداد بازدید', value: '۱۲', unit: 'نوبت/سال', highlight: true },
      { key: 'response', label: 'زمان پاسخ اضطراری', value: '۴ ساعت' },
    ],
    attributes: { scope: 'سرویس دوره‌ای', coverage: 'تبریز' },
  }),
]

/* ── کاربران ────────────────────────────────────────────────── */
export const users: User[] = [
  { id: 'u1', name: 'حامد رضایی', phone: '۰۹۱۲۳۴۵۶۷۸۹', role: 'buyer', company: 'ساختمانی آرین', avatarColor: '#1e2a38', createdAt: '۱۴۰۲/۰۵/۱۱' },
  { id: 'u2', name: 'مدیر آریا لیفت', phone: '۰۹۱۲۱۱۱۲۲۳۳', role: 'seller', company: 'آریا لیفت', avatarColor: '#37495c', createdAt: '۱۳۹۸/۰۲/۰۳' },
  { id: 'u3', name: 'مدیر سامانه', phone: '۰۹۱۲۰۰۰۰۰۰۰', role: 'admin', avatarColor: '#f5a800', createdAt: '۱۳۹۷/۰۱/۰۱' },
]

/* ── استعلام‌های نمونه ──────────────────────────────────────── */
export const inquiries: Inquiry[] = [
  {
    id: 'i1', code: 'RFQ-۱۴۰۳۸۸۱', kind: 'project', buyerId: 'u1',
    title: 'آسانسور مسافربر ۸ توقف – برج مسکونی نیاوران',
    note: 'ساختمان در حال اتمام سفت‌کاری است. تحویل مرحله‌ای مد نظر است.',
    spec: { type: 'mrl', stops: 8, capacity: 630, speed: 1.6, doorCount: 1, doorType: 'auto', usage: 'residential', travelHeight: 24 },
    lines: [
      { id: 'l1', productId: 'p1', title: 'موتور کشش گیرلس ۶۳۰ کیلوگرم', quantity: 1, unit: 'دستگاه' },
      { id: 'l2', productId: 'p6', title: 'تابلو فرمان ۸ توقف VVVF', quantity: 1, unit: 'دستگاه' },
      { id: 'l3', productId: 'p8', title: 'ریل راهنمای کابین T-89/B', quantity: 6, unit: 'شاخه' },
      { id: 'l4', partKey: 'landing-door', title: 'درب طبقه اتوماتیک ۹۰۰ میلی‌متر', quantity: 8, unit: 'دستگاه' },
    ],
    status: 'answered',
    offers: [
      {
        id: 'o1', inquiryId: 'i1', sellerId: 's1',
        unitPrices: { l1: 479_000_000, l2: 94_500_000, l3: 33_900_000, l4: 124_000_000 },
        total: 479_000_000 + 94_500_000 + 33_900_000 * 6 + 124_000_000 * 8,
        leadTimeDays: 18, validUntil: '۱۴۰۳/۰۹/۳۰', status: 'submitted',
        note: 'تحویل در دو مرحله؛ حمل تا درب پروژه رایگان.', createdAt: '۱۴۰۳/۰۹/۰۲',
      },
      {
        id: 'o2', inquiryId: 'i1', sellerId: 's3',
        unitPrices: { l1: 492_000_000, l2: 98_000_000, l3: 34_800_000, l4: 118_500_000 },
        total: 492_000_000 + 98_000_000 + 34_800_000 * 6 + 118_500_000 * 8,
        leadTimeDays: 12, validUntil: '۱۴۰۳/۰۹/۲۵', status: 'submitted',
        note: 'موجودی انبار تهران، تحویل فوری.', createdAt: '۱۴۰۳/۰۹/۰۳',
      },
    ],
    createdAt: '۱۴۰۳/۰۹/۰۱', expiresAt: '۱۴۰۳/۰۹/۱۵',
  },
  {
    id: 'i2', code: 'RFQ-۱۴۰۳۸۹۴', kind: 'product', buyerId: 'u1',
    title: 'کابین استنلس ۶ نفره – سفارشی',
    lines: [{ id: 'l1', productId: 'p17', title: 'کابین استنلس ۶ نفره با سقف کاذب LED', quantity: 2, unit: 'دستگاه' }],
    status: 'open', offers: [],
    createdAt: '۱۴۰۳/۰۹/۰۸', expiresAt: '۱۴۰۳/۰۹/۲۲',
  },
  {
    id: 'i3', code: 'RFQ-۱۴۰۳۸۶۲', kind: 'product', buyerId: 'u1',
    title: 'بافر روغنی برای بازسازی چاه',
    lines: [{ id: 'l1', productId: 'p13', title: 'بافر روغنی ۱٫۶ متر بر ثانیه', quantity: 2, unit: 'دستگاه' }],
    status: 'accepted',
    offers: [
      {
        id: 'o3', inquiryId: 'i3', sellerId: 's3', unitPrices: { l1: 27_500_000 }, total: 55_000_000,
        leadTimeDays: 14, validUntil: '۱۴۰۳/۰۸/۳۰', status: 'accepted', createdAt: '۱۴۰۳/۰۸/۱۸',
      },
    ],
    createdAt: '۱۴۰۳/۰۸/۱۵', expiresAt: '۱۴۰۳/۰۸/۲۹',
  },
]

/* ── سفارش‌های نمونه ────────────────────────────────────────── */
const addr = {
  fullName: 'حامد رضایی', phone: '۰۹۱۲۳۴۵۶۷۸۹', province: 'تهران', city: 'تهران',
  line: 'خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲۴۰، واحد ۷', postalCode: '۱۹۶۷۷۴۳۱۱۱',
}

export const orders: Order[] = [
  {
    id: 'or1', code: 'ORD-۱۲۴۸', buyerId: 'u1',
    lines: [
      { productId: 'p6', name: 'تابلو فرمان میکروپروسسوری ۸ توقف VVVF', partNumber: 'ARK-ADR-08', sellerId: 's1', unitPrice: 96_800_000, quantity: 1 },
      { productId: 'p21', name: 'شاسی طبقه استیل ضد خرابکاری', partNumber: 'SCH-LOP-V2', sellerId: 's3', unitPrice: 3_450_000, quantity: 9 },
    ],
    subtotal: 96_800_000 + 3_450_000 * 9, shipping: 2_400_000, commission: 7_800_000,
    total: 96_800_000 + 3_450_000 * 9 + 2_400_000,
    status: 'shipped', address: addr, createdAt: '۱۴۰۳/۰۹/۰۵', updatedAt: '۱۴۰۳/۰۹/۰۷',
  },
  {
    id: 'or2', code: 'ORD-۱۲۴۴', buyerId: 'u1',
    lines: [{ productId: 'p13', name: 'بافر روغنی ۱٫۶ متر بر ثانیه', partNumber: 'DYN-OB-160', sellerId: 's3', unitPrice: 27_500_000, quantity: 2 }],
    subtotal: 55_000_000, shipping: 1_200_000, commission: 4_400_000, total: 56_200_000,
    status: 'delivered', address: addr, inquiryId: 'i3', createdAt: '۱۴۰۳/۰۸/۲۰', updatedAt: '۱۴۰۳/۰۸/۲۶',
  },
  {
    id: 'or3', code: 'ORD-۱۲۵۱', buyerId: 'u1',
    lines: [{ productId: 'p8', name: 'ریل راهنمای کابین T-89/B شاخه ۵ متری', partNumber: 'FRZ-T89B-5000', sellerId: 's2', unitPrice: 32_500_000, quantity: 12 }],
    subtotal: 390_000_000, shipping: 8_500_000, commission: 27_300_000, total: 398_500_000,
    status: 'pending_payment', address: addr, createdAt: '۱۴۰۳/۰۹/۱۰', updatedAt: '۱۴۰۳/۰۹/۱۰',
  },
]

/* ── بلاگ آموزشی ────────────────────────────────────────────── */
export const posts: Post[] = [
  {
    id: 'b1', slug: 'choosing-traction-motor', title: 'چطور موتور کشش درست را برای پروژه انتخاب کنیم؟',
    excerpt: 'ظرفیت، سرعت و تعداد استارت در ساعت سه عددی هستند که انتخاب موتور را تعیین می‌کنند. بقیه، جزئیات است.',
    tag: 'راهنمای فنی', readMinutes: 7, author: 'مهندس سعید کاظمی', publishedAt: '۱۴۰۳/۰۸/۲۴', cover: 'motor',
    body: `انتخاب موتور کشش معمولاً با یک سؤال اشتباه شروع می‌شود: «چند کیلووات؟». توان خروجی نتیجه است، نه ورودی. آنچه باید اول مشخص شود سه عدد است.

## ۱. ظرفیت نامی و ضریب تعادل
وزن کابین خالی به‌علاوه نیمی از بار نامی، وزن وزنه تعادل را تعیین می‌کند. ضریب تعادل رایج ۰٫۴۵ تا ۰٫۵ است. هرچه این عدد دقیق‌تر انتخاب شود، جریان راه‌اندازی و مصرف انرژی پایین‌تر می‌آید.

## ۲. سرعت نامی و ارتفاع سفر
سرعت را ارتفاع سفر تعیین می‌کند، نه سلیقه کارفرما. برای سفر زیر ۲۰ متر، سرعت بیش از ۱ متر بر ثانیه عملاً هدر رفتن هزینه است؛ کابین به سرعت نامی نمی‌رسد و بیشتر مسیر را در شتاب‌گیری و ترمز می‌گذراند.

## ۳. تعداد استارت در ساعت
این عددی است که بیشتر از همه نادیده گرفته می‌شود. یک برج اداری ۱۲ طبقه در ساعت اوج به‌راحتی ۱۸۰ استارت در ساعت می‌رسد. موتوری که برای ۹۰ استارت طراحی شده، در این شرایط داغ می‌کند و عمر ترمزش نصف می‌شود.

## گیرلس یا گیربکسی؟
گیرلس در مصرف انرژی، صدا و نگهداری برنده است و برای ساختمان بدون موتورخانه تنها گزینه عملی است. گیربکسی هنوز در پروژه‌های باری کم‌تردد و جایی که بودجه اولیه تعیین‌کننده است، توجیه دارد. تفاوت قیمت اولیه معمولاً ظرف چهار تا شش سال از محل قبض برق جبران می‌شود.

## چک‌لیست نهایی پیش از سفارش
- قطر فلکه با قطر سیم‌بکسل سازگار باشد (نسبت حداقل ۴۰ به ۱)
- تعداد و گام شیارها با تعداد رشته‌های محاسبه‌شده بخواند
- ولتاژ ترمز با خروجی تابلو یکی باشد
- نوع انکودر با درایو انتخابی سازگار باشد`,
  },
  {
    id: 'b2', slug: 'rail-alignment', title: 'ریل‌گذاری بدون لرزش: تلورانس‌هایی که واقعاً مهم‌اند',
    excerpt: 'بیشتر شکایت‌های «آسانسور می‌لرزد» ریشه در نصب ریل دارد، نه موتور یا درایو.',
    tag: 'اجرا و نصب', readMinutes: 6, author: 'مهندس نگار موسوی', publishedAt: '۱۴۰۳/۰۸/۱۱', cover: 'rail',
    body: `وقتی کابین در حرکت می‌لرزد، اولین چیزی که متهم می‌شود درایو است. اما در تجربه میدانی، بیش از هفتاد درصد این موارد به ریل برمی‌گردد.

## سه تلورانسی که باید کنترل شوند
انحراف از شاقولی در کل ارتفاع سفر نباید از ۰٫۵ میلی‌متر در هر ۵ متر بیشتر شود. اختلاف سطح در محل اتصال دو شاخه باید زیر ۰٫۰۵ میلی‌متر بماند؛ همین پله کوچک است که در سرعت ۱٫۶ متر بر ثانیه به ضربه محسوس تبدیل می‌شود. فاصله بین دو ریل نیز در تمام ارتفاع باید ثابت بماند، با تلورانس مثبت یک و منفی صفر میلی‌متر.

## نکته‌ای درباره فاصله براکت‌ها
فاصله استاندارد ۲٫۵ متر است، اما در سرعت‌های بالای ۱٫۶ متر بر ثانیه یا ظرفیت‌های بالای ۱۰۰۰ کیلوگرم باید به ۲ متر کاهش یابد. صرفه‌جویی در تعداد براکت، گران‌ترین صرفه‌جویی ممکن در این حرفه است.

## پرداخت محل اتصال
بعد از بستن پشت‌بند، محل اتصال باید با سوهان تخت پرداخت شود تا کاملاً هم‌سطح شود. این کار پانزده دقیقه وقت می‌گیرد و سال‌ها شکایت را حذف می‌کند.`,
  },
  {
    id: 'b3', slug: 'en81-20-checklist', title: 'چک‌لیست انطباق با EN 81-20 برای بازرسی نهایی',
    excerpt: 'فهرست کوتاهی از مواردی که بازرس اول سراغشان می‌رود و بیشترین علت رد شدن بازرسی‌اند.',
    tag: 'استاندارد', readMinutes: 9, author: 'مهندس سعید کاظمی', publishedAt: '۱۴۰۳/۰۷/۲۹', cover: 'safety',
    body: `استاندارد EN 81-20 جایگزین EN 81-1 و 81-2 شده و تمرکز آن روی ایمنی افراد در چاه و روی کابین است.

## فضاهای امن
ارتفاع آزاد بالای کابین در بالاترین توقف باید حداقل ۱٫۰ متر و در چاهک ۰٫۵ متر باشد. این عدد بیشترین علت رد شدن بازرسی در پروژه‌های بازسازی است.

## نرده روی کابین
اگر فاصله لبه کابین تا دیواره چاه بیش از ۳۰ سانتی‌متر باشد، نرده الزامی است؛ ارتفاع آن بسته به همین فاصله ۷۰ یا ۱۱۰ سانتی‌متر تعیین می‌شود.

## روشنایی چاه
حداقل ۵۰ لوکس در فاصله یک متری از کف چاهک و سقف کابین. کلید روشنایی باید هم در چاهک و هم در ورودی بازرسی در دسترس باشد.

## سیستم توقف اضطراری
کلید توقف در چاهک و روی کابین با رنگ قرمز و برچسب فارسی و انگلیسی. کلید باید از نوع دوپل و ماندگار باشد، نه شستی لحظه‌ای.

## مدارک همراه
دفترچه راهنمای فارسی، نقشه مدار تابلو، گواهی تأیید نوع پاراشوت و گاورنر، و گزارش تست بار. نبود هر کدام یعنی بازرسی ناتمام.`,
  },
  {
    id: 'b4', slug: 'energy-saving', title: 'مصرف برق آسانسور را چطور کم کنیم؟',
    excerpt: 'از بازیابی انرژی ترمز تا خاموش کردن روشنایی کابین؛ اعداد واقعی صرفه‌جویی.',
    tag: 'بهره‌برداری', readMinutes: 5, author: 'مهندس نگار موسوی', publishedAt: '۱۴۰۳/۰۷/۱۵', cover: 'panel',
    body: `در یک ساختمان مسکونی معمولی، آسانسور بین ۵ تا ۱۰ درصد مصرف برق کل ساختمان را تشکیل می‌دهد. نکته جالب اینکه بخش بزرگی از این مصرف مربوط به زمانی است که کابین اصلاً حرکت نمی‌کند.

## حالت خواب
روشنایی کابین، فن و نمایشگرها در حالت انتظار مصرف پیوسته دارند. تنظیم خاموشی خودکار بعد از پنج دقیقه بی‌حرکتی، به‌تنهایی حدود ۲۰ درصد مصرف سالانه را کم می‌کند.

## بازیابی انرژی
درایوهای مجهز به واحد بازگردان، انرژی ترمز را به شبکه برمی‌گردانند. صرفه‌جویی واقعی بین ۲۰ تا ۳۰ درصد است، اما فقط در ساختمان‌های پرتردد به‌صرفه است؛ برای یک برج مسکونی ۱۰ واحدی دوره بازگشت سرمایه بیش از ده سال می‌شود.

## ضریب تعادل درست
اگر وزنه تعادل درست بسته نشده باشد، موتور در یک جهت همیشه بیشتر کار می‌کند. تنظیم دقیق وزنه هزینه‌ای جز چند ساعت کار ندارد و تا ۱۰ درصد مصرف را کم می‌کند.`,
  },
  {
    id: 'b5', slug: 'buying-guide-rfq', title: 'استعلام قیمت حرفه‌ای بنویسید تا پیشنهاد دقیق بگیرید',
    excerpt: 'فروشنده‌ها به استعلام مبهم، قیمت محافظه‌کارانه می‌دهند. آنچه باید در درخواست بنویسید.',
    tag: 'خرید', readMinutes: 4, author: 'تیم آسانسور مارکت', publishedAt: '۱۴۰۳/۰۶/۳۰', cover: 'service',
    body: `کیفیت پیشنهادی که می‌گیرید مستقیماً به کیفیت استعلامی که می‌نویسید بستگی دارد.

## چه چیزی را حتماً بنویسید
مشخصات فنی حداقلی: ظرفیت، سرعت، تعداد توقف، نوع درب و ارتفاع سفر. بدون این پنج عدد، هر قیمتی که بگیرید تخمینی است.

## تعداد و زمان‌بندی تحویل
اگر تحویل مرحله‌ای می‌خواهید، همان ابتدا بگویید. فروشنده‌ای که فکر می‌کند باید همه‌چیز را یکجا تأمین کند، قیمت انبارداری را در پیشنهاد می‌گنجاند.

## محل تحویل
هزینه حمل ریل پنج متری به یک پروژه در شهرستان می‌تواند چند درصد کل سفارش باشد. نبودن آدرس یعنی فروشنده بدترین حالت را فرض می‌کند.

## مهلت پاسخ
مهلت واقع‌بینانه بگذارید. مهلت ۲۴ ساعته برای یک پکیج کامل، پیشنهادهای عجولانه و گران به همراه دارد.`,
  },
  {
    id: 'b6', slug: 'door-troubleshooting', title: 'عیب‌یابی درب اتوماتیک: پنج ایراد پرتکرار',
    excerpt: 'درب، پرخرابی‌ترین بخش آسانسور است. این پنج مورد بیشتر تماس‌های سرویس را می‌سازند.',
    tag: 'تعمیر و نگهداری', readMinutes: 6, author: 'مهندس رضا فتحی', publishedAt: '۱۴۰۳/۰۶/۱۲', cover: 'door',
    body: `حدود شصت درصد تماس‌های اضطراری آسانسور به درب مربوط می‌شود. این پنج ایراد بیشترین سهم را دارند.

## ۱. کشویی ساییده‌شده
کشویی‌های نایلونی زیر لنگه درب مصرفی هستند. ساییدگی بیش از دو میلی‌متر باعث می‌شود لنگه روی آستانه بکشد. تعویض ساده است و باید هر دو سال انجام شود.

## ۲. آستانه پر از آشغال
شن، سنگریزه و ته‌سیگار در شیار آستانه، شایع‌ترین علت گیر کردن درب است. تمیزکاری ماهانه شیار جزو سرویس دوره‌ای است و اغلب فراموش می‌شود.

## ۳. تنظیم نبودن قفل
فاصله بین رولر و قلاب قفل باید بین ۵ تا ۷ میلی‌متر باشد. کمتر از آن، قفل زودتر آزاد می‌شود و مدار ایمنی قطع می‌ماند.

## ۴. پرده نوری کثیف
گرد و غبار روی لنز، پرده نوری را به تشخیص کاذب مانع می‌اندازد و درب باز می‌ماند. یک دستمال کافی است.

## ۵. تنظیم پارامتر اپراتور
بعد از هر تعویض کشویی یا تسمه، مسیر باید دوباره به اپراتور یاد داده شود. رد شدن از این مرحله باعث ضربه انتهای مسیر می‌شود.`,
  },
]
