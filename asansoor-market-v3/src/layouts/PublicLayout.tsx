import { Suspense, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AlertCircle, CheckCircle2, GitCompareArrows, Info, Mail, MapPin, Phone, X } from 'lucide-react'
import { Logo } from '@/components/Navbar'
import { Navbar } from '@/components/Navbar'
import { Button, Spinner } from '@/components/ui'
import { cn, toFa } from '@/lib/utils'
import { useLists, useToasts } from '@/store'

export default function PublicLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <CompareBar />
      <Footer />
      <Toaster />
    </div>
  )
}

/* ── نوار شناور مقایسه ──────────────────────────────────────── */
function CompareBar() {
  const { compare, clearCompare, toggleCompare } = useLists()
  const { pathname } = useLocation()

  if (compare.length === 0 || pathname === '/compare') return null

  return (
    <div className="animate-in-up sticky bottom-0 z-40 border-t border-steel-700 bg-steel-900 text-white">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-2.5">
        <GitCompareArrows size={17} className="text-signal-400" />
        <p className="text-[15px] font-semibold">
          <span className="num">{toFa(compare.length)}</span> محصول برای مقایسه انتخاب شده
        </p>
        <div className="flex items-center gap-1">
          {compare.map((id) => (
            <button
              key={id}
              onClick={() => toggleCompare(id)}
              className="code flex items-center gap-1 rounded-2xl bg-steel-800 px-1.5 py-0.5 text-[13px] text-steel-300 transition-colors hover:bg-steel-700 hover:text-white"
              aria-label="حذف از مقایسه"
            >
              {id}
              <X size={11} />
            </button>
          ))}
        </div>
        <div className="mr-auto flex items-center gap-2">
          <button onClick={clearCompare} className="text-[14px] text-steel-400 transition-colors hover:text-white">
            پاک کردن
          </button>
          <Link to="/compare">
            <Button size="sm" variant="signal">
              مقایسه کن
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── پاورقی ─────────────────────────────────────────────────── */
const footerCols = [
  {
    title: 'خرید',
    links: [
      { to: '/products', label: 'همه محصولات' },
      { to: '/products?mode=quote', label: 'کالاهای استعلامی' },
      { to: '/products?mode=tiered', label: 'قیمت همکاری' },
      { to: '/rfq', label: 'استعلام پکیج پروژه' },
      { to: '/compare', label: 'مقایسه محصولات' },
    ],
  },
  {
    title: 'فروشندگان',
    links: [
      { to: '/sellers', label: 'فهرست فروشندگان' },
      { to: '/login?role=seller', label: 'ورود فروشندگان' },
      { to: '/seller/products/new', label: 'ثبت محصول' },
      { to: '/blog/buying-guide-rfq', label: 'راهنمای پاسخ به استعلام' },
    ],
  },
  {
    title: 'راهنما',
    links: [
      { to: '/blog', label: 'بلاگ آموزشی' },
      { to: '/blog/en81-20-checklist', label: 'چک‌لیست استاندارد' },
      { to: '/blog/choosing-traction-motor', label: 'انتخاب موتور' },
      { to: '/panel/orders', label: 'پیگیری سفارش' },
    ],
  },
]

function Footer() {
  return (
    <footer className="mt-auto bg-steel-900 text-steel-300">
      {/* نوار هشدار صنعتی — امضای بصری سایت */}
      <div className="h-px bg-gradient-to-l from-transparent via-signal-500/50 to-transparent" />

      <div className="mx-auto max-w-[1280px] px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo dark />
            <p className="mt-4 max-w-sm text-[15px] leading-7 text-steel-400">
              بازار تخصصی قطعات، تجهیزات و خدمات آسانسور. قیمت بگیرید، پیشنهادها را کنار هم
              بگذارید و از فروشندگان تأییدشده سفارش دهید.
            </p>
            <div className="mt-5 space-y-2 text-[15px]">
              <a href="tel:02191001234" className="flex items-center gap-2 transition-colors hover:text-white">
                <Phone size={14} className="text-signal-400" />
                <span className="num">۰۲۱-۹۱۰۰۱۲۳۴</span>
              </a>
              <a href="mailto:info@asansoormarket.ir" className="flex items-center gap-2 transition-colors hover:text-white">
                <Mail size={14} className="text-signal-400" />
                info@asansoormarket.ir
              </a>
              <p className="flex items-start gap-2 text-steel-400">
                <MapPin size={14} className="mt-1 shrink-0 text-signal-400" />
                تهران، خیابان سهروردی شمالی، پلاک ۲۱۲، طبقه ۴
              </p>
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-[15px] font-bold text-white">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="text-[15px] text-steel-400 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-steel-800">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-4 py-4 text-[14px] text-steel-500 sm:flex-row">
          <p>© ۱۴۰۳ آسانسور مارکت — تمامی حقوق محفوظ است.</p>
          <p>ساخته شده برای اهل فن</p>
        </div>
      </div>
    </footer>
  )
}

/* ── اعلان‌ها ───────────────────────────────────────────────── */
export function Toaster() {
  const { toasts, dismiss } = useToasts()

  const icons = {
    success: <CheckCircle2 size={16} className="text-verify" />,
    error: <AlertCircle size={16} className="text-alert" />,
    info: <Info size={16} className="text-steel-400" />,
  }

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-200 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'animate-in-up pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-2xl border bg-paper px-3.5 py-2.5 shadow-lift',
            t.tone === 'error' ? 'border-alert/30' : 'border-line',
          )}
          role="status"
        >
          <span className="mt-0.5 shrink-0">{icons[t.tone]}</span>
          <p className="flex-1 text-[15px] font-medium leading-6 text-steel-800">{t.message}</p>
          <button
            onClick={() => dismiss(t.id)}
            className="-m-1 shrink-0 rounded p-1 text-steel-400 hover:text-steel-700"
            aria-label="بستن"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
