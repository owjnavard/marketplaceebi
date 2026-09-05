import { useEffect, useState } from 'react'
import { Check, MessageSquareQuote, Send } from 'lucide-react'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge, Button, Card, Empty, Field, Input, Modal, Spinner, Textarea } from '@/components/ui'
import { api } from '@/lib/api'
import type { Inquiry } from '@/lib/api/types'
import { doorTypeLabel, elevatorTypeLabel, inquiryStatusLabel, inquiryStatusTone, usageLabel } from '@/lib/labels'
import { cn, toEn, toFa, toman } from '@/lib/utils'
import { useToasts } from '@/store'
import { SELLER_ID } from './Dashboard'

/* استعلام‌های دریافتی — فروشنده برای هر ردیف قیمت واحد می‌دهد و
   جمع پیشنهاد همان‌جا محاسبه می‌شود. */
export default function SellerInquiries() {
  const [rows, setRows] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [answering, setAnswering] = useState<Inquiry | null>(null)
  const [filter, setFilter] = useState<'all' | 'todo'>('todo')

  const load = () => {
    setLoading(true)
    void api.inquiries('seller').then((r) => {
      setRows(r)
      setLoading(false)
    })
  }

  useEffect(load, [])

  if (loading) return <Spinner />

  const answered = (i: Inquiry) => i.offers.some((o) => o.sellerId === SELLER_ID)
  const list = filter === 'todo' ? rows.filter((i) => !answered(i) && i.status !== 'accepted') : rows

  return (
    <>
      <PanelHead
        title="استعلام‌های دریافتی"
        description="برای هر درخواست، قیمت واحد اقلام و زمان تحویل را اعلام کنید"
        action={
          <div className="flex overflow-hidden rounded-xl border border-line">
            {([['todo', 'در انتظار پاسخ'], ['all', 'همه']] as const).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={cn(
                  'px-3 py-2 text-[14px] font-semibold transition-colors',
                  filter === k ? 'bg-steel-800 text-white' : 'bg-paper text-steel-600 hover:bg-steel-50',
                )}
              >
                {l}
              </button>
            ))}
          </div>
        }
      />

      {list.length === 0 ? (
        <Empty
          icon={<MessageSquareQuote size={20} />}
          title={filter === 'todo' ? 'همه استعلام‌ها پاسخ داده شده' : 'استعلامی وجود ندارد'}
          description={filter === 'todo' ? 'وقتی درخواست جدیدی برسد، اینجا نمایش داده می‌شود.' : undefined}
        />
      ) : (
        <div className="space-y-3">
          {list.map((i) => {
            const mine = i.offers.find((o) => o.sellerId === SELLER_ID)
            return (
              <Card key={i.id} className="p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="code text-[13px] font-bold text-steel-500">{i.code}</span>
                      <Badge tone={inquiryStatusTone[i.status]}>{inquiryStatusLabel[i.status]}</Badge>
                      {i.kind === 'project' && <Badge tone="steel">پروژه‌ای</Badge>}
                      {mine && <Badge tone="verify"><Check size={10} />پاسخ داده‌اید</Badge>}
                    </div>
                    <h3 className="text-[15px] font-bold text-steel-900">{i.title}</h3>
                    <p className="num mt-0.5 text-[14px] text-steel-400">
                      {toFa(i.lines.length)} قلم — ثبت {i.createdAt} — مهلت {i.expiresAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {i.offers.length > 0 && (
                      <span className="num text-[14px] text-steel-400">
                        {toFa(i.offers.length)} رقیب
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant={mine ? 'outline' : 'signal'}
                      disabled={i.status === 'accepted'}
                      onClick={() => setAnswering(i)}
                    >
                      {mine ? 'ویرایش پیشنهاد' : 'ثبت پیشنهاد'}
                    </Button>
                  </div>
                </div>

                {i.spec && (
                  <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 rounded-3xl bg-steel-50 px-3 py-2 text-[14px] text-steel-600">
                    <span>{elevatorTypeLabel[i.spec.type]}</span>
                    <span className="num">{toFa(i.spec.stops)} توقف</span>
                    <span className="num">{toFa(i.spec.capacity)} کیلوگرم</span>
                    <span className="num">{toFa(i.spec.speed)} m/s</span>
                    <span>{doorTypeLabel[i.spec.doorType]}</span>
                    <span>{usageLabel[i.spec.usage]}</span>
                  </div>
                )}

                <ul className="divide-y divide-line rounded-3xl border border-line">
                  {i.lines.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[14px]">
                      <span className="min-w-0 truncate text-steel-700">{l.title}</span>
                      <span className="num shrink-0 font-semibold text-steel-900">
                        {toFa(l.quantity)} {l.unit}
                      </span>
                    </li>
                  ))}
                </ul>

                {i.note && (
                  <p className="mt-2.5 text-[14px] leading-6 text-steel-500">
                    <span className="font-semibold text-steel-700">توضیح خریدار: </span>
                    {i.note}
                  </p>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {answering && (
        <OfferForm
          inquiry={answering}
          onClose={() => setAnswering(null)}
          onDone={() => {
            setAnswering(null)
            load()
          }}
        />
      )}
    </>
  )
}

/* ── فرم ثبت پیشنهاد ────────────────────────────────────────── */
function OfferForm({
  inquiry, onClose, onDone,
}: {
  inquiry: Inquiry
  onClose: () => void
  onDone: () => void
}) {
  const existing = inquiry.offers.find((o) => o.sellerId === SELLER_ID)
  const [prices, setPrices] = useState<Record<string, number>>(existing?.unitPrices ?? {})
  const [leadTime, setLeadTime] = useState(existing?.leadTimeDays ?? 14)
  const [validUntil, setValidUntil] = useState(existing?.validUntil ?? '۱۴۰۳/۱۰/۱۵')
  const [note, setNote] = useState(existing?.note ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const push = useToasts((s) => s.push)

  const total = inquiry.lines.reduce((sum, l) => sum + (prices[l.id] ?? 0) * l.quantity, 0)
  const filled = inquiry.lines.filter((l) => prices[l.id] > 0).length

  const num = (v: string) => Number(toEn(v).replace(/\D/g, '')) || 0

  const submit = async () => {
    if (filled < inquiry.lines.length) {
      setError('برای همه ردیف‌ها باید قیمت واحد وارد شود. اگر قلمی را تأمین نمی‌کنید، عدد صفر بگذارید.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await api.submitOffer({
        inquiryId: inquiry.id,
        sellerId: SELLER_ID,
        unitPrices: prices,
        total,
        leadTimeDays: leadTime,
        validUntil,
        note: note || undefined,
      })
      push('پیشنهاد شما برای خریدار ارسال شد')
      onDone()
    } catch {
      push('ارسال پیشنهاد انجام نشد.', 'error')
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="ثبت پیشنهاد قیمت"
      subtitle={`${inquiry.code} — ${inquiry.title}`}
      size="lg"
      footer={
        <>
          <div className="ml-auto text-right">
            <p className="text-[13px] text-steel-400">جمع پیشنهاد</p>
            <p className="num text-[17px] font-extrabold text-steel-900">
              {toman(total)}
              <span className="mr-1 text-[13px] font-normal text-steel-400">تومان</span>
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button variant="signal" loading={busy} onClick={submit}>
            <Send size={15} />
            ارسال پیشنهاد
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl border border-alert/30 bg-alert-soft px-3 py-2 text-[14px] font-medium text-alert">
            {error}
          </p>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[15px] font-bold text-steel-800">قیمت واحد هر ردیف</p>
            <span className="num text-[14px] text-steel-400">{toFa(filled)} از {toFa(inquiry.lines.length)} تکمیل شده</span>
          </div>
          <div className="divide-y divide-line rounded-xl border border-line">
            {inquiry.lines.map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-3 p-3">
                <div className="min-w-40 flex-1">
                  <p className="text-[15px] font-semibold text-steel-900">{l.title}</p>
                  <p className="num text-[13px] text-steel-400">
                    {toFa(l.quantity)} {l.unit}
                    {l.description && ` — ${l.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={prices[l.id] ? toFa(prices[l.id].toLocaleString('en-US')) : ''}
                    onChange={(e) => setPrices((p) => ({ ...p, [l.id]: num(e.target.value) }))}
                    placeholder="قیمت واحد"
                    inputMode="numeric"
                    className="num h-9 w-40 text-left"
                  />
                  <span className="num w-32 text-left text-[14px] font-bold text-steel-700">
                    {prices[l.id] ? toman(prices[l.id] * l.quantity) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="زمان تحویل" hint="روز کاری" required>
            <Input value={toFa(leadTime)} onChange={(e) => setLeadTime(num(e.target.value))} inputMode="numeric" className="num" />
          </Field>
          <Field label="اعتبار پیشنهاد تا" required>
            <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="num" placeholder="۱۴۰۳/۱۰/۱۵" />
          </Field>
        </div>

        <Field label="توضیح برای خریدار" hint="اختیاری — شرایط حمل، تخفیف، ضمانت">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="مثلاً: حمل تا درب پروژه رایگان، تحویل در دو مرحله." />
        </Field>
      </div>
    </Modal>
  )
}
