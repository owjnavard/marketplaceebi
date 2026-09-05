import { useEffect, useState } from 'react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Select } from '@/components/ui'
import { api } from '@/lib/api'
import type { Order, OrderStatus } from '@/lib/api/types'
import { orderStatusLabel } from '@/lib/labels'
import { toFa, toman } from '@/lib/utils'
import { useToasts } from '@/store'

export default function AdminOrders() {
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const push = useToasts((s) => s.push)

  const load = () => {
    setLoading(true)
    void api.orders('admin').then((r) => {
      setRows(r)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const change = async (id: string, status: OrderStatus) => {
    await api.setOrderStatus(id, status)
    push(`وضعیت سفارش به «${orderStatusLabel[status]}» تغییر کرد`)
    load()
  }

  const columns: Column<Order>[] = [
    { key: 'code', header: 'کد', value: (r) => r.code, sortable: true, width: '110px', cell: (r) => <span className="code text-[14px] font-bold text-steel-700">{r.code}</span> },
    {
      key: 'buyer', header: 'خریدار', value: (r) => r.address.fullName,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-steel-900">{r.address.fullName || '—'}</p>
          <p className="num text-[13px] text-steel-400">{toFa(r.lines.length)} قلم</p>
        </div>
      ),
    },
    { key: 'total', header: 'مبلغ', value: (r) => r.total, sortable: true, align: 'end', cell: (r) => <span className="num font-bold text-steel-900">{toman(r.total)}</span> },
    { key: 'commission', header: 'کمیسیون', value: (r) => r.commission, sortable: true, align: 'end', secondary: true, cell: (r) => <span className="num font-semibold text-verify">{toman(r.commission)}</span> },
    { key: 'date', header: 'تاریخ', value: (r) => r.createdAt, sortable: true, secondary: true, cell: (r) => <span className="num text-[14px] text-steel-500">{r.createdAt}</span> },
    {
      key: 'status', header: 'وضعیت', align: 'end', value: (r) => r.status, width: '170px',
      cell: (r) => (
        <Select value={r.status} onChange={(e) => change(r.id, e.target.value as OrderStatus)} className="h-8 text-[14px]">
          {(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => (
            <option key={s} value={s}>{orderStatusLabel[s]}</option>
          ))}
        </Select>
      ),
    },
  ]

  return (
    <>
      <PanelHead title="سفارش‌ها" description="همه سفارش‌های ثبت‌شده در مارکت‌پلیس" />
      <DataTable rows={rows} columns={columns} loading={loading} searchPlaceholder="جستجو در کد سفارش یا نام خریدار…" />
    </>
  )
}
