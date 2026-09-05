/**
 * آماده‌سازی خروجی برای GitHub Pages
 *
 * گیت‌هاب‌پیجز فقط فایل استاتیک سرو می‌کند و از .htaccess خبری نیست،
 * پس بازنویسی مسیرها برای اپ تک‌صفحه‌ای انجام نمی‌شود. نتیجه‌اش این است
 * که /products/p1 هنگام رفرش، ۴۰۴ می‌دهد.
 *
 * راه‌حل پذیرفته‌شده: یک 404.html دقیقاً هم‌محتوای index.html بگذاریم.
 * گیت‌هاب برای هر مسیر ناشناخته همان را برمی‌گرداند، اپ بالا می‌آید و
 * react-router آدرس واقعی را از location می‌خواند.
 *
 * .nojekyll هم لازم است، وگرنه Jekyll پوشه‌ها و فایل‌هایی که با _
 * شروع می‌شوند را نادیده می‌گیرد.
 */
import { copyFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dist = join(process.cwd(), 'dist')

if (!existsSync(join(dist, 'index.html'))) {
  console.error('✗ ابتدا npm run build را اجرا کنید.')
  process.exit(1)
}

copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))
writeFileSync(join(dist, '.nojekyll'), '')

console.log('✓ 404.html و .nojekyll ساخته شد — خروجی برای GitHub Pages آماده است.')
