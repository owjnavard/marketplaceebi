import { useEffect, useState } from 'react'
import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react'
import { PanelHead } from '@/layouts/PanelLayout'
import { PartSchematic, schematicFor } from '@/components/PartSchematic'
import { Badge, Button, Card, Empty, Field, Input, Modal, Select, Spinner } from '@/components/ui'
import { api } from '@/lib/api'
import type { AttributeDef, AttributeType, Category } from '@/lib/api/types'
import { slugify, toFa } from '@/lib/utils'
import { useToasts } from '@/store'

const TYPE_LABEL: Record<AttributeType, string> = {
  text: 'متن', number: 'عدد', select: 'انتخابی', boolean: 'بله/خیر',
}

const EMPTY: Category = {
  id: '', slug: '', name: '', icon: 'panel', parentId: null, productCount: 0, attributes: [],
}

/* دسته‌بندی‌ها و ویژگی‌هایشان اینجا تعریف می‌شود؛ فرم ثبت محصول و
   فیلترهای کاتالوگ هر دو از همین تعریف تغذیه می‌شوند. */
export default function AdminCategories() {
  const [rows, setRows] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [busy, setBusy] = useState(false)
  const push = useToasts((s) => s.push)

  const load = () => {
    setLoading(true)
    void api.categories().then((r) => {
      setRows(r)
      setLoading(false)
    })
  }

  useEffect(load, [])

  if (loading) return <Spinner />

  const save = async () => {
    if (!editing) return
    if (editing.name.trim().length < 2) {
      push('نام دسته را وارد کنید.', 'error')
      return
    }
    setBusy(true)
    await api.saveCategory({ ...editing, slug: editing.slug || slugify(editing.name) })
    push(editing.id ? 'دسته‌بندی به‌روز شد' : 'دسته‌بندی ساخته شد')
    setEditing(null)
    setBusy(false)
    load()
  }

  const remove = async () => {
    if (!deleting) return
    setBusy(true)
    await api.deleteCategory(deleting.id)
    push(`دسته «${deleting.name}» حذف شد`)
    setDeleting(null)
    setBusy(false)
    load()
  }

  const setAttr = (i: number, patch: Partial<AttributeDef>) =>
    setEditing((c) => (c ? { ...c, attributes: c.attributes.map((a, j) => (j === i ? { ...a, ...patch } : a)) } : c))

  const addAttr = () =>
    setEditing((c) =>
      c ? { ...c, attributes: [...c.attributes, { key: `a${c.attributes.length + 1}`, label: '', type: 'text', required: false, filterable: true }] } : c,
    )

  const removeAttr = (i: number) =>
    setEditing((c) => (c ? { ...c, attributes: c.attributes.filter((_, j) => j !== i) } : c))

  return (
    <>
      <PanelHead
        title="دسته‌بندی‌ها"
        description="هر دسته ویژگی‌های خودش را دارد؛ همین ویژگی‌ها فرم ثبت محصول و فیلترهای کاتالوگ را می‌سازند"
        action={<Button variant="signal" onClick={() => setEditing({ ...EMPTY })}><Plus size={15} />دسته جدید</Button>}
      />

      {rows.length === 0 ? (
        <Empty icon={<FolderTree size={20} />} title="هنوز دسته‌بندی تعریف نشده" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((c) => (
            <Card key={c.id} className="flex flex-col p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="h-10 w-10 shrink-0 rounded-xl border border-line bg-steel-50 p-1.5 text-steel-400">
                  <PartSchematic kind={schematicFor(c.id)} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-steel-900">{c.name}</p>
                  <p className="code mt-0.5 text-[13px] text-steel-400">{c.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...c })} className="rounded-3xl p-1.5 text-steel-400 transition-colors hover:bg-steel-100 hover:text-steel-800" aria-label="ویرایش">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleting(c)} className="rounded-3xl p-1.5 text-steel-400 transition-colors hover:bg-alert-soft hover:text-alert" aria-label="حذف">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-1">
                {c.attributes.map((a) => (
                  <Badge key={a.key} tone={a.required ? 'steel' : 'muted'}>
                    {a.label}
                    {a.unit && <span className="opacity-70"> ({a.unit})</span>}
                  </Badge>
                ))}
                {c.attributes.length === 0 && <span className="text-[14px] text-steel-400">بدون ویژگی</span>}
              </div>

              <p className="num mt-auto text-[14px] text-steel-500">{toFa(c.productCount)} کالا در این دسته</p>
            </Card>
          ))}
        </div>
      )}

      {/* فرم دسته */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>انصراف</Button>
            <Button variant="signal" loading={busy} onClick={save}>ذخیره</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="نام دسته" required>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="مثلاً موتور و گیربکس" />
              </Field>
              <Field label="نامک (slug)" hint="در آدرس صفحه استفاده می‌شود">
                <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} dir="ltr" className="code" placeholder="motor" />
              </Field>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-bold text-steel-800">ویژگی‌های این دسته</p>
                  <p className="text-[13px] text-steel-400">ویژگی‌های «قابل فیلتر» در ستون فیلتر کاتالوگ نمایش داده می‌شوند.</p>
                </div>
                <Button size="sm" variant="outline" onClick={addAttr}><Plus size={13} />ویژگی</Button>
              </div>

              <div className="space-y-2">
                {editing.attributes.length === 0 && (
                  <p className="rounded-xl border border-dashed border-line py-6 text-center text-[14px] text-steel-400">
                    هنوز ویژگی‌ای تعریف نشده است.
                  </p>
                )}
                {editing.attributes.map((a, i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-line p-3">
                    <div className="flex flex-wrap items-end gap-2">
                      <Field label="عنوان" className="min-w-32 flex-1">
                        <Input value={a.label} onChange={(e) => setAttr(i, { label: e.target.value, key: a.key || slugify(e.target.value) })} className="h-9" placeholder="توان" />
                      </Field>
                      <Field label="کلید" className="w-28">
                        <Input value={a.key} onChange={(e) => setAttr(i, { key: e.target.value })} dir="ltr" className="code h-9" />
                      </Field>
                      <Field label="نوع" className="w-32">
                        <Select value={a.type} onChange={(e) => setAttr(i, { type: e.target.value as AttributeType })} className="h-9">
                          {(Object.keys(TYPE_LABEL) as AttributeType[]).map((t) => (
                            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="واحد" className="w-24">
                        <Input value={a.unit ?? ''} onChange={(e) => setAttr(i, { unit: e.target.value })} className="h-9" placeholder="kW" />
                      </Field>
                      <button onClick={() => removeAttr(i)} className="mb-1 rounded-3xl p-2 text-steel-400 transition-colors hover:bg-alert-soft hover:text-alert" aria-label="حذف ویژگی">
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {a.type === 'select' && (
                      <Field label="گزینه‌ها" hint="با ویرگول جدا کنید">
                        <Input
                          value={a.options?.join('، ') ?? ''}
                          onChange={(e) => setAttr(i, { options: e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean) })}
                          className="h-9"
                          placeholder="گیرلس، گیربکسی، هیدرولیک"
                        />
                      </Field>
                    )}

                    <div className="flex gap-4">
                      <label className="flex cursor-pointer items-center gap-1.5 text-[14px] text-steel-600">
                        <input type="checkbox" checked={a.required} onChange={(e) => setAttr(i, { required: e.target.checked })} className="h-4 w-4 accent-steel-800" />
                        الزامی
                      </label>
                      <label className="flex cursor-pointer items-center gap-1.5 text-[14px] text-steel-600">
                        <input type="checkbox" checked={a.filterable} onChange={(e) => setAttr(i, { filterable: e.target.checked })} className="h-4 w-4 accent-steel-800" />
                        قابل فیلتر
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="حذف دسته‌بندی"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>انصراف</Button>
            <Button variant="danger" loading={busy} onClick={remove}>حذف کن</Button>
          </>
        }
      >
        <p className="text-[15px] leading-7 text-steel-600">
          دسته «{deleting?.name}» حذف می‌شود. کالاهای موجود در این دسته بدون دسته‌بندی می‌مانند و
          باید دوباره دسته‌بندی شوند.
        </p>
      </Modal>
    </>
  )
}
