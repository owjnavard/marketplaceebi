import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/* ── اعداد فارسی ───────────────────────────────────────────── */
const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA[+d])
}

export function toEn(input: string): string {
  return input.replace(/[۰-۹]/g, (d) => String(FA.indexOf(d)))
}

/** قیمت به تومان با جداکننده هزارگان و ارقام فارسی */
export function toman(value: number): string {
  return toFa(Math.round(value).toLocaleString('en-US'))
}

/** خلاصه‌سازی مبالغ بزرگ برای کارت‌های آماری */
export function shortToman(value: number): string {
  if (value >= 1_000_000_000) return `${toFa((value / 1_000_000_000).toFixed(1))} میلیارد`
  if (value >= 1_000_000) return `${toFa(Math.round(value / 1_000_000))} میلیون`
  if (value >= 1_000) return `${toFa(Math.round(value / 1_000))} هزار`
  return toFa(value)
}

export function percentOff(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function slugify(input: string): string {
  return input.trim().replace(/\s+/g, '-').replace(/[^\w\u0600-\u06FF-]/g, '').toLowerCase()
}

/** برای اسکرول به بالا هنگام تعویض صفحه */
export function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
}
