import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Boxes, ClipboardList, FolderTree, Heart, LayoutDashboard,
  LogOut, Menu, MessageSquareQuote, Package, Percent, Settings, ShoppingBag, Users, X,
} from 'lucide-react'
import { Logo } from '@/components/Navbar'
import { Spinner } from '@/components/ui'
import { Toaster } from './PublicLayout'
import { roleLabel } from '@/lib/labels'
import type { Role } from '@/lib/api/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store'

/* ══════════════════════════════════════════════════════════════
   پوسته پنل‌ها

   هر سه پنل (خریدار، فروشنده، مدیر) یک پوسته دارند و فقط منوی
   کناری‌شان فرق می‌کند. این کار هم کد را کم می‌کند و هم باعث
   می‌شود جابه‌جایی بین نقش‌ها برای کاربر بی‌اصطکاک باشد.
   ══════════════════════════════════════════════════════════════ */

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  end?: boolean
}

const NAVS: Record<Role, { home: string; title: string; items: NavItem[] }> = {
  buyer: {
    home: '/panel',
    title: 'پنل خریدار',
    items: [
      { to: '/panel', label: 'نمای کلی', icon: <LayoutDashboard size={16} />, end: true },
      { to: '/panel/inquiries', label: 'استعلام‌های من', icon: <MessageSquareQuote size={16} /> },
      { to: '/panel/orders', label: 'سفارش‌ها', icon: <ShoppingBag size={16} /> },
      { to: '/panel/favorites', label: 'علاقه‌مندی‌ها', icon: <Heart size={16} /> },
      { to: '/panel/profile', label: 'پروفایل و آدرس', icon: <Settings size={16} /> },
    ],
  },
  seller: {
    home: '/seller',
    title: 'پنل فروشنده',
    items: [
      { to: '/seller', label: 'نمای کلی', icon: <LayoutDashboard size={16} />, end: true },
      { to: '/seller/products', label: 'محصولات من', icon: <Package size={16} /> },
      { to: '/seller/inquiries', label: 'استعلام‌های دریافتی', icon: <MessageSquareQuote size={16} /> },
      { to: '/seller/orders', label: 'سفارش‌ها', icon: <ShoppingBag size={16} /> },
      { to: '/seller/settings', label: 'اطلاعات فروشگاه', icon: <Settings size={16} /> },
    ],
  },
  admin: {
    home: '/admin',
    title: 'پنل مدیریت',
    items: [
      { to: '/admin', label: 'نمای کلی', icon: <LayoutDashboard size={16} />, end: true },
      { to: '/admin/sellers', label: 'فروشندگان', icon: <BadgeCheck size={16} /> },
      { to: '/admin/products', label: 'محصولات', icon: <Boxes size={16} /> },
      { to: '/admin/categories', label: 'دسته‌بندی‌ها', icon: <FolderTree size={16} /> },
      { to: '/admin/inquiries', label: 'استعلام‌ها', icon: <ClipboardList size={16} /> },
      { to: '/admin/orders', label: 'سفارش‌ها', icon: <ShoppingBag size={16} /> },
      { to: '/admin/commission', label: 'کمیسیون و درآمد', icon: <Percent size={16} /> },
      { to: '/admin/users', label: 'کاربران', icon: <Users size={16} /> },
    ],
  },
}

export default function PanelLayout({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const signOut = useAuth((s) => s.signOut)
  const switchRole = useAuth((s) => s.switchRole)

  const nav = NAVS[role]

  useEffect(() => {
    setOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  // دسترسی بدون ورود ممکن نیست
  useEffect(() => {
    if (!user) navigate(`/login?next=${encodeURIComponent(pathname)}`, { replace: true })
  }, [user, navigate, pathname])

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-haze">
      {/* منوی کناری */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-100 flex w-68 flex-col bg-steel-900 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Logo dark />
          <button onClick={() => setOpen(false)} className="rounded p-1 text-steel-400 lg:hidden" aria-label="بستن منو">
            <X size={18} />
          </button>
        </div>

        <div className="mx-4 mb-2 rounded-2xl bg-steel-800/60 px-4 py-3.5">
          <p className="text-[13px] font-bold uppercase tracking-[0.18em] text-signal-400">{nav.title}</p>
          <p className="mt-1 text-sm font-bold text-white">{user.name}</p>
          {user.company && <p className="text-[14px] text-steel-400">{user.company}</p>}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-3">
          {nav.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'mx-3 flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors',
                  isActive
                    ? 'bg-signal-400 font-bold text-steel-900'
                    : 'text-steel-400 hover:bg-steel-800/70 hover:text-steel-100',
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* جابه‌جایی نقش — فقط برای بازدید دمو */}
        <div className="border-t border-steel-800/70 p-4">
          <p className="mb-2 px-1 text-[12px] font-bold uppercase tracking-widest text-steel-500">
            نمای دمو — تغییر نقش
          </p>
          <div className="mb-3 grid grid-cols-3 gap-1">
            {(['buyer', 'seller', 'admin'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  switchRole(r)
                  navigate(NAVS[r].home)
                }}
                className={cn(
                  'rounded-full py-2 text-[13px] font-semibold transition-colors',
                  r === role ? 'bg-paper text-steel-900' : 'bg-steel-800 text-steel-400 hover:text-white',
                )}
              >
                {roleLabel[r]}
              </button>
            ))}
          </div>
          <Link
            to="/"
            className="mb-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px] text-steel-400 transition-colors hover:bg-steel-800 hover:text-white"
          >
            <ArrowRight size={15} />
            بازگشت به فروشگاه
          </Link>
          <button
            onClick={() => {
              signOut()
              navigate('/')
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px] text-steel-400 transition-colors hover:bg-steel-800 hover:text-alert"
          >
            <LogOut size={15} />
            خروج از حساب
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-50 bg-steel-950/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* محتوا */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur-sm lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded p-2 text-steel-600 hover:bg-steel-100" aria-label="باز کردن منو">
            <Menu size={19} />
          </button>
          <span className="text-sm font-bold text-steel-900">{nav.title}</span>
        </header>

        <div className="min-w-0 flex-1 p-5 md:p-8">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      <Toaster />
    </div>
  )
}

/* ── سربرگ صفحه داخل پنل ────────────────────────────────────── */
export function PanelHead({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-extrabold text-steel-900 md:text-[26px]">{title}</h1>
        {description && <p className="mt-1.5 text-[15px] text-steel-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}
