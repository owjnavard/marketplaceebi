import { cn } from '@/lib/utils'

/* ══════════════════════════════════════════════════════════════
   نقشه‌های شماتیک قطعات

   به‌جای عکس استوک، هر دسته یک نقشه خطی دارد. سه دلیل:
   ۱) هیچ درخواست شبکه‌ای اضافه نمی‌کند و روی هاست اشتراکی سریع است
   ۲) عکس خراب یا لینک از دست رفته وجود ندارد
   ۳) زبان بصری کاتالوگ فنی است، نه فروشگاه لوازم خانگی
   ══════════════════════════════════════════════════════════════ */

export type SchematicKey =
  | 'motor' | 'door' | 'panel' | 'rail' | 'safety'
  | 'rope' | 'cabin' | 'button' | 'service'

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const shapes: Record<SchematicKey, React.ReactNode> = {
  motor: (
    <>
      <rect x="18" y="30" width="44" height="36" rx="3" {...stroke} />
      <circle cx="76" cy="48" r="18" {...stroke} />
      <circle cx="76" cy="48" r="7" {...stroke} />
      <path d="M26 30v-6h12v6M44 30v-6h12v6" {...stroke} />
      <path d="M22 38h36M22 46h36M22 54h36" {...stroke} strokeWidth={1} opacity={0.45} />
      <path d="M62 42h-4M62 54h-4" {...stroke} />
      <path d="M94 34v28" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M76 30v-6M76 72v-6" {...stroke} strokeWidth={1} opacity={0.4} />
    </>
  ),
  door: (
    <>
      <rect x="20" y="14" width="60" height="72" rx="2" {...stroke} />
      <path d="M50 14v72" {...stroke} />
      <path d="M36 14v72M64 14v72" {...stroke} strokeWidth={1} opacity={0.45} />
      <path d="M44 48h-4M56 48h4" {...stroke} />
      <path d="M20 20h60" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M14 50h-6M92 50h-6" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M20 90h60" {...stroke} strokeWidth={2.5} />
    </>
  ),
  panel: (
    <>
      <rect x="22" y="12" width="56" height="76" rx="3" {...stroke} />
      <rect x="30" y="20" width="40" height="18" rx="2" {...stroke} />
      <path d="M35 29h10M52 25v8M56 25v8M60 25v8" {...stroke} strokeWidth={1.2} opacity={0.7} />
      <rect x="30" y="46" width="17" height="34" rx="2" {...stroke} />
      <rect x="53" y="46" width="17" height="16" rx="2" {...stroke} />
      <path d="M56 68h11M56 74h8" {...stroke} strokeWidth={1.2} opacity={0.6} />
      <path d="M34 52h9M34 58h9M34 64h9M34 70h6" {...stroke} strokeWidth={1} opacity={0.5} />
      <circle cx="74" cy="50" r="1.6" fill="currentColor" />
    </>
  ),
  rail: (
    <>
      <path d="M30 12h40M30 88h40" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M38 12v76M62 12v76" {...stroke} />
      <path d="M38 20h24M38 44h24M38 68h24" {...stroke} strokeWidth={1} opacity={0.35} />
      <path d="M46 12v76M54 12v76" {...stroke} strokeWidth={1} opacity={0.35} />
      <rect x="24" y="34" width="14" height="12" rx="1.5" {...stroke} />
      <rect x="62" y="54" width="14" height="12" rx="1.5" {...stroke} />
      <circle cx="31" cy="40" r="1.8" fill="currentColor" />
      <circle cx="69" cy="60" r="1.8" fill="currentColor" />
    </>
  ),
  safety: (
    <>
      <path d="M40 16v68M60 16v68" {...stroke} strokeWidth={1} opacity={0.4} />
      <rect x="26" y="38" width="48" height="26" rx="3" {...stroke} />
      <path d="M40 38v26M60 38v26" {...stroke} />
      <path d="M32 44l6 8-6 8M68 44l-6 8 6 8" {...stroke} strokeWidth={1.2} />
      <path d="M50 26v12M50 64v12" {...stroke} />
      <path d="M44 26h12M44 76h12" {...stroke} strokeWidth={2} />
      <circle cx="50" cy="51" r="3" {...stroke} />
    </>
  ),
  rope: (
    <>
      <circle cx="50" cy="26" r="14" {...stroke} />
      <circle cx="50" cy="26" r="4" {...stroke} />
      <path d="M36 26q7 22 0 58M44 26q7 22 0 58M56 26q-7 22 0 58M64 26q-7 22 0 58" {...stroke} strokeWidth={1.2} />
      <path d="M30 62q40 8 40 0M30 74q40 8 40 0" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M50 12v-4" {...stroke} strokeWidth={1} opacity={0.4} />
    </>
  ),
  cabin: (
    <>
      <path d="M14 10h72M14 90h72" {...stroke} strokeWidth={1} opacity={0.35} />
      <rect x="24" y="18" width="52" height="64" rx="2" {...stroke} />
      <rect x="32" y="26" width="36" height="48" rx="1.5" {...stroke} strokeWidth={1} opacity={0.55} />
      <path d="M50 26v48" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M32 62h36" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M24 18l-6-6M76 18l6-6" {...stroke} strokeWidth={1} opacity={0.4} />
      <rect x="36" y="14" width="28" height="4" rx="1" {...stroke} />
    </>
  ),
  button: (
    <>
      <rect x="30" y="10" width="40" height="80" rx="4" {...stroke} />
      <rect x="37" y="18" width="26" height="18" rx="2" {...stroke} />
      <path d="M43 24v6M47 24v6M55 24v6M59 24v6" {...stroke} strokeWidth={1.4} opacity={0.7} />
      <circle cx="50" cy="50" r="8" {...stroke} />
      <path d="M50 46l4 5h-8z" fill="currentColor" />
      <circle cx="50" cy="72" r="8" {...stroke} />
      <path d="M50 76l4-5h-8z" fill="currentColor" />
    </>
  ),
  service: (
    <>
      <path d="M28 72l24-24" {...stroke} strokeWidth={2} />
      <path d="M22 78a5 5 0 007 7l5-5-7-7z" {...stroke} />
      <path d="M52 48a13 13 0 1015-15l-7 7-6-1-1-6z" {...stroke} />
      <circle cx="30" cy="30" r="12" {...stroke} strokeWidth={1} opacity={0.4} />
      <circle cx="30" cy="30" r="4" {...stroke} strokeWidth={1} opacity={0.4} />
      <path d="M30 18v-4M30 46v-4M18 30h-4M46 30h-4" {...stroke} strokeWidth={1} opacity={0.4} />
    </>
  ),
}

export function PartSchematic({
  kind,
  className,
}: {
  kind: SchematicKey
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('h-full w-full', className)}
      role="presentation"
      aria-hidden="true"
    >
      {shapes[kind]}
    </svg>
  )
}

/* نگاشت شناسه دسته به نقشه — تنها جایی که این ارتباط تعریف می‌شود */
const byCategory: Record<string, SchematicKey> = {
  c1: 'motor', c2: 'door', c3: 'panel', c4: 'rail', c5: 'safety',
  c6: 'rope', c7: 'cabin', c8: 'button', c9: 'service',
}

export function schematicFor(categoryId: string): SchematicKey {
  return byCategory[categoryId] ?? 'panel'
}
