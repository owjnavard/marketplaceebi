import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, MapPin, Truck } from 'lucide-react'
import { PanelHead } from '@/layouts/PanelLayout'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { Badge, Button, Card, Empty, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Order, Product } from '@/lib/api/types'
import { ORDER_FLOW, orderStatusLabel, orderStatusTone } from '@/lib/labels'
import { cn, toFa, toman } from '@/lib/utils'

export default function OrderDetail() {
  const { id = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void api.order(id).then(async (o) => {
      setOrder(o)
      if (o) {
        const list = await Promise.all(o.lines.map((l) => api.product(l.productId)))
        setProducts(list.filter(Boolean) as Product[])
      }
      setLoading(false)
    })
  }, [id])

  if (loading) return <Spinner />
  if (!order) {
    return <Empty title="این سفارش پیدا نشد" action={<Link to="/panel/orders"><Button>فهرست سفارش‌ها</Button></Link>} />
  }

  const stageIndex = ORDER_FLOW.indexOf(order.status)
  const cancelled = order.status === 'cancelled' || order.status === 'refunded'

  return (
    <>
      <Link to="/panel/orders" className="mb-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-steel-500 transition-colors hover:text-steel-900">
        <ArrowRight size={15} />
        سفارش‌ها
      </Link>

      <PanelHead
        title={`سفارش ${order.code}`}
        description={`ثبت در ${order.createdAt} — آخرین به‌روزرسانی ${order.updatedAt}`}
        action={<Badge tone={orderStatusTone[order.status]}>{orderStatusLabel[order.status]}</Badge>}
      />

      {/* خط زمانی */}
      {!cancelled && (
        <Card className="mb-5 p-5">
          <div className="flex items-center">
            {ORDER_FLOW.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold transition-colors',
                      i <= stageIndex ? 'bg-verify text-white' : 'bg-steel-100 text-steel-400',
                    )}
                  >
                    {i < stageIndex ? <Check size={15} /> : toFa(i + 1)}
                  </span>
                  <span className={cn('whitespace-nowrap text-[13px] font-semibold', i <= stageIndex ? 'text-steel-900' : 'text-steel-400')}>
                    {orderStatusLabel[s]}
                  </span>
                </div>
                {i < ORDER_FLOW.length - 1 && (
                  <div className={cn('mx-2 mb-6 h-0.5 flex-1', i < stageIndex ? 'bg-verify' : 'bg-steel-200')} />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="divide-y divide-line">
          {order.lines.map((l) => {
            const product = products.find((p) => p.id === l.productId)
            return (
              <div key={l.productId} className="flex gap-3 p-4">
                <span className="h-16 w-16 shrink-0 rounded-xl border border-line bg-steel-50 p-2 text-steel-300">
                  <PartSchematic kind={product ? schematicFor(product.categoryId) : 'panel'} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-steel-900">{l.name}</p>
                  <p className="code mt-0.5 text-[13px] text-steel-400">{l.partNumber}</p>
                  <p className="num mt-1.5 text-[14px] text-steel-500">
                    {toFa(l.quantity)} عدد × {toman(l.unitPrice)} تومان
                  </p>
                </div>
                <span className="num shrink-0 self-center text-[15px] font-extrabold text-steel-900">
                  {toman(l.unitPrice * l.quantity)}
                </span>
              </div>
            )
          })}
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-4 py-2.5 text-[15px] font-bold text-steel-900">صورتحساب</h2>
            <dl className="space-y-2.5 p-4 text-[15px]">
              <Line label="جمع کالاها" value={toman(order.subtotal)} />
              <Line label="هزینه ارسال" value={order.shipping ? toman(order.shipping) : '—'} />
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-bold text-steel-900">مبلغ کل</dt>
                <dd className="num text-lg font-extrabold text-steel-900">{toman(order.total)}</dd>
              </div>
            </dl>
            {order.status === 'pending_payment' && (
              <div className="border-t border-line p-4">
                <Button variant="signal" className="w-full">پرداخت سفارش</Button>
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <h2 className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-[15px] font-bold text-steel-900">
              <MapPin size={14} className="text-steel-400" />
              نشانی تحویل
            </h2>
            <div className="space-y-1 p-4 text-[14px] leading-6 text-steel-600">
              <p className="font-bold text-steel-900">{order.address.fullName || '—'}</p>
              <p className="num">{order.address.phone}</p>
              <p>{order.address.province} {order.address.city && `— ${order.address.city}`}</p>
              <p>{order.address.line}</p>
              {order.address.postalCode && <p className="num text-steel-400">کد پستی: {order.address.postalCode}</p>}
            </div>
          </Card>

          {order.inquiryId && (
            <Card className="p-4">
              <p className="text-[14px] text-steel-500">این سفارش از پذیرش یک پیشنهاد استعلام ساخته شده است.</p>
              <Link to={`/panel/inquiries/${order.inquiryId}`} className="mt-2 inline-block">
                <Button variant="outline" size="sm">مشاهده استعلام</Button>
              </Link>
            </Card>
          )}

          <Card className="flex items-start gap-2.5 p-4">
            <Truck size={15} className="mt-0.5 shrink-0 text-steel-400" />
            <p className="text-[14px] leading-6 text-steel-500">
              برای بارهای سنگین، هماهنگی حمل توسط باربری طرف قرارداد انجام و کد رهگیری پیامک می‌شود.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-steel-500">{label}</dt>
      <dd className="num font-semibold text-steel-800">{value}</dd>
    </div>
  )
}
