import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { PricingModeTag } from '@/components/PriceBlock'
import { Badge, Button, Empty, Modal } from '@/components/ui'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api/types'
import { productStatusLabel, productStatusTone, stockLabel, stockTone } from '@/lib/labels'
import { toFa, toman } from '@/lib/utils'
import { useToasts } from '@/store'
import { SELLER_ID } from './Dashboard'

export default function SellerProducts() {
  const [rows, setRows] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [busy, setBusy] = useState(false)
  const push = useToasts((s) => s.push)
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    void api.sellerProducts(SELLER_ID).then((r) => {
      setRows(r)
      setLoading(false)
    })
  }

  useEffect(load, [])

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    await api.deleteProduct(deleting.id)
    push(`«${deleting.name}» حذف شد`)
    setDeleting(null)
    setBusy(false)
    load()
  }

  const columns: Column<Product>[] = [
    {
      key: 'name', header: 'محصول', value: (r) => r.name + r.partNumber,
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-9 w-9 shrink-0 rounded-3xl border border-line bg-steel-50 p-1 text-steel-300">
            <PartSchematic kind={schematicFor(r.categoryId)} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-steel-900">{r.name}</p>
            <p className="code mt-0.5 text-[13px] text-steel-400">{r.partNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price', header: 'قیمت', value: (r) => r.price ?? 0, sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-2">
          {r.price != null ? (
            <span className="num font-bold text-steel-900">{toman(r.price)}</span>
          ) : (
            <span className="text-[14px] text-steel-400">استعلامی</span>
          )}
          <PricingModeTag product={r} />
        </div>
      ),
    },
    {
      key: 'stock', header: 'موجودی', value: (r) => r.stockQty, sortable: true, secondary: true,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="num font-semibold text-steel-700">{toFa(r.stockQty)}</span>
          <Badge tone={stockTone[r.stockState]}>{stockLabel[r.stockState]}</Badge>
        </div>
      ),
    },
    {
      key: 'sold', header: 'فروش', value: (r) => r.soldCount, sortable: true, secondary: true,
      cell: (r) => <span className="num text-steel-600">{toFa(r.soldCount)}</span>,
    },
    {
      key: 'status', header: 'وضعیت', value: (r) => r.status,
      cell: (r) => <Badge tone={productStatusTone[r.status]}>{productStatusLabel[r.status]}</Badge>,
    },
    {
      key: 'actions', header: '', align: 'end', width: '90px',
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/seller/products/${r.id}`) }}
            className="rounded-3xl p-1.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-800"
            aria-label="ویرایش"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleting(r) }}
            className="rounded-3xl p-1.5 text-steel-400 transition-colors hover:bg-alert-soft hover:text-alert"
            aria-label="حذف"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PanelHead
        title="محصولات من"
        description="مدیریت کالاها، قیمت و موجودی"
        action={<Link to="/seller/products/new"><Button variant="signal"><Plus size={15} />افزودن محصول</Button></Link>}
      />
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        searchPlaceholder="جستجو در نام یا کد فنی…"
        empty={
          <Empty
            icon={<Package size={20} />}
            title="هنوز محصولی ثبت نکرده‌اید"
            description="اولین کالا را اضافه کنید تا پس از تأیید مدیر در کاتالوگ نمایش داده شود."
            action={<Link to="/seller/products/new"><Button>افزودن محصول</Button></Link>}
          />
        }
      />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="حذف محصول"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>انصراف</Button>
            <Button variant="danger" loading={busy} onClick={remove}>حذف کن</Button>
          </>
        }
      >
        <p className="text-[15px] leading-7 text-steel-600">
          «{deleting?.name}» از کاتالوگ حذف می‌شود. سفارش‌های ثبت‌شده روی این کالا دست‌نخورده
          می‌مانند. این کار قابل بازگشت نیست.
        </p>
      </Modal>
    </>
  )
}
