import { useEffect, useState } from 'react'
import { Percent, TrendingUp, Wallet } from 'lucide-react'
import { BarChart, DataTable, StatCard, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Card, Field, Input, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Order, Seller } from '@/lib/api/types'
import { shortToman, toEn, toFa, toman } from '@/lib/utils'
import { useToasts } from '@/store'

/* درآمد مارکت‌پلیس = کمیسیون هر سفارش. نرخ پایه سراسری است و برای
   هر فروشنده قابل بازنویسی. */
export default function AdminCommission() {
  const [orders, setOrders] = useState<Order[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [baseRate, setBaseRate] = useState('۷')
  const push = useToasts((s) => s.push)

  useEffect(() => {
    void Promise.all([api.orders('admin'), api.sellers()]).then(([o, s]) => {
      setOrders(o)
      setSellers(s)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const valid = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
  const gmv = valid.reduce((s, o) => s + o.total, 0)
  const earned = valid.reduce((s, o) => s + o.commission, 0)
  const settled = valid.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.commission, 0)

  const perSeller = sellers.map((seller) => {
    const lines = valid.flatMap((o) => o.lines.filter((l) => l.sellerId === seller.id))
    const volume = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)
    return {
      id: seller.id,
      seller,
      volume,
      commission: Math.round((volume * seller.commissionRate) / 100),
      orders: valid.filter((o) => o.lines.some((l) => l.sellerId === seller.id)).length,
    }
  })

  const columns: Column<(typeof perSeller)[number]>[] = [
    {
      key: 'seller', header: 'فروشنده', value: (r) => r.seller.name,
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-3xl text-[14px] font-extrabold text-white" style={{ background: r.seller.logoColor }}>
            {r.seller.name.charAt(0)}
          </span>
          <span className="truncate font-semibold text-steel-900">{r.seller.name}</span>
        </div>
      ),
    },
    { key: 'orders', header: 'سفارش', value: (r) => r.orders, sortable: true, secondary: true, cell: (r) => <span className="num text-steel-700">{toFa(r.orders)}</span> },
    { key: 'volume', header: 'حجم فروش', value: (r) => r.volume, sortable: true, align: 'end', cell: (r) => <span className="num font-semibold text-steel-800">{toman(r.volume)}</span> },
    { key: 'rate', header: 'نرخ', value: (r) => r.seller.commissionRate, sortable: true, align: 'end', secondary: true, cell: (r) => <Badge tone="muted">{toFa(r.seller.commissionRate)}٪</Badge> },
    { key: 'commission', header: 'کمیسیون', value: (r) => r.commission, sortable: true, align: 'end', cell: (r) => <span className="num font-extrabold text-verify">{toman(r.commission)}</span> },
  ]

  return (
    <>
      <PanelHead title="کمیسیون و درآمد" description="سهم مارکت‌پلیس از معاملات انجام‌شده" />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="ارزش کل معاملات" value={shortToman(gmv)} unit="تومان" icon={<TrendingUp size={15} />} />
        <StatCard label="کمیسیون محاسبه‌شده" value={shortToman(earned)} unit="تومان" icon={<Percent size={15} />} tone="signal" />
        <StatCard label="کمیسیون تسویه‌شده" value={shortToman(settled)} unit="تومان" icon={<Wallet size={15} />} tone="verify" />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-4 text-[15px] font-bold text-steel-900">روند درآمد کمیسیون</h2>
          <BarChart
            data={[
              { label: 'تیر', value: 86 }, { label: 'مرداد', value: 110 }, { label: 'شهریور', value: 99 },
              { label: 'مهر', value: 137 }, { label: 'آبان', value: 126 }, { label: 'آذر', value: 163 },
            ]}
          />
          <p className="num mt-3 text-[13px] text-steel-400">اعداد به میلیون تومان</p>
        </Card>

        <Card>
          <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">نرخ پایه کمیسیون</h2>
          <div className="space-y-3 p-4">
            <Field label="نرخ پیش‌فرض" hint="درصد از مبلغ کالا">
              <Input value={baseRate} onChange={(e) => setBaseRate(e.target.value)} inputMode="numeric" className="num" />
            </Field>
            <p className="text-[14px] leading-6 text-steel-500">
              این نرخ برای فروشندگان جدید اعمال می‌شود. نرخ اختصاصی هر فروشنده در همان صفحه
              فروشنده قابل تغییر است و بر نرخ پایه اولویت دارد.
            </p>
            <Button
              variant="signal"
              className="w-full"
              onClick={() => {
                const n = Number(toEn(baseRate).replace(/\D/g, ''))
                if (!n || n > 30) {
                  push('نرخ باید عددی بین ۱ تا ۳۰ باشد.', 'error')
                  return
                }
                push(`نرخ پایه کمیسیون روی ${toFa(n)}٪ تنظیم شد`)
              }}
            >
              ذخیره نرخ
            </Button>
          </div>
        </Card>
      </div>

      <h2 className="mb-3 text-[16px] font-extrabold text-steel-900">کمیسیون به تفکیک فروشنده</h2>
      <DataTable rows={perSeller} columns={columns} searchPlaceholder="جستجوی فروشنده…" perPage={8} />
    </>
  )
}
