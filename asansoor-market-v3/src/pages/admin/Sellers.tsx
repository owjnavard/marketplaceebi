import { useEffect, useState } from 'react'
import { Check, ShieldCheck, X } from 'lucide-react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Modal, Stars } from '@/components/ui'
import { api } from '@/lib/api'
import type { Seller, SellerStatus } from '@/lib/api/types'
import { sellerGroupLabel, sellerStatusLabel, sellerStatusTone } from '@/lib/labels'
import { toFa } from '@/lib/utils'
import { useToasts } from '@/store'

export default function AdminSellers() {
  const [rows, setRows] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<{ seller: Seller; status: SellerStatus } | null>(null)
  const [busy, setBusy] = useState(false)
  const push = useToasts((s) => s.push)

  const load = () => {
    setLoading(true)
    void api.sellers().then((r) => {
      setRows(r)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const apply = async () => {
    if (!acting) return
    setBusy(true)
    await api.setSellerStatus(acting.seller.id, acting.status)
    push(`«${acting.seller.name}» به وضعیت «${sellerStatusLabel[acting.status]}» تغییر کرد`)
    setActing(null)
    setBusy(false)
    load()
  }

  const columns: Column<Seller>[] = [
    {
      key: 'name', header: 'فروشنده', value: (r) => r.name + r.legalName,
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold text-white" style={{ background: r.logoColor }}>
            {r.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate font-semibold text-steel-900">
              {r.name}
              {r.verified && <ShieldCheck size={12} className="shrink-0 text-verify" />}
            </p>
            <p className="truncate text-[13px] text-steel-400">{r.legalName}</p>
          </div>
        </div>
      ),
    },
    { key: 'city', header: 'محل', value: (r) => r.province, secondary: true, cell: (r) => <span className="text-[14px] text-steel-600">{r.province} — {r.city}</span> },
    {
      key: 'group', header: 'گروه', value: (r) => r.group, secondary: true,
      cell: (r) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="muted">{sellerGroupLabel[r.group]}</Badge>
          {r.licensed && <Badge tone="verify">مجوزدار</Badge>}
        </div>
      ),
    },
    { key: 'products', header: 'کالا', value: (r) => r.productCount, sortable: true, secondary: true, cell: (r) => <span className="num text-steel-700">{toFa(r.productCount)}</span> },
    {
      key: 'rating', header: 'امتیاز', value: (r) => r.rating, sortable: true, secondary: true,
      cell: (r) => (r.reviewCount ? <span className="flex items-center gap-1.5"><Stars value={r.rating} size={11} /><span className="num text-[13px] text-steel-400">({toFa(r.reviewCount)})</span></span> : <span className="text-[14px] text-steel-300">—</span>),
    },
    { key: 'commission', header: 'کمیسیون', value: (r) => r.commissionRate, sortable: true, secondary: true, cell: (r) => <span className="num font-semibold text-steel-800">{toFa(r.commissionRate)}٪</span> },
    { key: 'status', header: 'وضعیت', value: (r) => r.status, cell: (r) => <Badge tone={sellerStatusTone[r.status]}>{sellerStatusLabel[r.status]}</Badge> },
    {
      key: 'actions', header: '', align: 'end', width: '150px',
      cell: (r) => (
        <div className="flex justify-end gap-1.5">
          {r.status !== 'approved' && (
            <Button size="sm" variant="outline" onClick={() => setActing({ seller: r, status: 'approved' })}>
              <Check size={13} />تأیید
            </Button>
          )}
          {r.status !== 'suspended' && (
            <Button size="sm" variant="ghost" onClick={() => setActing({ seller: r, status: 'suspended' })}>
              <X size={13} />تعلیق
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PanelHead title="فروشندگان" description="تأیید، تعلیق و بررسی عملکرد فروشندگان" />
      <DataTable rows={rows} columns={columns} loading={loading} searchPlaceholder="جستجو در نام فروشنده…" />

      <Modal
        open={!!acting}
        onClose={() => setActing(null)}
        title={acting?.status === 'approved' ? 'تأیید فروشنده' : 'تعلیق فروشنده'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActing(null)}>انصراف</Button>
            <Button variant={acting?.status === 'approved' ? 'signal' : 'danger'} loading={busy} onClick={apply}>
              {acting?.status === 'approved' ? 'تأیید کن' : 'تعلیق کن'}
            </Button>
          </>
        }
      >
        <p className="text-[15px] leading-7 text-steel-600">
          {acting?.status === 'approved'
            ? <>«{acting?.seller.name}» می‌تواند محصول منتشر کند و به استعلام‌ها پاسخ دهد.</>
            : <>کالاهای «{acting?.seller.name}» از کاتالوگ برداشته می‌شود و امکان پاسخ به استعلام را از دست می‌دهد. سفارش‌های جاری ادامه پیدا می‌کنند.</>}
        </p>
      </Modal>
    </>
  )
}
