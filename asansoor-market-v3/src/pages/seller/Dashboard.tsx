import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareQuote, Plus, ShoppingBag, Star, TrendingUp } from 'lucide-react'
import { BarChart, StatCard } from '@/components/DataTable'
import { PanelList } from '@/pages/buyer/Dashboard'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Card, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Inquiry, Order, Product, Seller } from '@/lib/api/types'
import { inquiryStatusLabel, inquiryStatusTone, orderStatusLabel, orderStatusTone, productStatusLabel, productStatusTone } from '@/lib/labels'
import { shortToman, toFa } from '@/lib/utils'

const SELLER_ID = 's1' // در حالت دمو، فروشنده جاری ثابت است

export default function SellerDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [seller, setSeller] = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void Promise.all([
      api.sellerProducts(SELLER_ID),
      api.orders('seller'),
      api.inquiries('seller'),
      api.seller(SELLER_ID),
    ]).then(([p, o, i, s]) => {
      setProducts(p)
      setOrders(o)
      setInquiries(i)
      setSeller(s)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const mine = orders.filter((o) => o.lines.some((l) => l.sellerId === SELLER_ID))
  const revenue = mine.reduce(
    (sum, o) => sum + o.lines.filter((l) => l.sellerId === SELLER_ID).reduce((s, l) => s + l.unitPrice * l.quantity, 0),
    0,
  )
  const unanswered = inquiries.filter((i) => !i.offers.some((o) => o.sellerId === SELLER_ID) && i.status !== 'accepted')
  const pending = products.filter((p) => p.status === 'pending')

  return (
    <>
      <PanelHead
        title="نمای کلی"
        description={seller ? `${seller.name} — کمیسیون ${toFa(seller.commissionRate)}٪` : undefined}
        action={<Link to="/seller/products/new"><Button variant="signal"><Plus size={15} />افزودن محصول</Button></Link>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="فروش این ماه" value={shortToman(revenue)} unit="تومان" change={{ value: '۱۲٪', up: true }} icon={<TrendingUp size={15} />} tone="verify" />
        <StatCard label="سفارش‌های فعال" value={toFa(mine.filter((o) => o.status !== 'delivered').length)} unit="سفارش" icon={<ShoppingBag size={15} />} />
        <StatCard label="استعلام بی‌پاسخ" value={toFa(unanswered.length)} unit="مورد" icon={<MessageSquareQuote size={15} />} tone="signal" />
        <StatCard label="امتیاز فروشگاه" value={toFa(seller?.rating ?? 0)} unit="از ۵" icon={<Star size={15} />} />
      </div>

      {unanswered.length > 0 && (
        <Card className="mb-5 flex flex-wrap items-center justify-between gap-3 border-signal-300 bg-signal-50 p-4">
          <div>
            <p className="text-[15px] font-bold text-steel-900">
              <span className="num">{toFa(unanswered.length)}</span> استعلام منتظر پیشنهاد شماست
            </p>
            <p className="mt-0.5 text-[14px] text-steel-600">
              پاسخ سریع‌تر، شانس پذیرفته شدن پیشنهاد را محسوس بالا می‌برد.
            </p>
          </div>
          <Link to="/seller/inquiries"><Button variant="signal" size="sm">پاسخ به استعلام‌ها</Button></Link>
        </Card>
      )}

      {pending.length > 0 && (
        <Card className="mb-5 p-4">
          <p className="text-[15px] text-steel-600">
            <span className="num font-bold text-steel-900">{toFa(pending.length)}</span> محصول شما در انتظار تأیید مدیر است و
            هنوز در کاتالوگ نمایش داده نمی‌شود.
          </p>
        </Card>
      )}

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-bold text-steel-900">فروش شش ماه گذشته</h2>
          <BarChart
            data={[
              { label: 'تیر', value: 92 }, { label: 'مرداد', value: 118 }, { label: 'شهریور', value: 104 },
              { label: 'مهر', value: 146 }, { label: 'آبان', value: 132 }, { label: 'آذر', value: 168 },
            ]}
          />
          <p className="num mt-3 text-[13px] text-steel-400">اعداد به میلیون تومان</p>
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-[15px] font-bold text-steel-900">وضعیت محصولات</h2>
          <div className="space-y-2">
            {(['approved', 'pending', 'rejected', 'draft'] as const).map((s) => {
              const n = products.filter((p) => p.status === s).length
              return (
                <div key={s} className="flex items-center justify-between rounded-3xl border border-line px-3 py-2">
                  <Badge tone={productStatusTone[s]}>{productStatusLabel[s]}</Badge>
                  <span className="num text-[15px] font-extrabold text-steel-900">{toFa(n)}</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelList
          title="آخرین سفارش‌ها"
          href="/seller/orders"
          empty="هنوز سفارشی دریافت نکرده‌اید."
          rows={mine.slice(0, 4).map((o) => ({
            id: o.id,
            to: '/seller/orders',
            title: o.lines[0]?.name ?? o.code,
            meta: `${o.code} — ${toFa(o.lines.length)} قلم`,
            badge: <Badge tone={orderStatusTone[o.status]}>{orderStatusLabel[o.status]}</Badge>,
          }))}
        />
        <PanelList
          title="استعلام‌های اخیر"
          href="/seller/inquiries"
          empty="استعلام جدیدی نیست."
          rows={inquiries.slice(0, 4).map((i) => ({
            id: i.id,
            to: '/seller/inquiries',
            title: i.title,
            meta: `${i.code} — ${toFa(i.lines.length)} قلم`,
            badge: <Badge tone={inquiryStatusTone[i.status]}>{inquiryStatusLabel[i.status]}</Badge>,
          }))}
        />
      </div>
    </>
  )
}

export { SELLER_ID }
