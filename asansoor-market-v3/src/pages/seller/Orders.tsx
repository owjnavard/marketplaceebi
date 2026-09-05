import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Empty, Select } from '@/components/ui'
import { api } from '@/lib/api'
import type { Order, OrderStatus } from '@/lib/api/types'
import { orderStatusLabel, orderStatusTone } from '@/lib/labels'
import { toFa, toman } from '@/lib/utils'
import { useToasts } from '@/store'
import { SELLER_ID } from './Dashboard'

/* فروشنده وضعیت سفارش را از همین جدول جلو می‌برد. */
export default function SellerOrders() {
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const push = useToasts((s) => s.push)

  const load = () => {
    setLoading(true)
    void api.orders('seller').then((r) => {
      setRows(r.filter((o) => o.lines.some((l) => l.sellerId === SELLER_ID)))
      setLoading(false)
    })
  }

  useEffect(load, [])

  const changeStatus = async (id: string, status: OrderStatus) => {
    await api.setOrderStatus(id, status)
    push(`وضعیت سفارش به «${orderStatusLabel[status]}» تغییر کرد`)
    load()
  }

  const myTotal = (o: Order) =>
    o.lines.filter((l) => l.sellerId === SELLER_ID).reduce((s, l) => s + l.unitPrice * l.quantity, 0)

  const columns: Column<Order>[] = [
    {
      key: 'code', header: 'کد', value: (r) => r.code, sortable: true, width: '110px',
      cell: (r) => <span className="code text-[14px] font-bold text-steel-700">{r.code}</span>,
    },
    {
      key: 'buyer', header: 'خریدار', value: (r) => r.address.fullName,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-steel-900">{r.address.fullName || '—'}</p>
          <p className="num mt-0.5 text-[13px] text-steel-400">{r.address.city || r.address.province}</p>
        </div>
      ),
    },
    {
      key: 'items', header: 'اقلام شما', value: (r) => r.lines.length, secondary: true,
      cell: (r) => {
        const mine = r.lines.filter((l) => l.sellerId === SELLER_ID)
        return (
          <div className="min-w-0">
            <p className="truncate text-[14px] text-steel-700">{mine[0]?.name}</p>
            {mine.length > 1 && <p className="num text-[13px] text-steel-400">و {toFa(mine.length - 1)} قلم دیگر</p>}
          </div>
        )
      },
    },
    {
      key: 'total', header: 'سهم شما', value: (r) => myTotal(r), sortable: true, align: 'end',
      cell: (r) => <span className="num font-bold text-steel-900">{toman(myTotal(r))}</span>,
    },
    {
      key: 'status', header: 'وضعیت', align: 'end', value: (r) => r.status, width: '170px',
      cell: (r) =>
        r.status === 'cancelled' || r.status === 'delivered' ? (
          <Badge tone={orderStatusTone[r.status]}>{orderStatusLabel[r.status]}</Badge>
        ) : (
          <Select
            value={r.status}
            onChange={(e) => changeStatus(r.id, e.target.value as OrderStatus)}
            onClick={(e) => e.stopPropagation()}
            className="h-8 text-[14px]"
          >
            {(['pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map((s) => (
              <option key={s} value={s}>{orderStatusLabel[s]}</option>
            ))}
          </Select>
        ),
    },
  ]

  return (
    <>
      <PanelHead title="سفارش‌ها" description="سفارش‌هایی که شامل کالاهای شماست" />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="جستجو در کد سفارش یا نام خریدار…"
        empty={<Empty icon={<ShoppingBag size={20} />} title="هنوز سفارشی دریافت نکرده‌اید" />}
      />
    </>
  )
}
