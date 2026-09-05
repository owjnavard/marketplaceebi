import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Percent, Plus, Trash2 } from 'lucide-react'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Card, Checkbox, Field, Input, Select, Spinner, Textarea } from '@/components/ui'
import { api } from '@/lib/api'
import type { Category, PriceTier, PricingMode, Product, ProductSpec, StockState } from '@/lib/api/types'
import { pricingModeLabel, stockLabel } from '@/lib/labels'
import { cn, slugify, toEn, toFa } from '@/lib/utils'
import { useToasts } from '@/store'
import { SELLER_ID } from './Dashboard'

/* ══════════════════════════════════════════════════════════════
   فرم محصول

   فیلدهای ویژگی از تعریف دسته‌بندی خوانده می‌شوند، پس وقتی مدیر
   دسته جدیدی با ویژگی‌های تازه می‌سازد، این فرم بدون تغییر کد
   آن‌ها را نشان می‌دهد.
   ══════════════════════════════════════════════════════════════ */

const EMPTY: Product = {
  id: '', slug: '', name: '', brand: '', sellerId: SELLER_ID, categoryId: 'c1',
  partNumber: '', shortDescription: '', description: '', images: [],
  pricingMode: 'fixed', price: null, minOrderQty: 1, partnerDiscount: 0,
  stockState: 'in_stock', stockQty: 1,
  specs: [], attributes: {},
  rating: 0, reviewCount: 0, soldCount: 0,
  status: 'pending', isService: false, createdAt: '',
}

export default function ProductForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const push = useToasts((s) => s.push)

  const [form, setForm] = useState<Product>(EMPTY)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    void Promise.all([api.categories(), isNew ? Promise.resolve(null) : api.product(id!)]).then(
      ([cats, product]) => {
        setCategories(cats)
        if (product) setForm(product)
        setLoading(false)
      },
    )
  }, [id, isNew])

  if (loading) return <Spinner />

  const category = categories.find((c) => c.id === form.categoryId)
  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  /* ── مشخصات فنی ─────────────────────────────────────────── */
  const setSpec = (i: number, patch: Partial<ProductSpec>) =>
    set('specs', form.specs.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  const addSpec = () =>
    set('specs', [...form.specs, { key: `s${form.specs.length + 1}`, label: '', value: '', highlight: form.specs.length < 3 }])

  const removeSpec = (i: number) => set('specs', form.specs.filter((_, j) => j !== i))

  /* ── پله‌های قیمت ────────────────────────────────────────── */
  const tiers = form.tiers ?? []
  const setTier = (i: number, patch: Partial<PriceTier>) =>
    set('tiers', tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)))
  const addTier = () =>
    set('tiers', [...tiers, { minQty: (tiers.at(-1)?.maxQty ?? 0) + 1, price: form.price }])
  const removeTier = (i: number) => set('tiers', tiers.filter((_, j) => j !== i))

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 5) e.name = 'نام محصول را کامل‌تر بنویسید.'
    if (!form.partNumber.trim()) e.partNumber = 'کد فنی الزامی است.'
    if (!form.brand.trim()) e.brand = 'برند را وارد کنید.'
    if (form.shortDescription.trim().length < 15) e.shortDescription = 'توضیح کوتاه حداقل ۱۵ نویسه باشد.'
    if (form.pricingMode === 'fixed' && (!form.price || form.price <= 0)) {
      e.price = 'برای حالت «قیمت مشخص» باید قیمت وارد شود.'
    }
    if (form.pricingMode === 'tiered' && tiers.length < 2) {
      e.tiers = 'قیمت پلکانی حداقل دو پله لازم دارد.'
    }
    for (const a of category?.attributes ?? []) {
      if (a.required && !form.attributes[a.key]) e[`attr_${a.key}`] = `«${a.label}» الزامی است.`
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async (asDraft = false) => {
    if (!asDraft && !validate()) {
      push('چند فیلد نیاز به اصلاح دارد.', 'error')
      return
    }
    setBusy(true)
    try {
      await api.saveProduct({
        ...form,
        slug: form.slug || slugify(form.partNumber || form.name),
        status: asDraft ? 'draft' : 'pending',
        createdAt: form.createdAt || 'همین حالا',
      })
      push(asDraft ? 'پیش‌نویس ذخیره شد' : isNew ? 'محصول ثبت شد و برای تأیید ارسال شد' : 'تغییرات ذخیره شد')
      navigate('/seller/products')
    } catch {
      push('ذخیره انجام نشد. دوباره تلاش کنید.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const num = (v: string) => (v ? Number(toEn(v).replace(/\D/g, '')) : 0)

  return (
    <>
      <Link to="/seller/products" className="mb-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-steel-500 transition-colors hover:text-steel-900">
        <ArrowRight size={15} />
        محصولات من
      </Link>

      <PanelHead
        title={isNew ? 'افزودن محصول' : 'ویرایش محصول'}
        description="پس از ثبت، محصول برای تأیید مدیر ارسال می‌شود و سپس در کاتالوگ منتشر می‌گردد."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-4">
          {/* پایه */}
          <Card>
            <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">اطلاعات پایه</h2>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field label="نام محصول" required error={errors.name} className="sm:col-span-2">
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} invalid={!!errors.name} placeholder="مثلاً: موتور کشش گیرلس ۶۳۰ کیلوگرم" />
              </Field>
              <Field label="کد فنی / پارت‌نامبر" required error={errors.partNumber}>
                <Input value={form.partNumber} onChange={(e) => set('partNumber', e.target.value)} dir="ltr" className="code" invalid={!!errors.partNumber} placeholder="MNT-WYJ-630" />
              </Field>
              <Field label="برند" required error={errors.brand}>
                <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} invalid={!!errors.brand} />
              </Field>
              <Field label="دسته‌بندی" required>
                <Select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="نوع" required>
                <Select
                  value={form.isService ? 'service' : 'product'}
                  onChange={(e) => set('isService', e.target.value === 'service')}
                >
                  <option value="product">کالا</option>
                  <option value="service">خدمت</option>
                </Select>
              </Field>
              <Field label="توضیح کوتاه" required error={errors.shortDescription} hint="در کارت محصول دیده می‌شود" className="sm:col-span-2">
                <Input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} invalid={!!errors.shortDescription} />
              </Field>
              <Field label="توضیح کامل" className="sm:col-span-2">
                <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="min-h-32" />
              </Field>
            </div>
          </Card>

          {/* قیمت */}
          <Card>
            <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">قیمت‌گذاری</h2>
            <div className="space-y-4 p-4">
              <Field label="نحوه قیمت‌گذاری" required group>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(['fixed', 'quote', 'tiered'] as PricingMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        set('pricingMode', m)
                        if (m === 'quote') set('price', null)
                        if (m === 'tiered' && tiers.length === 0) {
                          set('tiers', [
                            { minQty: 1, maxQty: 9, price: form.price ?? 0 },
                            { minQty: 10, price: null },
                          ])
                        }
                      }}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-[14px] font-semibold transition-colors',
                        form.pricingMode === m
                          ? 'border-steel-800 bg-steel-800 text-white'
                          : 'border-line bg-paper text-steel-600 hover:border-steel-300',
                      )}
                    >
                      {pricingModeLabel[m]}
                    </button>
                  ))}
                </div>
              </Field>

              <p className="rounded-3xl bg-steel-50 px-3 py-2 text-[14px] leading-6 text-steel-600">
                {form.pricingMode === 'fixed' && 'قیمت ثابت نمایش داده می‌شود و خریدار مستقیم به سبد اضافه می‌کند.'}
                {form.pricingMode === 'quote' && 'به‌جای قیمت، دکمه «درخواست قیمت» نمایش داده می‌شود. مناسب کالاهای سفارشی.'}
                {form.pricingMode === 'tiered' && 'قیمت بر اساس تعداد پله‌بندی می‌شود. پله‌ای که قیمت نداشته باشد، به استعلام می‌رود.'}
              </p>

              {/* تخفیف همکاری — فقط فروشندگان تأییدشده آن را می‌بینند */}
              <div className="rounded-2xl border border-verify/30 bg-verify-soft p-4">
                <div className="mb-3 flex items-start gap-2.5">
                  <Percent size={16} className="mt-0.5 shrink-0 text-verify" />
                  <div>
                    <p className="text-[14px] font-bold text-steel-900">قیمت همکاری</p>
                    <p className="mt-1 text-[12.5px] leading-6 text-steel-600">
                      درصد تخفیفی که برای سایر فروشندگان تأییدشده اعمال می‌شود. خریدار عادی
                      نه این درصد را می‌بیند نه قیمت حاصل از آن. اگر کالا قیمت مشخص نداشته
                      باشد، فروشنده می‌تواند استعلام با احتساب همین تخفیف ثبت کند.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="درصد تخفیف همکاری" hint="۰ تا ۵۰">
                    <Input
                      value={toFa(form.partnerDiscount ?? 0)}
                      onChange={(e) => set('partnerDiscount', Math.min(50, num(e.target.value)))}
                      inputMode="numeric"
                      className="num"
                    />
                  </Field>
                  {form.price != null && form.price > 0 && (form.partnerDiscount ?? 0) > 0 && (
                    <div className="rounded-xl bg-paper px-4 py-3">
                      <p className="text-[12px] text-steel-400">قیمت همکاری حاصل</p>
                      <p className="num mt-0.5 text-[16px] font-extrabold text-verify">
                        {toFa(Math.round(form.price * (1 - (form.partnerDiscount ?? 0) / 100)).toLocaleString('en-US'))}
                        <span className="mr-1.5 text-[11.5px] font-normal text-steel-400">تومان</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {form.pricingMode !== 'quote' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="قیمت پایه" hint="تومان" required={form.pricingMode === 'fixed'} error={errors.price}>
                    <Input
                      value={form.price ? toFa(form.price.toLocaleString('en-US')) : ''}
                      onChange={(e) => set('price', num(e.target.value) || null)}
                      inputMode="numeric"
                      className="num"
                      invalid={!!errors.price}
                    />
                  </Field>
                  <Field label="قیمت پیش از تخفیف" hint="اختیاری">
                    <Input
                      value={form.compareAtPrice ? toFa(form.compareAtPrice.toLocaleString('en-US')) : ''}
                      onChange={(e) => set('compareAtPrice', num(e.target.value) || null)}
                      inputMode="numeric"
                      className="num"
                    />
                  </Field>
                  <Field label="حداقل سفارش" hint="عدد">
                    <Input
                      value={toFa(form.minOrderQty)}
                      onChange={(e) => set('minOrderQty', Math.max(1, num(e.target.value)))}
                      inputMode="numeric"
                      className="num"
                    />
                  </Field>
                </div>
              )}

              {form.pricingMode === 'tiered' && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[14px] font-bold text-steel-700">پله‌های قیمت</p>
                    <Button size="sm" variant="outline" onClick={addTier}><Plus size={13} />پله جدید</Button>
                  </div>
                  {errors.tiers && <p className="mb-2 text-[14px] font-medium text-alert">{errors.tiers}</p>}
                  <div className="space-y-2">
                    {tiers.map((t, i) => (
                      <div key={i} className="flex flex-wrap items-end gap-2 rounded-xl border border-line p-2.5">
                        <Field label="از تعداد" className="w-24">
                          <Input value={toFa(t.minQty)} onChange={(e) => setTier(i, { minQty: num(e.target.value) })} inputMode="numeric" className="num h-9" />
                        </Field>
                        <Field label="تا تعداد" hint="خالی = بی‌نهایت" className="w-32">
                          <Input
                            value={t.maxQty ? toFa(t.maxQty) : ''}
                            onChange={(e) => setTier(i, { maxQty: num(e.target.value) || undefined })}
                            inputMode="numeric"
                            className="num h-9"
                          />
                        </Field>
                        <Field label="قیمت واحد" hint="خالی = استعلامی" className="min-w-40 flex-1">
                          <Input
                            value={t.price ? toFa(t.price.toLocaleString('en-US')) : ''}
                            onChange={(e) => setTier(i, { price: num(e.target.value) || null })}
                            inputMode="numeric"
                            className="num h-9"
                            placeholder="استعلامی"
                          />
                        </Field>
                        <button
                          onClick={() => removeTier(i)}
                          className="mb-1 rounded-3xl p-2 text-steel-400 transition-colors hover:bg-alert-soft hover:text-alert"
                          aria-label="حذف پله"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ویژگی‌های دسته */}
          {category && category.attributes.length > 0 && (
            <Card>
              <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">
                ویژگی‌های «{category.name}»
                <Badge tone="muted">برای فیلتر کردن استفاده می‌شود</Badge>
              </h2>
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                {category.attributes.map((a) => (
                  <Field key={a.key} label={a.label} hint={a.unit} required={a.required} error={errors[`attr_${a.key}`]}>
                    {a.type === 'select' ? (
                      <Select
                        value={String(form.attributes[a.key] ?? '')}
                        onChange={(e) => set('attributes', { ...form.attributes, [a.key]: e.target.value })}
                      >
                        <option value="">انتخاب کنید…</option>
                        {a.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    ) : a.type === 'boolean' ? (
                      <Checkbox
                        label="دارد"
                        checked={!!form.attributes[a.key]}
                        onChange={(e) => set('attributes', { ...form.attributes, [a.key]: e.target.checked })}
                      />
                    ) : (
                      <Input
                        value={String(form.attributes[a.key] ?? '')}
                        onChange={(e) =>
                          set('attributes', {
                            ...form.attributes,
                            [a.key]: a.type === 'number' ? num(e.target.value) : e.target.value,
                          })
                        }
                        inputMode={a.type === 'number' ? 'numeric' : 'text'}
                        invalid={!!errors[`attr_${a.key}`]}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </Card>
          )}

          {/* مشخصات فنی */}
          <Card>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-[15px] font-bold text-steel-900">جدول مشخصات فنی</h2>
              <Button size="sm" variant="outline" onClick={addSpec}><Plus size={13} />ردیف جدید</Button>
            </div>
            <div className="space-y-2 p-4">
              {form.specs.length === 0 && (
                <p className="py-4 text-center text-[14px] text-steel-400">
                  هنوز مشخصه‌ای اضافه نکرده‌اید. سه ردیف اول در کارت محصول نمایش داده می‌شود.
                </p>
              )}
              {form.specs.map((s, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2.5">
                  <Input value={s.label} onChange={(e) => setSpec(i, { label: e.target.value })} placeholder="عنوان (مثلاً توان)" className="h-9 min-w-32 flex-1" />
                  <Input value={s.value} onChange={(e) => setSpec(i, { value: e.target.value })} placeholder="مقدار" className="h-9 min-w-24 flex-1" />
                  <Input value={s.unit ?? ''} onChange={(e) => setSpec(i, { unit: e.target.value })} placeholder="واحد" className="h-9 w-20" />
                  <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-[14px] text-steel-600">
                    <input type="checkbox" checked={!!s.highlight} onChange={(e) => setSpec(i, { highlight: e.target.checked })} className="h-4 w-4 accent-steel-800" />
                    شاخص
                  </label>
                  <button onClick={() => removeSpec(i)} className="rounded-3xl p-1.5 text-steel-400 transition-colors hover:bg-alert-soft hover:text-alert" aria-label="حذف ردیف">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* کنار: موجودی و ذخیره */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card>
            <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">موجودی</h2>
            <div className="space-y-4 p-4">
              <Field label="وضعیت موجودی" required>
                <Select value={form.stockState} onChange={(e) => set('stockState', e.target.value as StockState)}>
                  {(['in_stock', 'low', 'out', 'on_order'] as StockState[]).map((s) => (
                    <option key={s} value={s}>{stockLabel[s]}</option>
                  ))}
                </Select>
              </Field>
              <Field label="تعداد موجود">
                <Input value={toFa(form.stockQty)} onChange={(e) => set('stockQty', num(e.target.value))} inputMode="numeric" className="num" />
              </Field>
              <Field label="زمان تأمین" hint="روز — برای کالای سفارشی">
                <Input
                  value={form.leadTimeDays ? toFa(form.leadTimeDays) : ''}
                  onChange={(e) => set('leadTimeDays', num(e.target.value) || undefined)}
                  inputMode="numeric"
                  className="num"
                />
              </Field>
              <Field label="لینک دیتاشیت" hint="اختیاری">
                <Input value={form.datasheetUrl ?? ''} onChange={(e) => set('datasheetUrl', e.target.value)} dir="ltr" placeholder="https://…" />
              </Field>
            </div>
          </Card>

          <Card className="space-y-2 p-4">
            <Button variant="signal" size="lg" className="w-full" loading={busy} onClick={() => save(false)}>
              {isNew ? 'ثبت و ارسال برای تأیید' : 'ذخیره تغییرات'}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => save(true)}>ذخیره پیش‌نویس</Button>
            <Link to="/seller/products" className="block pt-1 text-center text-[14px] text-steel-500 hover:text-steel-900">
              انصراف
            </Link>
          </Card>
        </aside>
      </div>
    </>
  )
}
