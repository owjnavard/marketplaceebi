import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MapPin, Package, ShieldCheck } from 'lucide-react'
import { Badge, Button, Card, Input, SectionHead, Select, Spinner, Stars } from '@/components/ui'
import { api } from '@/lib/api'
import { PROVINCES } from '@/lib/api/seed'
import type { Seller, SellerGroup } from '@/lib/api/types'
import { sellerGroupLabel } from '@/lib/labels'
import { toFa } from '@/lib/utils'

export default function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [province, setProvince] = useState('')
  const [group, setGroup] = useState<SellerGroup | ''>('')

  useEffect(() => {
    void api.sellers().then((s) => {
      setSellers(s.filter((x) => x.status === 'approved'))
      setLoading(false)
    })
  }, [])

  const list = sellers.filter(
    (s) =>
      (!q || (s.name + s.legalName + s.about).includes(q)) &&
      (!province || s.province === province) &&
      (!group || s.group === group),
  )

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <SectionHead eyebrow="تأمین‌کنندگان" title="فروشندگان تأییدشده" />

      <div className="mb-5 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="نام فروشنده…"
          className="h-10 max-w-64"
        />
        <Select value={province} onChange={(e) => setProvince(e.target.value)} className="h-10 max-w-48">
          <option value="">همه استان‌ها</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Select value={group} onChange={(e) => setGroup(e.target.value as SellerGroup | '')} className="h-10 max-w-52">
          <option value="">همه گروه‌ها</option>
          {(Object.keys(sellerGroupLabel) as SellerGroup[]).map((g) => (
            <option key={g} value={g}>{sellerGroupLabel[g]}</option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <Card key={s.id} className="flex flex-col p-5 transition-colors hover:border-steel-300">
            <div className="mb-3 flex items-start gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                style={{ background: s.logoColor }}
              >
                {s.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <Link to={`/sellers/${s.id}`} className="flex items-center gap-1.5">
                  <span className="truncate font-bold text-steel-900 hover:text-signal-600">{s.name}</span>
                  {s.verified && <ShieldCheck size={14} className="shrink-0 text-verify" />}
                </Link>
                <p className="mt-0.5 flex items-center gap-1 text-[14px] text-steel-400">
                  <MapPin size={11} />
                  {s.province} — {s.city}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge tone="muted">{sellerGroupLabel[s.group]}</Badge>
                  {s.licensed && <Badge tone="verify">مجوزدار</Badge>}
                </div>
              </div>
            </div>

            <p className="mb-4 line-clamp-2 flex-1 text-[15px] leading-6 text-steel-500">{s.about}</p>

            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[14px] text-steel-500">
              <span className="flex items-center gap-1">
                <Stars value={s.rating} size={11} />
                <span className="num font-semibold text-steel-700">{toFa(s.rating)}</span>
              </span>
              <span className="num flex items-center gap-1"><Package size={11} />{toFa(s.productCount)} کالا</span>
              <span className="num flex items-center gap-1"><Clock size={11} />{toFa(s.responseHours)} ساعت پاسخ</span>
            </div>

            <Link to={`/sellers/${s.id}`}>
              <Button variant="outline" size="sm" className="w-full">مشاهده فروشگاه</Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="mt-8 flex flex-wrap items-center justify-between gap-4 border-signal-300 bg-signal-50 p-6">
        <div>
          <h2 className="text-lg font-extrabold text-steel-900">شما هم فروشنده هستید؟</h2>
          <p className="mt-1 max-w-xl text-[15px] leading-7 text-steel-600">
            محصولاتتان را ثبت کنید، به استعلام‌های پروژه‌ای پاسخ بدهید و فقط بابت فروش موفق
            کمیسیون بپردازید. تأیید مدارک معمولاً کمتر از دو روز کاری طول می‌کشد.
          </p>
        </div>
        <Link to="/login?role=seller">
          <Button variant="signal" size="lg">ثبت‌نام فروشندگان</Button>
        </Link>
      </Card>
    </div>
  )
}
