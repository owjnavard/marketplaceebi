import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitCompareArrows, ShoppingCart, Trash2, X } from 'lucide-react'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { PriceBlock } from '@/components/PriceBlock'
import { Badge, Button, Empty, Spinner, Stars } from '@/components/ui'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api/types'
import { pricingModeLabel, stockLabel, stockTone } from '@/lib/labels'
import { cn, toFa } from '@/lib/utils'
import { useCart, useLists, useToasts } from '@/store'

/* مقایسه — ردیف‌هایی که مقدارشان بین محصولات فرق دارد برجسته می‌شوند،
   چون همان تفاوت‌ها دلیل مقایسه‌اند. */
export default function Compare() {
  const { compare, toggleCompare, clearCompare } = useLists()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [onlyDiff, setOnlyDiff] = useState(false)
  const add = useCart((s) => s.add)
  const push = useToasts((s) => s.push)

  useEffect(() => {
    setLoading(true)
    void Promise.all(compare.map((id) => api.product(id))).then((list) => {
      setProducts(list.filter(Boolean) as Product[])
      setLoading(false)
    })
  }, [compare])

  if (loading) return <Spinner />

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Empty
          icon={<GitCompareArrows size={20} />}
          title="هنوز محصولی برای مقایسه انتخاب نکرده‌اید"
          description="در کاتالوگ روی آیکون مقایسه هر کالا بزنید تا اینجا کنار هم قرار بگیرند. تا ۴ کالا همزمان قابل مقایسه است."
          action={<Link to="/products"><Button>رفتن به کاتالوگ</Button></Link>}
        />
      </div>
    )
  }

  /* اجتماع همه کلیدهای مشخصات، به ترتیب ظهور */
  const specKeys: { key: string; label: string }[] = []
  for (const p of products) {
    for (const s of p.specs) {
      if (!specKeys.some((k) => k.key === s.key)) specKeys.push({ key: s.key, label: s.label })
    }
  }

  const valueOf = (p: Product, key: string) => {
    const s = p.specs.find((x) => x.key === key)
    return s ? `${s.value}${s.unit ? ' ' + s.unit : ''}` : '—'
  }

  const isDifferent = (key: string) =>
    new Set(products.map((p) => valueOf(p, key))).size > 1

  const rows = onlyDiff ? specKeys.filter((k) => isDifferent(k.key)) : specKeys

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-steel-900 md:text-2xl">مقایسه محصولات</h1>
          <p className="num mt-1 text-[15px] text-steel-500">{toFa(products.length)} کالا کنار هم</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-[14px] font-semibold text-steel-700">
            <input
              type="checkbox"
              checked={onlyDiff}
              onChange={(e) => setOnlyDiff(e.target.checked)}
              className="h-4 w-4 accent-steel-800"
            />
            فقط تفاوت‌ها
          </label>
          <Button variant="outline" size="sm" onClick={clearCompare}>
            <Trash2 size={14} />
            پاک کردن همه
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
        <table className="w-full min-w-[680px] text-right">
          <thead>
            <tr>
              <th className="w-36 border-b border-l border-line bg-steel-50 p-3 text-[14px] font-bold text-steel-500">
                مشخصه
              </th>
              {products.map((p) => (
                <th key={p.id} className="border-b border-l border-line p-3 align-top last:border-l-0">
                  <div className="relative">
                    <button
                      onClick={() => toggleCompare(p.id)}
                      className="absolute -left-1 -top-1 rounded p-1 text-steel-300 transition-colors hover:text-alert"
                      aria-label="حذف از مقایسه"
                    >
                      <X size={14} />
                    </button>
                    <div className="mx-auto mb-2 h-20 w-20 text-steel-300">
                      <PartSchematic kind={schematicFor(p.categoryId)} />
                    </div>
                    <Link to={`/products/${p.id}`} className="block text-[15px] font-bold leading-6 text-steel-900 hover:text-signal-600">
                      {p.name}
                    </Link>
                    <p className="code mt-1 text-[13px] font-normal text-steel-400">{p.partNumber}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="قیمت">
              {products.map((p) => (
                <Cell key={p.id}><PriceBlock product={p} size="sm" /></Cell>
              ))}
            </Row>
            <Row label="نحوه قیمت‌گذاری">
              {products.map((p) => (
                <Cell key={p.id}>
                  <Badge tone={p.pricingMode === 'quote' ? 'signal' : p.pricingMode === 'tiered' ? 'steel' : 'muted'}>
                    {pricingModeLabel[p.pricingMode]}
                  </Badge>
                </Cell>
              ))}
            </Row>
            <Row label="برند">
              {products.map((p) => <Cell key={p.id}><span className="font-semibold">{p.brand}</span></Cell>)}
            </Row>
            <Row label="موجودی">
              {products.map((p) => (
                <Cell key={p.id}><Badge tone={stockTone[p.stockState]}>{stockLabel[p.stockState]}</Badge></Cell>
              ))}
            </Row>
            <Row label="امتیاز">
              {products.map((p) => (
                <Cell key={p.id}>
                  <span className="flex items-center gap-1.5">
                    <Stars value={p.rating} size={12} />
                    <span className="num text-[14px] text-steel-500">({toFa(p.reviewCount)})</span>
                  </span>
                </Cell>
              ))}
            </Row>

            {rows.length > 0 && (
              <tr>
                <td colSpan={products.length + 1} className="border-b border-line bg-steel-50 px-3 py-1.5 text-[13px] font-bold uppercase tracking-wider text-steel-500">
                  مشخصات فنی
                </td>
              </tr>
            )}
            {rows.map((k) => (
              <Row key={k.key} label={k.label} highlight={isDifferent(k.key)}>
                {products.map((p) => (
                  <Cell key={p.id}>
                    <span className="num text-[15px] font-semibold text-steel-800">{valueOf(p, k.key)}</span>
                  </Cell>
                ))}
              </Row>
            ))}

            <tr>
              <td className="border-l border-line bg-steel-50 p-3" />
              {products.map((p) => (
                <td key={p.id} className="border-l border-line p-3 last:border-l-0">
                  {p.pricingMode === 'fixed' ? (
                    <Button
                      variant="signal"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        add(p.id, p.minOrderQty)
                        push('به سبد اضافه شد')
                      }}
                    >
                      <ShoppingCart size={14} />
                      افزودن به سبد
                    </Button>
                  ) : (
                    <Link to={`/products/${p.id}?ask=1`}>
                      <Button size="sm" className="w-full">درخواست قیمت</Button>
                    </Link>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({
  label, children, highlight,
}: {
  label: string; children: React.ReactNode; highlight?: boolean
}) {
  return (
    <tr className={cn(highlight && 'bg-signal-50/60')}>
      <th className="border-b border-l border-line bg-steel-50 p-3 text-right text-[14px] font-semibold text-steel-600">
        {label}
      </th>
      {children}
    </tr>
  )
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="border-b border-l border-line p-3 align-middle text-[15px] last:border-l-0">{children}</td>
}
