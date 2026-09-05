import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, CreditCard, MapPin, ShieldCheck } from 'lucide-react'
import { Button, Card, Field, Input, Select, Spinner, Textarea } from '@/components/ui'
import { api } from '@/lib/api'
import { PROVINCES } from '@/lib/api/seed'
import type { Address, Order, Product } from '@/lib/api/types'
import { cn, toEn, toFa, toman } from '@/lib/utils'
import { unitPriceFor, useAuth, useCart, useToasts } from '@/store'

type Errors = Partial<Record<keyof Address, string>>

export default function Checkout() {
  const { lines, clear } = useCart()
  const user = useAuth((s) => s.user)
  const push = useToasts((s) => s.push)
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState<Order | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [payment, setPayment] = useState<'gateway' | 'transfer'>('gateway')
  const [note, setNote] = useState('')

  const [address, setAddress] = useState<Address>({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    province: 'تهران',
    city: '',
    line: '',
    postalCode: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login?next=/checkout', { replace: true })
      return
    }
    void Promise.all(lines.map((l) => api.product(l.productId))).then((list) => {
      setProducts(list.filter(Boolean) as Product[])
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <Spinner />

  /* ── تأییدیه سفارش ────────────────────────────────────────── */
  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card className="p-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verify-soft text-verify">
            <CheckCircle2 size={28} />
          </span>
          <h1 className="text-xl font-extrabold text-steel-900">سفارش شما ثبت شد</h1>
          <p className="mt-2 text-[15px] leading-7 text-steel-500">
            کد پیگیری سفارش <span className="code font-bold text-steel-900">{placed.code}</span> است.
            وضعیت آماده‌سازی و ارسال را از پنل خریدار دنبال کنید.
          </p>
          <dl className="mt-5 divide-y divide-line rounded-xl border border-line text-right text-[15px]">
            <Row label="مبلغ پرداختی" value={`${toman(placed.total)} تومان`} />
            <Row label="تعداد اقلام" value={`${toFa(placed.lines.length)} قلم`} />
            <Row label="گیرنده" value={placed.address.fullName} />
          </dl>
          <div className="mt-6 flex gap-2">
            <Link to={`/panel/orders/${placed.id}`} className="flex-1">
              <Button variant="signal" className="w-full">پیگیری سفارش</Button>
            </Link>
            <Link to="/products" className="flex-1">
              <Button variant="outline" className="w-full">ادامه خرید</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const rows = lines
    .map((l) => {
      const product = products.find((p) => p.id === l.productId)
      if (!product) return null
      const unit = unitPriceFor(product, l.quantity)
      return unit == null ? null : { product, quantity: l.quantity, unit }
    })
    .filter(Boolean) as { product: Product; quantity: number; unit: number }[]

  const subtotal = rows.reduce((s, r) => s + r.unit * r.quantity, 0)
  const shipping = 2_400_000
  const total = subtotal + shipping

  const validate = (): boolean => {
    const e: Errors = {}
    if (address.fullName.trim().length < 3) e.fullName = 'نام و نام خانوادگی گیرنده را کامل بنویسید.'
    if (toEn(address.phone).replace(/\D/g, '').length !== 11) e.phone = 'شماره موبایل باید ۱۱ رقم باشد.'
    if (!address.city.trim()) e.city = 'نام شهر را وارد کنید.'
    if (address.line.trim().length < 10) e.line = 'نشانی را کامل‌تر بنویسید تا ارسال بدون مشکل انجام شود.'
    if (toEn(address.postalCode).replace(/\D/g, '').length !== 10) e.postalCode = 'کد پستی باید ۱۰ رقم باشد.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) {
      push('چند فیلد نیاز به اصلاح دارد.', 'error')
      return
    }
    setBusy(true)
    try {
      const order = await api.placeOrder({
        buyerId: user!.id,
        lines: rows.map((r) => ({
          productId: r.product.id,
          name: r.product.name,
          partNumber: r.product.partNumber,
          sellerId: r.product.sellerId,
          unitPrice: r.unit,
          quantity: r.quantity,
        })),
        subtotal,
        shipping,
        commission: Math.round(subtotal * 0.07),
        total,
        address,
      })
      clear()
      setPlaced(order)
    } catch {
      push('ثبت سفارش انجام نشد. دوباره تلاش کنید.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress((a) => ({ ...a, [key]: e.target.value }))
    setErrors((x) => ({ ...x, [key]: undefined }))
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <h1 className="mb-5 text-xl font-extrabold text-steel-900 md:text-2xl">تسویه حساب</h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* آدرس */}
          <Card>
            <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">
              <MapPin size={16} className="text-steel-400" />
              نشانی تحویل
            </h2>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <Field label="نام و نام خانوادگی گیرنده" required error={errors.fullName}>
                <Input value={address.fullName} onChange={set('fullName')} invalid={!!errors.fullName} />
              </Field>
              <Field label="شماره موبایل" required error={errors.phone}>
                <Input value={address.phone} onChange={set('phone')} invalid={!!errors.phone} inputMode="tel" placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
              </Field>
              <Field label="استان" required>
                <Select value={address.province} onChange={set('province')}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </Field>
              <Field label="شهر" required error={errors.city}>
                <Input value={address.city} onChange={set('city')} invalid={!!errors.city} />
              </Field>
              <Field label="نشانی کامل" required error={errors.line} className="sm:col-span-2">
                <Textarea
                  value={address.line}
                  onChange={(e) => {
                    setAddress((a) => ({ ...a, line: e.target.value }))
                    setErrors((x) => ({ ...x, line: undefined }))
                  }}
                  placeholder="خیابان، کوچه، پلاک، واحد"
                />
              </Field>
              <Field label="کد پستی" required error={errors.postalCode}>
                <Input value={address.postalCode} onChange={set('postalCode')} invalid={!!errors.postalCode} inputMode="numeric" />
              </Field>
            </div>
          </Card>

          {/* پرداخت */}
          <Card>
            <h2 className="flex items-center gap-2 border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">
              <CreditCard size={16} className="text-steel-400" />
              روش پرداخت
            </h2>
            <div className="space-y-2 p-4">
              {([
                { key: 'gateway', title: 'درگاه پرداخت اینترنتی', desc: 'پرداخت آنی با کارت بانکی؛ سفارش بلافاصله به فروشنده اعلام می‌شود.' },
                { key: 'transfer', title: 'واریز به حساب و ارسال فیش', desc: 'برای سفارش‌های سنگین. تأیید مالی تا یک روز کاری طول می‌کشد.' },
              ] as const).map((m) => (
                <label
                  key={m.key}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors',
                    payment === m.key ? 'border-steel-800 bg-steel-50' : 'border-line hover:border-steel-300',
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === m.key}
                    onChange={() => setPayment(m.key)}
                    className="mt-1 h-4 w-4 accent-steel-800"
                  />
                  <div>
                    <p className="text-[15px] font-bold text-steel-900">{m.title}</p>
                    <p className="mt-0.5 text-[14px] leading-6 text-steel-500">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <Field label="یادداشت برای فروشنده" hint="اختیاری">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثلاً زمان مناسب تحویل یا نکته‌ای درباره دسترسی پروژه" />
            </Field>
          </Card>
        </div>

        {/* خلاصه */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">خلاصه سفارش</h2>
            <ul className="max-h-64 divide-y divide-line overflow-y-auto">
              {rows.map((r) => (
                <li key={r.product.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-steel-800">{r.product.name}</p>
                    <p className="num text-[13px] text-steel-400">{toFa(r.quantity)} × {toman(r.unit)}</p>
                  </div>
                  <span className="num shrink-0 text-[14px] font-bold text-steel-900">
                    {toman(r.unit * r.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2.5 border-t border-line p-4 text-[15px]">
              <div className="flex justify-between"><dt className="text-steel-500">جمع کالاها</dt><dd className="num font-semibold">{toman(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-steel-500">ارسال</dt><dd className="num font-semibold">{toman(shipping)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-bold text-steel-900">قابل پرداخت</dt>
                <dd className="num text-lg font-extrabold text-steel-900">{toman(total)}</dd>
              </div>
            </dl>
            <div className="border-t border-line p-4">
              <Button variant="signal" size="lg" className="w-full" loading={busy} onClick={submit}>
                ثبت و پرداخت سفارش
              </Button>
              <p className="mt-3 flex items-start gap-1.5 text-[13px] leading-5 text-steel-400">
                <ShieldCheck size={13} className="mt-0.5 shrink-0 text-verify" />
                مبلغ نزد مارکت‌پلیس می‌ماند و پس از تأیید تحویل به فروشنده پرداخت می‌شود.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-2">
      <dt className="text-steel-500">{label}</dt>
      <dd className="num font-semibold text-steel-900">{value}</dd>
    </div>
  )
}
