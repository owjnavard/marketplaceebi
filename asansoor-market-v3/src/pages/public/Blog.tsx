import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PartSchematic, type SchematicKey } from '@/components/PartSchematic'
import { Badge, SectionHead, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Post } from '@/lib/api/types'
import { cn, toFa } from '@/lib/utils'

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [tag, setTag] = useState('')

  useEffect(() => {
    void api.posts().then((p) => {
      setPosts(p)
      setLoading(false)
    })
  }, [])

  if (loading) return <Spinner />

  const tags = [...new Set(posts.map((p) => p.tag))]
  const list = tag ? posts.filter((p) => p.tag === tag) : posts

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <SectionHead eyebrow="دانش فنی" title="بلاگ آموزشی" />
      <p className="-mt-3 mb-5 max-w-2xl text-[15px] leading-7 text-steel-500">
        نوشته‌هایی درباره انتخاب قطعه، اجرای درست و استانداردها — از کسانی که پای کار بوده‌اند.
      </p>

      <div className="mb-6 flex flex-wrap gap-1.5">
        <button
          onClick={() => setTag('')}
          className={cn(
            'rounded-3xl border px-3 py-1.5 text-[14px] font-semibold transition-colors',
            !tag ? 'border-steel-800 bg-steel-800 text-white' : 'border-line bg-paper text-steel-600 hover:border-steel-300',
          )}
        >
          همه
        </button>
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={cn(
              'rounded-3xl border px-3 py-1.5 text-[14px] font-semibold transition-colors',
              tag === t ? 'border-steel-800 bg-steel-800 text-white' : 'border-line bg-paper text-steel-600 hover:border-steel-300',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link
            key={p.id}
            to={`/blog/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper transition-colors hover:border-steel-300"
          >
            <div className="flex h-36 items-center justify-center border-b border-line bg-steel-50 p-7 text-steel-200 transition-colors group-hover:text-signal-400">
              <PartSchematic kind={p.cover as SchematicKey} className="h-full w-auto" />
            </div>
            <div className="flex flex-1 flex-col p-4">
              <Badge tone="muted" className="mb-2 self-start">{p.tag}</Badge>
              <h2 className="text-[16px] font-bold leading-7 text-steel-900 transition-colors group-hover:text-signal-600">
                {p.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-[15px] leading-6 text-steel-500">{p.excerpt}</p>
              <div className="num mt-4 flex items-center justify-between text-[13px] text-steel-400">
                <span>{p.author}</span>
                <span>{toFa(p.readMinutes)} دقیقه</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
