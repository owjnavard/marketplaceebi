import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { Badge, Button, Card, Empty, Spinner } from '@/components/ui'
import { QtyStepper } from './ProductDetail'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api/types'
import { toFa, toman } from '@/lib/utils'
import { unitPriceFor, useCart, useToasts } from '@/store'

export default function Cart() {
  const { lines, setQty, remove, clear } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const push = useToasts((s) => s.push)

  useEffect(() => {
    setLoading(true)
    void Promise.all(lines.map((l) => api.product(l.productId))).then((list) => {
      setProducts(list.filter(Boolean) as Product[])
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length])

  if (loading) return <Spinner />

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Empty
          icon={<ShoppingCart size={20} />}
          title="سبد خرید شما خالی است"
          description="کالاهای دارای قیمت مشخص را می‌توانید مستقیم به سبد اضافه کنید. برای کالاهای استعلامی، درخواست قیمت ثبت کنید."
          action={
            <div className="flex gap-2">
              <Link to="/products"><Button>مشاهده کاتالوگ</Button></Link>
              <Link to="/rfq"><Button variant="outline">استعلام پروژه</Button></Link>
            </div>
          }
        />
      </div>
    )
  }

  const rows = lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId)
      if (!product) return null
      const unit = unitPriceFor(product, l.quantity)
      return { line: l, product, unit }
    })
    .filter(Boolean) as { line: (typeof lines)[number]; product: Product; unit: number | null }[]

  /* ردیف‌هایی که در پله فعلی قیمت ندارند باید به استعلام بروند، نه به پرداخت */
  const priced = rows.filter((r) => r.unit != null)
  const needsQuote = rows.filter((r) => r.unit == null)

  const subtotal = priced.reduce((sum, r) => sum + r.unit! * r.line.quantity, 0)
  const shipping = subtotal > 0 ? 2_400_000 : 0

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-steel-900 md:text-2xl">سبد خرید</h1>
          <p className="num mt-1 text-[15px] text-steel-500">{toFa(rows.length)} قلم کالا</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            clear()
            push('سبد خرید خالی شد')
          }}
        >
          <Trash2 size={14} />
          خالی کردن سبد
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="divide-y divide-line">
            {rows.map(({ line, product, unit }) => (
              <div key={product.id} className="flex gap-4 p-4">
                <Link
                  to={`/products/${product.id}`}
                  className="h-20 w-20 shrink-0 rounded-xl border border-line bg-steel-50 p-2.5 text-steel-300"
                >
                  <PartSchematic kind={schematicFor(product.categoryId)} />
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/products/${product.id}`} className="block truncate text-[15px] font-bold text-steel-900 hover:text-signal-600">
                        {product.name}
                      </Link>
                      <p className="code mt-0.5 text-[13px] text-steel-400">{product.partNumber}</p>
                    </div>
                    <button
                      onClick={() => remove(product.id)}
                      className="shrink-0 rounded p-1 text-steel-300 transition-colors hover:text-alert"
                      aria-label="حذف از سبد"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <QtyStepper
                      value={line.quantity}
                      min={product.minOrderQty}
                      onChange={(n) => setQty(product.id, n)}
                    />
                    <div className="text-left">
                      {unit == null ? (
                        <Badge tone="signal">در این تعداد، قیمت استعلامی است</Badge>
                      ) : (
                        <>
                          <p className="num text-[16px] font-extrabold text-steel-900">
                            {toman(unit * line.quantity)}
                            <span className="mr-1 text-[13px] font-normal text-steel-400">تومان</span>
                          </p>
                          <p className="num mt-0.5 text-[13px] text-steel-400">
                            واحدی {toman(unit)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {needsQuote.length > 0 && (
            <Card className="border-signal-300 bg-signal-50 p-4">
              <p className="text-[15px] font-bold text-steel-900">
                <span className="num">{toFa(needsQuote.length)}</span> قلم از سبد شما در این تعداد قیمت ثابت ندارد
              </p>
              <p className="mt-1.5 text-[14px] leading-6 text-steel-600">
                در پله‌های عمده، قیمت مذاکره‌ای است. این اقلام در پرداخت محاسبه نمی‌شوند؛ برایشان
                استعلام ثبت کنید تا فروشندگان قیمت پیشنهادی بدهند.
              </p>
              <Link to="/rfq" className="mt-3 inline-block">
                <Button size="sm" variant="signal">ثبت استعلام برای این اقلام</Button>
              </Link>
            </Card>
          )}
        </div>

        {/* خلاصه */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">
              خلاصه سفارش
            </h2>
            <dl className="space-y-2.5 p-4 text-[15px]">
              <Line label={`جمع کالاها (${toFa(priced.length)} قلم)`} value={`${toman(subtotal)} تومان`} />
              <Line label="هزینه ارسال" value={shipping ? `${toman(shipping)} تومان` : '—'} />
              {needsQuote.length > 0 && (
                <Line label={`${toFa(needsQuote.length)} قلم استعلامی`} value="محاسبه نشده" muted />
              )}
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-bold text-steel-900">مبلغ قابل پرداخت</dt>
                <dd className="num text-lg font-extrabold text-steel-900">
                  {toman(subtotal + shipping)}
                  <span className="mr-1 text-[13px] font-normal text-steel-400">تومان</span>
                </dd>
              </div>
            </dl>
            <div className="border-t border-line p-4">
              <Link to="/checkout">
                <Button variant="signal" size="lg" className="w-full" disabled={priced.length === 0}>
                  ادامه و تسویه حساب
                  <ArrowLeft size={16} />
                </Button>
              </Link>
              <Link to="/products" className="mt-2 block text-center text-[14px] text-steel-500 hover:text-steel-800">
                ادامه خرید
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-steel-500">{label}</dt>
      <dd className={muted ? 'text-steel-400' : 'num font-semibold text-steel-800'}>{value}</dd>
    </div>
  )
}
