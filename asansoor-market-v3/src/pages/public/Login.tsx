import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Logo } from '@/components/Navbar'
import { Button, Card, Field, Input } from '@/components/ui'
import { api } from '@/lib/api'
import type { Role } from '@/lib/api/types'
import { roleLabel } from '@/lib/labels'
import { cn, toEn, toFa } from '@/lib/utils'
import { useAuth, useToasts } from '@/store'

/* ورود با شماره موبایل و کد یک‌بارمصرف — همان الگویی که کاربر
   ایرانی به آن عادت دارد. رمز عبور در کار نیست. */
export default function Login() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const signIn = useAuth((s) => s.signIn)
  const push = useToasts((s) => s.push)

  const [phase, setPhase] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [role, setRole] = useState<Role>((params.get('role') as Role) ?? 'buyer')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  const next = params.get('next') ?? (role === 'admin' ? '/admin' : role === 'seller' ? '/seller' : '/panel')

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const sendCode = async () => {
    const digits = toEn(phone).replace(/\D/g, '')
    if (digits.length !== 11 || !digits.startsWith('09')) {
      setError('شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await api.requestOtp(digits)
      setPhase('code')
      setSeconds(90)
      setTimeout(() => codeRef.current?.focus(), 60)
    } catch {
      setError('ارسال کد انجام نشد. اتصال اینترنت را بررسی کنید.')
    } finally {
      setBusy(false)
    }
  }

  const verify = async () => {
    const digits = toEn(code).replace(/\D/g, '')
    if (digits.length !== 5) {
      setError('کد تأیید ۵ رقمی است.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const user = await api.verifyOtp(toEn(phone).replace(/\D/g, ''), digits, role)
      signIn(user)
      push(`خوش آمدید، ${user.name}`)
      navigate(next, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'کد وارد شده درست نیست.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-signal-400 to-signal-500" />

        <div className="p-6">
          <h1 className="text-lg font-extrabold text-steel-900">
            {phase === 'phone' ? 'ورود یا ثبت‌نام' : 'کد تأیید را وارد کنید'}
          </h1>
          <p className="mt-1.5 text-[15px] leading-6 text-steel-500">
            {phase === 'phone'
              ? 'شماره موبایل خود را وارد کنید. اگر حساب نداشته باشید، همین‌جا ساخته می‌شود.'
              : <>کد پنج‌رقمی به شماره <span className="num font-semibold text-steel-800">{phone}</span> پیامک شد.</>}
          </p>

          {phase === 'phone' ? (
            <div className="mt-5 space-y-4">
              <Field label="نوع حساب" group>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['buyer', 'seller', 'admin'] as Role[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        'rounded-xl border px-2 py-2 text-[14px] font-semibold transition-colors',
                        role === r
                          ? 'border-steel-800 bg-steel-800 text-white'
                          : 'border-line bg-paper text-steel-600 hover:border-steel-300',
                      )}
                    >
                      {roleLabel[r]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="شماره موبایل" required error={error}>
                <Input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  inputMode="tel"
                  autoFocus
                  invalid={!!error}
                  className="num text-center tracking-widest"
                />
              </Field>

              <Button variant="signal" size="lg" className="w-full" loading={busy} onClick={sendCode}>
                ارسال کد تأیید
              </Button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="کد تأیید" required error={error}>
                <Input
                  ref={codeRef}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value)
                    setError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && verify()}
                  placeholder="—————"
                  inputMode="numeric"
                  maxLength={5}
                  invalid={!!error}
                  className="num h-12 text-center text-lg tracking-[0.5em]"
                />
              </Field>

              <Button variant="signal" size="lg" className="w-full" loading={busy} onClick={verify}>
                ورود به حساب
              </Button>

              <div className="flex items-center justify-between text-[14px]">
                <button
                  onClick={() => {
                    setPhase('phone')
                    setCode('')
                    setError('')
                  }}
                  className="flex items-center gap-1 text-steel-500 transition-colors hover:text-steel-900"
                >
                  <ArrowRight size={13} />
                  تغییر شماره
                </button>
                {seconds > 0 ? (
                  <span className="num text-steel-400">ارسال مجدد تا {toFa(seconds)} ثانیه</span>
                ) : (
                  <button onClick={sendCode} className="font-semibold text-signal-600 hover:underline">
                    ارسال دوباره کد
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 border-t border-line bg-steel-50 px-6 py-3">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-verify" />
          <p className="text-[13px] leading-5 text-steel-500">
            در حالت دمو، هر کد پنج‌رقمی پذیرفته می‌شود. نقش انتخابی تعیین می‌کند وارد کدام پنل شوید.
          </p>
        </div>
      </Card>

      <Link to="/" className="mt-5 text-center text-[15px] text-steel-500 transition-colors hover:text-steel-900">
        بازگشت به صفحه اصلی
      </Link>
    </div>
  )
}
