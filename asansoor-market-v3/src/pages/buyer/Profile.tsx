import { useState } from 'react'
import { PanelHead } from '@/layouts/PanelLayout'
import { Button, Card, Field, Input, Select } from '@/components/ui'
import { PROVINCES } from '@/lib/api/seed'
import type { Address } from '@/lib/api/types'
import { toEn } from '@/lib/utils'
import { useAuth, useToasts } from '@/store'

export default function Profile() {
  const user = useAuth((s) => s.user)!
  const signIn = useAuth((s) => s.signIn)
  const push = useToasts((s) => s.push)

  const [name, setName] = useState(user.name)
  const [company, setCompany] = useState(user.company ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [address, setAddress] = useState<Address>({
    fullName: user.name,
    phone: user.phone,
    province: 'تهران',
    city: '',
    line: '',
    postalCode: '',
  })

  const saveProfile = () => {
    const e: Record<string, string> = {}
    if (name.trim().length < 3) e.name = 'نام را کامل بنویسید.'
    if (email && !email.includes('@')) e.email = 'قالب ایمیل درست نیست.'
    setErrors(e)
    if (Object.keys(e).length) return

    setBusy(true)
    setTimeout(() => {
      signIn({ ...user, name: name.trim(), company: company.trim() || undefined, email: email.trim() || undefined })
      push('اطلاعات پروفایل ذخیره شد')
      setBusy(false)
    }, 300)
  }

  const saveAddress = () => {
    const e: Record<string, string> = {}
    if (!address.city.trim()) e.city = 'شهر را وارد کنید.'
    if (address.line.trim().length < 10) e.line = 'نشانی را کامل‌تر بنویسید.'
    if (address.postalCode && toEn(address.postalCode).replace(/\D/g, '').length !== 10) {
      e.postalCode = 'کد پستی ۱۰ رقم است.'
    }
    setErrors(e)
    if (Object.keys(e).length) return
    push('نشانی پیش‌فرض ذخیره شد')
  }

  return (
    <>
      <PanelHead title="پروفایل و آدرس" description="اطلاعاتی که هنگام ثبت سفارش و استعلام استفاده می‌شود" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">اطلاعات حساب</h2>
          <div className="space-y-4 p-4">
            <Field label="نام و نام خانوادگی" required error={errors.name}>
              <Input value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} />
            </Field>
            <Field label="شماره موبایل" hint="قابل تغییر نیست">
              <Input value={user.phone} disabled className="num" />
            </Field>
            <Field label="نام شرکت یا مجموعه" hint="اختیاری">
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="مثلاً ساختمانی آرین" />
            </Field>
            <Field label="ایمیل" hint="برای دریافت فاکتور" error={errors.email}>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr" invalid={!!errors.email} />
            </Field>
            <Button variant="signal" loading={busy} onClick={saveProfile}>ذخیره تغییرات</Button>
          </div>
        </Card>

        <Card>
          <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">نشانی پیش‌فرض</h2>
          <div className="space-y-4 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="استان">
                <Select value={address.province} onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}>
                  {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                </Select>
              </Field>
              <Field label="شهر" required error={errors.city}>
                <Input value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} invalid={!!errors.city} />
              </Field>
            </div>
            <Field label="نشانی کامل" required error={errors.line}>
              <Input value={address.line} onChange={(e) => setAddress((a) => ({ ...a, line: e.target.value }))} placeholder="خیابان، کوچه، پلاک، واحد" invalid={!!errors.line} />
            </Field>
            <Field label="کد پستی" error={errors.postalCode}>
              <Input value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} inputMode="numeric" className="num" invalid={!!errors.postalCode} />
            </Field>
            <Button variant="outline" onClick={saveAddress}>ذخیره نشانی</Button>
          </div>
        </Card>
      </div>
    </>
  )
}
