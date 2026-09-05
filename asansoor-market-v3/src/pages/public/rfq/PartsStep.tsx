import { useEffect, useMemo, useState } from 'react'
import {
  Percent, Plus, RotateCcw, Save, ShoppingCart, Trash2, X,
} from 'lucide-react'
import { Badge, Button, Card, Field, Input, Modal, Select, Stars } from '@/components/ui'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { api } from '@/lib/api'
import type { Product, Seller } from '@/lib/api/types'
import { canSeePartnerPrice, partnerMargin, partnerPrice } from '@/lib/partner'
import {
  buildParts, landingDoorLabel, machineRoomLabel, PART_GROUPS, SPEED_STEPS, systemLabel,
  type BuildSettings, type InquirySpec, type LandingDoorKind, type MachineRoom,
  type PartGroup, type PartLine, type Suspension, type SystemKind,
} from '@/features/rfq/inquiry'
import { cn, toEn, toFa, toman } from '@/lib/utils'
import { useAuth, useCart, useToasts } from '@/store'

const num = (v: string) => Number(toEn(v).replace(/[^\d.]/g, '')) || 0

export function PartsStep({
  spec, settings, setSettings, lines, setLines,
}: {
  spec: InquirySpec
  settings: BuildSettings
  setSettings: (u: (s: BuildSettings) => BuildSettings) => void
  lines: PartLine[]
  setLines: (u: (l: PartLine[]) => PartLine[]) => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [group, setGroup] = useState<PartGroup | 'all'>('all')
  const [picking, setPicking] = useState<PartLine | null>(null)
  const [showMargin, setShowMargin] = useState(false)

  const user = useAuth((s) => s.user)
  const add = useCart((s) => s.add)
  const push = useToasts((s) => s.push)

  const mySeller = sellers.find((s) => s.id === 's1') ?? null
  const partnerView = canSeePartnerPrice(user, mySeller)

  useEffect(() => {
    void Promise.all([api.products({ perPage: 100 }), api.sellers()]).then(([p, s]) => {
      setProducts(p.items)
      setSellers(s)
    })
  }, [])

  /* با تغییر تنظیمات، لیست دوباره ساخته می‌شود ولی انتخاب محصول و
     تعدادهای ویرایش‌شده کاربر تا حد امکان حفظ می‌شوند */
  const rebuild = () => {
    const fresh = buildParts(spec, settings)
    setLines((old) =>
      fresh.map((f) => {
        const prev = old.find((o) => o.title === f.title && !o.custom)
        return prev ? { ...f, quantity: prev.quantity, productId: prev.productId, selected: prev.selected } : f
      }).concat(old.filter((o) => o.custom)),
    )
  }

  useEffect(rebuild, [settings, spec.stops, spec.units, spec.capacityKg])

  const productOf = (id?: string) => products.find((p) => p.id === id)

  const lineUnitPrice = (l: PartLine): number | null => {
    const p = productOf(l.productId)
    if (!p || p.price == null) return null
    return partnerView ? (partnerPrice(p) ?? p.price) : p.price
  }

  const lineTotal = (l: PartLine) => {
    const u = lineUnitPrice(l)
    return u == null ? null : u * l.quantity
  }

  const visible = group === 'all' ? lines : lines.filter((l) => l.group === group)
  const selected = lines.filter((l) => l.selected)

  const total = selected.reduce((sum, l) => sum + (lineTotal(l) ?? 0), 0)
  const quoteCount = selected.filter((l) => lineTotal(l) == null).length
  const marginTotal = selected.reduce((sum, l) => {
    const p = productOf(l.productId)
    const m = p ? partnerMargin(p) : null
    return sum + (m ?? 0) * l.quantity
  }, 0)

  const setLine = (id: string, patch: Partial<PartLine>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const addCustom = () =>
    setLines((ls) => [
      ...ls,
      {
        id: `custom${ls.length + 1}`,
        group: group === 'all' ? 'mechanical' : group,
        title: '',
        detail: '',
        computedQty: 1,
        quantity: 1,
        unit: 'عدد',
        categoryId: 'c1',
        selected: true,
        custom: true,
      },
    ])

  const addToCart = () => {
    const withProduct = selected.filter((l) => l.productId && lineTotal(l) != null)
    if (!withProduct.length) {
      push('قلمی با محصول و قیمت مشخص انتخاب نشده است.', 'error')
      return
    }
    withProduct.forEach((l) => add(l.productId!, l.quantity))
    push(`${toFa(withProduct.length)} قلم به سبد خرید اضافه شد`)
  }

  const saveList = () => {
    try {
      localStorage.setItem('am.savedPartsList', JSON.stringify({ spec, settings, lines }))
      push('لیست قطعات ذخیره شد')
    } catch {
      push('ذخیره لیست انجام نشد.', 'error')
    }
  }

  const isPackage = settings.mode === 'package'

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      {/* ── تنظیمات ── */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-4 py-3 text-[14px] font-extrabold text-steel-900">
            تنظیمات
          </h2>

          <div className="space-y-4 p-4">
            <Field label="۱. نوع آسانسور" required group>
              <div className="grid grid-cols-2 gap-2">
                {([['package', 'پکیج'], ['custom', 'ترکیبی']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setSettings((s) => ({ ...s, mode: v }))}
                    className={cn(
                      'rounded-xl border py-2.5 text-[13px] font-bold transition-colors',
                      settings.mode === v
                        ? 'border-steel-800 bg-steel-800 text-white'
                        : 'border-line bg-paper text-steel-600 hover:border-steel-300',
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>

            {isPackage && (
              <p className="rounded-xl bg-signal-50 px-3.5 py-3 text-[12.5px] leading-6 text-steel-600">
                در حالت پکیج، بقیه تنظیمات غیرفعال است. بر اساس مشخصات آسانسور ثبت‌شده،
                پکیج مورد نظر را از فروشگاه انتخاب کنید.
              </p>
            )}

            <fieldset disabled={isPackage} className={cn('space-y-4', isPackage && 'opacity-40')}>
              <Field label="۲. نوع سیستم" required>
                <Select value={settings.system} onChange={(e) => setSettings((s) => ({ ...s, system: e.target.value as SystemKind }))}>
                  {(Object.keys(systemLabel) as SystemKind[]).map((k) => (
                    <option key={k} value={k}>{systemLabel[k]}</option>
                  ))}
                </Select>
              </Field>

              <Field label="۳. محل موتورخانه" required>
                <Select value={settings.machineRoom} onChange={(e) => setSettings((s) => ({ ...s, machineRoom: e.target.value as MachineRoom }))}>
                  {(Object.keys(machineRoomLabel) as MachineRoom[]).map((k) => (
                    <option key={k} value={k}>{machineRoomLabel[k]}</option>
                  ))}
                </Select>
              </Field>

              <Field label="۴. نوع درب طبقات" required>
                <Select value={settings.landingDoor} onChange={(e) => setSettings((s) => ({ ...s, landingDoor: e.target.value as LandingDoorKind }))}>
                  {(Object.keys(landingDoorLabel) as LandingDoorKind[]).map((k) => (
                    <option key={k} value={k}>{landingDoorLabel[k]}</option>
                  ))}
                </Select>
              </Field>

              <Field label="۵. سرعت آسانسور" hint="m/s" required group>
                <div className="flex flex-wrap gap-1.5">
                  {SPEED_STEPS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setSettings((s) => ({ ...s, speed: v }))}
                      className={cn(
                        'num rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors',
                        settings.speed === v
                          ? 'border-signal-500 bg-signal-400 text-steel-900'
                          : 'border-line bg-paper text-steel-600 hover:border-steel-300',
                      )}
                    >
                      {toFa(v)}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="۶. سیستم تعلیق" required group>
                <div className="grid grid-cols-4 gap-2">
                  {([1, 2, 4, 8] as Suspension[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setSettings((s) => ({ ...s, suspension: v }))}
                      className={cn(
                        'num rounded-xl border py-2 text-[12.5px] font-bold transition-colors',
                        settings.suspension === v
                          ? 'border-steel-800 bg-steel-800 text-white'
                          : 'border-line bg-paper text-steel-600 hover:border-steel-300',
                      )}
                    >
                      ۱:{toFa(v)}
                    </button>
                  ))}
                </div>
              </Field>

              {([['karaSling', '۷. سیستم کارا سلینگی'], ['cwtSafetyGear', '۸. کادر وزنه پاراشوت‌دار']] as const).map(
                ([key, label]) => (
                  <label
                    key={key}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors',
                      settings[key] ? 'border-steel-400 bg-steel-50' : 'border-line hover:border-steel-300',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <span className="text-[13px] font-semibold text-steel-700">{label}</span>
                  </label>
                ),
              )}
            </fieldset>
          </div>
        </Card>
      </aside>

      {/* ── لیست قطعات ── */}
      <div className="min-w-0 space-y-4">
        {/* فیلتر گروه */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setGroup('all')}
            className={cn(
              'rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
              group === 'all' ? 'border-steel-800 bg-steel-800 text-white' : 'border-line bg-paper text-steel-600 hover:border-steel-300',
            )}
          >
            همه
            <span className="num mr-1.5 opacity-70">{toFa(lines.length)}</span>
          </button>
          {PART_GROUPS.map((g) => {
            const n = lines.filter((l) => l.group === g.key).length
            if (!n) return null
            return (
              <button
                key={g.key}
                onClick={() => setGroup(g.key)}
                className={cn(
                  'rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
                  group === g.key ? 'border-steel-800 bg-steel-800 text-white' : 'border-line bg-paper text-steel-600 hover:border-steel-300',
                )}
              >
                {g.label}
                <span className="num mr-1.5 opacity-70">{toFa(n)}</span>
              </button>
            )
          })}
        </div>

        {/* نمایش قیمت همکاری */}
        {partnerView && (
          <Card className="flex flex-wrap items-center justify-between gap-3 border-verify/30 bg-verify-soft p-4">
            <div className="flex items-start gap-2.5">
              <Percent size={16} className="mt-0.5 shrink-0 text-verify" />
              <p className="text-[13px] leading-7 text-steel-700">
                شما فروشنده تأییدشده‌اید، پس قیمت‌ها با احتساب <span className="font-bold">تخفیف همکاری</span> نمایش داده می‌شوند.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-steel-700">
              <input type="checkbox" checked={showMargin} onChange={(e) => setShowMargin(e.target.checked)} className="h-4 w-4" />
              نمایش سود
            </label>
          </Card>
        )}

        {/* جدول */}
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="text-[14px] font-extrabold text-steel-900">
              لوازم اصلی
              <span className="num mr-2 text-[13px] font-normal text-steel-400">({toFa(visible.length)})</span>
            </h2>
            <Button size="sm" variant="outline" onClick={addCustom}>
              <Plus size={14} />
              سایر لوازم
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-right">
              <thead>
                <tr className="border-b border-line bg-steel-50 text-[12.5px] font-bold text-steel-500">
                  <th className="w-10 px-3 py-3"></th>
                  <th className="w-12 px-2 py-3">ردیف</th>
                  <th className="px-3 py-3">عنوان</th>
                  <th className="w-28 px-3 py-3">تعداد</th>
                  <th className="w-20 px-3 py-3">واحد</th>
                  <th className="w-44 px-3 py-3">انتخاب محصول</th>
                  <th className="w-32 px-3 py-3">قیمت</th>
                  <th className="w-32 px-3 py-3">قیمت کل</th>
                  <th className="w-10 px-2 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((l, i) => {
                  const p = productOf(l.productId)
                  const unit = lineUnitPrice(l)
                  const tot = lineTotal(l)
                  return (
                    <tr key={l.id} className={cn('border-b border-line last:border-0', !l.selected && 'opacity-45')}>
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={l.selected}
                          onChange={(e) => setLine(l.id, { selected: e.target.checked })}
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="num px-2 py-2.5 text-[13px] text-steel-400">{toFa(i + 1)}</td>
                      <td className="px-3 py-2.5">
                        {l.custom ? (
                          <Input
                            value={l.title}
                            onChange={(e) => setLine(l.id, { title: e.target.value })}
                            placeholder="عنوان قلم"
                            className="h-9"
                          />
                        ) : (
                          <>
                            <p className="text-[13.5px] font-bold text-steel-900">{l.title}</p>
                            <p className="text-[12px] text-steel-400">{l.detail}</p>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <Input
                            value={toFa(l.quantity)}
                            onChange={(e) => setLine(l.id, { quantity: Math.max(1, num(e.target.value)) })}
                            className="num h-9 w-16 text-center"
                            inputMode="numeric"
                          />
                          {l.quantity !== l.computedQty && !l.custom && (
                            <button
                              onClick={() => setLine(l.id, { quantity: l.computedQty })}
                              title={`بازگشت به مقدار محاسبه‌شده (${toFa(l.computedQty)})`}
                              className="rounded-lg p-1.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-800"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[13px] text-steel-600">{l.unit}</td>
                      <td className="px-3 py-2.5">
                        {p ? (
                          <button
                            onClick={() => setPicking(l)}
                            className="flex w-full items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-right transition-colors hover:border-steel-400"
                          >
                            <span className="h-7 w-7 shrink-0 text-steel-300">
                              <PartSchematic kind={schematicFor(p.categoryId)} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-steel-800">{p.name}</span>
                          </button>
                        ) : (
                          <Button size="sm" variant="outline" className="whitespace-nowrap" onClick={() => setPicking(l)}>انتخاب</Button>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {unit != null ? (
                          <div>
                            <span className="num text-[13px] font-bold text-steel-900">{toman(unit)}</span>
                            {partnerView && p?.partnerDiscount && (
                              <span className="block text-[11.5px] text-verify">
                                {toFa(p.partnerDiscount)}٪ تخفیف همکاری
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge tone="signal">استعلام</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {tot != null ? (
                          <div>
                            <span className="num text-[13.5px] font-extrabold text-steel-900">{toman(tot)}</span>
                            {showMargin && p && partnerMargin(p) != null && (
                              <span className="num block text-[11.5px] text-verify">
                                سود {toman((partnerMargin(p) ?? 0) * l.quantity)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[13px] text-steel-300">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5">
                        <button
                          onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}
                          className="rounded-lg p-1.5 text-steel-400 transition-colors hover:bg-alert-soft hover:text-alert"
                          aria-label="حذف ردیف"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* جمع و اقدام‌ها */}
        <Card className="p-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-steel-50 px-4 py-3">
              <p className="text-[12px] text-steel-400">اقلام انتخاب‌شده</p>
              <p className="num mt-0.5 text-[17px] font-extrabold text-steel-900">{toFa(selected.length)}</p>
            </div>
            <div className="rounded-xl bg-steel-50 px-4 py-3">
              <p className="text-[12px] text-steel-400">نیازمند استعلام</p>
              <p className="num mt-0.5 text-[17px] font-extrabold text-signal-700">{toFa(quoteCount)}</p>
            </div>
            <div className="rounded-xl bg-steel-800 px-4 py-3">
              <p className="text-[12px] text-steel-400">جمع قابل محاسبه</p>
              <p className="num mt-0.5 text-[17px] font-extrabold text-white">{toman(total)}</p>
            </div>
          </div>

          {showMargin && partnerView && marginTotal > 0 && (
            <p className="mb-4 rounded-xl bg-verify-soft px-4 py-3 text-[13px] text-verify">
              سود تخمینی شما از این لیست: <span className="num font-extrabold">{toman(marginTotal)}</span> تومان
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="signal" onClick={addToCart}>
              <ShoppingCart size={16} />
              افزودن به سبد خرید
            </Button>
            <Button variant="outline" onClick={saveList}>
              <Save size={15} />
              ذخیره لیست
            </Button>
          </div>
        </Card>
      </div>

      {picking && (
        <ProductPicker
          line={picking}
          products={products}
          partnerView={partnerView}
          onClose={() => setPicking(null)}
          onPick={(id) => {
            setLine(picking.id, { productId: id })
            setPicking(null)
          }}
        />
      )}
    </div>
  )
}

/* ── انتخاب محصول از فروشگاه ────────────────────────────────── */
function ProductPicker({
  line, products, partnerView, onClose, onPick,
}: {
  line: PartLine
  products: Product[]
  partnerView: boolean
  onClose: () => void
  onPick: (id: string) => void
}) {
  const [q, setQ] = useState('')
  const matches = useMemo(
    () =>
      products
        .filter((p) => p.categoryId === line.categoryId || q)
        .filter((p) => !q || (p.name + p.partNumber + p.brand).includes(q))
        .sort((a, b) => b.rating - a.rating),
    [products, line.categoryId, q],
  )

  return (
    <Modal open onClose={onClose} title="انتخاب محصول" subtitle={line.title} size="lg">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در همه محصولات…" className="mb-4" />

      {line.productId && (
        <Button variant="ghost" className="mb-3" onClick={() => onPick('')}>
          <X size={14} />
          حذف انتخاب فعلی
        </Button>
      )}

      <div className="space-y-2">
        {matches.length === 0 && (
          <p className="py-8 text-center text-[13.5px] text-steel-500">
            محصولی در این دسته پیدا نشد. این قلم را بدون محصول بگذارید تا استعلام گرفته شود.
          </p>
        )}
        {matches.map((p) => {
          const shown = partnerView ? (partnerPrice(p) ?? p.price) : p.price
          return (
            <button
              key={p.id}
              onClick={() => onPick(p.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-right transition-colors hover:border-steel-400 hover:bg-steel-50',
                line.productId === p.id ? 'border-steel-800 bg-steel-50' : 'border-line',
              )}
            >
              <span className="h-11 w-11 shrink-0 text-steel-300">
                <PartSchematic kind={schematicFor(p.categoryId)} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-steel-900">{p.name}</p>
                <p className="mt-0.5 text-[12px] text-steel-400">
                  <span className="code">{p.partNumber}</span> — {p.brand}
                </p>
                <Stars value={p.rating} size={11} />
              </div>
              <div className="shrink-0 text-left">
                {shown != null ? (
                  <>
                    <span className="num text-[13.5px] font-extrabold text-steel-900">{toman(shown)}</span>
                    {partnerView && p.partnerDiscount && (
                      <span className="block text-[11.5px] text-verify">{toFa(p.partnerDiscount)}٪ همکاری</span>
                    )}
                  </>
                ) : (
                  <Badge tone="signal">استعلامی</Badge>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
