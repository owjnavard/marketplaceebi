import type { ElevatorSpec, Product } from '@/lib/api/types'
import { toFa } from '@/lib/utils'

/* ══════════════════════════════════════════════════════════════
   موتور تولید لیست قطعات

   از مشخصات پروژه به فهرست قطعات می‌رسد. هر قطعه یک «چرا» دارد
   تا خریدار بفهمد این عدد از کجا آمده — بدون آن، لیست فقط یک
   حدس بی‌پشتوانه به نظر می‌رسد.
   ══════════════════════════════════════════════════════════════ */

export type Priority = 'ضروری' | 'توصیه‌شده' | 'اختیاری'

export interface PartRequirement {
  key: string
  name: string
  categoryId: string
  /** توضیح مشخصات محاسبه‌شده */
  detail: string
  /** دلیل فنی این انتخاب — روی نقشه و در لیست نمایش داده می‌شود */
  reason: string
  quantity: number
  unit: string
  priority: Priority
  /** شماره روی نقشه برش چاه */
  marker?: number
}

const round = (n: number) => Math.max(1, Math.ceil(n))

export function generateParts(spec: ElevatorSpec): PartRequirement[] {
  const parts: PartRequirement[] = []
  const travel = spec.travelHeight || spec.stops * 3
  const railSticks = round(travel / 5) + 1

  /* ── محرک ─────────────────────────────────────────────────── */
  if (spec.type === 'traction' || spec.type === 'mrl') {
    const kw = spec.capacity <= 450 ? 4 : spec.capacity <= 630 ? 5.5 : spec.capacity <= 1000 ? 7.5 : 11
    parts.push({
      key: 'motor',
      name: spec.type === 'mrl' ? 'موتور کشش گیرلس (بدون موتورخانه)' : 'موتور کشش',
      categoryId: 'c1',
      detail: `توان ${toFa(kw)} کیلووات، ظرفیت ${toFa(spec.capacity)} کیلوگرم، سرعت ${toFa(spec.speed)} متر بر ثانیه`,
      reason: `توان از ظرفیت ${toFa(spec.capacity)} کیلوگرم و سرعت ${toFa(spec.speed)} متر بر ثانیه با ضریب تعادل ۰٫۵ محاسبه شده است.`,
      quantity: 1,
      unit: 'دستگاه',
      priority: 'ضروری',
      marker: 1,
    })
  } else {
    parts.push({
      key: 'power-unit',
      name: 'پاور یونیت هیدرولیک',
      categoryId: 'c1',
      detail: `مناسب ظرفیت ${toFa(spec.capacity)} کیلوگرم، فشار کاری متناسب با ارتفاع ${toFa(travel)} متر`,
      reason: 'در سیستم هیدرولیک، پاور یونیت جایگزین موتور کشش و وزنه تعادل می‌شود.',
      quantity: 1,
      unit: 'دستگاه',
      priority: 'ضروری',
      marker: 1,
    })
    parts.push({
      key: 'cylinder',
      name: 'سیلندر هیدرولیک',
      categoryId: 'c1',
      detail: travel > 6 ? 'سیلندر تلسکوپی دو مرحله‌ای' : 'سیلندر تک مرحله‌ای',
      reason: `ارتفاع سفر ${toFa(travel)} متر است؛ ${travel > 6 ? 'بالای ۶ متر سیلندر تلسکوپی لازم می‌شود' : 'تا ۶ متر سیلندر تک مرحله‌ای کافی است'}.`,
      quantity: 1,
      unit: 'دستگاه',
      priority: 'ضروری',
    })
  }

  /* ── تابلو فرمان ──────────────────────────────────────────── */
  parts.push({
    key: 'panel',
    name: 'تابلو فرمان و درایو',
    categoryId: 'c3',
    detail: `${toFa(spec.stops)} توقف، ${spec.type === 'hydraulic' ? 'کنترل هیدرولیک' : 'کنترل VVVF'}`,
    reason:
      spec.usage === 'hospital'
        ? 'کاربری بیمارستانی است؛ تابلو باید قابلیت اولویت‌دهی به تخت و برق اضطراری داشته باشد.'
        : `تعداد ایستگاه ${toFa(spec.stops)} تعیین‌کننده تعداد ورودی و خروجی تابلو است.`,
    quantity: 1,
    unit: 'دستگاه',
    priority: 'ضروری',
    marker: 2,
  })

  /* ── ریل ──────────────────────────────────────────────────── */
  const cabinRail = spec.capacity <= 630 ? 'T-89' : 'T-114'
  parts.push({
    key: 'rail-cabin',
    name: `ریل راهنمای کابین ${cabinRail}`,
    categoryId: 'c4',
    detail: `${toFa(railSticks)} شاخه ۵ متری برای ارتفاع سفر ${toFa(travel)} متر`,
    reason: `ارتفاع سفر ${toFa(travel)} متر تقسیم بر ۵ متر، به‌علاوه یک شاخه برای اضافه‌طول بالا و چاهک.`,
    quantity: railSticks,
    unit: 'شاخه ۵ متری',
    priority: 'ضروری',
    marker: 3,
  })

  if (spec.type !== 'hydraulic') {
    parts.push({
      key: 'rail-cwt',
      name: 'ریل راهنمای وزنه تعادل T-70',
      categoryId: 'c4',
      detail: `${toFa(railSticks)} شاخه ۵ متری`,
      reason: 'وزنه تعادل به ریل سبک‌تر نیاز دارد چون بار جانبی کمتری تحمل می‌کند.',
      quantity: railSticks,
      unit: 'شاخه ۵ متری',
      priority: 'ضروری',
      marker: 4,
    })
  }

  const brackets = round(travel / (spec.speed > 1.6 || spec.capacity > 1000 ? 2 : 2.5)) * 2
  parts.push({
    key: 'brackets',
    name: 'براکت و اتصالات ریل',
    categoryId: 'c4',
    detail: `${toFa(brackets)} عدد براکت قابل تنظیم`,
    reason:
      spec.speed > 1.6 || spec.capacity > 1000
        ? 'به دلیل سرعت یا ظرفیت بالا، فاصله براکت‌ها به ۲ متر کاهش یافته است.'
        : 'فاصله استاندارد براکت ۲٫۵ متر در نظر گرفته شده است.',
    quantity: brackets,
    unit: 'عدد',
    priority: 'ضروری',
  })

  /* ── سیم‌بکسل ─────────────────────────────────────────────── */
  if (spec.type !== 'hydraulic') {
    const ropes = spec.capacity <= 450 ? 3 : spec.capacity <= 1000 ? 4 : 6
    const dia = spec.speed > 1.6 || spec.capacity > 1000 ? 13 : 10
    const length = (travel + 10) * ropes
    parts.push({
      key: 'rope',
      name: 'سیم‌بکسل فولادی',
      categoryId: 'c6',
      detail: `قطر ${toFa(dia)} میلی‌متر، ${toFa(ropes)} رشته، مجموعاً حدود ${toFa(length)} متر`,
      reason: `${toFa(ropes)} رشته بر اساس ظرفیت ${toFa(spec.capacity)} کیلوگرم و ضریب اطمینان ۱۲ انتخاب شده است.`,
      quantity: length,
      unit: 'متر',
      priority: 'ضروری',
      marker: 5,
    })
  }

  /* ── کابین و درب ──────────────────────────────────────────── */
  const persons = Math.round(spec.capacity / 75)
  parts.push({
    key: 'cabin',
    name: 'کابین آسانسور',
    categoryId: 'c7',
    detail: `${toFa(persons)} نفره، ${spec.usage === 'cargo' ? 'کف فلزی مقاوم' : 'با دکوراسیون داخلی'}`,
    reason: `ظرفیت ${toFa(spec.capacity)} کیلوگرم معادل ${toFa(persons)} نفر (هر نفر ۷۵ کیلوگرم) است.`,
    quantity: 1,
    unit: 'دستگاه',
    priority: 'ضروری',
    marker: 6,
  })

  const doorWidth = spec.capacity <= 630 ? 800 : spec.capacity <= 1000 ? 900 : 1100
  parts.push({
    key: 'landing-door',
    name: 'درب طبقه',
    categoryId: 'c2',
    detail: `عرض ${toFa(doorWidth)} میلی‌متر، ${spec.doorType === 'auto' ? 'تمام اتوماتیک' : spec.doorType === 'semi-auto' ? 'نیمه اتوماتیک' : 'لولایی دستی'}`,
    reason: `یک درب برای هر ایستگاه؛ عرض بازشو از ظرفیت ${toFa(spec.capacity)} کیلوگرم به دست آمده است.`,
    quantity: spec.stops * spec.doorCount,
    unit: 'دستگاه',
    priority: 'ضروری',
    marker: 7,
  })

  if (spec.doorType === 'auto') {
    parts.push({
      key: 'operator',
      name: 'اپراتور درب کابین',
      categoryId: 'c2',
      detail: `عرض ${toFa(doorWidth)} میلی‌متر با درایو اختصاصی`,
      reason: 'درب تمام اتوماتیک انتخاب شده؛ اپراتور و درب کابین جدا از درب طبقه سفارش داده می‌شوند.',
      quantity: spec.doorCount,
      unit: 'دستگاه',
      priority: 'ضروری',
    })
  }

  /* ── ایمنی ────────────────────────────────────────────────── */
  parts.push({
    key: 'safety-gear',
    name: 'پاراشوت (ترمز ایمنی)',
    categoryId: 'c5',
    detail: spec.speed > 0.63 ? 'تدریجی، مناسب سرعت‌های بالا' : 'آنی',
    reason:
      spec.speed > 0.63
        ? `سرعت ${toFa(spec.speed)} متر بر ثانیه بالاتر از ۰٫۶۳ است؛ استاندارد پاراشوت تدریجی را الزامی می‌کند.`
        : 'در سرعت‌های زیر ۰٫۶۳ متر بر ثانیه، پاراشوت آنی مجاز است.',
    quantity: 1,
    unit: 'ست',
    priority: 'ضروری',
    marker: 8,
  })

  parts.push({
    key: 'governor',
    name: 'گاورنر (محدودکننده سرعت)',
    categoryId: 'c5',
    detail: `تنظیم‌شده برای سرعت ${toFa(spec.speed)} متر بر ثانیه`,
    reason: 'گاورنر باید با همان سرعت نامی و نوع پاراشوت هماهنگ تنظیم و پلمب شود.',
    quantity: 1,
    unit: 'دستگاه',
    priority: 'ضروری',
    marker: 9,
  })

  parts.push({
    key: 'buffer',
    name: 'بافر چاهک',
    categoryId: 'c5',
    detail: spec.speed > 1 ? 'روغنی' : 'فنری (پلی‌اورتان)',
    reason:
      spec.speed > 1
        ? 'بالای ۱ متر بر ثانیه، بافر فنری انرژی کافی جذب نمی‌کند و بافر روغنی الزامی است.'
        : 'در سرعت‌های پایین، بافر فنری پاسخگو و اقتصادی‌تر است.',
    quantity: spec.type === 'hydraulic' ? 1 : 2,
    unit: 'دستگاه',
    priority: 'ضروری',
    marker: 10,
  })

  /* ── برقی و روشنایی ───────────────────────────────────────── */
  parts.push({
    key: 'lop',
    name: 'شاسی و نمایشگر طبقات',
    categoryId: 'c8',
    detail: `${toFa(spec.stops)} ست شاسی طبقه و یک ست شاسی کابین`,
    reason: 'برای هر ایستگاه یک شاسی احضار و یک نمایشگر لازم است.',
    quantity: spec.stops + 1,
    unit: 'ست',
    priority: 'ضروری',
  })

  parts.push({
    key: 'lighting',
    name: 'روشنایی کابین با باتری اضطراری',
    categoryId: 'c8',
    detail: 'پنل LED با پشتیبان باتری',
    reason: 'روشنایی اضطراری مستقل، الزام استاندارد EN 81-20 است.',
    quantity: 1,
    unit: 'دستگاه',
    priority: 'ضروری',
  })

  parts.push({
    key: 'intercom',
    name: 'سیستم ارتباط اضطراری (آیفون)',
    categoryId: 'c8',
    detail: 'ارتباط کابین با نگهبانی و موتورخانه',
    reason: 'برای ساختمان بدون نگهبان ۲۴ ساعته، مدل با اتصال به خط تلفن پیشنهاد می‌شود.',
    quantity: 1,
    unit: 'دستگاه',
    priority: 'ضروری',
  })

  /* ── توصیه‌شده ────────────────────────────────────────────── */
  if (spec.usage === 'commercial' || spec.usage === 'hospital' || spec.stops >= 8) {
    parts.push({
      key: 'arv',
      name: 'سیستم نجات اضطراری (ARV)',
      categoryId: 'c3',
      detail: 'رساندن کابین به نزدیک‌ترین طبقه در قطعی برق',
      reason:
        spec.usage === 'hospital'
          ? 'در کاربری بیمارستانی، ماندن مسافر در کابین قابل قبول نیست.'
          : 'با این تعداد توقف و تردد، احتمال گیر افتادن مسافر قابل توجه است.',
      quantity: 1,
      unit: 'دستگاه',
      priority: 'توصیه‌شده',
    })
  }

  parts.push({
    key: 'overload',
    name: 'سنسور اضافه‌بار',
    categoryId: 'c8',
    detail: `تنظیم‌شده روی ${toFa(spec.capacity)} کیلوگرم`,
    reason: 'از حرکت با بار بیش از حد مجاز جلوگیری می‌کند و در بازرسی بررسی می‌شود.',
    quantity: 1,
    unit: 'دستگاه',
    priority: 'توصیه‌شده',
  })

  parts.push({
    key: 'fan',
    name: 'فن تهویه کابین',
    categoryId: 'c7',
    detail: 'فن سقفی کم‌صدا',
    reason: 'در کابین‌های بسته و کاربری پرتردد، تهویه رضایت مسافر را محسوس بالا می‌برد.',
    quantity: 1,
    unit: 'دستگاه',
    priority: 'اختیاری',
  })

  /* ── خدمات ────────────────────────────────────────────────── */
  parts.push({
    key: 'installation',
    name: 'خدمات نصب و راه‌اندازی',
    categoryId: 'c9',
    detail: `نصب کامل ${toFa(spec.stops)} توقف تا تحویل و تست بار`,
    reason: 'شامل داربست، ریل‌گذاری، مونتاژ، سیم‌کشی، تنظیم درایو و گزارش بازرسی.',
    quantity: 1,
    unit: 'پروژه',
    priority: 'توصیه‌شده',
  })

  return parts
}

/* محصولات پیشنهادی برای هر ردیف قطعه */
export function matchProducts(part: PartRequirement, products: Product[]): Product[] {
  return products
    .filter((p) => p.categoryId === part.categoryId && p.status === 'approved')
    .sort((a, b) => b.rating - a.rating)
}
