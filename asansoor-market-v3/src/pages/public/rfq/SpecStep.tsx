import { useMemo, useState } from 'react'
import { ChevronDown, Info, MapPin, Plus, Table2, Trash2, Wand2 } from 'lucide-react'
import { Button, Card, Field, Input, Select } from '@/components/ui'
import { PROVINCES } from '@/lib/api/seed'
import {
  deriveStops, makeStops, PROGRESS_STAGES, usageLabel,
  type InquirySpec, type ProgressStage, type ProjectUsage, type Representative,
} from '@/features/rfq/inquiry'
import { cn, toEn, toFa } from '@/lib/utils'
import { useAuth } from '@/store'

const num = (v: string) => Number(toEn(v).replace(/[^\d.]/g, '')) || 0

export function SpecStep({
  spec, setSpec,
}: {
  spec: InquirySpec
  setSpec: (updater: (s: InquirySpec) => InquirySpec) => void
}) {
  const [showTable, setShowTable] = useState(false)
  const user = useAuth((s) => s.user)
  const isSeller = user?.role === 'seller'

  const set = <K extends keyof InquirySpec>(k: K, v: InquirySpec[K]) =>
    setSpec((s) => ({ ...s, [k]: v }))

  const derived = useMemo(() => deriveStops(spec.stopRows, spec.stops), [spec.stopRows, spec.stops])

  const setStops = (n: number) => {
    const count = Math.min(50, Math.max(2, n))
    setSpec((s) => ({ ...s, stops: count, stopRows: makeStops(count, s.stopRows) }))
  }

  const setRow = (index: number, patch: Partial<InquirySpec['stopRows'][number]>) =>
    setSpec((s) => ({
      ...s,
      stopRows: s.stopRows.map((r) => (r.index === index ? { ...r, ...patch } : r)),
    }))

  /* پر کردن یکسان یک ستون برای همه ردیف‌ها */
  const fillColumn = (field: 'ceiling' | 'height') => {
    const raw = window.prompt(
      field === 'ceiling'
        ? 'ارتفاع سقف برای همه توقف‌ها (سانتی‌متر):'
        : 'فاصله بین طبقات برای همه توقف‌ها (سانتی‌متر):',
      field === 'ceiling' ? '250' : '300',
    )
    if (!raw) return
    const v = num(raw)
    if (!v) return
    setSpec((s) => ({
      ...s,
      stopRows: s.stopRows.map((r) =>
        // چاهک و بالاترین ردیف مقادیر خاص خودشان را دارند (پیت و اورهد)
        r.index === 0 || (field === 'height' && r.index === s.stops) ? r : { ...r, [field]: v },
      ),
    }))
  }

  const addRep = () =>
    set('reps', [
      ...spec.reps,
      { id: `rp${spec.reps.length + 1}`, name: '', phone: '', role: '' },
    ])

  const setRep = (i: number, patch: Partial<Representative>) =>
    set('reps', spec.reps.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const toggleStage = (k: ProgressStage) =>
    set('doneStages', spec.doneStages.includes(k)
      ? spec.doneStages.filter((x) => x !== k)
      : [...spec.doneStages, k])

  const rowsTopDown = [...spec.stopRows].sort((a, b) => b.index - a.index)

  return (
    <div className="space-y-5">
      {/* ── پروژه ── */}
      <Card>
        <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-extrabold text-steel-900">
          مشخصات پروژه
        </h2>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="نام پروژه" required className="sm:col-span-2">
            <Input
              value={spec.projectName}
              onChange={(e) => set('projectName', e.target.value)}
              placeholder="مثلاً برج مسکونی نیاوران"
            />
          </Field>

          <Field
            label="کارفرما"
            required
            hint={isSeller ? 'انتخاب از مشتریان یا افزودن' : 'نام شما'}
          >
            <Input
              value={spec.clientName || (isSeller ? '' : user?.name ?? '')}
              onChange={(e) => set('clientName', e.target.value)}
              placeholder={isSeller ? 'نام مشتری' : user?.name ?? 'نام خریدار'}
              disabled={!isSeller && !!user}
            />
          </Field>

          <Field label="کاربری پروژه" required>
            <Select value={spec.usage} onChange={(e) => set('usage', e.target.value as ProjectUsage)}>
              {(Object.keys(usageLabel) as ProjectUsage[]).map((u) => (
                <option key={u} value={u}>{usageLabel[u]}</option>
              ))}
            </Select>
          </Field>
        </div>

        {/* نمایندگان */}
        <div className="border-t border-line p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[14px] font-bold text-steel-800">نماینده کارفرما یا سرپرست کارگاه</p>
              <p className="text-[12.5px] text-steel-400">اختیاری — می‌توانید چند نفر اضافه کنید</p>
            </div>
            <Button size="sm" variant="outline" onClick={addRep}>
              <Plus size={14} />
              افزودن نماینده
            </Button>
          </div>

          {spec.reps.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line py-5 text-center text-[13px] text-steel-400">
              نماینده‌ای اضافه نشده است.
            </p>
          ) : (
            <div className="space-y-2">
              {spec.reps.map((r, i) => (
                <div key={r.id} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_150px_150px_40px]">
                  <Input value={r.name} onChange={(e) => setRep(i, { name: e.target.value })} placeholder="نام و نام خانوادگی" className="h-10" />
                  <Input value={r.phone} onChange={(e) => setRep(i, { phone: e.target.value })} placeholder="تلفن" className="num h-10" />
                  <Input value={r.role} onChange={(e) => setRep(i, { role: e.target.value })} placeholder="سمت" className="h-10" />
                  <button
                    onClick={() => set('reps', spec.reps.filter((_, j) => j !== i))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-steel-400 transition-colors hover:bg-alert-soft hover:text-alert"
                    aria-label="حذف نماینده"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* آدرس */}
        <div className="border-t border-line p-5">
          <p className="mb-3 flex items-center gap-2 text-[14px] font-bold text-steel-800">
            <MapPin size={15} className="text-steel-400" />
            آدرس پروژه
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="استان" required>
              <Select value={spec.province} onChange={(e) => set('province', e.target.value)}>
                {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </Field>
            <Field label="شهر" required>
              <Input value={spec.city} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="نشانی" className="sm:col-span-2">
              <Input value={spec.address} onChange={(e) => set('address', e.target.value)} placeholder="خیابان، کوچه، پلاک" />
            </Field>
            <Field label="موقعیت روی نقشه" hint="عرض و طول جغرافیایی" className="sm:col-span-2">
              <div className="grid grid-cols-2 gap-3">
                <Input value={spec.lat ?? ''} onChange={(e) => set('lat', num(e.target.value) || undefined)} placeholder="۳۵٫۸۱" className="num" inputMode="decimal" />
                <Input value={spec.lng ?? ''} onChange={(e) => set('lng', num(e.target.value) || undefined)} placeholder="۵۱٫۴۷" className="num" inputMode="decimal" />
              </div>
            </Field>
          </div>
        </div>
      </Card>

      {/* ── آسانسور ── */}
      <Card>
        <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-extrabold text-steel-900">
          مشخصات آسانسور
        </h2>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <Field label="تعداد دستگاه مشابه" required hint="پیش‌فرض ۱">
            <Input
              value={toFa(spec.units)}
              onChange={(e) => set('units', Math.max(1, num(e.target.value)))}
              className="num"
              inputMode="numeric"
            />
          </Field>
          <Field label="نام آسانسور" required>
            <Input value={spec.elevatorName} onChange={(e) => set('elevatorName', e.target.value)} />
          </Field>
          <Field label="توضیح مختصر">
            <Input
              value={spec.elevatorNote}
              onChange={(e) => set('elevatorNote', e.target.value)}
              placeholder="ضلع غربی، سمت چپ"
            />
          </Field>

          <Field label="ظرفیت" hint="نفر" required>
            <Input
              value={toFa(spec.capacityPersons)}
              onChange={(e) => {
                const p = num(e.target.value)
                setSpec((s) => ({ ...s, capacityPersons: p, capacityKg: p * 75 }))
              }}
              className="num"
              inputMode="numeric"
            />
          </Field>
          <Field label="ظرفیت" hint="کیلوگرم — قابل تغییر" required>
            <Input
              value={toFa(spec.capacityKg)}
              onChange={(e) => set('capacityKg', num(e.target.value))}
              className="num"
              inputMode="numeric"
            />
          </Field>
          <Field label="تعداد توقف" hint="۲ تا ۵۰" required>
            <Input
              value={toFa(spec.stops)}
              onChange={(e) => setStops(num(e.target.value))}
              className="num"
              inputMode="numeric"
            />
          </Field>
        </div>

        {/* مراحل انجام‌شده */}
        <div className="border-t border-line p-5">
          <p className="mb-1 text-[14px] font-bold text-steel-800">مراحل انجام‌شده</p>
          <p className="mb-3 text-[12.5px] text-steel-400">
            هر مرحله‌ای که تیک بخورد، از فهرست خدمات اجرا حذف می‌شود.
          </p>
          <div className="flex flex-wrap gap-2">
            {PROGRESS_STAGES.map((s) => {
              const locked = 'locked' in s && s.locked
              const on = spec.doneStages.includes(s.key)
              return (
                <button
                  key={s.key}
                  disabled={locked}
                  onClick={() => toggleStage(s.key)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors',
                    locked && 'cursor-not-allowed border-dashed border-line text-steel-300',
                    !locked && on && 'border-verify bg-verify-soft text-verify',
                    !locked && !on && 'border-line bg-paper text-steel-600 hover:border-steel-300',
                  )}
                  title={locked ? 'استاندارد نتیجه فرایند است و انتخابی نیست' : undefined}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* ── جدول توقف‌ها ── */}
      <Card>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-right"
        >
          <span className="flex items-center gap-2.5">
            <Table2 size={17} className="text-steel-400" />
            <span>
              <span className="block text-[15px] font-extrabold text-steel-900">جدول توقف‌ها</span>
              <span className="block text-[12.5px] text-steel-400">
                برای ثبت دقیق‌تر اطلاعات و آسانسورهای خاص
              </span>
            </span>
          </span>
          <ChevronDown size={18} className={cn('shrink-0 text-steel-400 transition-transform', showTable && 'rotate-180')} />
        </button>

        {showTable && (
          <div className="border-t border-line">
            <div className="flex flex-wrap gap-2 border-b border-line bg-steel-50 px-5 py-3">
              <Button size="sm" variant="outline" onClick={() => fillColumn('ceiling')}>
                <Wand2 size={14} />
                ارتفاع سقف یکسان برای همه
              </Button>
              <Button size="sm" variant="outline" onClick={() => fillColumn('height')}>
                <Wand2 size={14} />
                فاصله طبقات یکسان برای همه
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-right">
                <thead>
                  <tr className="border-b border-line bg-steel-50 text-[12.5px] font-bold text-steel-500">
                    <th className="px-4 py-3">توقف</th>
                    <th className="px-4 py-3">شاخص</th>
                    <th className="px-4 py-3">ارتفاع سقف (cm)</th>
                    <th className="px-4 py-3">فاصله / ارتفاع (cm)</th>
                    <th className="px-3 py-3 text-center">ورودی جلو</th>
                    <th className="px-3 py-3 text-center">ورودی پشت</th>
                    <th className="px-3 py-3 text-center">ورودی جانبی</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsTopDown.map((r) => {
                    const isPit = r.index === 0
                    const isTop = r.index === spec.stops
                    return (
                      <tr
                        key={r.index}
                        className={cn('border-b border-line last:border-0', (isPit || isTop) && 'bg-signal-50/50')}
                      >
                        <td className="px-4 py-2.5">
                          <span className="num font-bold text-steel-800">
                            {isPit ? 'چاهک' : toFa(r.index)}
                          </span>
                          {isTop && <span className="mr-1.5 text-[12px] text-signal-700">(اورهد)</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {isPit ? (
                            <span className="code rounded-md bg-steel-200 px-2 py-1 text-[12px] font-bold text-steel-700">PIT</span>
                          ) : (
                            <Input value={r.label} onChange={(e) => setRow(r.index, { label: e.target.value })} className="code h-9 w-20 text-center" />
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <Input
                            value={r.ceiling != null ? toFa(r.ceiling) : ''}
                            onChange={(e) => setRow(r.index, { ceiling: num(e.target.value) || null })}
                            className="num h-9 w-24"
                            inputMode="numeric"
                            disabled={isPit}
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <Input
                            value={r.height != null ? toFa(r.height) : ''}
                            onChange={(e) => setRow(r.index, { height: num(e.target.value) || null })}
                            className="num h-9 w-24"
                            inputMode="numeric"
                            placeholder={isPit ? 'ارتفاع پیت' : isTop ? 'ارتفاع اورهد' : ''}
                          />
                        </td>
                        {([['entryFront', r.entryFront], ['entryRear', r.entryRear], ['entrySide', r.entrySide]] as const).map(
                          ([key, val]) => (
                            <td key={key} className="px-3 py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={val}
                                disabled={isPit}
                                onChange={(e) => setRow(r.index, { [key]: e.target.checked })}
                                className="h-4 w-4 disabled:opacity-30"
                              />
                            </td>
                          ),
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* ── مقادیر محاسبه‌شده ── */}
      <Card className="border-signal-300 bg-signal-50/60 p-5">
        <p className="mb-3 flex items-center gap-2 text-[14px] font-bold text-steel-900">
          <Info size={15} className="text-signal-600" />
          محاسبه‌شده از جدول توقف‌ها
        </p>
        <dl className="grid gap-3 sm:grid-cols-4">
          {[
            { l: 'تعداد ورودی کابین', v: toFa(derived.cabinEntries), u: 'ورودی' },
            { l: 'تعداد درب طبقات', v: toFa(derived.landingDoors), u: 'درب' },
            { l: 'کورس حرکت', v: derived.travel ? toFa(derived.travel) : '—', u: 'متر' },
            { l: 'ارتفاع پیت / اورهد', v: `${derived.pitDepth ? toFa(derived.pitDepth) : '—'} / ${derived.overhead ? toFa(derived.overhead) : '—'}`, u: 'cm' },
          ].map((r) => (
            <div key={r.l} className="rounded-xl bg-paper px-4 py-3">
              <dt className="text-[12px] text-steel-400">{r.l}</dt>
              <dd className="num mt-0.5 text-[17px] font-extrabold text-steel-900">
                {r.v}
                <span className="mr-1.5 text-[12px] font-normal text-steel-400">{r.u}</span>
              </dd>
            </div>
          ))}
        </dl>
        {derived.travel === 0 && (
          <p className="mt-3 text-[12.5px] leading-6 text-notice">
            کورس حرکت صفر است — ستون «فاصله» را در جدول توقف‌ها پر کنید تا لیست قطعات درست
            محاسبه شود.
          </p>
        )}
      </Card>
    </div>
  )
}
