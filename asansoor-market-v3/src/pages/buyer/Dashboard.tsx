import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Heart, MessageSquareQuote, ShoppingBag, Wallet } from 'lucide-react'
import { StatCard } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Card, Empty, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Inquiry, Order } from '@/lib/api/types'
import { inquiryStatusLabel, inquiryStatusTone, orderStatusLabel, orderStatusTone } from '@/lib/labels'
import { shortToman, toFa } from '@/lib/utils'
import { useLists } from '@/store'

export default function BuyerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const favCount = useLists((s) => s.favorites.length)

  useEffect(() => {
    void Promise.all([api.orders('buyer'), api.inquiries('buyer')]).then(([o, i]) => {
      setOrders(o)
      setInquiries(i)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const spend = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const openInquiries = inquiries.filter((i) => i.status === 'open' || i.status === 'answered')
  const newOffers = inquiries.reduce((n, i) => n + i.offers.filter((o) => o.status === 'submitted').length, 0)

  return (
    <>
      <PanelHead title="نمای کلی" description="خلاصه سفارش‌ها، استعلام‌ها و پیشنهادهای دریافتی" />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="سفارش‌های ثبت‌شده" value={toFa(orders.length)} unit="سفارش" icon={<ShoppingBag size={15} />} />
        <StatCard label="استعلام‌های باز" value={toFa(openInquiries.length)} unit="مورد" icon={<MessageSquareQuote size={15} />} tone="signal" />
        <StatCard label="پیشنهاد در انتظار بررسی" value={toFa(newOffers)} unit="پیشنهاد" icon={<Wallet size={15} />} tone="verify" />
        <StatCard label="کالاهای ذخیره‌شده" value={toFa(favCount)} unit="کالا" icon={<Heart size={15} />} />
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-paper p-4">
        <p className="text-[14px] text-steel-500">مجموع خرید شما تا امروز</p>
        <p className="num mt-1 text-2xl font-extrabold text-steel-900">
          {shortToman(spend)}
          <span className="mr-1.5 text-[14px] font-normal text-steel-400">تومان</span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelList
          title="آخرین استعلام‌ها"
          href="/panel/inquiries"
          empty="هنوز استعلامی ثبت نکرده‌اید."
          rows={inquiries.slice(0, 4).map((i) => ({
            id: i.id,
            to: `/panel/inquiries/${i.id}`,
            title: i.title,
            meta: `${i.code} — ${toFa(i.offers.length)} پیشنهاد`,
            badge: <Badge tone={inquiryStatusTone[i.status]}>{inquiryStatusLabel[i.status]}</Badge>,
          }))}
        />
        <PanelList
          title="آخرین سفارش‌ها"
          href="/panel/orders"
          empty="هنوز سفارشی ثبت نکرده‌اید."
          rows={orders.slice(0, 4).map((o) => ({
            id: o.id,
            to: `/panel/orders/${o.id}`,
            title: o.lines[0]?.name ?? o.code,
            meta: `${o.code} — ${toFa(o.lines.length)} قلم`,
            badge: <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>,
          }))}
        />
      </div>
    </>
  )
}

export function PanelList({
  title, href, rows, empty,
}: {
  title: string
  href: string
  empty: string
  rows: { id: string; to: string; title: string; meta: string; badge: React.ReactNode }[]
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="text-[15px] font-bold text-steel-900">{title}</h2>
        <Link to={href} className="flex items-center gap-0.5 text-[14px] font-semibold text-steel-500 hover:text-signal-600">
          همه
          <ChevronLeft size={14} />
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="p-4"><Empty title={empty} /></div>
      ) : (
        <div className="divide-y divide-line">
          {rows.map((r) => (
            <Link key={r.id} to={r.to} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-steel-50">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-steel-800">{r.title}</p>
                <p className="num mt-0.5 text-[13px] text-steel-400">{r.meta}</p>
              </div>
              {r.badge}
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
