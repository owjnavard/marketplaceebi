import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Empty } from '@/components/ui'
import { api } from '@/lib/api'
import type { Order } from '@/lib/api/types'
import { orderStatusLabel, orderStatusTone } from '@/lib/labels'
import { toFa, toman } from '@/lib/utils'

export default function BuyerOrders() {
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    void api.orders('buyer').then((r) => {
      setRows(r)
      setLoading(false)
    })
  }, [])

  const columns: Column<Order>[] = [
    {
      key: 'code', header: 'کد سفارش', value: (r) => r.code, sortable: true, width: '120px',
      cell: (r) => <span className="code text-[14px] font-bold text-steel-700">{r.code}</span>,
    },
    {
      key: 'items', header: 'اقلام', value: (r) => r.lines.map((l) => l.name).join(' '),
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-steel-900">{r.lines[0]?.name}</p>
          {r.lines.length > 1 && (
            <p className="num mt-0.5 text-[13px] text-steel-400">و {toFa(r.lines.length - 1)} قلم دیگر</p>
          )}
        </div>
      ),
    },
    {
      key: 'total', header: 'مبلغ', value: (r) => r.total, sortable: true, align: 'end',
      cell: (r) => <span className="num font-bold text-steel-900">{toman(r.total)}</span>,
    },
    {
      key: 'date', header: 'تاریخ', value: (r) => r.createdAt, sortable: true, secondary: true,
      cell: (r) => <span className="num text-[14px] text-steel-500">{r.createdAt}</span>,
    },
    {
      key: 'status', header: 'وضعیت', align: 'end', value: (r) => r.status,
      cell: (r) => <Badge tone={orderStatusTone[r.status]}>{orderStatusLabel[r.status]}</Badge>,
    },
  ]

  return (
    <>
      <PanelHead title="سفارش‌ها" description="پیگیری وضعیت سفارش‌های ثبت‌شده" />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="جستجو در کد سفارش یا نام کالا…"
        onRowClick={(r) => navigate(`/panel/orders/${r.id}`)}
        empty={
          <Empty
            icon={<ShoppingBag size={20} />}
            title="هنوز سفارشی ثبت نکرده‌اید"
            action={<Link to="/products"><Button>مشاهده کاتالوگ</Button></Link>}
          />
        }
      />
    </>
  )
}
