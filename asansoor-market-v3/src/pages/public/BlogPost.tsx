import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, User } from 'lucide-react'
import { PartSchematic, type SchematicKey } from '@/components/PartSchematic'
import { Badge, Button, Card, Empty, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { Post } from '@/lib/api/types'
import { toFa } from '@/lib/utils'

/* متن مقاله در دیتابیس با markdown ساده ذخیره می‌شود؛ فقط تیتر و
   پاراگراف و لیست پشتیبانی می‌شود تا نیازی به کتابخانه نباشد. */
function renderBody(body: string) {
  return body.split('\n\n').map((block, i) => {
    const trimmed = block.trim()
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={i} className="mt-8 mb-3 text-[19px] font-extrabold text-steel-900">
          {trimmed.slice(3)}
        </h2>
      )
    }
    if (trimmed.startsWith('- ')) {
      return (
        <ul key={i} className="my-4 space-y-2">
          {trimmed.split('\n').map((li, j) => (
            <li key={j} className="flex gap-2.5 text-[15px] leading-8 text-steel-600">
              <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-400" />
              {li.replace(/^-\s*/, '')}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={i} className="my-4 text-[15px] leading-9 text-steel-600">
        {trimmed}
      </p>
    )
  })
}

export default function BlogPost() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [more, setMore] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void Promise.all([api.post(slug), api.posts()]).then(([p, all]) => {
      setPost(p)
      setMore(all.filter((x) => x.slug !== slug).slice(0, 3))
      setLoading(false)
    })
  }, [slug])

  if (loading) return <Spinner />
  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <Empty title="این مقاله پیدا نشد" action={<Link to="/blog"><Button>بازگشت به بلاگ</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <Link to="/blog" className="mb-4 inline-flex items-center gap-1.5 text-[15px] font-semibold text-steel-500 transition-colors hover:text-steel-900">
        <ArrowRight size={15} />
        همه مقالات
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <article className="min-w-0">
          <Card className="overflow-hidden">
            <div className="flex h-44 items-center justify-center border-b border-line bg-steel-50 p-8 text-steel-200">
              <PartSchematic kind={post.cover as SchematicKey} className="h-full w-auto" />
            </div>

            <div className="p-6 md:p-8">
              <Badge tone="signal" className="mb-3">{post.tag}</Badge>
              <h1 className="text-[24px] font-black leading-[1.4] text-steel-900 md:text-[30px]">{post.title}</h1>
              <p className="mt-3 text-[16px] leading-8 text-steel-500">{post.excerpt}</p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3 text-[14px] text-steel-500">
                <span className="flex items-center gap-1.5"><User size={13} />{post.author}</span>
                <span className="num flex items-center gap-1.5"><Calendar size={13} />{post.publishedAt}</span>
                <span className="num flex items-center gap-1.5"><Clock size={13} />{toFa(post.readMinutes)} دقیقه مطالعه</span>
              </div>

              <div className="mt-2">{renderBody(post.body)}</div>
            </div>
          </Card>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <Card className="border-signal-300 bg-signal-50 p-5">
            <h2 className="text-[16px] font-extrabold text-steel-900">پروژه‌ای در دست دارید؟</h2>
            <p className="mt-1.5 text-[14px] leading-6 text-steel-600">
              مشخصات آسانسور را وارد کنید تا لیست قطعات با تعداد محاسبه‌شده بسازیم و یکجا برایتان
              استعلام بگیریم.
            </p>
            <Link to="/rfq" className="mt-3 block">
              <Button variant="signal" className="w-full">شروع استعلام پروژه</Button>
            </Link>
          </Card>

          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-4 py-3 text-[15px] font-bold text-steel-900">مطالب دیگر</h2>
            <div className="divide-y divide-line">
              {more.map((p) => (
                <Link key={p.id} to={`/blog/${p.slug}`} className="block px-4 py-3 transition-colors hover:bg-steel-50">
                  <p className="text-[15px] font-bold leading-6 text-steel-800">{p.title}</p>
                  <p className="num mt-1 text-[13px] text-steel-400">{toFa(p.readMinutes)} دقیقه — {p.tag}</p>
                </Link>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
