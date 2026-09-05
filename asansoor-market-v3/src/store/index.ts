import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import type { CartLine, ID, Product, Role, User } from '@/lib/api/types'

/* ══════════════════════════════════════════════════════════════
   وضعیت سراسری — سه استور کوچک و مستقل
   ══════════════════════════════════════════════════════════════ */

/* ── احراز هویت ─────────────────────────────────────────────── */
interface AuthState {
  user: User | null
  signIn: (user: User) => void
  signOut: () => void
  switchRole: (role: Role) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      signIn: (user) => set({ user }),
      signOut: () => {
        void api.logout()
        set({ user: null })
      },
      // در حالت دمو امکان جابه‌جایی بین نقش‌ها برای بازدید پنل‌ها
      switchRole: (role) => {
        const u = get().user
        if (u) set({ user: { ...u, role } })
      },
    }),
    { name: 'am.auth' },
  ),
)

/* ── سبد خرید ───────────────────────────────────────────────── */
interface CartState {
  lines: CartLine[]
  add: (productId: ID, quantity?: number) => void
  setQty: (productId: ID, quantity: number) => void
  remove: (productId: ID) => void
  clear: () => void
  count: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (productId, quantity = 1) =>
        set((s) => {
          const found = s.lines.find((l) => l.productId === productId)
          return found
            ? { lines: s.lines.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l)) }
            : { lines: [...s.lines, { productId, quantity }] }
        }),
      setQty: (productId, quantity) =>
        set((s) => ({
          lines: quantity <= 0
            ? s.lines.filter((l) => l.productId !== productId)
            : s.lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
        })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
    }),
    { name: 'am.cart' },
  ),
)

/* ── علاقه‌مندی و مقایسه ─────────────────────────────────────── */
const COMPARE_LIMIT = 4

interface ListsState {
  favorites: ID[]
  compare: ID[]
  toggleFavorite: (id: ID) => void
  toggleCompare: (id: ID) => void
  clearCompare: () => void
  isFavorite: (id: ID) => boolean
  inCompare: (id: ID) => boolean
}

export const useLists = create<ListsState>()(
  persist(
    (set, get) => ({
      favorites: [],
      compare: [],
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id],
        })),
      toggleCompare: (id) =>
        set((s) => {
          if (s.compare.includes(id)) return { compare: s.compare.filter((x) => x !== id) }
          if (s.compare.length >= COMPARE_LIMIT) return s
          return { compare: [...s.compare, id] }
        }),
      clearCompare: () => set({ compare: [] }),
      isFavorite: (id) => get().favorites.includes(id),
      inCompare: (id) => get().compare.includes(id),
    }),
    { name: 'am.lists' },
  ),
)

export { COMPARE_LIMIT }

/* ── اعلان‌های کوتاه ────────────────────────────────────────── */
export interface Toast {
  id: string
  message: string
  tone: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  push: (message: string, tone?: Toast['tone']) => void
  dismiss: (id: string) => void
}

export const useToasts = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2, 9)
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3600)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/* ── محاسبه قیمت پلکانی ─────────────────────────────────────── */
export function unitPriceFor(product: Product, quantity: number): number | null {
  if (product.pricingMode === 'quote') return null
  if (product.pricingMode === 'fixed') return product.price
  const tier = product.tiers?.find(
    (t) => quantity >= t.minQty && (t.maxQty == null || quantity <= t.maxQty),
  )
  return tier ? tier.price : product.price
}
