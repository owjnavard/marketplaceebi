import type {
  InquiryStatus, OrderStatus, PricingMode, ProductStatus, Role, SellerStatus, StockState,
} from './api/types'

/* برچسب‌های فارسی و رنگ وضعیت‌ها — تنها منبع حقیقت برای متن‌های UI */

export const pricingModeLabel: Record<PricingMode, string> = {
  fixed: 'قیمت مشخص',
  quote: 'استعلامی',
  tiered: 'قیمت همکاری',
}

export const stockLabel: Record<StockState, string> = {
  in_stock: 'موجود',
  low: 'موجودی کم',
  out: 'ناموجود',
  on_order: 'سفارشی',
}

export const stockTone: Record<StockState, 'verify' | 'notice' | 'alert' | 'muted'> = {
  in_stock: 'verify',
  low: 'notice',
  out: 'alert',
  on_order: 'muted',
}

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending_payment: 'در انتظار پرداخت',
  processing: 'در حال آماده‌سازی',
  shipped: 'ارسال شده',
  delivered: 'تحویل شده',
  cancelled: 'لغو شده',
  refunded: 'مسترد شده',
}

export const orderStatusTone: Record<OrderStatus, 'verify' | 'notice' | 'alert' | 'muted' | 'steel'> = {
  pending_payment: 'notice',
  processing: 'steel',
  shipped: 'steel',
  delivered: 'verify',
  cancelled: 'alert',
  refunded: 'muted',
}

export const ORDER_FLOW: OrderStatus[] = ['pending_payment', 'processing', 'shipped', 'delivered']

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  open: 'در انتظار پیشنهاد',
  answered: 'پیشنهاد دریافت شد',
  accepted: 'پذیرفته شده',
  closed: 'بسته شده',
  expired: 'منقضی شده',
}

export const inquiryStatusTone: Record<InquiryStatus, 'verify' | 'notice' | 'alert' | 'muted' | 'steel'> = {
  open: 'notice',
  answered: 'steel',
  accepted: 'verify',
  closed: 'muted',
  expired: 'alert',
}

export const productStatusLabel: Record<ProductStatus, string> = {
  approved: 'تأیید شده',
  pending: 'در انتظار تأیید',
  rejected: 'رد شده',
  draft: 'پیش‌نویس',
}

export const productStatusTone: Record<ProductStatus, 'verify' | 'notice' | 'alert' | 'muted'> = {
  approved: 'verify',
  pending: 'notice',
  rejected: 'alert',
  draft: 'muted',
}

export const sellerStatusLabel: Record<SellerStatus, string> = {
  approved: 'تأیید شده',
  pending: 'در انتظار بررسی',
  suspended: 'معلق',
}

export const sellerStatusTone: Record<SellerStatus, 'verify' | 'notice' | 'alert'> = {
  approved: 'verify',
  pending: 'notice',
  suspended: 'alert',
}

export const roleLabel: Record<Role, string> = {
  buyer: 'خریدار',
  seller: 'فروشنده',
  admin: 'مدیر سامانه',
}

export const elevatorTypeLabel = {
  traction: 'کششی با موتورخانه',
  mrl: 'کششی بدون موتورخانه (MRL)',
  hydraulic: 'هیدرولیک',
} as const

export const doorTypeLabel = {
  auto: 'تمام اتوماتیک',
  'semi-auto': 'نیمه اتوماتیک',
  manual: 'دستی (لولایی)',
} as const

export const usageLabel = {
  residential: 'مسکونی',
  commercial: 'اداری و تجاری',
  hospital: 'بیمارستانی',
  cargo: 'باری',
} as const

/* ── گروه فروشندگان (نسخه ۳) ────────────────────────────────── */
import type { SellerGroup } from './api/types'

export const sellerGroupLabel: Record<SellerGroup, string> = {
  manufacturer: 'تولیدکننده',
  contractor: 'شرکت پیمانکاری آسانسور',
  trading: 'بازرگانی',
  installer: 'مجری نصب',
  design: 'طراحی و مشاوره',
}
