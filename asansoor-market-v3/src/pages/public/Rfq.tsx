import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Send } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { SpecStep } from './rfq/SpecStep'
import { PartsStep } from './rfq/PartsStep'
import { SendStep } from './rfq/SendStep'
import { api } from '@/lib/api'
import type { Product, Seller } from '@/lib/api/types'
import { canSeePartnerPrice, partnerPrice } from '@/lib/partner'
import {
  DEFAULT_SETTINGS, buildParts, defaultCommitments, deriveStops, emptySpec,
  type BuildSettings, type Commitment, type InquirySpec, type PartLine, type PaymentTerms,
} from '@/features/rfq/inquiry'
import { cn, toFa } from '@/lib/utils'
import { useAuth, useToasts } from '@/store'

/* ══════════════════════════════════════════════════════════════
   استعلام — جریان سه‌مرحله‌ای نسخه ۳

   ۱) مشخصات پروژه و آسانسور، با جدول توقف‌ها
   ۲) لیست قطعات: تنظیمات سمت راست، اقلام سمت چپ
   ۳) ارسال به شرکت پیمانکار: تعهدات، پرداخت، انتخاب شرکت
   ══════════════════════════════════════════════════════════════ */

const STEPS = ['مشخصات پروژه', 'لیست قطعات', 'ارسال به پیمانکار']

export default function Rfq() {
  const [step, setStep] = useState(0)
  const [spec, setSpec] = useState<InquirySpec>(emptySpec)
  const [settings, setSettings] = useState<BuildSettings>(DEFAULT_SETTINGS)
  const [lines, setLines] = useState<PartLine[]>([])
  const [commitments, setCommitments] = useState<Commitment[]>(defaultCommitments(0))
  const [terms, setTerms] = useState<PaymentTerms>({
    method: 'mixed', prepayment: 30, chequeMonths: 3, note: '',
  })
  const [chosen, setChosen] = useState<string[]>([])
  const [showContact, setShowContact] = useState(true)
  const [busy, setBusy] = useState(false)
  const [doneCode, setDoneCode] = useState<string | null>(null)

  const user = useAuth((s) => s.user)
  const push = useToasts((s) => s.push)
  const navigate = useNavigate()

  const derived = useMemo(() => deriveStops(spec.stopRows, spec.stops), [spec.stopRows, spec.stops])

  /* جمع قابل محاسبه لیست قطعات — همین عدد وارد تعهد «خرید اجناس»
     در مرحله بعد می‌شود، پس اینجا یک‌بار حساب می‌شود نه دو جا */
  const [products, setProducts] = useState<Product[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])

  useEffect(() => {
    void Promise.all([api.products({ perPage: 100 }), api.sellers()]).then(([p, sl]) => {
      setProducts(p.items)
      setSellers(sl)
    })
  }, [])

  const partnerView = canSeePartnerPrice(user, sellers.find((s) => s.id === 's1') ?? null)

  const partsTotal = useMemo(
    () =>
      lines
        .filter((l) => l.selected && l.productId)
        .reduce((sum, l) => {
          const p = products.find((x) => x.id === l.productId)
          if (!p || p.price == null) return sum
          const unit = partnerView ? (partnerPrice(p) ?? p.price) : p.price
          return sum + unit * l.quantity
        }, 0),
    [lines, products, partnerView],
  )

  const goNext = () => {
    if (step === 0) {
      if (!spec.projectName.trim()) {
        push('نام پروژه را وارد کنید.', 'error')
        return
      }
      if (!spec.city.trim()) {
        push('شهر پروژه را وارد کنید.', 'error')
        return
      }
      if (lines.length === 0) setLines(buildParts(spec, settings))
    }
    setStep((s) => s + 1)
    window.scrollTo({ top: 0 })
  }

  const submit = async () => {
    if (!user) {
      navigate('/login?next=/rfq')
      return
    }
    setBusy(true)
    try {
      const selected = lines.filter((l) => l.selected)
      const inquiry = await api.createInquiry({
        kind: 'project',
        buyerId: user.id,
        title: `${spec.projectName} — ${spec.elevatorName}`,
        note: [
          spec.elevatorNote,
          `کاربری: ${spec.usage}`,
          terms.note,
          chosen.length ? `ارسال به ${toFa(chosen.length)} شرکت منتخب` : 'ارسال به همه شرکت‌های واجد شرایط',
          showContact ? 'اطلاعات تماس نمایش داده می‌شود' : 'اطلاعات تماس مخفی است',
        ].filter(Boolean).join(' — '),
        lines: selected.map((l, i) => ({
          id: `l${i + 1}`,
          productId: l.productId,
          partKey: l.group,
          title: l.title,
          description: l.detail,
          quantity: l.quantity,
          unit: l.unit,
        })),
      })
      setDoneCode(inquiry.code)
    } catch {
      push('ثبت استعلام انجام نشد. دوباره تلاش کنید.', 'error')
    } finally {
      setBusy(false)
    }
  }

  if (doneCode) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20">
        <Card className="p-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-verify-soft text-verify">
            <CheckCircle2 size={28} />
          </span>
          <h1 className="text-xl font-extrabold text-steel-900">استعلام ارسال شد</h1>
          <p className="mt-2 text-[14px] leading-8 text-steel-500">
            کد پیگیری <span className="code font-bold text-steel-900">{doneCode}</span> است.
            پیشنهادها را در پنل خود مقایسه کنید.
          </p>
          <div className="mt-6 flex gap-2">
            <Link to="/panel/inquiries" className="flex-1">
              <Button variant="signal" className="w-full">استعلام‌های من</Button>
            </Link>
            <Link to="/products" className="flex-1">
              <Button variant="outline" className="w-full">ادامه گشت‌وگذار</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-8">
      <div className="mb-6">
        <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.2em] text-signal-600">استعلام پروژه</p>
        <h1 className="text-2xl font-extrabold text-steel-900">
          {['مشخصات پروژه و آسانسور را وارد کنید',
            'لیست قطعات را بسازید و تنظیم کنید',
            'تعهدات را مشخص و برای پیمانکاران بفرستید'][step]}
        </h1>
      </div>

      {/* گام‌ها */}
      <ol className="mb-6 flex overflow-hidden rounded-2xl border border-line bg-paper">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3.5 text-right transition-colors',
                i === step ? 'bg-steel-800 text-white' : i < step ? 'text-steel-700 hover:bg-steel-50' : 'text-steel-300',
              )}
            >
              <span
                className={cn(
                  'num flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold',
                  i === step ? 'bg-signal-400 text-steel-900' : i < step ? 'bg-verify text-white' : 'bg-steel-100',
                )}
              >
                {i < step ? <Check size={14} /> : toFa(i + 1)}
              </span>
              <span className="hidden text-[14px] font-bold sm:block">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 && <SpecStep spec={spec} setSpec={setSpec} />}
      {step === 1 && (
        <PartsStep
          spec={spec}
          settings={settings}
          setSettings={setSettings}
          lines={lines}
          setLines={setLines}
        />
      )}
      {step === 2 && (
        <SendStep
          spec={spec}
          lines={lines}
          partsTotal={partsTotal}
          commitments={commitments}
          setCommitments={setCommitments}
          terms={terms}
          setTerms={setTerms}
          chosen={chosen}
          setChosen={setChosen}
          showContact={showContact}
          setShowContact={setShowContact}
        />
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowRight size={16} />
          مرحله قبل
        </Button>

        {step < 2 ? (
          <Button variant="signal" size="lg" onClick={goNext}>
            {step === 0 ? 'ساخت لیست قطعات' : 'ادامه به ارسال'}
            <ArrowLeft size={17} />
          </Button>
        ) : (
          <Button variant="signal" size="lg" loading={busy} onClick={submit}>
            <Send size={17} />
            {user ? 'ارسال به شرکت پیمانکار' : 'ورود و ارسال'}
          </Button>
        )}
      </div>

      {step === 0 && derived.travel > 0 && (
        <p className="mt-3 text-center text-[13px] text-steel-400">
          کورس محاسبه‌شده: <span className="num font-bold text-steel-700">{toFa(derived.travel)}</span> متر
          — <span className="num font-bold text-steel-700">{toFa(derived.landingDoors)}</span> درب طبقه
        </p>
      )}
    </div>
  )
}
