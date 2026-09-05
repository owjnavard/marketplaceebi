import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Card, Field, Input, Select, Spinner, Textarea } from '@/components/ui'
import { api } from '@/lib/api'
import { PROVINCES } from '@/lib/api/seed'
import type { Seller, SellerGroup } from '@/lib/api/types'
import { sellerGroupLabel, sellerStatusLabel, sellerStatusTone } from '@/lib/labels'
import { toFa } from '@/lib/utils'
import { useToasts } from '@/store'
import { SELLER_ID } from './Dashboard'

export default function SellerSettings() {
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const push = useToasts((s) => s.push)

  useEffect(() => {
    void api.seller(SELLER_ID).then((s) => {
      setSeller(s)
      setLoading(false)
    })
  }, [])

  if (loading || !seller) return <Spinner />

  const set = <K extends keyof Seller>(k: K, v: Seller[K]) => setSeller((s) => (s ? { ...s, [k]: v } : s))

  const save = () => {
    const e: Record<string, string> = {}
    if (seller.name.trim().length < 2) e.name = 'نام فروشگاه را وارد کنید.'
    if (seller.legalName.trim().length < 3) e.legalName = 'نام حقوقی را کامل بنویسید.'
    if (seller.about.trim().length < 20) e.about = 'معرفی فروشگاه حداقل ۲۰ نویسه باشد.'
    setErrors(e)
    if (Object.keys(e).length) {
      push('چند فیلد نیاز به اصلاح دارد.', 'error')
      return
    }
    setBusy(true)
    setTimeout(() => {
      push('اطلاعات فروشگاه ذخیره شد')
      setBusy(false)
    }, 350)
  }

  return (
    <>
      <PanelHead
        title="اطلاعات فروشگاه"
        description="این اطلاعات در صفحه عمومی فروشگاه شما نمایش داده می‌شود"
        action={<Badge tone={sellerStatusTone[seller.status]}>{sellerStatusLabel[seller.status]}</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <Card>
          <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">مشخصات عمومی</h2>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label="نام فروشگاه" required error={errors.name}>
              <Input value={seller.name} onChange={(e) => set('name', e.target.value)} invalid={!!errors.name} />
            </Field>
            <Field label="نام حقوقی / ثبتی" required error={errors.legalName}>
              <Input value={seller.legalName} onChange={(e) => set('legalName', e.target.value)} invalid={!!errors.legalName} />
            </Field>
            <Field label="استان">
              <Select value={seller.province} onChange={(e) => set('province', e.target.value)}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="شهر">
              <Input value={seller.city} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="گروه فعالیت" required>
              <Select value={seller.group} onChange={(e) => set('group', e.target.value as SellerGroup)}>
                {(Object.keys(sellerGroupLabel) as SellerGroup[]).map((g) => (
                  <option key={g} value={g}>{sellerGroupLabel[g]}</option>
                ))}
              </Select>
            </Field>
            <Field label="مجوز رسمی" hint="در فیلتر «مجوزدار» دیده می‌شوید">
              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-line px-4">
                <input
                  type="checkbox"
                  checked={seller.licensed}
                  onChange={(e) => set('licensed', e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-[14px] text-steel-700">دارای مجوز رسمی هستم</span>
              </label>
            </Field>
            <Field label="تلفن تماس" className="sm:col-span-2">
              <Input value={seller.phone} onChange={(e) => set('phone', e.target.value)} className="num" />
            </Field>
            <Field label="معرفی فروشگاه" required error={errors.about} className="sm:col-span-2">
              <Textarea value={seller.about} onChange={(e) => set('about', e.target.value)} className="min-h-28" invalid={!!errors.about} />
            </Field>
          </div>
          <div className="border-t border-line p-4">
            <Button variant="signal" loading={busy} onClick={save}>ذخیره تغییرات</Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-4 py-2.5 text-[15px] font-bold text-steel-900">وضعیت همکاری</h2>
            <dl className="divide-y divide-line text-[14px]">
              {[
                { l: 'نرخ کمیسیون', v: `${toFa(seller.commissionRate)}٪` },
                { l: 'عضویت از', v: seller.memberSince },
                { l: 'امتیاز', v: `${toFa(seller.rating)} از ۵` },
                { l: 'کالاهای فعال', v: toFa(seller.productCount) },
              ].map((r) => (
                <div key={r.l} className="flex items-baseline justify-between px-4 py-2">
                  <dt className="text-steel-500">{r.l}</dt>
                  <dd className="num font-bold text-steel-900">{r.v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck size={16} className={seller.verified ? 'text-verify' : 'text-steel-300'} />
              <p className="text-[15px] font-bold text-steel-900">
                {seller.verified ? 'هویت احراز شده' : 'احراز هویت انجام نشده'}
              </p>
            </div>
            <p className="text-[14px] leading-6 text-steel-500">
              {seller.verified
                ? 'نشان احراز روی همه کالاهای شما نمایش داده می‌شود و نرخ پذیرش پیشنهادهایتان را بالا می‌برد.'
                : 'با ارسال مدارک ثبتی، نشان احراز بگیرید. خریدارها به فروشندگان احرازشده بیشتر اعتماد می‌کنند.'}
            </p>
            {!seller.verified && (
              <Button variant="outline" size="sm" className="mt-3 w-full">ارسال مدارک</Button>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
