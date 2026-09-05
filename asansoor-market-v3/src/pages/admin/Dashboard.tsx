import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Boxes, ClipboardList, Percent, ShoppingBag, Users } from 'lucide-react'
import { BarChart, StatCard } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Card, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Inquiry, Order, Product, Seller } from '@/lib/api/types'
import { orderStatusLabel, orderStatusTone } from '@/lib/labels'
import { shortToman, toFa, toman } from '@/lib/utils'

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void Promise.all([api.allProducts(), api.sellers(), api.orders('admin'), api.inquiries('admin')]).then(
      ([p, s, o, i]) => {
        setProducts(p)
        setSellers(s)
        setOrders(o)
        setInquiries(i)
        setLoading(false)
      },
    )
  }, [])

  if (loading) return <Spinner />

  const gmv = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const commission = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.commission, 0)
  const pendingProducts = products.filter((p) => p.status === 'pending')
  const pendingSellers = sellers.filter((s) => s.status === 'pending')

  const queue = [
    { count: pendingSellers.length, label: 'فروشنده در انتظار تأیید', href: '/admin/sellers', icon: <BadgeCheck size={15} /> },
    { count: pendingProducts.length, label: 'محصول در انتظار تأیید', href: '/admin/products', icon: <Boxes size={15} /> },
    { count: inquiries.filter((i) => i.status === 'open').length, label: 'استعلام بدون پیشنهاد', href: '/admin/inquiries', icon: <ClipboardList size={15} /> },
  ].filter((q) => q.count > 0)

  return (
    <>
      <PanelHead title="نمای کلی" description="وضعیت کلی مارکت‌پلیس و کارهای در انتظار رسیدگی" />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="ارزش کل معاملات" value={shortToman(gmv)} unit="تومان" change={{ value: '۱۸٪', up: true }} icon={<ShoppingBag size={15} />} />
        <StatCard label="درآمد کمیسیون" value={shortToman(commission)} unit="تومان" change={{ value: '۹٪', up: true }} icon={<Percent size={15} />} tone="verify" />
        <StatCard label="فروشندگان فعال" value={toFa(sellers.filter((s) => s.status === 'approved').length)} unit="فروشنده" icon={<Users size={15} />} />
        <StatCard label="کالاهای منتشرشده" value={toFa(products.filter((p) => p.status === 'approved').length)} unit="کالا" icon={<Boxes size={15} />} />
      </div>

      {queue.length > 0 && (
        <Card className="mb-5 overflow-hidden border-signal-300">
          <h2 className="border-b border-signal-300 bg-signal-50 px-4 py-2.5 text-[15px] font-bold text-steel-900">
            در انتظار رسیدگی شما
          </h2>
          <div className="divide-y divide-line">
            {queue.map((q) => (
              <Link key={q.href} to={q.href} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-steel-50">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-signal-100 text-signal-700">
                  {q.icon}
                </span>
                <p className="flex-1 text-[15px] text-steel-700">
                  <span className="num font-extrabold text-steel-900">{toFa(q.count)}</span> {q.label}
                </p>
                <Button size="sm" variant="outline">رسیدگی</Button>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-bold text-steel-900">ارزش معاملات شش ماه گذشته</h2>
          <BarChart
            data={[
              { label: 'تیر', value: 1240 }, { label: 'مرداد', value: 1580 }, { label: 'شهریور', value: 1420 },
              { label: 'مهر', value: 1960 }, { label: 'آبان', value: 1810 }, { label: 'آذر', value: 2340 },
            ]}
          />
          <p className="num mt-3 text-[13px] text-steel-400">اعداد به میلیون تومان</p>
        </Card>

        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">آخرین سفارش‌ها</h2>
          <div className="divide-y divide-line">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center gap-2 px-4 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="code text-[13px] font-bold text-steel-700">{o.code}</p>
                  <p className="num mt-0.5 text-[14px] text-steel-500">{toman(o.total)}</p>
                </div>
                <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
