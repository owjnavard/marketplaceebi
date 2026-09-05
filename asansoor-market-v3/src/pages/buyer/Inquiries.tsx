import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquareQuote, Plus } from 'lucide-react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Empty } from '@/components/ui'
import { api } from '@/lib/api'
import type { Inquiry } from '@/lib/api/types'
import { inquiryStatusLabel, inquiryStatusTone } from '@/lib/labels'
import { toFa, toman } from '@/lib/utils'

export default function BuyerInquiries() {
  const [rows, setRows] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    void api.inquiries('buyer').then((r) => {
      setRows(r)
      setLoading(false)
    })
  }, [])

  const columns: Column<Inquiry>[] = [
    {
      key: 'code', header: 'کد', value: (r) => r.code, sortable: true, width: '130px',
      cell: (r) => <span className="code text-[14px] font-bold text-steel-700">{r.code}</span>,
    },
    {
      key: 'title', header: 'عنوان', value: (r) => r.title, sortable: true,
      cell: (r) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-steel-900">{r.title}</p>
          <p className="num mt-0.5 text-[13px] text-steel-400">
            {toFa(r.lines.length)} قلم — {r.kind === 'project' ? 'پروژه‌ای' : 'تک‌کالا'}
          </p>
        </div>
      ),
    },
    {
      key: 'offers', header: 'پیشنهادها', value: (r) => r.offers.length, sortable: true, secondary: true,
      cell: (r) =>
        r.offers.length === 0 ? (
          <span className="text-[14px] text-steel-400">در انتظار</span>
        ) : (
          <div>
            <span className="num font-bold text-steel-900">{toFa(r.offers.length)}</span>
            <span className="num mr-1.5 text-[13px] text-steel-400">
              از {toman(Math.min(...r.offers.map((o) => o.total)))}
            </span>
          </div>
        ),
    },
    {
      key: 'date', header: 'تاریخ ثبت', value: (r) => r.createdAt, sortable: true, secondary: true,
      cell: (r) => <span className="num text-[14px] text-steel-500">{r.createdAt}</span>,
    },
    {
      key: 'status', header: 'وضعیت', align: 'end', value: (r) => r.status,
      cell: (r) => <Badge tone={inquiryStatusTone[r.status]}>{inquiryStatusLabel[r.status]}</Badge>,
    },
  ]

  return (
    <>
      <PanelHead
        title="استعلام‌های من"
        description="درخواست‌های قیمتی که ثبت کرده‌اید و پیشنهادهای دریافتی"
        action={<Link to="/rfq"><Button variant="signal"><Plus size={15} />استعلام جدید</Button></Link>}
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="جستجو در عنوان یا کد استعلام…"
        onRowClick={(r) => navigate(`/panel/inquiries/${r.id}`)}
        empty={
          <Empty
            icon={<MessageSquareQuote size={20} />}
            title="هنوز استعلامی ثبت نکرده‌اید"
            description="برای کالاهای استعلامی یا یک پروژه کامل، درخواست قیمت بفرستید تا فروشندگان پیشنهاد بدهند."
            action={<Link to="/rfq"><Button>ثبت اولین استعلام</Button></Link>}
          />
        }
      />
    </>
  )
}
