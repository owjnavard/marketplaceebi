import { cn, percentOff, toFa, toman } from '@/lib/utils'
import type { Product } from '@/lib/api/types'
import { canSeePartnerPrice, partnerPrice } from '@/lib/partner'
import { useAuth } from '@/store'
import { Badge } from './ui'

/* ══════════════════════════════════════════════════════════════
   نمایش قیمت — سه حالت فایل نیازمندی

   هر حالت شکل بصری متفاوتی دارد تا خریدار بدون خواندن برچسب
   بفهمد با چه نوع قیمتی روبه‌روست:

   • قیمت مشخص  → عدد بزرگ، آماده خرید
   • استعلامی    → فیلد هاشورخورده؛ جای خالیِ یک عدد که باید پرسید
   • همکاری      → نردبان پلکانی؛ قیمت تابع تعداد است
   ══════════════════════════════════════════════════════════════ */

export function PriceBlock({
  product,
  size = 'md',
  quantity,
  /** در کارت‌ها فقط خلاصه قیمت نمایش داده می‌شود؛ نردبان کامل
      و توضیح‌ها متعلق به صفحه محصول‌اند. */
  compact,
}: {
  product: Product
  size?: 'sm' | 'md' | 'lg'
  quantity?: number
  compact?: boolean
}) {
  const numberSize = {
    sm: 'text-[19px]',
    md: 'text-[22px]',
    lg: 'text-[30px]',
  }[size]

  /* ── استعلامی ─────────────────────────────────────────────── */
  if (product.pricingMode === 'quote') {
    return (
      <div>
        <span
          className="inline-flex items-center gap-2 rounded-full bg-steel-100 px-3.5 py-1.5 text-[14px] font-bold text-steel-600"
          aria-label="قیمت اعلام نشده است"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-signal-500" />
          قیمت با استعلام
        </span>
        {!compact && (
          <p className="mt-2 text-[14px] text-steel-400">
            قیمت این کالا به شرایط پروژه بستگی دارد
          </p>
        )}
      </div>
    )
  }

  /* ── پلکانی / همکاری ──────────────────────────────────────── */
  if (product.pricingMode === 'tiered' && product.tiers?.length) {
    const active = quantity
      ? product.tiers.find((t) => quantity >= t.minQty && (t.maxQty == null || quantity <= t.maxQty))
      : product.tiers[0]

    return (
      <div>
        {compact && <p className="mb-0.5 text-[13px] text-steel-400">شروع از</p>}
        <div className="flex items-baseline gap-1.5">
          {active?.price != null ? (
            <>
              <span className={cn('num font-extrabold text-steel-900', numberSize)}>
                {toman(active.price)}
              </span>
              <span className="text-[14px] font-semibold text-steel-400">تومان</span>
            </>
          ) : (
            <span className={cn('font-extrabold text-steel-500', numberSize)}>استعلامی</span>
          )}
        </div>

        {!compact && <TierLadder product={product} quantity={quantity} />}
      </div>
    )
  }

  /* ── قیمت مشخص ────────────────────────────────────────────── */
  const off = percentOff(product.price ?? 0, product.compareAtPrice)
  return (
    <div>
      <PartnerLine product={product} />
      {off != null && (
        <div className="mb-0.5 flex items-center gap-2">
          <Badge tone="alert">{toFa(off)}٪ تخفیف</Badge>
          <span className="num text-[15px] text-steel-400 line-through">
            {toman(product.compareAtPrice!)}
          </span>
        </div>
      )}
      <div className="flex items-baseline gap-1.5">
        <span className={cn('num font-extrabold text-steel-900', numberSize)}>
          {toman(product.price ?? 0)}
        </span>
        <span className="text-[14px] font-semibold text-steel-400">تومان</span>
      </div>
    </div>
  )
}

/* ── نردبان پله‌های قیمت ─────────────────────────────────────── */
export function TierLadder({
  product,
  quantity,
  detailed,
}: {
  product: Product
  quantity?: number
  detailed?: boolean
}) {
  if (!product.tiers?.length) return null

  return (
    <div className={cn('mt-3 overflow-hidden rounded-xl bg-steel-50', detailed && 'mt-0')}>
      {product.tiers.map((tier, i) => {
        const isActive =
          quantity != null &&
          quantity >= tier.minQty &&
          (tier.maxQty == null || quantity <= tier.maxQty)

        const range = tier.maxQty
          ? `${toFa(tier.minQty)} تا ${toFa(tier.maxQty)}`
          : `${toFa(tier.minQty)} به بالا`

        return (
          <div
            key={i}
            className={cn(
              'flex items-center justify-between gap-3 px-3.5 py-2 text-[14px]',
              i > 0 && 'border-t border-white',
              isActive && 'bg-signal-100/70',
            )}
          >
            <span className={cn('font-medium', isActive ? 'text-steel-900' : 'text-steel-500')}>
              {range} عدد
            </span>
            {tier.price != null ? (
              <span className={cn('num font-bold', isActive ? 'text-steel-900' : 'text-steel-600')}>
                {toman(tier.price)}
              </span>
            ) : (
              <span className="font-bold text-signal-700">استعلام بگیرید</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── برچسب کوچک حالت قیمت‌گذاری ─────────────────────────────── */
export function PricingModeTag({ product }: { product: Product }) {
  if (product.pricingMode === 'quote') return <Badge tone="signal">استعلامی</Badge>
  if (product.pricingMode === 'tiered') return <Badge tone="steel">قیمت همکاری</Badge>
  return null
}


/* ══════════════════════════════════════════════════════════════
   خط قیمت همکاری

   فقط برای فروشندگان تأییدشده رندر می‌شود. اگر شرط برقرار نباشد،
   هیچ نشانه‌ای از وجود تخفیف در صفحه دیده نمی‌شود.
   ══════════════════════════════════════════════════════════════ */
export function PartnerLine({ product }: { product: Product }) {
  const user = useAuth((s) => s.user)
  if (!canSeePartnerPrice(user)) return null

  const p = partnerPrice(product)

  if (p == null) {
    if (!product.partnerDiscount) return null
    return (
      <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-verify-soft px-3 py-1 text-[12.5px] font-bold text-verify">
        استعلام با {toFa(product.partnerDiscount)}٪ تخفیف همکاری
      </span>
    )
  }

  return (
    <div className="mb-1.5 inline-flex items-baseline gap-2 rounded-full bg-verify-soft px-3 py-1">
      <span className="text-[12px] font-bold text-verify">قیمت همکاری</span>
      <span className="num text-[13.5px] font-extrabold text-verify">{toman(p)}</span>
      <span className="text-[11.5px] text-verify/70">({toFa(product.partnerDiscount ?? 0)}٪)</span>
    </div>
  )
}
