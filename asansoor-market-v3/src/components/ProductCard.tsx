import { Link } from 'react-router-dom'
import { GitCompareArrows, Heart, MessageSquareQuote, ShoppingCart } from 'lucide-react'
import type { Product } from '@/lib/api/types'
import { stockLabel, stockTone } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { useCart, useLists, useToasts } from '@/store'
import { Badge, Button } from './ui'
import { PartSchematic, schematicFor } from './PartSchematic'
import { PriceBlock, PricingModeTag } from './PriceBlock'

/* ══════════════════════════════════════════════════════════════
   کارت محصول

   عمداً کم‌حرف است. در نگاه اول فقط چهار چیز دیده می‌شود:
   تصویر، نام، دو مشخصه کلیدی، قیمت. باقی جزئیات (کد فنی، امتیاز،
   تعداد فروش) در صفحه محصول هستند و اینجا فقط نویز می‌سازند.

   دکمه‌های ثانویه (مقایسه و ذخیره) شناورند و با هاور ظاهر می‌شوند
   تا در حالت عادی چشم را شلوغ نکنند.
   ══════════════════════════════════════════════════════════════ */

export function ProductCard({ product, layout = 'grid' }: { product: Product; layout?: 'grid' | 'row' }) {
  const add = useCart((s) => s.add)
  const { toggleFavorite, toggleCompare, favorites, compare } = useLists()
  const push = useToasts((s) => s.push)

  const isFav = favorites.includes(product.id)
  const isCmp = compare.includes(product.id)
  const keySpecs = product.specs.filter((s) => s.highlight).slice(0, 2)

  const onAdd = () => {
    add(product.id, product.minOrderQty)
    push(`${product.name} به سبد اضافه شد`)
  }

  const onCompare = () => {
    if (!isCmp && compare.length >= 4) {
      push('حداکثر ۴ محصول را می‌توان مقایسه کرد', 'error')
      return
    }
    toggleCompare(product.id)
  }

  const primaryAction =
    product.pricingMode === 'fixed' ? (
      <Button size="sm" variant="signal" className="w-full" onClick={onAdd}>
        <ShoppingCart size={15} />
        افزودن به سبد
      </Button>
    ) : (
      <Link to={`/products/${product.id}?ask=1`} className="block">
        <Button size="sm" variant="outline" className="w-full">
          <MessageSquareQuote size={15} />
          درخواست قیمت
        </Button>
      </Link>
    )

  const floatingActions = (
    <div className="absolute left-3 top-3 flex flex-col gap-1.5 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
      <IconToggle
        active={isFav}
        onClick={() => toggleFavorite(product.id)}
        label={isFav ? 'حذف از علاقه‌مندی' : 'ذخیره'}
        icon={<Heart size={15} className={isFav ? 'fill-current' : ''} />}
      />
      <IconToggle
        active={isCmp}
        onClick={onCompare}
        label={isCmp ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
        icon={<GitCompareArrows size={15} />}
      />
    </div>
  )

  /* ── حالت سطری ───────────────────────────────────────────── */
  if (layout === 'row') {
    return (
      <article className="group relative flex gap-5 rounded-2xl bg-paper p-5 shadow-plate transition-shadow duration-200 hover:shadow-soft">
        <Link
          to={`/products/${product.id}`}
          className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-steel-50 p-4 text-steel-300 transition-colors group-hover:text-steel-400"
        >
          <PartSchematic kind={schematicFor(product.categoryId)} />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <Link to={`/products/${product.id}`}>
                <h3 className="truncate text-[17px] font-bold text-steel-900 transition-colors hover:text-signal-600">
                  {product.name}
                </h3>
              </Link>
              <p className="mt-1 line-clamp-1 text-[15px] text-steel-500">{product.shortDescription}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {keySpecs.map((s) => (
                  <SpecPill key={s.key} label={s.label} value={s.value} unit={s.unit} />
                ))}
              </div>
            </div>
            <div className="shrink-0 text-left">
              <PriceBlock product={product} size="sm" compact />
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <PricingModeTag product={product} />
              <Badge tone={stockTone[product.stockState]}>{stockLabel[product.stockState]}</Badge>
            </div>
            <div className="w-44">{primaryAction}</div>
          </div>
        </div>
      </article>
    )
  }

  /* ── حالت شبکه‌ای ────────────────────────────────────────── */
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-paper shadow-plate transition-shadow duration-200 hover:shadow-soft">
      <Link
        to={`/products/${product.id}`}
        className="relative block h-44 bg-steel-50/70 p-8 text-steel-300 transition-colors group-hover:text-steel-400 sm:aspect-4/3 sm:h-auto sm:p-10"
      >
        <PartSchematic kind={schematicFor(product.categoryId)} />
        <div className="absolute right-3 top-3">
          <PricingModeTag product={product} />
        </div>
      </Link>

      {floatingActions}

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/products/${product.id}`}>
          <h3 className="line-clamp-2 min-h-14 text-[15.5px] font-bold leading-7 text-steel-900 transition-colors hover:text-signal-600">
            {product.name}
          </h3>
        </Link>

        {keySpecs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {keySpecs.map((s) => (
              <SpecPill key={s.key} label={s.label} value={s.value} unit={s.unit} />
            ))}
          </div>
        )}

        <div className="mt-auto space-y-4 pt-5">
          <div className="flex items-end justify-between gap-3">
            <PriceBlock product={product} size="sm" compact />
            <Badge tone={stockTone[product.stockState]}>{stockLabel[product.stockState]}</Badge>
          </div>
          {primaryAction}
        </div>
      </div>
    </article>
  )
}

/* ── اجزای کمکی ─────────────────────────────────────────────── */
function SpecPill({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full bg-steel-50 px-3 py-1 text-[13px]">
      <span className="text-steel-400">{label}</span>
      <span className="num font-bold text-steel-800">
        {value}
        {unit && <span className="mr-0.5 font-normal text-steel-400">{unit}</span>}
      </span>
    </span>
  )
}

function IconToggle({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full shadow-plate transition-colors',
        active
          ? 'bg-steel-800 text-white'
          : 'bg-paper/90 text-steel-500 backdrop-blur-sm hover:text-steel-900',
      )}
    >
      {icon}
    </button>
  )
}

/* ── اسکلت بارگذاری ─────────────────────────────────────────── */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-paper shadow-plate">
      <div className="aspect-4/3 animate-pulse bg-steel-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-full animate-pulse rounded-full bg-steel-100" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-steel-100" />
        <div className="h-9 w-full animate-pulse rounded-full bg-steel-100" />
      </div>
    </div>
  )
}
