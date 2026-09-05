import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { PricingModeTag } from '@/components/PriceBlock'
import { Badge, Button, Modal, Textarea } from '@/components/ui'
import { api } from '@/lib/api'
import type { Product, ProductStatus, Seller } from '@/lib/api/types'
import { productStatusLabel, productStatusTone } from '@/lib/labels'
import { cn, toFa, toman } from '@/lib/utils'
import { useToasts } from '@/store'

export default function AdminProducts() {
  const [rows, setRows] = useState<Product[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ProductStatus | 'all'>('pending')
  const [acting, setActing] = useState<{ product: Product; status: ProductStatus } | null>(null)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const push = useToasts((s) => s.push)

  const load = () => {
    setLoading(true)
    void Promise.all([api.allProducts(), api.sellers()]).then(([p, s]) => {
      setRows(p)
      setSellers(s)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const apply = async () => {
    if (!acting) return
    setBusy(true)
    await api.setProductStatus(acting.product.id, acting.status)
    push(acting.status === 'approved' ? 'محصول تأیید و منتشر شد' : 'محصول رد شد و به فروشنده اطلاع داده می‌شود')
    setActing(null)
    setReason('')
    setBusy(false)
    load()
  }

  const list = filter === 'all' ? rows : rows.filter((r) => r.status === filter)
  const counts = (s: ProductStatus) => rows.filter((r) => r.status === s).length

  const columns: Column<Product>[] = [
    {
      key: 'name', header: 'محصول', value: (r) => r.name + r.partNumber + r.brand,
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-9 w-9 shrink-0 rounded-3xl border border-line bg-steel-50 p-1 text-steel-300">
            <PartSchematic kind={schematicFor(r.categoryId)} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-steel-900">{r.name}</p>
            <p className="mt-0.5 text-[13px] text-steel-400"><span className="code">{r.partNumber}</span> — {r.brand}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'seller', header: 'فروشنده', value: (r) => sellers.find((s) => s.id === r.sellerId)?.name ?? '', secondary: true,
      cell: (r) => <span className="text-[14px] text-steel-600">{sellers.find((s) => s.id === r.sellerId)?.name ?? '—'}</span>,
    },
    {
      key: 'price', header: 'قیمت', value: (r) => r.price ?? 0, sortable: true, secondary: true,
      cell: (r) => (
        <div className="flex items-center gap-2">
          {r.price != null ? <span className="num font-semibold text-steel-800">{toman(r.price)}</span> : <span className="text-[14px] text-steel-400">استعلامی</span>}
          <PricingModeTag product={r} />
        </div>
      ),
    },
    { key: 'status', header: 'وضعیت', value: (r) => r.status, cell: (r) => <Badge tone={productStatusTone[r.status]}>{productStatusLabel[r.status]}</Badge> },
    {
      key: 'actions', header: '', align: 'end', width: '140px',
      cell: (r) => (
        <div className="flex justify-end gap-1.5">
          {r.status !== 'approved' && (
            <Button size="sm" variant="outline" onClick={() => setActing({ product: r, status: 'approved' })}><Check size={13} />تأیید</Button>
          )}
          {r.status !== 'rejected' && (
            <Button size="sm" variant="ghost" onClick={() => setActing({ product: r, status: 'rejected' })}><X size={13} />رد</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <PanelHead title="محصولات" description="بررسی و تأیید کالاهایی که فروشندگان ثبت می‌کنند" />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(['pending', 'approved', 'rejected', 'draft', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-3xl border px-3 py-1.5 text-[14px] font-semibold transition-colors',
              filter === s ? 'border-steel-800 bg-steel-800 text-white' : 'border-line bg-paper text-steel-600 hover:border-steel-300',
            )}
          >
            {s === 'all' ? 'همه' : productStatusLabel[s]}
            <span className="num mr-1.5 text-[13px] opacity-70">
              {toFa(s === 'all' ? rows.length : counts(s))}
            </span>
          </button>
        ))}
      </div>

      <DataTable rows={list} columns={columns} loading={loading} searchPlaceholder="جستجو در نام، کد فنی یا برند…" />

      <Modal
        open={!!acting}
        onClose={() => setActing(null)}
        title={acting?.status === 'approved' ? 'تأیید و انتشار محصول' : 'رد محصول'}
        subtitle={acting?.product.name}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActing(null)}>انصراف</Button>
            <Button variant={acting?.status === 'approved' ? 'signal' : 'danger'} loading={busy} onClick={apply}>
              {acting?.status === 'approved' ? 'تأیید و انتشار' : 'رد کن'}
            </Button>
          </>
        }
      >
        {acting?.status === 'approved' ? (
          <p className="text-[15px] leading-7 text-steel-600">
            این محصول بلافاصله در کاتالوگ عمومی نمایش داده می‌شود و در نتایج جستجو و استعلام‌ها
            پیشنهاد خواهد شد.
          </p>
        ) : (
          <>
            <p className="mb-3 text-[15px] leading-7 text-steel-600">
              دلیل رد را بنویسید تا فروشنده بداند چه چیزی را باید اصلاح کند.
            </p>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً: مشخصات فنی ناقص است و کد فنی با برند اعلامی نمی‌خواند." />
          </>
        )}
      </Modal>
    </>
  )
}
