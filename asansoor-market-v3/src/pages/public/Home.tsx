import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronLeft, Layers, MessageSquareQuote,
  Search, ShieldCheck, Truck, Wallet,
} from 'lucide-react'
import { PartSchematic, type SchematicKey } from '@/components/PartSchematic'
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard'
import { Badge, Button, SectionHead } from '@/components/ui'
import { api } from '@/lib/api'
import type { Category, Post, Product, Seller } from '@/lib/api/types'
import { toFa } from '@/lib/utils'

const CATEGORY_ICON: Record<string, SchematicKey> = {
  c1: 'motor', c2: 'door', c3: 'panel', c4: 'rail', c5: 'safety',
  c6: 'rope', c7: 'cabin', c8: 'button', c9: 'service',
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featured, setFeatured] = useState<Product[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    void Promise.all([
      api.categories(),
      api.products({ sort: 'popular', perPage: 8 }),
      api.posts(),
      api.sellers(),
    ]).then(([c, p, b, s]) => {
      setCategories(c)
      setFeatured(p.items)
      setPosts(b.slice(0, 3))
      setSellers(s.filter((x) => x.status === 'approved').slice(0, 6))
      setLoading(false)
    })
  }, [])

  return (
    <>
      <Hero onSearch={(q) => navigate(`/products?q=${encodeURIComponent(q)}`)} />
      <TrustStrip />

      {/* دسته‌بندی‌ها */}
      <section className="mx-auto max-w-[1240px] px-5 py-20">
        <SectionHead
          eyebrow="کاتالوگ"
          title="دسته‌بندی قطعات و تجهیزات"
          action={
            <Link to="/products" className="flex items-center gap-1 text-[15px] font-semibold text-steel-600 transition-colors hover:text-signal-600">
              همه محصولات
              <ChevronLeft size={15} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?cat=${c.id}`}
              className="group flex flex-col items-center gap-3 rounded-[18px] bg-paper p-7 text-center shadow-plate transition-shadow duration-200 hover:shadow-soft"
            >
              <div className="h-16 w-16 text-steel-300 transition-colors group-hover:text-signal-500">
                <PartSchematic kind={CATEGORY_ICON[c.id] ?? 'panel'} />
              </div>
              <p className="text-[15px] font-bold leading-6 text-steel-800">{c.name}</p>
              <p className="num text-[13px] text-steel-400">{toFa(c.productCount)} کالا</p>
            </Link>
          ))}
        </div>
      </section>

      <PricingModesExplainer />

      {/* محصولات پرفروش */}
      <section className="mx-auto max-w-[1240px] px-5 py-20">
        <SectionHead
          eyebrow="پرفروش‌ترین‌ها"
          title="آنچه اهل فن بیشتر سفارش می‌دهند"
          action={
            <Link to="/products?sort=popular" className="flex items-center gap-1 text-[15px] font-semibold text-steel-600 transition-colors hover:text-signal-600">
              مشاهده همه
              <ChevronLeft size={15} />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <RfqBanner />

      {/* فروشندگان */}
      <section className="mx-auto max-w-[1240px] px-5 py-20">
        <SectionHead
          eyebrow="تأمین‌کنندگان"
          title="فروشندگان تأییدشده"
          action={
            <Link to="/sellers" className="flex items-center gap-1 text-[15px] font-semibold text-steel-600 transition-colors hover:text-signal-600">
              همه فروشندگان
              <ChevronLeft size={15} />
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {sellers.map((s) => (
            <Link key={s.id} to={`/sellers/${s.id}`} className="group rounded-2xl bg-paper p-5 text-center shadow-plate transition-shadow duration-200 hover:shadow-soft">
              <div
                className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl text-base font-extrabold text-white"
                style={{ background: s.logoColor }}
              >
                {s.name.charAt(0)}
              </div>
              <p className="truncate text-[15px] font-bold text-steel-800">{s.name}</p>
              <p className="mt-0.5 text-[13px] text-steel-400">{s.city}</p>
              {s.verified && (
                <Badge tone="verify" className="mt-2">
                  <ShieldCheck size={10} />
                  احراز شده
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* بلاگ */}
      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-5 py-20">
          <SectionHead
            eyebrow="دانش فنی"
            title="از تجربه میدانی، نه از بروشور"
            action={
              <Link to="/blog" className="flex items-center gap-1 text-[15px] font-semibold text-steel-600 transition-colors hover:text-signal-600">
                همه مقالات
                <ChevronLeft size={15} />
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[18px] bg-paper shadow-plate transition-shadow duration-200 hover:shadow-soft"
              >
                <div className="flex h-36 items-center justify-center bg-steel-50/70 p-7 text-steel-200 transition-colors group-hover:text-signal-400">
                  <PartSchematic kind={p.cover as SchematicKey} className="h-full w-auto" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <Badge tone="muted" className="mb-3 self-start">{p.tag}</Badge>
                  <h3 className="text-[15px] font-bold leading-6 text-steel-900 transition-colors group-hover:text-signal-600">
                    {p.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[15px] leading-6 text-steel-500">{p.excerpt}</p>
                  <p className="num mt-3 text-[13px] text-steel-400">{toFa(p.readMinutes)} دقیقه مطالعه</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   هیرو — جستجو بر اساس مشخصات، نه شعار

   خریدار این بازار با «کد فنی» و «ظرفیت» سر و کار دارد، نه با
   بنر تخفیف. پس بالاترین نقطه صفحه به همان چیزی داده شده که
   واقعاً دنبالش است.
   ══════════════════════════════════════════════════════════════ */
function Hero({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState('')
  const quick = ['موتور گیرلس ۶۳۰', 'ریل T-89', 'تابلو ۸ توقف', 'پاراشوت تدریجی']

  return (
    <section className="relative overflow-hidden bg-steel-900">
      <div className="blueprint absolute inset-0 opacity-60" aria-hidden="true" />
      {/* هاله ملایم پشت متن، به‌جای نوار هشدار تیز قبلی */}
      <div
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-signal-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-steel-800/80 px-4 py-1.5 text-[14px] font-medium text-steel-300 ring-1 ring-steel-700">
          <span className="h-1.5 w-1.5 rounded-full bg-signal-400" />
          بازار تخصصی صنعت آسانسور
        </p>

        <h1 className="text-[34px] font-black leading-[1.3] tracking-tight text-white md:text-[52px]">
          قطعه را با مشخصاتش پیدا کنید
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-9 text-steel-300 md:text-[19px]">
          ظرفیت، سرعت و تعداد توقف را بدهید تا قطعات سازگار را ببینید — و در یک درخواست،
          از چند فروشنده تأییدشده قیمت بگیرید.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSearch(q.trim())
          }}
          className="mx-auto mt-9 flex max-w-xl gap-2 rounded-full bg-paper/10 p-2 ring-1 ring-white/10 backdrop-blur-sm"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-steel-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="مثلاً موتور گیرلس ۶۳۰ کیلوگرم"
              aria-label="جستجوی قطعه"
              className="h-12 w-full rounded-full bg-transparent pr-12 pl-3 text-[16px] text-white placeholder:text-steel-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="lg" variant="signal">
            جستجو
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {quick.map((t) => (
            <button
              key={t}
              onClick={() => onSearch(t)}
              className="rounded-full px-3 py-1.5 text-[14px] text-steel-400 ring-1 ring-steel-700 transition-colors hover:text-signal-400 hover:ring-signal-400/50"
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {[
            { v: '۱۰,۴۰۰+', l: 'کد کالای فعال' },
            { v: '۵۱۲', l: 'فروشنده تأییدشده' },
            { v: '۴ ساعت', l: 'میانگین پاسخ' },
          ].map((s) => (
            <div key={s.l}>
              <p className="num text-2xl font-extrabold text-white">{s.v}</p>
              <p className="mt-1 text-[14px] text-steel-400">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustStrip() {
  const items = [
    { icon: <ShieldCheck size={18} />, t: 'فروشنده احراز هویت‌شده', d: 'مدارک ثبتی بررسی می‌شود' },
    { icon: <Wallet size={18} />, t: 'پرداخت امن', d: 'وجه پس از تأیید تحویل آزاد می‌شود' },
    { icon: <MessageSquareQuote size={18} />, t: 'استعلام چندفروشنده', d: 'یک درخواست، چند پیشنهاد' },
    { icon: <Truck size={18} />, t: 'ارسال سراسری', d: 'حمل بار سنگین با باربری طرف قرارداد' },
  ]
  return (
    <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-8 gap-y-6 px-5 py-9 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.t} className="flex items-start gap-3.5">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-signal-100 text-signal-700">
            {i.icon}
          </span>
          <div>
            <p className="text-[15px] font-bold text-steel-900">{i.t}</p>
            <p className="mt-1 text-[14px] leading-6 text-steel-500">{i.d}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* توضیح سه حالت قیمت‌گذاری — چون این تفاوت اصلی این بازار با یک فروشگاه معمولی است */
function PricingModesExplainer() {
  const modes = [
    {
      tag: 'قیمت مشخص',
      tone: 'muted' as const,
      title: 'کالای استاندارد',
      desc: 'قطعاتی که مشخصات ثابتی دارند و قیمتشان قابل اعلام است. مستقیم به سبد اضافه کنید.',
      link: '/products?mode=fixed',
      sample: (
        <div className="flex items-baseline gap-1">
          <span className="num text-lg font-extrabold text-steel-900">۹۶,۸۰۰,۰۰۰</span>
          <span className="text-[13px] text-steel-400">تومان</span>
        </div>
      ),
    },
    {
      tag: 'استعلامی',
      tone: 'signal' as const,
      title: 'وابسته به شرایط پروژه',
      desc: 'کابین سفارشی، خدمات نصب و کالاهایی که قیمتشان به ابعاد و محل پروژه بستگی دارد.',
      link: '/products?mode=quote',
      sample: (
        <div className="hatch flex h-8 w-40 items-center justify-center rounded-3xl border border-dashed border-steel-300">
          <span className="rounded-2xl bg-paper px-2 text-[13px] font-bold text-steel-500">قیمت با استعلام</span>
        </div>
      ),
    },
    {
      tag: 'قیمت همکاری',
      tone: 'steel' as const,
      title: 'پلکانی بر اساس تعداد',
      desc: 'برای خرید عمده. از تعداد مشخصی به بالا، قیمت مذاکره‌ای می‌شود و باید استعلام بگیرید.',
      link: '/products?mode=tiered',
      sample: (
        <div className="w-40 overflow-hidden rounded-3xl border border-line text-[13px]">
          <div className="flex justify-between bg-paper px-2 py-1">
            <span className="text-steel-500">۱ تا ۹</span>
            <span className="num font-bold">۳۴,۸۰۰,۰۰۰</span>
          </div>
          <div className="flex justify-between border-t border-line bg-signal-50 px-2 py-1">
            <span className="text-steel-700">۱۰ به بالا</span>
            <span className="font-bold text-signal-700">استعلام</span>
          </div>
        </div>
      ),
    },
  ]

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-[1240px] px-5 py-20">
        <SectionHead eyebrow="نحوه قیمت‌گذاری" title="هر کالا یک قیمت ثابت ندارد — و این عمدی است" />
        <p className="-mt-2 mb-6 max-w-2xl text-[15px] leading-7 text-steel-500">
          در صنعت آسانسور، قیمت خیلی از اقلام به ابعاد چاه، تعداد و محل پروژه بستگی دارد. به‌جای
          نمایش عدد نادرست، سه حالت قیمت‌گذاری داریم و هرکدام شکل ظاهری متفاوتی دارند.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {modes.map((m) => (
            <div key={m.tag} className="flex flex-col rounded-[18px] bg-paper p-7 shadow-plate">
              <Badge tone={m.tone} className="mb-3 self-start">{m.tag}</Badge>
              <h3 className="text-[16px] font-bold text-steel-900">{m.title}</h3>
              <p className="mt-1.5 flex-1 text-[15px] leading-6 text-steel-500">{m.desc}</p>
              <div className="my-4">{m.sample}</div>
              <Link
                to={m.link}
                className="flex items-center gap-1 text-[14px] font-bold text-steel-700 transition-colors hover:text-signal-600"
              >
                دیدن این دسته کالاها
                <ChevronLeft size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RfqBanner() {
  return (
    <section className="bg-steel-800">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-6 px-4 py-10 md:flex-row md:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-signal-400 text-steel-900">
          <Layers size={24} />
        </span>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-white">
            لیست قطعات یک پروژه کامل را در دو دقیقه بسازید
          </h2>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-7 text-steel-300">
            مشخصات آسانسور را وارد کنید تا نمای برش چاه و فهرست قطعات با تعداد محاسبه‌شده را
            ببینید — همراه با دلیل فنی هر انتخاب. بعد یکجا برای همه فروشندگان استعلام بفرستید.
          </p>
        </div>
        <Link to="/rfq" className="shrink-0">
          <Button size="lg" variant="signal">
            ساخت لیست قطعات
            <ArrowLeft size={16} />
          </Button>
        </Link>
      </div>
    </section>
  )
}
