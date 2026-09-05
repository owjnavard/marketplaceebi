import { DataTable, type Column } from '@/components/DataTable'
import { PanelHead } from '@/layouts/PanelLayout'
import { Badge } from '@/components/ui'
import { users } from '@/lib/api/seed'
import type { User } from '@/lib/api/types'
import { roleLabel } from '@/lib/labels'

const roleTone = { buyer: 'muted', seller: 'steel', admin: 'signal' } as const

export default function AdminUsers() {
  const columns: Column<User>[] = [
    {
      key: 'name', header: 'کاربر', value: (r) => r.name + r.phone,
      cell: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-3xl text-[14px] font-extrabold text-white" style={{ background: r.avatarColor }}>
            {r.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-steel-900">{r.name}</p>
            <p className="num text-[13px] text-steel-400">{r.phone}</p>
          </div>
        </div>
      ),
    },
    { key: 'company', header: 'مجموعه', value: (r) => r.company ?? '', secondary: true, cell: (r) => <span className="text-[14px] text-steel-600">{r.company ?? '—'}</span> },
    { key: 'role', header: 'نقش', value: (r) => r.role, cell: (r) => <Badge tone={roleTone[r.role]}>{roleLabel[r.role]}</Badge> },
    { key: 'created', header: 'تاریخ عضویت', value: (r) => r.createdAt, sortable: true, align: 'end', secondary: true, cell: (r) => <span className="num text-[14px] text-steel-500">{r.createdAt}</span> },
  ]

  return (
    <>
      <PanelHead title="کاربران" description="حساب‌های ثبت‌شده در سامانه" />
      <DataTable rows={users} columns={columns} searchPlaceholder="جستجو در نام یا شماره…" />
    </>
  )
}
