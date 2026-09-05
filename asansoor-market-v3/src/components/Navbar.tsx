import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  GitCompareArrows, Heart, LayoutGrid, LogOut, Menu,
  Search, ShoppingCart, Store, User as UserIcon, X,
} from 'lucide-react'
import { api } from '@/lib/api'
import type { Category } from '@/lib/api/types'
import { roleLabel } from '@/lib/labels'
import { cn, toFa } from '@/lib/utils'
import { useAuth, useCart, useLists } from '@/store'
import { Button } from './ui'
import { PartSchematic, schematicFor } from './PartSchematic'

/* ══════════════════════════════════════════════════════════════
   هدر

   قبلاً سه ردیف روی هم بود (تماس، اصلی، دسته‌بندی) و پیش از شروع
   محتوا ۱۴۰ پیکسل جا می‌گرفت. حالا یک ردیف است؛ دسته‌بندی‌ها به
   یک مگامنو منتقل شده‌اند که فقط با کلیک باز می‌شود.
   ══════════════════════════════════════════════════════════════ */

const MAIN_LINKS = [
  { to: '/products', label: 'محصولات' },
  { to: '/rfq', label: 'استعلام پروژه' },
  { to: '/sellers', label: 'فروشندگان' },
  { to: '/blog', label: 'بلاگ' },
]

export function Navbar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const navigate = useNavigate()

  const cartCount = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0))
  const compareCount = useLists((s) => s.compare.length)
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)

  const accountRef = useRef<HTMLDivElement>(null)
  const catsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void api.categories().then(setCategories)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!accountRef.current?.contains(e.target as Node)) setAccountOpen(false)
      if (!catsRef.current?.contains(e.target as Node)) setCatsOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (setCatsOpen(false), setAccountOpen(false))
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products')
    setMenuOpen(false)
  }

  const panelHref = user?.role === 'admin' ? '/admin' : user?.role === 'seller' ? '/seller' : '/panel'

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1240px] items-center gap-4 px-5">
          <button
            onClick={() => setMenuOpen(true)}
            className="-mr-2 rounded-full p-2.5 text-steel-600 transition-colors hover:bg-steel-100 lg:hidden"
            aria-label="باز کردن منو"
          >
            <Menu size={20} />
          </button>

          <Logo />

          {/* دسته‌بندی + پیوندها */}
          <nav className="hidden items-center gap-1 lg:flex">
            <div ref={catsRef} className="relative">
              <button
                onClick={() => setCatsOpen((v) => !v)}
                aria-expanded={catsOpen}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition-colors',
                  catsOpen ? 'bg-steel-800 text-white' : 'text-steel-700 hover:bg-steel-100',
                )}
              >
                <LayoutGrid size={16} />
                دسته‌بندی
              </button>

              {catsOpen && (
                <div className="animate-in-up absolute right-0 top-full z-50 mt-3 w-[600px] rounded-[20px] bg-paper p-3 shadow-lift">
                  <div className="grid grid-cols-3 gap-1">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/products?cat=${c.id}`}
                        onClick={() => setCatsOpen(false)}
                        className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-steel-50"
                      >
                        <span className="h-9 w-9 shrink-0 text-steel-300">
                          <PartSchematic kind={schematicFor(c.id)} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-semibold text-steel-800">
                            {c.name}
                          </span>
                          <span className="num block text-[13px] text-steel-400">
                            {toFa(c.productCount)} کالا
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {MAIN_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex h-10 items-center rounded-full px-4 text-[15px] font-medium text-steel-600 transition-colors hover:bg-steel-100 hover:text-steel-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* جستجو */}
          <form onSubmit={submitSearch} className="relative mr-auto hidden max-w-md flex-1 md:block">
            <Search
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-steel-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی قطعه یا کد فنی…"
              aria-label="جستجوی محصولات"
              className="h-11 w-full rounded-full bg-steel-50 pr-11 pl-4 text-[15px] transition-colors placeholder:text-steel-400 hover:bg-steel-100 focus:bg-paper focus:shadow-plate focus:outline-none focus:ring-4 focus:ring-steel-500/10"
            />
          </form>

          <div className="mr-auto flex items-center gap-1 md:mr-0">
            <IconLink to="/compare" label="مقایسه" count={compareCount} icon={<GitCompareArrows size={19} />} className="hidden sm:flex" />
            <IconLink to="/cart" label="سبد خرید" count={cartCount} icon={<ShoppingCart size={19} />} />

            <div ref={accountRef} className="relative mr-1">
              {user ? (
                <>
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-expanded={accountOpen}
                    className="flex h-11 items-center gap-2 rounded-full p-1 pl-3 transition-colors hover:bg-steel-100"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-bold text-white"
                      style={{ background: user.avatarColor }}
                    >
                      {user.name.charAt(0)}
                    </span>
                    <span className="hidden text-[15px] font-semibold text-steel-700 sm:block">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {accountOpen && (
                    <div className="animate-in-up absolute left-0 top-full mt-3 w-60 overflow-hidden rounded-[18px] bg-paper p-2 shadow-lift">
                      <div className="mb-1 rounded-2xl bg-steel-50 px-4 py-3">
                        <p className="text-[15px] font-bold text-steel-900">{user.name}</p>
                        <p className="num mt-0.5 text-[13px] text-steel-500">{user.phone}</p>
                        <p className="mt-1.5 text-[13px] font-semibold text-signal-600">
                          {roleLabel[user.role]}
                        </p>
                      </div>
                      <MenuLink to={panelHref} icon={<LayoutGrid size={16} />} onClick={() => setAccountOpen(false)}>
                        پنل کاربری
                      </MenuLink>
                      <MenuLink to="/panel/orders" icon={<ShoppingCart size={16} />} onClick={() => setAccountOpen(false)}>
                        سفارش‌های من
                      </MenuLink>
                      <MenuLink to="/panel/favorites" icon={<Heart size={16} />} onClick={() => setAccountOpen(false)}>
                        علاقه‌مندی‌ها
                      </MenuLink>
                      <button
                        onClick={() => {
                          signOut()
                          setAccountOpen(false)
                          navigate('/')
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] text-alert transition-colors hover:bg-alert-soft"
                      >
                        <LogOut size={16} />
                        خروج از حساب
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login">
                  <Button size="sm" variant="primary">
                    <UserIcon size={15} />
                    <span className="hidden sm:inline">ورود</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* منوی موبایل */}
      {menuOpen && (
        <div className="animate-fade fixed inset-0 z-100 bg-steel-950/40 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}>
          <aside
            className="animate-in-up absolute inset-y-0 right-0 flex w-[88%] max-w-xs flex-col bg-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <Logo />
              <button onClick={() => setMenuOpen(false)} className="rounded-full p-2 text-steel-500 hover:bg-steel-100" aria-label="بستن">
                <X size={19} />
              </button>
            </div>

            <form onSubmit={submitSearch} className="relative px-5 pb-4">
              <Search size={16} className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-steel-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجوی قطعه…"
                className="h-11 w-full rounded-full bg-steel-50 pr-10 pl-4 text-[15px] focus:bg-paper focus:outline-none focus:ring-4 focus:ring-steel-500/10"
              />
            </form>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {MAIN_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-[16px] font-semibold text-steel-800 hover:bg-steel-50"
                >
                  {l.label}
                </Link>
              ))}
              <p className="mt-4 px-4 pb-2 text-[13px] font-bold uppercase tracking-widest text-steel-400">
                دسته‌بندی قطعات
              </p>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?cat=${c.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-2.5 text-[15px] text-steel-600 hover:bg-steel-50"
                >
                  {c.name}
                  <span className="num text-[13px] text-steel-400">{toFa(c.productCount)}</span>
                </Link>
              ))}
            </div>

            <div className="p-4">
              <Link to={user ? panelHref : '/login'} onClick={() => setMenuOpen(false)}>
                <Button className="w-full" variant="primary">
                  {user ? <Store size={16} /> : <UserIcon size={16} />}
                  {user ? 'پنل کاربری' : 'ورود / ثبت‌نام'}
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}

/* ── اجزای کمکی ─────────────────────────────────────────────── */
export function Logo({ dark }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5">
      <svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill={dark ? '#f5a800' : '#1e2a38'} />
        <rect x="7" y="6" width="18" height="20" rx="2.5" fill="none" stroke={dark ? '#1e2a38' : '#6b8098'} strokeWidth="1.6" />
        <rect x="10.5" y="10" width="11" height="16" rx="1" fill={dark ? '#1e2a38' : '#f5a800'} />
        <path d="M16 10v16" stroke={dark ? '#f5a800' : '#1e2a38'} strokeWidth="1.6" />
      </svg>
      <div className="leading-none">
        <p className={cn('text-[17px] font-extrabold', dark ? 'text-white' : 'text-steel-900')}>
          آسانسور مارکت
        </p>
        <p className={cn('mt-1 text-[12px] font-medium', dark ? 'text-steel-400' : 'text-steel-400')}>
          قطعات، تجهیزات و خدمات
        </p>
      </div>
    </Link>
  )
}

function IconLink({
  to, label, count, icon, className,
}: {
  to: string; label: string; count: number; icon: React.ReactNode; className?: string
}) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-full text-steel-600 transition-colors hover:bg-steel-100 hover:text-steel-900',
        className,
      )}
    >
      {icon}
      {count > 0 && (
        <span className="num absolute right-1.5 top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-signal-400 px-1 text-[11.5px] font-bold text-steel-900">
          {toFa(count)}
        </span>
      )}
    </Link>
  )
}

function MenuLink({
  to, icon, children, onClick,
}: {
  to: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] text-steel-700 transition-colors hover:bg-steel-50"
    >
      {icon}
      {children}
    </Link>
  )
}
