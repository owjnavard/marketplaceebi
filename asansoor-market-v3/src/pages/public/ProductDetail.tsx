import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Building2, ChevronLeft, Clock, FileText, GitCompareArrows, Heart,
  MessageSquareQuote, Minus, Package, Plus, ShieldCheck, ShoppingCart, Truck,
} from 'lucide-react'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { PriceBlock, TierLadder } from '@/components/PriceBlock'
import { ProductCard } from '@/components/ProductCard'
import { Badge, Button, Card, Empty, Field, Modal, Spinner, Stars, Textarea } from '@/components/ui'
import { api } from '@/lib/api'
import type { Product, Seller } from '@/lib/api/types'
import { pricingModeLabel, stockLabel, stockTone } from '@/lib/labels'
import { cn, toFa, toman } from '@/lib/utils'
import { unitPriceFor, useAuth, useCart, useLists, useToasts } from '@/store'

export default function ProductDetail() {
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [seller, setSeller] = useState<Seller | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'specs' | 'description' | 'seller'>('specs')
  const [askOpen, setAskOpen] = useState(false)

  const add = useCart((s) => s.add)
  const { toggleFavorite, toggleCompare, favorites, compare } = useLists()
  const push = useToasts((s) => s.push)

  useEffect(() => {
    setLoading(true)
    void api.product(id).then(async (p) => {
      setProduct(p)
      if (p) {
        setQty(p.minOrderQty)
        const [s, r] = await Promise.all([api.seller(p.sellerId), api.relatedProducts(p.id)])
        setSeller(s)
        setRelated(r)
      }
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    if (params.get('ask') === '1') setAskOpen(true)
  }, [params])

  const unitPrice = useMemo(() => (product ? unitPriceFor(product, qty) : null), [product, qty])

  if (loading) return <Spinner />
  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Empty
          icon={<Package size={20} />}
          title="این کالا پیدا نشد"
          description="ممکن است حذف شده باشد یا آدرس اشتباه باشد."
          action={<Link to="/products"><Button>بازگشت به کاتالوگ</Button></Link>}
        />
      </div>
    )
  }

  const isFav = favorites.includes(product.id)
  const isCmp = compare.includes(product.id)
  const canBuy = product.pricingMode !== 'quote' && unitPrice != null

  const onAdd = () => {
    add(product.id, qty)
    push(`${toFa(qty)} عدد به سبد اضافه شد`)
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[14px] text-steel-400">
        <Link to="/" className="transition-colors hover:text-steel-700">خانه</Link>
        <span>/</span>
        <Link to="/products" className="transition-colors hover:text-steel-700">محصولات</Link>
        <span>/</span>
        <Link to={`/products?cat=${product.categoryId}`} className="transition-colors hover:text-steel-700">
          {product.isService ? 'خدمات' : 'قطعات'}
        </Link>
        <span>/</span>
        <span className="truncate font-medium text-steel-700">{product.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ستون اصلی */}
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <div className="grid gap-5 p-5 md:grid-cols-[240px_1fr]">
              <div className="relative flex aspect-square items-center justify-center rounded-xl border border-line bg-steel-50 p-10 text-steel-300">
                <PartSchematic kind={schematicFor(product.categoryId)} />
                <Badge tone={stockTone[product.stockState]} className="absolute bottom-3 left-3">
                  {stockLabel[product.stockState]}
                </Badge>
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="code rounded-2xl bg-steel-100 px-1.5 py-0.5 text-[13px] font-bold text-steel-600">
                    {product.partNumber}
                  </span>
                  <Badge tone={product.pricingMode === 'quote' ? 'signal' : product.pricingMode === 'tiered' ? 'steel' : 'muted'}>
                    {pricingModeLabel[product.pricingMode]}
                  </Badge>
                  {product.isService && <Badge tone="verify">خدمت</Badge>}
                </div>

                <h1 className="text-lg font-extrabold leading-8 text-steel-900 md:text-xl">{product.name}</h1>
                <p className="mt-2 text-[15px] leading-7 text-steel-500">{product.shortDescription}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px]">
                  <span className="flex items-center gap-1.5">
                    <Stars value={product.rating} />
                    <span className="num font-semibold text-steel-700">{toFa(product.rating)}</span>
                    <span className="num text-steel-400">({toFa(product.reviewCount)} نظر)</span>
                  </span>
                  <span className="num text-steel-400">{toFa(product.soldCount)} فروش موفق</span>
                  <span className="text-steel-400">برند: <span className="font-semibold text-steel-700">{product.brand}</span></span>
                </div>

                {/* مشخصات کلیدی */}
                <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {product.specs.filter((s) => s.highlight).map((s) => (
                    <div key={s.key} className="rounded-xl bg-steel-50 px-3.5 py-2.5">
                      <dt className="text-[13px] text-steel-400">{s.label}</dt>
                      <dd className="num mt-0.5 text-[15px] font-bold text-steel-900">
                        {s.value}
                        {s.unit && <span className="mr-1 text-[13px] font-normal text-steel-400">{s.unit}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Card>

          {/* تب‌ها */}
          <Card>
            <div className="flex border-b border-line">
              {([
                ['specs', 'مشخصات فنی'],
                ['description', 'توضیحات'],
                ['seller', 'فروشنده'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'relative px-4 py-3 text-[15px] font-bold transition-colors',
                    tab === key
                      ? 'text-steel-900 after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-signal-400'
                      : 'text-steel-400 hover:text-steel-700',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === 'specs' && (
                <>
                  <dl className="divide-y divide-line">
                    {product.specs.map((s) => (
                      <div key={s.key} className="flex items-baseline justify-between gap-4 py-2.5">
                        <dt className="text-[15px] text-steel-500">{s.label}</dt>
                        <dd className="num text-[15px] font-semibold text-steel-900">
                          {s.value}
                          {s.unit && <span className="mr-1 text-[13px] font-normal text-steel-400">{s.unit}</span>}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {product.datasheetUrl && (
                    <a
                      href={product.datasheetUrl}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[15px] font-semibold text-steel-700 transition-colors hover:border-steel-300"
                    >
                      <FileText size={15} />
                      دانلود دیتاشیت فنی (PDF)
                    </a>
                  )}
                </>
              )}

              {tab === 'description' && (
                <p className="whitespace-pre-line text-[15px] leading-8 text-steel-600">
                  {product.description || 'برای این کالا توضیح تکمیلی ثبت نشده است. مشخصات فنی را در تب کناری ببینید یا از فروشنده استعلام بگیرید.'}
                </p>
              )}

              {tab === 'seller' && seller && <SellerPanel seller={seller} />}
            </div>
          </Card>

          {/* محصولات مرتبط */}
          {related.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-extrabold text-steel-900">کالاهای مشابه</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>

        {/* جعبه خرید */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Card className="overflow-hidden">
            <div className="border-b border-line p-5">
              <PriceBlock product={product} size="lg" quantity={qty} />
            </div>

            {product.pricingMode === 'tiered' && product.tiers && (
              <div className="border-b border-line p-4">
                <p className="mb-2 text-[14px] font-bold text-steel-700">پله‌های قیمت</p>
                <TierLadder product={product} quantity={qty} detailed />
              </div>
            )}

            <div className="space-y-3 p-5">
              {product.minOrderQty > 1 && (
                <p className="rounded-3xl bg-steel-50 px-2.5 py-1.5 text-[14px] text-steel-600">
                  حداقل سفارش: <span className="num font-bold">{toFa(product.minOrderQty)}</span> عدد
                </p>
              )}

              {product.pricingMode !== 'quote' && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[15px] font-semibold text-steel-700">تعداد</span>
                  <QtyStepper value={qty} min={product.minOrderQty} onChange={setQty} />
                </div>
              )}

              {canBuy && (
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-[15px] text-steel-500">جمع</span>
                  <span className="num text-lg font-extrabold text-steel-900">
                    {toman(unitPrice! * qty)}
                    <span className="mr-1 text-[13px] font-normal text-steel-400">تومان</span>
                  </span>
                </div>
              )}

              {canBuy ? (
                <Button variant="signal" size="lg" className="w-full" onClick={onAdd}>
                  <ShoppingCart size={17} />
                  افزودن به سبد خرید
                </Button>
              ) : (
                <Button variant="signal" size="lg" className="w-full" onClick={() => setAskOpen(true)}>
                  <MessageSquareQuote size={17} />
                  درخواست قیمت از فروشنده
                </Button>
              )}

              {product.pricingMode !== 'quote' && (
                <Button variant="outline" className="w-full" onClick={() => setAskOpen(true)}>
                  <MessageSquareQuote size={15} />
                  استعلام برای تعداد بالا
                </Button>
              )}

              <div className="flex gap-2">
                <Button
                  variant="quiet"
                  className="flex-1"
                  onClick={() => {
                    if (!isCmp && compare.length >= 4) return push('حداکثر ۴ محصول', 'error')
                    toggleCompare(product.id)
                  }}
                >
                  <GitCompareArrows size={15} />
                  {isCmp ? 'در مقایسه' : 'مقایسه'}
                </Button>
                <Button variant="quiet" className="flex-1" onClick={() => toggleFavorite(product.id)}>
                  <Heart size={15} className={isFav ? 'fill-current text-alert' : ''} />
                  {isFav ? 'ذخیره شد' : 'ذخیره'}
                </Button>
              </div>
            </div>

            <ul className="divide-y divide-line border-t border-line text-[14px]">
              <li className="flex items-center gap-2.5 px-5 py-2.5 text-steel-600">
                <Truck size={15} className="text-steel-400" />
                {product.leadTimeDays
                  ? <>زمان تأمین حدود <span className="num font-semibold">{toFa(product.leadTimeDays)}</span> روز</>
                  : 'ارسال از انبار فروشنده، ۲ تا ۵ روز کاری'}
              </li>
              <li className="flex items-center gap-2.5 px-5 py-2.5 text-steel-600">
                <ShieldCheck size={15} className="text-steel-400" />
                پرداخت امن؛ وجه پس از تأیید تحویل آزاد می‌شود
              </li>
              {seller && (
                <li className="flex items-center gap-2.5 px-5 py-2.5 text-steel-600">
                  <Clock size={15} className="text-steel-400" />
                  میانگین پاسخ فروشنده: <span className="num font-semibold">{toFa(seller.responseHours)}</span> ساعت
                </li>
              )}
            </ul>
          </Card>

          {seller && (
            <Card className="mt-4 p-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-extrabold text-white"
                  style={{ background: seller.logoColor }}
                >
                  {seller.name.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={`/sellers/${seller.id}`} className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-bold text-steel-900 hover:text-signal-600">{seller.name}</span>
                    {seller.verified && <ShieldCheck size={13} className="shrink-0 text-verify" />}
                  </Link>
                  <p className="num mt-0.5 text-[13px] text-steel-400">
                    {seller.city} — امتیاز {toFa(seller.rating)} از ۵
                  </p>
                </div>
                <Link to={`/sellers/${seller.id}`}>
                  <ChevronLeft size={16} className="text-steel-400" />
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>

      <QuoteModal
        open={askOpen}
        onClose={() => {
          setAskOpen(false)
          if (params.get('ask')) {
            const next = new URLSearchParams(params)
            next.delete('ask')
            setParams(next, { replace: true })
          }
        }}
        product={product}
        defaultQty={qty}
        onDone={() => navigate('/panel/inquiries')}
      />
    </div>
  )
}

/* ── انتخاب تعداد ───────────────────────────────────────────── */
export function QtyStepper({
  value, min = 1, onChange,
}: {
  value: number; min?: number; onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-line">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center text-steel-600 transition-colors hover:bg-steel-50 disabled:text-steel-300"
        aria-label="کاهش"
      >
        <Minus size={14} />
      </button>
      <span className="num w-12 border-x border-line text-center text-[15px] font-bold">{toFa(value)}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex h-9 w-9 items-center justify-center text-steel-600 transition-colors hover:bg-steel-50"
        aria-label="افزایش"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

/* ── پنجره درخواست قیمت ─────────────────────────────────────── */
function QuoteModal({
  open, onClose, product, defaultQty, onDone,
}: {
  open: boolean
  onClose: () => void
  product: Product
  defaultQty: number
  onDone: () => void
}) {
  const [qty, setQty] = useState(defaultQty)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const user = useAuth((s) => s.user)
  const push = useToasts((s) => s.push)
  const navigate = useNavigate()

  useEffect(() => setQty(defaultQty), [defaultQty, open])

  const submit = async () => {
    if (!user) {
      onClose()
      navigate('/login?next=/products/' + product.id)
      return
    }
    setBusy(true)
    try {
      await api.createInquiry({
        kind: 'product',
        buyerId: user.id,
        title: product.name,
        note: note || undefined,
        lines: [{ id: 'l1', productId: product.id, title: product.name, quantity: qty, unit: 'عدد' }],
      })
      push('استعلام ثبت شد. پیشنهادها در پنل شما نمایش داده می‌شود.')
      onClose()
      onDone()
    } catch {
      push('ثبت استعلام انجام نشد. دوباره تلاش کنید.', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="درخواست قیمت"
      subtitle={product.name}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button variant="signal" loading={busy} onClick={submit}>
            {user ? 'ارسال استعلام' : 'ورود و ارسال'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-line bg-steel-50 p-3 text-[14px] leading-6 text-steel-600">
          درخواست شما برای فروشنده این کالا و فروشندگان دیگری که همین دسته را عرضه می‌کنند
          ارسال می‌شود. پیشنهادها را در پنل خریدار کنار هم می‌بینید.
        </div>

        <Field label="تعداد مورد نیاز" required group>
          <QtyStepper value={qty} min={product.minOrderQty} onChange={setQty} />
        </Field>

        <Field label="توضیح تکمیلی" hint="اختیاری">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثلاً: مشخصات پروژه، زمان‌بندی تحویل، شهر محل نصب…"
          />
        </Field>
      </div>
    </Modal>
  )
}

/* ── اطلاعات فروشنده در تب ──────────────────────────────────── */
function SellerPanel({ seller }: { seller: Seller }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
          style={{ background: seller.logoColor }}
        >
          {seller.name.charAt(0)}
        </span>
        <div>
          <p className="flex items-center gap-1.5 font-bold text-steel-900">
            {seller.name}
            {seller.verified && <ShieldCheck size={14} className="text-verify" />}
          </p>
          <p className="text-[14px] text-steel-500">{seller.legalName}</p>
        </div>
      </div>

      <p className="mb-4 text-[15px] leading-7 text-steel-600">{seller.about}</p>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { l: 'شهر', v: `${seller.province} — ${seller.city}` },
          { l: 'عضویت از', v: seller.memberSince },
          { l: 'تعداد کالا', v: toFa(seller.productCount) },
          { l: 'پاسخ به استعلام', v: `${toFa(seller.responseHours)} ساعت` },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-steel-50 px-3.5 py-2.5">
            <dt className="text-[13px] text-steel-400">{s.l}</dt>
            <dd className="num mt-0.5 text-[15px] font-bold text-steel-900">{s.v}</dd>
          </div>
        ))}
      </dl>

      <Link to={`/sellers/${seller.id}`} className="mt-4 inline-block">
        <Button variant="outline" size="sm">
          <Building2 size={14} />
          مشاهده فروشگاه
        </Button>
      </Link>
    </div>
  )
}
