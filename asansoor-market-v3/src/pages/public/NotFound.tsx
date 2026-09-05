import { Link } from 'react-router-dom'
import { Button, Card } from '@/components/ui'
import { PartSchematic } from '@/components/PartSchematic'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <Card className="overflow-hidden text-center">
        <div className="h-1 bg-gradient-to-l from-signal-400 to-signal-500" />
        <div className="p-8">
          <div className="mx-auto mb-4 h-20 w-20 text-steel-200">
            <PartSchematic kind="rail" />
          </div>
          <p className="num text-[42px] font-black leading-none text-steel-200">۴۰۴</p>
          <h1 className="mt-3 text-lg font-extrabold text-steel-900">این صفحه پیدا نشد</h1>
          <p className="mt-2 text-[15px] leading-7 text-steel-500">
            ممکن است آدرس اشتباه تایپ شده باشد یا صفحه جابه‌جا شده باشد. از کاتالوگ شروع کنید یا
            نام قطعه را جستجو کنید.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/products"><Button variant="signal">مشاهده کاتالوگ</Button></Link>
            <Link to="/"><Button variant="outline">صفحه اصلی</Button></Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
