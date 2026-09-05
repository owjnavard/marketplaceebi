import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Building2, Check, Clock, ShieldCheck, Trophy } from 'lucide-react'
import { PanelHead } from '@/layouts/PanelLayout'
import { ShaftDiagram } from '@/features/rfq/ShaftDiagram'
import { Badge, Button, Card, Empty, Modal, Spinner, Stars } from '@/components/ui'
import { api } from '@/lib/api'
import type { Inquiry, Offer, Seller } from '@/lib/api/types'
import {
  doorTypeLabel, elevatorTypeLabel, inquiryStatusLabel, inquiryStatusTone, usageLabel,
} from '@/lib/labels'
import { cn, toFa, toman } from '@/lib/utils'
import { useToasts } from '@/store'

export default function InquiryDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const push = useToasts((s) => s.push)

  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<Offer | null>(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    void Promise.all([api.inquiry(id), api.sellers()]).then(([i, s]) => {
      setInquiry(i)
      setSellers(s)
      setLoading(false)
    })
  }

  useEffect(load, [id])

  if (loading) return <Spinner />
  if (!inquiry) {
    return (
      <Empty
        title="این استعلام پیدا نشد"
        action={<Link to="/panel/inquiries"><Button>بازگشت به فهرست</Button></Link>}
      />
    )
  }

  const sellerOf = (sid: string) => sellers.find((s) => s.id === sid)
  const cheapest = inquiry.offers.length
    ? Math.min(...inquiry.offers.map((o) => o.total))
    : 0
  const fastest = inquiry.offers.length
    ? Math.min(...inquiry.offers.map((o) => o.leadTimeDays))
    : 0

  const accept = async () => {
    if (!confirming) return
    setBusy(true)
    try {
      const order = await api.acceptOffer(inquiry.id, confirming.id)
      push('پیشنهاد پذیرفته شد و سفارش ساخته شد.')
      navigate(`/panel/orders/${order.id}`)
    } catch {
      push('پذیرش پیشنهاد انجام نشد.', 'error')
      setBusy(false)
    }
  }

  return (
    <>
      <Link to="/panel/inquiries" className="mb-3 inline-flex items-center gap-1.5 text-[15px] font-semibold text-steel-500 transition-colors hover:text-steel-900">
        <ArrowRight size={15} />
        استعلام‌های من
      </Link>

      <PanelHead
        title={inquiry.title}
        description={`کد ${inquiry.code} — ثبت در ${inquiry.createdAt} — اعتبار تا ${inquiry.expiresAt}`}
        action={<Badge tone={inquiryStatusTone[inquiry.status]}>{inquiryStatusLabel[inquiry.status]}</Badge>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-5">
          {/* پیشنهادها */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-[16px] font-extrabold text-steel-900">
              پیشنهادهای دریافتی
              <span className="num text-[15px] font-normal text-steel-400">({toFa(inquiry.offers.length)})</span>
            </h2>

            {inquiry.offers.length === 0 ? (
              <Empty
                icon={<Clock size={20} />}
                title="هنوز پیشنهادی ثبت نشده"
                description="فروشندگان مرتبط، درخواست شما را دیده‌اند. معمولاً اولین پیشنهادها ظرف چند ساعت می‌رسد."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {inquiry.offers.map((offer) => {
                  const seller = sellerOf(offer.sellerId)
                  const isCheapest = offer.total === cheapest
                  const isFastest = offer.leadTimeDays === fastest
                  const isAccepted = offer.status === 'accepted'
                  const isRejected = offer.status === 'rejected'

                  return (
                    <Card
                      key={offer.id}
                      className={cn(
                        'flex flex-col overflow-hidden transition-colors',
                        isAccepted && 'border-verify ring-1 ring-verify/25',
                        isRejected && 'opacity-55',
                      )}
                    >
                      {(isCheapest || isFastest) && !isRejected && (
                        <div className="flex gap-1.5 border-b border-line bg-signal-50 px-3 py-1.5">
                          {isCheapest && (
                            <Badge tone="signal"><Trophy size={10} />کمترین قیمت</Badge>
                          )}
                          {isFastest && (
                            <Badge tone="steel"><Clock size={10} />سریع‌ترین تحویل</Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 border-b border-line p-3.5">
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
                          style={{ background: seller?.logoColor ?? '#1e2a38' }}
                        >
                          {seller?.name.charAt(0) ?? '؟'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 truncate text-[15px] font-bold text-steel-900">
                            {seller?.name ?? 'فروشنده'}
                            {seller?.verified && <ShieldCheck size={12} className="shrink-0 text-verify" />}
                          </p>
                          <span className="mt-0.5 flex items-center gap-1.5">
                            <Stars value={seller?.rating ?? 0} size={10} />
                            <span className="num text-[13px] text-steel-400">{seller?.city}</span>
                          </span>
                        </div>
                        {isAccepted && <Badge tone="verify"><Check size={10} />پذیرفته شد</Badge>}
                      </div>

                      <div className="flex-1 p-3.5">
                        <p className="text-[13px] text-steel-400">مبلغ کل پیشنهاد</p>
                        <p className="num mt-0.5 text-xl font-extrabold text-steel-900">
                          {toman(offer.total)}
                          <span className="mr-1 text-[13px] font-normal text-steel-400">تومان</span>
                        </p>

                        <dl className="mt-3 divide-y divide-line border-y border-line text-[14px]">
                          <Row label="زمان تحویل" value={`${toFa(offer.leadTimeDays)} روز کاری`} />
                          <Row label="اعتبار پیشنهاد" value={offer.validUntil} />
                          <Row label="تاریخ ثبت" value={offer.createdAt} />
                        </dl>

                        {offer.note && (
                          <p className="mt-3 rounded-3xl bg-steel-50 px-2.5 py-2 text-[14px] leading-6 text-steel-600">
                            {offer.note}
                          </p>
                        )}

                        {/* ریز قیمت هر ردیف */}
                        <details className="mt-3">
                          <summary className="cursor-pointer text-[14px] font-semibold text-steel-600 hover:text-steel-900">
                            ریز قیمت هر ردیف
                          </summary>
                          <dl className="mt-2 divide-y divide-line rounded-3xl border border-line">
                            {inquiry.lines.map((l) => (
                              <div key={l.id} className="flex items-baseline justify-between gap-2 px-2.5 py-1.5 text-[13px]">
                                <dt className="min-w-0 truncate text-steel-500">
                                  {l.title}
                                  <span className="num mr-1 text-steel-400">×{toFa(l.quantity)}</span>
                                </dt>
                                <dd className="num shrink-0 font-semibold text-steel-800">
                                  {offer.unitPrices[l.id] ? toman(offer.unitPrices[l.id]) : '—'}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </details>
                      </div>

                      {inquiry.status !== 'accepted' && (
                        <div className="border-t border-line p-3">
                          <Button
                            variant={isCheapest ? 'signal' : 'primary'}
                            className="w-full"
                            onClick={() => setConfirming(offer)}
                          >
                            پذیرش این پیشنهاد
                          </Button>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          {/* اقلام درخواستی */}
          <section>
            <h2 className="mb-3 text-[16px] font-extrabold text-steel-900">اقلام درخواستی</h2>
            <Card className="divide-y divide-line">
              {inquiry.lines.map((l, i) => (
                <div key={l.id} className="flex items-start gap-3 p-3.5">
                  <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-2xl bg-steel-100 text-[13px] font-bold text-steel-600">
                    {toFa(i + 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-steel-900">{l.title}</p>
                    {l.description && <p className="mt-0.5 text-[14px] text-steel-500">{l.description}</p>}
                  </div>
                  <span className="num shrink-0 rounded-2xl bg-steel-100 px-2 py-0.5 text-[14px] font-bold text-steel-700">
                    {toFa(l.quantity)} {l.unit}
                  </span>
                </div>
              ))}
            </Card>
            {inquiry.note && (
              <Card className="mt-3 p-3.5">
                <p className="mb-1 text-[14px] font-bold text-steel-700">توضیح شما</p>
                <p className="text-[14px] leading-6 text-steel-600">{inquiry.note}</p>
              </Card>
            )}
          </section>
        </div>

        {/* مشخصات پروژه */}
        {inquiry.spec && (
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card className="overflow-hidden">
              <h2 className="border-b border-line px-4 py-2.5 text-[15px] font-bold text-steel-900">
                مشخصات پروژه
              </h2>
              <div className="bg-steel-50/50 p-3">
                <ShaftDiagram spec={inquiry.spec} />
              </div>
              <dl className="divide-y divide-line border-t border-line text-[14px]">
                <Row label="نوع" value={elevatorTypeLabel[inquiry.spec.type]} pad />
                <Row label="کاربری" value={usageLabel[inquiry.spec.usage]} pad />
                <Row label="تعداد توقف" value={toFa(inquiry.spec.stops)} pad />
                <Row label="ظرفیت" value={`${toFa(inquiry.spec.capacity)} کیلوگرم`} pad />
                <Row label="سرعت" value={`${toFa(inquiry.spec.speed)} m/s`} pad />
                <Row label="نوع درب" value={doorTypeLabel[inquiry.spec.doorType]} pad />
                <Row label="ارتفاع سفر" value={`${toFa(inquiry.spec.travelHeight)} متر`} pad />
              </dl>
            </Card>
          </aside>
        )}
      </div>

      <Modal
        open={!!confirming}
        onClose={() => setConfirming(null)}
        title="پذیرش پیشنهاد"
        subtitle={sellerOf(confirming?.sellerId ?? '')?.name}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(null)}>انصراف</Button>
            <Button variant="signal" loading={busy} onClick={accept}>تأیید و ساخت سفارش</Button>
          </>
        }
      >
        <p className="text-[15px] leading-7 text-steel-600">
          با پذیرش این پیشنهاد، یک سفارش به مبلغ{' '}
          <span className="num font-bold text-steel-900">{toman(confirming?.total ?? 0)}</span> تومان
          ساخته می‌شود و بقیه پیشنهادها رد می‌شوند. پرداخت را در صفحه سفارش انجام می‌دهید.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-steel-50 p-3">
          <Building2 size={15} className="shrink-0 text-steel-400" />
          <p className="text-[14px] text-steel-600">
            زمان تحویل اعلامی: <span className="num font-bold">{toFa(confirming?.leadTimeDays ?? 0)}</span> روز کاری
          </p>
        </div>
      </Modal>
    </>
  )
}

function Row({ label, value, pad }: { label: string; value: string; pad?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', pad ? 'px-4 py-2' : 'py-1.5')}>
      <dt className="text-steel-500">{label}</dt>
      <dd className="num font-semibold text-steel-900">{value}</dd>
    </div>
  )
}
