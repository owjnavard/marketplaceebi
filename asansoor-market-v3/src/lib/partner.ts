import type { Product, Seller, User } from './api/types'

/* ══════════════════════════════════════════════════════════════
   قیمت همکاری

   قانون کسب‌وکار از فایل نیازمندی V3:

   • قیمت همکاری فقط برای **فروشندگان تأییدشده** قابل رویت است.
     خریدار عادی نه درصد تخفیف را می‌بیند، نه قیمت حاصل از آن.
   • فروشنده برای قیمت همکاری یک درصد تخفیف تعیین می‌کند و همان
     درصد هنگام نمایش به سایر فروشندگان تأییدشده اعمال می‌شود.
   • اگر کالا قیمت مشخص نداشته باشد، فروشنده تأییدشده می‌تواند
     «استعلام با احتساب تخفیف» ثبت کند.

   همه‌جای رابط کاربری از همین توابع استفاده می‌کند تا این قانون
   در یک نقطه بماند و جایی از قلم نیفتد.
   ══════════════════════════════════════════════════════════════ */

/** آیا این کاربر اجازه دیدن قیمت همکاری را دارد؟ */
export function canSeePartnerPrice(
  user: User | null,
  seller?: Seller | null,
): boolean {
  if (!user || user.role !== 'seller') return false
  // فروشنده باید تأییدشده باشد؛ فروشنده در انتظار بررسی حق دیدن ندارد
  return seller ? seller.status === 'approved' : true
}

/** قیمت همکاری یک کالا؛ اگر قیمت پایه نداشته باشد null برمی‌گرداند */
export function partnerPrice(product: Product): number | null {
  if (product.price == null || !product.partnerDiscount) return null
  return Math.round(product.price * (1 - product.partnerDiscount / 100))
}

/** سود فروشنده از فروش این کالا به قیمت عمومی */
export function partnerMargin(product: Product): number | null {
  const p = partnerPrice(product)
  if (p == null || product.price == null) return null
  return product.price - p
}
