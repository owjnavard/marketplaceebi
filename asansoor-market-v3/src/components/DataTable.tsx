import { type ReactNode, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import { cn, toFa } from '@/lib/utils'
import { Empty, Input, Skeleton } from './ui'

/* ══════════════════════════════════════════════════════════════
   جدول داده

   یک جدول برای هر سه پنل. جستجو، مرتب‌سازی و صفحه‌بندی داخلی
   دارد و روی موبایل به کارت تبدیل می‌شود — چون جدول افقی روی
   گوشی عملاً غیرقابل استفاده است.
   ══════════════════════════════════════════════════════════════ */

export interface Column<T> {
  key: string
  header: string
  /** مقداری که برای مرتب‌سازی و جستجو استفاده می‌شود */
  value?: (row: T) => string | number
  cell: (row: T) => ReactNode
  sortable?: boolean
  align?: 'start' | 'end'
  /** روی موبایل پنهان شود */
  secondary?: boolean
  width?: string
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  loading,
  searchable = true,
  searchPlaceholder = 'جستجو…',
  perPage = 10,
  empty,
  toolbar,
  onRowClick,
}: {
  rows: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  perPage?: number
  empty?: ReactNode
  toolbar?: ReactNode
  onRowClick?: (row: T) => void
}) {
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = rows
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      list = list.filter((row) =>
        columns
          .map((c) => (c.value ? String(c.value(row)) : ''))
          .join(' ')
          .toLowerCase()
          .includes(needle),
      )
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key)
      if (col?.value) {
        list = [...list].sort((a, b) => {
          const av = col.value!(a)
          const bv = col.value!(b)
          const cmp = typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv), 'fa')
          return sort.dir === 'asc' ? cmp : -cmp
        })
      }
    }
    return list
  }, [rows, q, sort, columns])

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage))
  const current = Math.min(page, pageCount)
  const slice = filtered.slice((current - 1) * perPage, current * perPage)

  const toggleSort = (key: string) =>
    setSort((s) =>
      s?.key === key
        ? s.dir === 'asc' ? { key, dir: 'desc' } : null
        : { key, dir: 'asc' },
    )

  if (loading) {
    return (
      <div className="space-y-3 rounded-[18px] bg-paper p-6 shadow-plate">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[18px] bg-paper shadow-plate">
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
          {searchable && (
            <div className="relative min-w-52 flex-1">
              <Search size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-steel-400" />
              <Input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setPage(1)
                }}
                placeholder={searchPlaceholder}
                className="h-11 pr-11"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      {slice.length === 0 ? (
        <div className="p-4">{empty ?? <Empty title="موردی یافت نشد" description="فیلتر یا عبارت جستجو را تغییر دهید." />}</div>
      ) : (
        <>
          {/* دسکتاپ */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-line bg-steel-50">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      style={{ width: c.width }}
                      className={cn(
                        'whitespace-nowrap px-5 py-3.5 text-[14px] font-semibold text-steel-500',
                        c.align === 'end' && 'text-left',
                      )}
                    >
                      {c.sortable && c.value ? (
                        <button
                          onClick={() => toggleSort(c.key)}
                          className="inline-flex items-center gap-1 transition-colors hover:text-steel-900"
                        >
                          {c.header}
                          {sort?.key === c.key &&
                            (sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-line last:border-0 transition-colors hover:bg-steel-50/70',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cn('px-5 py-4 align-middle text-[15px]', c.align === 'end' && 'text-left')}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* موبایل */}
          <div className="divide-y divide-line md:hidden">
            {slice.map((row) => (
              <div
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn('space-y-2.5 p-5', onRowClick && 'cursor-pointer active:bg-steel-50')}
              >
                {columns
                  .filter((c) => !c.secondary)
                  .map((c) => (
                    <div key={c.key} className="flex items-start justify-between gap-3">
                      <span className="shrink-0 text-[14px] text-steel-400">{c.header}</span>
                      <span className="min-w-0 text-left text-[15px]">{c.cell(row)}</span>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-4">
          <p className="num text-[14px] text-steel-500">
            {toFa(filtered.length)} مورد — صفحه {toFa(current)} از {toFa(pageCount)}
          </p>
          <div className="flex gap-1">
            <PagerButton disabled={current === 1} onClick={() => setPage(current - 1)}>
              قبلی
            </PagerButton>
            <PagerButton disabled={current === pageCount} onClick={() => setPage(current + 1)}>
              بعدی
            </PagerButton>
          </div>
        </div>
      )}
    </div>
  )
}

function PagerButton({
  children, disabled, onClick,
}: {
  children: ReactNode; disabled: boolean; onClick: () => void
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-line px-4 py-1.5 text-[14px] font-semibold text-steel-700 transition-colors hover:border-steel-300 hover:bg-steel-50 disabled:cursor-not-allowed disabled:text-steel-300"
    >
      {children}
    </button>
  )
}

/* ── کارت آماری ─────────────────────────────────────────────── */
export function StatCard({
  label,
  value,
  unit,
  change,
  icon,
  tone = 'steel',
}: {
  label: string
  value: string
  unit?: string
  change?: { value: string; up: boolean }
  icon?: ReactNode
  tone?: 'steel' | 'signal' | 'verify' | 'alert'
}) {
  const tones = {
    steel: 'bg-steel-100 text-steel-600',
    signal: 'bg-signal-100 text-signal-700',
    verify: 'bg-verify-soft text-verify',
    alert: 'bg-alert-soft text-alert',
  }

  return (
    <div className="rounded-[18px] bg-paper p-6 shadow-plate">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-[14px] font-medium text-steel-500">{label}</p>
        {icon && (
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', tones[tone])}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="num text-2xl font-extrabold text-steel-900">{value}</span>
        {unit && <span className="text-[14px] text-steel-400">{unit}</span>}
      </div>
      {change && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1 text-[14px] font-semibold',
            change.up ? 'text-verify' : 'text-alert',
          )}
        >
          {change.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
          <span className="num">{change.value}</span>
          <span className="font-normal text-steel-400">نسبت به ماه قبل</span>
        </p>
      )}
    </div>
  )
}

/* ── نمودار میله‌ای سبک (بدون کتابخانه) ─────────────────────── */
export function BarChart({
  data,
  height = 140,
}: {
  data: { label: string; value: number }[]
  height?: number
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-stretch gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center gap-1.5">
          {/* میله با موقعیت مطلق رسم می‌شود تا درصد ارتفاع نسبت به
              والد با ارتفاع مشخص محاسبه شود، نه نسبت به ارتفاع خودکار */}
          <div className="relative w-full flex-1">
            <div
              className="absolute bottom-0 w-full rounded-t-[8px] bg-steel-800 transition-[height] duration-500 hover:bg-signal-400"
              style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
              title={`${d.label}: ${toFa(d.value.toLocaleString('en-US'))}`}
            />
          </div>
          <span className="shrink-0 text-[12px] text-steel-400">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
