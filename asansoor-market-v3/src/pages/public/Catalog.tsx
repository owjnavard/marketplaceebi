import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LayoutGrid, PackageSearch, Rows3, SlidersHorizontal, X } from 'lucide-react'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { Badge, Button, Checkbox, Empty, Input, Select } from '@/components/ui'
import { api } from '@/lib/api'
import type { Category, PricingMode, Product, ProductQuery, Seller } from '@/lib/api/types'
import { pricingModeLabel } from '@/lib/labels'
import { cn, toEn, toFa } from '@/lib/utils'

const SORTS: { value: NonNullable<ProductQuery['sort']>; label: string }[] = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'popular', label: 'پرفروش‌ترین' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
  { value: 'rating', label: 'بیشترین امتیاز' },
]

const MODES: PricingMode[] = ['fixed', 'quote', 'tiered']

export default function Catalog() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [products, setProducts] = useState<Product[]>([])
  /* فهرست کامل، فقط برای استخراج مقادیر ممکن هر ویژگی */
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'row'>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)

  /* وضعیت فیلترها از آدرس صفحه خوانده می‌شود تا لینک‌ها قابل اشتراک باشند */
  const selCats = params.getAll('cat')
  const selBrands = params.getAll('brand')
  const selSellers = params.getAll('seller')
  /* ویژگی‌های دسته به شکل attr:<key>=<value> در آدرس ذخیره می‌شوند
     تا لینک فیلترشده قابل اشتراک بماند */
  const selAttrs: Record<string, string[]> = {}
  for (const [k, v] of params.entries()) {
    if (k.startsWith('attr:')) {
      const key = k.slice(5)
      ;(selAttrs[key] ??= []).push(v)
    }
  }
  const selModes = params.getAll('mode') as PricingMode[]
  const inStock = params.get('stock') === '1'
  const sort = (params.get('sort') ?? 'newest') as NonNullable<ProductQuery['sort']>
  const q = params.get('q') ?? ''
  const min = params.get('min') ?? ''
  const max = params.get('max') ?? ''
  const page = Number(params.get('page') ?? 1)

  const attrCount = Object.values(selAttrs).reduce((n, v) => n + v.length, 0)
  const activeCount =
    selCats.length + selBrands.length + selModes.length + selSellers.length + attrCount +
    (inStock ? 1 : 0) + (min || max ? 1 : 0)

  useEffect(() => {
    void Promise.all([api.categories(), api.brands(), api.sellers()]).then(([c, b, s]) => {
      setCategories(c)
      setBrands(b)
      setSellers(s.filter((x) => x.status === 'approved'))
    })
    void api.products({ perPage: 200 }).then((r) => setAllProducts(r.items))
  }, [])

  useEffect(() => {
    setLoading(true)
    void api
      .products({
        q: q || undefined,
        categoryIds: selCats.length ? selCats : undefined,
        brands: selBrands.length ? selBrands : undefined,
        sellerIds: selSellers.length ? selSellers : undefined,
        attributes: attrCount ? selAttrs : undefined,
        pricingModes: selModes.length ? selModes : undefined,
        inStockOnly: inStock || undefined,
        minPrice: min ? Number(toEn(min)) * 1_000_000 : undefined,
        maxPrice: max ? Number(toEn(max)) * 1_000_000 : undefined,
        sort,
        page,
        perPage: 12,
      })
      .then((res) => {
        setProducts(res.items)
        setTotal(res.total)
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const update = (fn: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params)
    fn(next)
    next.delete('page')
    setParams(next, { replace: true })
  }

  const toggleMulti = (key: string, value: string) =>
    update((p) => {
      const current = p.getAll(key)
      p.delete(key)
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
      next.forEach((v) => p.append(key, v))
    })

  const clearAll = () =>
    setParams(q ? new URLSearchParams({ q }) : new URLSearchParams(), { replace: true })

  const pageCount = Math.ceil(total / 12)

  /* وقتی دسته‌ای انتخاب شده، ویژگی‌های همان دسته به فیلترها اضافه می‌شوند */
  const activeCategories = categories.filter((c) => selCats.includes(c.id))

  /** مقادیر موجود یک ویژگی در محصولات همان دسته */
  const attributeValues = (categoryId: string, key: string) =>
    [...new Set(
      allProducts
        .filter((p) => p.categoryId === categoryId)
        .map((p) => p.attributes[key])
        .filter((v) => v != null && v !== '')
        .map(String),
    )].sort()

  const filterPanel = (
    <div className="space-y-5">
      <FilterGroup title="دسته‌بندی">
        {categories.map((c) => (
          <Checkbox
            key={c.id}
            label={c.name}
            count={c.productCount}
            checked={selCats.includes(c.id)}
            onChange={() => toggleMulti('cat', c.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="نحوه قیمت‌گذاری">
        {MODES.map((m) => (
          <Checkbox
            key={m}
            label={pricingModeLabel[m]}
            checked={selModes.includes(m)}
            onChange={() => toggleMulti('mode', m)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="محدوده قیمت" hint="میلیون تومان">
        <div className="flex items-center gap-2 px-2">
          <Input
            value={min}
            onChange={(e) => update((p) => (e.target.value ? p.set('min', e.target.value) : p.delete('min')))}
            placeholder="از"
            inputMode="numeric"
            className="h-9 text-[15px]"
          />
          <span className="text-steel-300">—</span>
          <Input
            value={max}
            onChange={(e) => update((p) => (e.target.value ? p.set('max', e.target.value) : p.delete('max')))}
            placeholder="تا"
            inputMode="numeric"
            className="h-9 text-[15px]"
          />
        </div>
      </FilterGroup>

      {/* ویژگی‌های دسته انتخاب‌شده — از تعریف همان دسته می‌آیند */}
      {activeCategories.map((cat) =>
        cat.attributes.filter((a) => a.filterable).map((attr) => {
          const values = attributeValues(cat.id, attr.key)
          if (values.length === 0) return null
          return (
            <FilterGroup key={`${cat.id}-${attr.key}`} title={attr.label} hint={attr.unit}>
              {values.map((v) => (
                <Checkbox
                  key={v}
                  label={v}
                  checked={(selAttrs[attr.key] ?? []).includes(v)}
                  onChange={() => toggleMulti(`attr:${attr.key}`, v)}
                />
              ))}
            </FilterGroup>
          )
        }),
      )}

      <FilterGroup title="فروشنده">
        <div className="max-h-56 overflow-y-auto">
          {sellers.map((s) => (
            <Checkbox
              key={s.id}
              label={s.name}
              count={s.productCount}
              checked={selSellers.includes(s.id)}
              onChange={() => toggleMulti('seller', s.id)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="برند">
        <div className="max-h-56 overflow-y-auto">
          {brands.map((b) => (
            <Checkbox key={b} label={b} checked={selBrands.includes(b)} onChange={() => toggleMulti('brand', b)} />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="موجودی">
        <Checkbox
          label="فقط کالاهای موجود"
          checked={inStock}
          onChange={() => update((p) => (inStock ? p.delete('stock') : p.set('stock', '1')))}
        />
      </FilterGroup>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-8">
      {/* مسیر و عنوان */}
      <nav className="mb-4 flex items-center gap-1.5 text-[14px] text-steel-400">
        <Link to="/" className="transition-colors hover:text-steel-700">خانه</Link>
        <span>/</span>
        <span className="font-medium text-steel-700">
          {selCats.length === 1 ? categories.find((c) => c.id === selCats[0])?.name : 'همه محصولات'}
        </span>
      </nav>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-steel-900 md:text-2xl">
            {q ? `نتایج جستجوی «${q}»` : selCats.length === 1
              ? categories.find((c) => c.id === selCats[0])?.name ?? 'محصولات'
              : 'همه محصولات'}
          </h1>
          <p className="num mt-1 text-[15px] text-steel-500">{toFa(total)} کالا یافت شد</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={14} />
            فیلترها
            {activeCount > 0 && <Badge tone="steel">{toFa(activeCount)}</Badge>}
          </Button>

          <Select
            value={sort}
            onChange={(e) => update((p) => p.set('sort', e.target.value))}
            className="h-9 w-40 text-[15px]"
            aria-label="مرتب‌سازی"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>

          <div className="hidden overflow-hidden rounded-xl border border-line sm:flex">
            {([['grid', <LayoutGrid size={15} key="g" />], ['row', <Rows3 size={15} key="r" />]] as const).map(([v, icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-label={v === 'grid' ? 'نمای شبکه‌ای' : 'نمای فهرستی'}
                aria-pressed={view === v}
                className={cn(
                  'flex h-9 w-9 items-center justify-center transition-colors',
                  view === v ? 'bg-steel-800 text-white' : 'bg-paper text-steel-500 hover:bg-steel-50',
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* تراشه‌های فیلتر فعال */}
      {activeCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          {selCats.map((id) => (
            <Chip key={id} onRemove={() => toggleMulti('cat', id)}>
              {categories.find((c) => c.id === id)?.name ?? id}
            </Chip>
          ))}
          {selModes.map((m) => (
            <Chip key={m} onRemove={() => toggleMulti('mode', m)}>{pricingModeLabel[m]}</Chip>
          ))}
          {selBrands.map((b) => (
            <Chip key={b} onRemove={() => toggleMulti('brand', b)}>{b}</Chip>
          ))}
          {selSellers.map((id) => (
            <Chip key={id} onRemove={() => toggleMulti('seller', id)}>
              {sellers.find((s) => s.id === id)?.name ?? id}
            </Chip>
          ))}
          {Object.entries(selAttrs).flatMap(([k, vs]) =>
            vs.map((v) => (
              <Chip key={`${k}-${v}`} onRemove={() => toggleMulti(`attr:${k}`, v)}>{v}</Chip>
            )),
          )}
          {inStock && <Chip onRemove={() => update((p) => p.delete('stock'))}>فقط موجود</Chip>}
          {(min || max) && (
            <Chip onRemove={() => update((p) => { p.delete('min'); p.delete('max') })}>
              {min && `از ${min}`} {max && `تا ${max}`} میلیون
            </Chip>
          )}
          <button onClick={clearAll} className="mr-1 text-[14px] font-semibold text-alert hover:underline">
            حذف همه فیلترها
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* ستون فیلتر */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-[18px] bg-paper p-6 shadow-plate">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-steel-900">فیلترها</h2>
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-[14px] text-alert hover:underline">پاک کردن</button>
              )}
            </div>
            {filterPanel}
          </div>
        </aside>

        {/* محصولات */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className={cn('grid gap-5', view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : '')}>
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <Empty
              icon={<PackageSearch size={20} />}
              title="کالایی با این مشخصات پیدا نشد"
              description="فیلترها را کمتر کنید یا عبارت جستجو را ساده‌تر بنویسید. اگر قطعه‌ای را در سایت پیدا نکردید، می‌توانید مستقیم استعلام ثبت کنید."
              action={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearAll}>حذف فیلترها</Button>
                  <Link to="/rfq"><Button>ثبت استعلام</Button></Link>
                </div>
              }
            />
          ) : (
            <div
              className={cn(
                'grid gap-5',
                view === 'grid' ? 'sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1',
              )}
            >
              {products.map((p) => <ProductCard key={p.id} product={p} layout={view} />)}
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-5 flex items-center justify-center gap-1.5">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = new URLSearchParams(params)
                    next.set('page', String(i + 1))
                    setParams(next)
                    window.scrollTo({ top: 0 })
                  }}
                  className={cn(
                    'num h-9 w-9 rounded-xl border text-[15px] font-semibold transition-colors',
                    page === i + 1
                      ? 'border-steel-800 bg-steel-800 text-white'
                      : 'border-line bg-paper text-steel-600 hover:border-steel-300',
                  )}
                >
                  {toFa(i + 1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* فیلتر موبایل */}
      {filtersOpen && (
        <div className="animate-fade fixed inset-0 z-100 bg-steel-950/50 lg:hidden" onClick={() => setFiltersOpen(false)}>
          <div
            className="animate-in-up absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-bold text-steel-900">فیلترها</h2>
              <button onClick={() => setFiltersOpen(false)} className="rounded p-1.5 text-steel-500 hover:bg-steel-100" aria-label="بستن">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
            <div className="flex gap-2 border-t border-line p-3">
              <Button variant="outline" className="flex-1" onClick={clearAll}>پاک کردن</Button>
              <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
                نمایش {toFa(total)} کالا
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterGroup({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-5 last:border-0 last:pb-0">
      <h3 className="mb-1.5 flex items-baseline gap-1.5 px-2 text-[14px] font-bold text-steel-800">
        {title}
        {hint && <span className="text-[13px] font-normal text-steel-400">({hint})</span>}
      </h3>
      {children}
    </div>
  )
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="flex items-center gap-1 rounded-3xl border border-line bg-paper px-2 py-1 text-[14px] font-medium text-steel-700 transition-colors hover:border-alert hover:text-alert"
    >
      {children}
      <X size={12} />
    </button>
  )
}
