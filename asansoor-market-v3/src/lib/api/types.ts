/* ══════════════════════════════════════════════════════════════
   مدل دامنه — قرارداد مشترک بین رابط کاربری و بک‌اند
   هر اینترفیس اینجا معادل یک جدول/ریسورس در لاراول است.
   ══════════════════════════════════════════════════════════════ */

export type ID = string

/* ── نقش‌ها ─────────────────────────────────────────────────── */
export type Role = 'buyer' | 'seller' | 'admin'

export interface User {
  id: ID
  name: string
  phone: string
  email?: string
  role: Role
  company?: string
  avatarColor: string
  createdAt: string
}

/* ── استراتژی قیمت‌گذاری (سه حالت فایل نیازمندی) ─────────────── */
export type PricingMode =
  | 'fixed' // قیمت مشخص — قابل افزودن به سبد
  | 'quote' // درخواست قیمت — قیمت وابسته به شرایط
  | 'tiered' // قیمت همکاری / عمده — پلکانی، از تعداد مشخص استعلام

export interface PriceTier {
  minQty: number
  maxQty?: number
  price: number | null // null ⇒ در این پله باید استعلام گرفت
}

/* ── دسته‌بندی و ویژگی‌ها ────────────────────────────────────── */
export type AttributeType = 'text' | 'number' | 'select' | 'boolean'

export interface AttributeDef {
  key: string
  label: string
  type: AttributeType
  unit?: string
  options?: string[]
  required: boolean
  filterable: boolean
}

export interface Category {
  id: ID
  slug: string
  name: string
  icon: string
  parentId: ID | null
  productCount: number
  attributes: AttributeDef[]
}

/* ── محصول ──────────────────────────────────────────────────── */
export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'draft'
export type StockState = 'in_stock' | 'low' | 'out' | 'on_order'

export interface ProductSpec {
  key: string
  label: string
  value: string
  unit?: string
  highlight?: boolean
}

export interface Product {
  id: ID
  slug: string
  name: string
  brand: string
  sellerId: ID
  categoryId: ID
  partNumber: string
  shortDescription: string
  description: string
  images: string[]
  datasheetUrl?: string

  pricingMode: PricingMode
  price: number | null
  compareAtPrice?: number | null
  tiers?: PriceTier[]
  minOrderQty: number
  /**
   * درصد تخفیف قیمت همکاری.
   * فقط برای فروشندگان تأییدشده اعمال و نمایش داده می‌شود؛ خریدار
   * عادی هرگز این عدد یا قیمت حاصل از آن را نمی‌بیند.
   */
  partnerDiscount?: number

  stockState: StockState
  stockQty: number
  leadTimeDays?: number

  specs: ProductSpec[]
  attributes: Record<string, string | number | boolean>

  rating: number
  reviewCount: number
  soldCount: number
  status: ProductStatus
  isService: boolean
  createdAt: string
}

/* ── فروشنده ────────────────────────────────────────────────── */
export type SellerStatus = 'pending' | 'approved' | 'suspended'

/** گروه فعالیت فروشنده — مبنای فیلتر در فهرست پیمانکاران */
export type SellerGroup =
  | 'manufacturer'   // تولیدکننده
  | 'contractor'     // شرکت پیمانکاری آسانسور
  | 'trading'        // بازرگانی
  | 'installer'      // مجری نصب
  | 'design'         // طراحی و مشاوره

export interface Seller {
  id: ID
  slug: string
  name: string
  legalName: string
  logoColor: string
  province: string
  city: string
  phone: string
  status: SellerStatus
  verified: boolean
  group: SellerGroup
  /** دارای مجوز رسمی از سازمان مربوطه */
  licensed: boolean
  rating: number
  reviewCount: number
  productCount: number
  responseHours: number
  commissionRate: number // درصد کمیسیون مارکت‌پلیس
  memberSince: string
  about: string
}

/* ── استعلام (RFQ) ──────────────────────────────────────────── */
export type InquiryKind = 'product' | 'project'
export type InquiryStatus = 'open' | 'answered' | 'accepted' | 'closed' | 'expired'
export type OfferStatus = 'submitted' | 'accepted' | 'rejected' | 'withdrawn'

export interface InquiryLine {
  id: ID
  productId?: ID
  partKey?: string // برای استعلام پروژه‌ای که هنوز محصول انتخاب نشده
  title: string
  description?: string
  quantity: number
  unit: string
}

export interface Offer {
  id: ID
  inquiryId: ID
  sellerId: ID
  unitPrices: Record<string, number> // lineId ⇒ قیمت واحد
  total: number
  leadTimeDays: number
  validUntil: string
  note?: string
  status: OfferStatus
  createdAt: string
}

export interface Inquiry {
  id: ID
  code: string
  kind: InquiryKind
  buyerId: ID
  title: string
  note?: string
  lines: InquiryLine[]
  spec?: ElevatorSpec // فقط برای استعلام پروژه‌ای
  status: InquiryStatus
  offers: Offer[]
  createdAt: string
  expiresAt: string
}

/* ── مشخصات پروژه آسانسور (ورودی ویزارد استعلام) ─────────────── */
export type ElevatorType = 'traction' | 'mrl' | 'hydraulic'
export type DoorType = 'auto' | 'semi-auto' | 'manual'
export type Usage = 'residential' | 'commercial' | 'hospital' | 'cargo'

export interface ElevatorSpec {
  type: ElevatorType
  stops: number
  capacity: number // کیلوگرم
  speed: number // متر بر ثانیه
  doorCount: number
  doorType: DoorType
  usage: Usage
  travelHeight: number // متر
}

/* ── سبد و سفارش ────────────────────────────────────────────── */
export interface CartLine {
  productId: ID
  quantity: number
}

export type OrderStatus =
  | 'pending_payment'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderLine {
  productId: ID
  name: string
  partNumber: string
  sellerId: ID
  unitPrice: number
  quantity: number
}

export interface Order {
  id: ID
  code: string
  buyerId: ID
  lines: OrderLine[]
  subtotal: number
  shipping: number
  commission: number
  total: number
  status: OrderStatus
  address: Address
  inquiryId?: ID
  createdAt: string
  updatedAt: string
}

export interface Address {
  fullName: string
  phone: string
  province: string
  city: string
  line: string
  postalCode: string
}

/* ── بلاگ ───────────────────────────────────────────────────── */
export interface Post {
  id: ID
  slug: string
  title: string
  excerpt: string
  body: string
  cover: string
  tag: string
  readMinutes: number
  author: string
  publishedAt: string
}

/* ── پارامترهای فهرست محصولات ───────────────────────────────── */
export interface ProductQuery {
  q?: string
  categoryIds?: string[]
  brands?: string[]
  sellerIds?: string[]
  pricingModes?: PricingMode[]
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  attributes?: Record<string, string[]>
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating'
  page?: number
  perPage?: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  perPage: number
}
