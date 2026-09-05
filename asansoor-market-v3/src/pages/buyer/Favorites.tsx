import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { PanelHead } from '@/layouts/PanelLayout'
import { Button, Empty, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Product } from '@/lib/api/types'
import { toFa } from '@/lib/utils'
import { useLists } from '@/store'

export default function Favorites() {
  const favorites = useLists((s) => s.favorites)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void Promise.all(favorites.map((id) => api.product(id))).then((list) => {
      setProducts(list.filter(Boolean) as Product[])
      setLoading(false)
    })
  }, [favorites])

  if (loading) return <Spinner />

  return (
    <>
      <PanelHead
        title="علاقه‌مندی‌ها"
        description={products.length ? `${toFa(products.length)} کالای ذخیره‌شده` : undefined}
      />
      {products.length === 0 ? (
        <Empty
          icon={<Heart size={20} />}
          title="لیست علاقه‌مندی‌ها خالی است"
          description="کالاهایی را که می‌خواهید بعداً بررسی کنید، با آیکون قلب ذخیره کنید."
          action={<Link to="/products"><Button>مشاهده کاتالوگ</Button></Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </>
  )
}
