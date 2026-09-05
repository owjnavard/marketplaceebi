import { useEffect, useState } from 'react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge } from '@/components/ui'
import { api } from '@/lib/api'
import type { Inquiry } from '@/lib/api/types'
import { inquiryStatusLabel, inquiryStatusTone } from '@/lib/labels'
import { toFa, toman } from '@/lib/utils'

export default function AdminInquiries() {
  const [rows, setRows] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void api.inquiries('admin').then((r) => {
      setRows(r)
      setLoading(false)
    })
  }, [])

  const columns: Column<Inquiry>[] = [
    { key: 'code', header: 'کد', value: (r) => r.code, sortable: true, width: '130px', cell: (r) => <span className="code text-[14px] font-bold text-steel-700">{r.code}</span> },
    {
      key: 'title', header: 'عنوان', value: (r) => r.title, sortable: true,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-steel-900">{r.title}</p>
          <p className="num mt-0.5 text-[13px] text-steel-400">{toFa(r.lines.length)} قلم — {r.kind === 'project' ? 'پروژه‌ای' : 'تک‌کالا'}</p>
        </div>
      ),
    },
    {
      key: 'offers', header: 'پیشنهادها', value: (r) => r.offers.length, sortable: true, secondary: true,
      cell: (r) =>
        r.offers.length ? (
          <div>
            <span className="num font-bold text-steel-900">{toFa(r.offers.length)}</span>
            <span className="num mr-1.5 text-[13px] text-steel-400">از {toman(Math.min(...r.offers.map((o) => o.total)))}</span>
          </div>
        ) : (
          <span className="text-[14px] text-steel-400">بدون پیشنهاد</span>
        ),
    },
    { key: 'date', header: 'ثبت', value: (r) => r.createdAt, sortable: true, secondary: true, cell: (r) => <span className="num text-[14px] text-steel-500">{r.createdAt}</span> },
    { key: 'status', header: 'وضعیت', align: 'end', value: (r) => r.status, cell: (r) => <Badge tone={inquiryStatusTone[r.status]}>{inquiryStatusLabel[r.status]}</Badge> },
  ]

  return (
    <>
      <PanelHead title="استعلام‌ها" description="نظارت بر درخواست‌های قیمت و پاسخ فروشندگان" />
      <DataTable rows={rows} columns={columns} loading={loading} searchPlaceholder="جستجو در کد یا عنوان استعلام…" />
    </>
  )
}
