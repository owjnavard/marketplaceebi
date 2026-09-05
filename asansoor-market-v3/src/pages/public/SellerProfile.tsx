import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Package, Phone, ShieldCheck } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Badge, Button, Card, Empty, Spinner, Stars } from '@/components/ui'
import { api } from '@/lib/api'
import type { Product, Seller } from '@/lib/api/types'
import { toFa } from '@/lib/utils'

export default function SellerProfile() {
  const { id = '' } = useParams()
  const [seller, setSeller] = useState<Seller | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void api.seller(id).then(async (s) => {
      setSeller(s)
      if (s) setProducts((await api.sellerProducts(s.id)).filter((p) => p.status === 'approved'))
      setLoading(false)
    })
  }, [id])

  if (loading) return <Spinner />
  if (!seller) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Empty title="این فروشنده پیدا نشد" action={<Link to="/sellers"><Button>فهرست فروشندگان</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <Card className="mb-6 overflow-hidden">
        <div className="blueprint bg-steel-900 px-6 py-8">
          <div className="flex flex-wrap items-center gap-4">
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[18px] text-2xl font-extrabold text-white"
              style={{ background: seller.logoColor, boxShadow: '0 0 0 2px rgba(255,255,255,0.12)' }}
            >
              {seller.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 text-xl font-extrabold text-white">
                {seller.name}
                {seller.verified && (
                  <Badge tone="verify"><ShieldCheck size={11} />احراز شده</Badge>
                )}
              </h1>
              <p className="mt-1 text-[15px] text-steel-400">{seller.legalName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-steel-300">
                <span className="flex items-center gap-1"><MapPin size={12} />{seller.province} — {seller.city}</span>
                <span className="num flex items-center gap-1"><Phone size={12} />{seller.phone}</span>
                <span className="num">عضو از {seller.memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
          {[
            { l: 'امتیاز فروشگاه', v: toFa(seller.rating), extra: <Stars value={seller.rating} size={12} /> },
            { l: 'نظرات ثبت‌شده', v: toFa(seller.reviewCount) },
            { l: 'کالاهای فعال', v: toFa(seller.productCount) },
            { l: 'میانگین پاسخ', v: `${toFa(seller.responseHours)} ساعت` },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-steel-50 px-4 py-3">
              <dt className="text-[13px] text-steel-400">{s.l}</dt>
              <dd className="num mt-1 flex items-center gap-2 text-[16px] font-extrabold text-steel-900">
                {s.v}
                {s.extra}
              </dd>
            </div>
          ))}
        </dl>

        <p className="border-t border-line px-5 py-4 text-[15px] leading-7 text-steel-600">{seller.about}</p>
      </Card>

      <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-steel-900">
        <Package size={17} className="text-steel-400" />
        کالاهای این فروشنده
        <span className="num text-[15px] font-normal text-steel-400">({toFa(products.length)})</span>
      </h2>

      {products.length === 0 ? (
        <Empty title="هنوز کالایی منتشر نشده" description="این فروشنده در حال تکمیل فهرست محصولاتش است." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
