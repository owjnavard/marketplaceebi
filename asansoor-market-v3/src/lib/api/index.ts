import * as seed from './seed'
import type {
  Category,
  ID,
  Inquiry,
  Offer,
  Order,
  Paginated,
  Post,
  Product,
  ProductQuery,
  Seller,
  User,
} from './types'

/* ══════════════════════════════════════════════════════════════
   لایه دسترسی به داده

   یک نقطه ورود واحد برای کل اپلیکیشن. اگر VITE_API_URL خالی باشد
   از دیتای نمونه استفاده می‌شود؛ در غیر این صورت همان متدها روی
   REST بک‌اند لاراول اجرا می‌شوند. هیچ کامپوننتی نمی‌داند کدام یک
   فعال است.

   نگاشت متدها به روت‌های لاراول در فایل docs/API.md آمده است.
   ══════════════════════════════════════════════════════════════ */

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')
export const LIVE = BASE.length > 0

const TOKEN_KEY = 'am.token'

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  status: number
  fields?: Record<string, string[]>
  constructor(message: string, status: number, fields?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.fields = fields
  }
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const t = token.get()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...init.headers,
    },
  })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      data?.message ?? 'ارتباط با سرور برقرار نشد. دوباره تلاش کنید.',
      res.status,
      data?.errors,
    )
  }
  return (data?.data ?? data) as T
}

/* ── حالت دمو: نگهداری تغییرات کاربر در localStorage ───────── */
const DB_KEY = 'am.db'

interface LocalDB {
  products: Product[]
  sellers: Seller[]
  categories: Category[]
  inquiries: Inquiry[]
  orders: Order[]
}

function loadDB(): LocalDB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw) as LocalDB
  } catch {
    /* دیتای خراب را نادیده بگیر و از نو بساز */
  }
  return {
    products: seed.products,
    sellers: seed.sellers,
    categories: seed.categories,
    inquiries: seed.inquiries,
    orders: seed.orders,
  }
}

let db: LocalDB = loadDB()

function saveDB() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* سهمیه ذخیره‌سازی پر است — در حالت دمو مهم نیست */
  }
}

export function resetDemoData() {
  localStorage.removeItem(DB_KEY)
  db = loadDB()
}

const wait = (ms = 140) => new Promise((r) => setTimeout(r, ms))
const uid = () => Math.random().toString(36).slice(2, 10)

/* ── فیلتر و مرتب‌سازی محصولات در حالت دمو ─────────────────── */
function queryProducts(q: ProductQuery): Paginated<Product> {
  const page = q.page ?? 1
  const perPage = q.perPage ?? 12
  let list = db.products.filter((p) => p.status === 'approved')

  if (q.q) {
    const needle = q.q.trim().toLowerCase()
    list = list.filter((p) =>
      [p.name, p.brand, p.partNumber, p.shortDescription]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    )
  }
  if (q.categoryIds?.length) list = list.filter((p) => q.categoryIds!.includes(p.categoryId))
  if (q.brands?.length) list = list.filter((p) => q.brands!.includes(p.brand))
  if (q.sellerIds?.length) list = list.filter((p) => q.sellerIds!.includes(p.sellerId))
  if (q.pricingModes?.length) list = list.filter((p) => q.pricingModes!.includes(p.pricingMode))
  if (q.inStockOnly) list = list.filter((p) => p.stockState === 'in_stock' || p.stockState === 'low')
  if (q.minPrice != null) list = list.filter((p) => p.price == null || p.price >= q.minPrice!)
  if (q.maxPrice != null) list = list.filter((p) => p.price == null || p.price <= q.maxPrice!)
  if (q.attributes) {
    for (const [key, values] of Object.entries(q.attributes)) {
      if (!values.length) continue
      list = list.filter((p) => values.includes(String(p.attributes[key])))
    }
  }

  const byPrice = (p: Product) => p.price ?? Number.MAX_SAFE_INTEGER
  switch (q.sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => byPrice(a) - byPrice(b))
      break
    case 'price-desc':
      list = [...list].sort((a, b) => byPrice(b) - byPrice(a))
      break
    case 'popular':
      list = [...list].sort((a, b) => b.soldCount - a.soldCount)
      break
    case 'rating':
      list = [...list].sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }

  return {
    items: list.slice((page - 1) * perPage, page * perPage),
    total: list.length,
    page,
    perPage,
  }
}

/* ══════════════════════════════════════════════════════════════
   API عمومی
   ══════════════════════════════════════════════════════════════ */
export const api = {
  /* ── کاتالوگ ─────────────────────────────────────────────── */
  async categories(): Promise<Category[]> {
    if (LIVE) return http('/categories')
    await wait(60)
    return db.categories
  },

  async products(q: ProductQuery = {}): Promise<Paginated<Product>> {
    if (LIVE) return http(`/products?${new URLSearchParams(flatten(q))}`)
    await wait()
    return queryProducts(q)
  },

  async product(id: ID): Promise<Product | null> {
    if (LIVE) return http(`/products/${id}`)
    await wait(90)
    return db.products.find((p) => p.id === id || p.slug === id) ?? null
  },

  async relatedProducts(id: ID): Promise<Product[]> {
    if (LIVE) return http(`/products/${id}/related`)
    await wait(90)
    const p = db.products.find((x) => x.id === id)
    if (!p) return []
    return db.products
      .filter((x) => x.id !== p.id && x.categoryId === p.categoryId && x.status === 'approved')
      .slice(0, 4)
  },

  async brands(): Promise<string[]> {
    if (LIVE) return http('/brands')
    await wait(40)
    return [...new Set(db.products.map((p) => p.brand))].sort()
  },

  /* ── فروشندگان ───────────────────────────────────────────── */
  async sellers(): Promise<Seller[]> {
    if (LIVE) return http('/sellers')
    await wait(80)
    return db.sellers
  },

  async seller(id: ID): Promise<Seller | null> {
    if (LIVE) return http(`/sellers/${id}`)
    await wait(60)
    return db.sellers.find((s) => s.id === id || s.slug === id) ?? null
  },

  async setSellerStatus(id: ID, status: Seller['status']): Promise<void> {
    if (LIVE) return http(`/admin/sellers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    await wait(120)
    db.sellers = db.sellers.map((s) => (s.id === id ? { ...s, status } : s))
    saveDB()
  },

  /* ── محصولات فروشنده / ادمین ─────────────────────────────── */
  async sellerProducts(sellerId: ID): Promise<Product[]> {
    if (LIVE) return http(`/seller/${sellerId}/products`)
    await wait(100)
    return db.products.filter((p) => p.sellerId === sellerId)
  },

  async allProducts(): Promise<Product[]> {
    if (LIVE) return http('/admin/products')
    await wait(100)
    return db.products
  },

  async saveProduct(input: Product): Promise<Product> {
    if (LIVE) {
      return input.id
        ? http(`/products/${input.id}`, { method: 'PUT', body: JSON.stringify(input) })
        : http('/products', { method: 'POST', body: JSON.stringify(input) })
    }
    await wait(200)
    const exists = db.products.some((p) => p.id === input.id)
    const record: Product = exists ? input : { ...input, id: input.id || `p${uid()}` }
    db.products = exists
      ? db.products.map((p) => (p.id === record.id ? record : p))
      : [record, ...db.products]
    saveDB()
    return record
  },

  async setProductStatus(id: ID, status: Product['status']): Promise<void> {
    if (LIVE) return http(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    await wait(120)
    db.products = db.products.map((p) => (p.id === id ? { ...p, status } : p))
    saveDB()
  },

  async deleteProduct(id: ID): Promise<void> {
    if (LIVE) return http(`/products/${id}`, { method: 'DELETE' })
    await wait(120)
    db.products = db.products.filter((p) => p.id !== id)
    saveDB()
  },

  /* ── دسته‌بندی‌ها (ادمین) ─────────────────────────────────── */
  async saveCategory(input: Category): Promise<Category> {
    if (LIVE) {
      return input.id
        ? http(`/admin/categories/${input.id}`, { method: 'PUT', body: JSON.stringify(input) })
        : http('/admin/categories', { method: 'POST', body: JSON.stringify(input) })
    }
    await wait(160)
    const exists = db.categories.some((c) => c.id === input.id)
    const record = exists ? input : { ...input, id: input.id || `c${uid()}` }
    db.categories = exists
      ? db.categories.map((c) => (c.id === record.id ? record : c))
      : [...db.categories, record]
    saveDB()
    return record
  },

  async deleteCategory(id: ID): Promise<void> {
    if (LIVE) return http(`/admin/categories/${id}`, { method: 'DELETE' })
    await wait(120)
    db.categories = db.categories.filter((c) => c.id !== id)
    saveDB()
  },

  /* ── استعلام‌ها ──────────────────────────────────────────── */
  async inquiries(scope: 'buyer' | 'seller' | 'admin' = 'buyer'): Promise<Inquiry[]> {
    if (LIVE) return http(`/inquiries?scope=${scope}`)
    await wait(120)
    return db.inquiries
  },

  async inquiry(id: ID): Promise<Inquiry | null> {
    if (LIVE) return http(`/inquiries/${id}`)
    await wait(90)
    return db.inquiries.find((i) => i.id === id || i.code === id) ?? null
  },

  async createInquiry(input: Omit<Inquiry, 'id' | 'code' | 'offers' | 'status' | 'createdAt' | 'expiresAt'>): Promise<Inquiry> {
    if (LIVE) return http('/inquiries', { method: 'POST', body: JSON.stringify(input) })
    await wait(260)
    const record: Inquiry = {
      ...input,
      id: `i${uid()}`,
      code: `RFQ-${Math.floor(1_400_000 + Math.random() * 99_999)}`,
      offers: [],
      status: 'open',
      createdAt: 'همین حالا',
      expiresAt: '۱۴ روز دیگر',
    }
    db.inquiries = [record, ...db.inquiries]
    saveDB()
    return record
  },

  async submitOffer(input: Omit<Offer, 'id' | 'status' | 'createdAt'>): Promise<Offer> {
    if (LIVE) return http(`/inquiries/${input.inquiryId}/offers`, { method: 'POST', body: JSON.stringify(input) })
    await wait(240)
    const offer: Offer = { ...input, id: `o${uid()}`, status: 'submitted', createdAt: 'همین حالا' }
    db.inquiries = db.inquiries.map((i) =>
      i.id === input.inquiryId
        ? { ...i, offers: [...i.offers, offer], status: i.status === 'open' ? 'answered' : i.status }
        : i,
    )
    saveDB()
    return offer
  },

  async acceptOffer(inquiryId: ID, offerId: ID): Promise<Order> {
    if (LIVE) return http(`/inquiries/${inquiryId}/offers/${offerId}/accept`, { method: 'POST' })
    await wait(300)
    const inquiry = db.inquiries.find((i) => i.id === inquiryId)!
    const offer = inquiry.offers.find((o) => o.id === offerId)!
    db.inquiries = db.inquiries.map((i) =>
      i.id === inquiryId
        ? {
            ...i,
            status: 'accepted',
            offers: i.offers.map((o) => ({
              ...o,
              status: o.id === offerId ? ('accepted' as const) : ('rejected' as const),
            })),
          }
        : i,
    )
    const seller = db.sellers.find((s) => s.id === offer.sellerId)
    const order: Order = {
      id: `or${uid()}`,
      code: `ORD-${Math.floor(1200 + Math.random() * 800)}`,
      buyerId: inquiry.buyerId,
      lines: inquiry.lines.map((l) => ({
        productId: l.productId ?? l.id,
        name: l.title,
        partNumber: db.products.find((p) => p.id === l.productId)?.partNumber ?? '—',
        sellerId: offer.sellerId,
        unitPrice: offer.unitPrices[l.id] ?? 0,
        quantity: l.quantity,
      })),
      subtotal: offer.total,
      shipping: 0,
      commission: Math.round((offer.total * (seller?.commissionRate ?? 7)) / 100),
      total: offer.total,
      status: 'pending_payment',
      address: {
        fullName: '', phone: '', province: '', city: '', line: '', postalCode: '',
      },
      inquiryId,
      createdAt: 'همین حالا',
      updatedAt: 'همین حالا',
    }
    db.orders = [order, ...db.orders]
    saveDB()
    return order
  },

  /* ── سفارش‌ها ────────────────────────────────────────────── */
  async orders(scope: 'buyer' | 'seller' | 'admin' = 'buyer'): Promise<Order[]> {
    if (LIVE) return http(`/orders?scope=${scope}`)
    await wait(120)
    return db.orders
  },

  async order(id: ID): Promise<Order | null> {
    if (LIVE) return http(`/orders/${id}`)
    await wait(90)
    return db.orders.find((o) => o.id === id || o.code === id) ?? null
  },

  async placeOrder(input: Omit<Order, 'id' | 'code' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    if (LIVE) return http('/orders', { method: 'POST', body: JSON.stringify(input) })
    await wait(400)
    const order: Order = {
      ...input,
      id: `or${uid()}`,
      code: `ORD-${Math.floor(1200 + Math.random() * 800)}`,
      status: 'pending_payment',
      createdAt: 'همین حالا',
      updatedAt: 'همین حالا',
    }
    db.orders = [order, ...db.orders]
    saveDB()
    return order
  },

  async setOrderStatus(id: ID, status: Order['status']): Promise<void> {
    if (LIVE) return http(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
    await wait(140)
    db.orders = db.orders.map((o) => (o.id === id ? { ...o, status, updatedAt: 'همین حالا' } : o))
    saveDB()
  },

  /* ── بلاگ ────────────────────────────────────────────────── */
  async posts(): Promise<Post[]> {
    if (LIVE) return http('/posts')
    await wait(70)
    return seed.posts
  },

  async post(slug: string): Promise<Post | null> {
    if (LIVE) return http(`/posts/${slug}`)
    await wait(70)
    return seed.posts.find((p) => p.slug === slug) ?? null
  },

  /* ── احراز هویت ──────────────────────────────────────────── */
  async requestOtp(phone: string): Promise<{ sent: true }> {
    if (LIVE) return http('/auth/otp', { method: 'POST', body: JSON.stringify({ phone }) })
    await wait(500)
    return { sent: true }
  },

  async verifyOtp(phone: string, code: string, role: User['role'] = 'buyer'): Promise<User> {
    if (LIVE) {
      const res = await http<{ token: string; user: User }>('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      })
      token.set(res.token)
      return res.user
    }
    await wait(600)
    if (code.length !== 5) throw new ApiError('کد تأیید باید ۵ رقم باشد.', 422)
    const known = seed.users.find((u) => u.role === role)
    token.set('demo-token')
    return known ?? { ...seed.users[0], phone, role }
  },

  async me(): Promise<User | null> {
    if (LIVE) {
      if (!token.get()) return null
      return http<User | null>('/auth/me').catch(() => null)
    }
    return null
  },

  async logout(): Promise<void> {
    token.clear()
    if (LIVE) await http('/auth/logout', { method: 'POST' }).catch(() => undefined)
  },
}

function flatten(q: ProductQuery): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(q)) {
    if (v == null) continue
    out[k] = Array.isArray(v) ? v.join(',') : typeof v === 'object' ? JSON.stringify(v) : String(v)
  }
  return out
}
