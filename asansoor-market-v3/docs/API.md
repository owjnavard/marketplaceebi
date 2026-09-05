# قرارداد API — نگاشت به بک‌اند لاراول

فرانت‌اند از یک لایه واحد در `src/lib/api/index.ts` با بک‌اند حرف می‌زند.
تا وقتی `VITE_API_URL` خالی باشد، همان متدها روی دیتای نمونه داخلی اجرا
می‌شوند. به‌محض مقداردهی، دقیقاً همان متدها روی REST لاراول می‌روند و
**هیچ کامپوننتی تغییر نمی‌کند**.

```env
VITE_API_URL=https://example.com/api
```

## قواعد عمومی

| موضوع | قرارداد |
|---|---|
| احراز هویت | `Authorization: Bearer <token>` (Sanctum) |
| قالب پاسخ | یا مستقیم بدنه، یا `{ "data": ... }` — هر دو پشتیبانی می‌شود |
| خطا | کد HTTP مناسب + `{ "message": "...", "errors": { "field": ["..."] } }` |
| پاسخ خالی | `204 No Content` |
| صفحه‌بندی | `{ "items": [], "total": 0, "page": 1, "perPage": 12 }` |

پیام خطا مستقیم به کاربر نمایش داده می‌شود، پس **فارسی و قابل‌فهم** بنویسید.

## جدول مسیرها

### کاتالوگ (عمومی)

| متد فرانت | HTTP | مسیر |
|---|---|---|
| `api.categories()` | GET | `/categories` |
| `api.products(q)` | GET | `/products?q=&categoryIds=&brands=&pricingModes=&minPrice=&maxPrice=&inStockOnly=&sort=&page=&perPage=` |
| `api.product(id)` | GET | `/products/{id}` |
| `api.relatedProducts(id)` | GET | `/products/{id}/related` |
| `api.brands()` | GET | `/brands` |
| `api.sellers()` | GET | `/sellers` |
| `api.seller(id)` | GET | `/sellers/{id}` |
| `api.posts()` | GET | `/posts` |
| `api.post(slug)` | GET | `/posts/{slug}` |

پارامترهای آرایه‌ای با ویرگول جدا می‌شوند: `categoryIds=c1,c4`.
`sort` یکی از `newest` \| `price-asc` \| `price-desc` \| `popular` \| `rating`.

### احراز هویت

| متد فرانت | HTTP | مسیر | بدنه |
|---|---|---|---|
| `api.requestOtp(phone)` | POST | `/auth/otp` | `{ phone }` |
| `api.verifyOtp(...)` | POST | `/auth/verify` | `{ phone, code }` → `{ token, user }` |
| `api.me()` | GET | `/auth/me` | — |
| `api.logout()` | POST | `/auth/logout` | — |

### فروشنده

| متد فرانت | HTTP | مسیر |
|---|---|---|
| `api.sellerProducts(sellerId)` | GET | `/seller/{sellerId}/products` |
| `api.saveProduct(p)` | POST / PUT | `/products` یا `/products/{id}` |
| `api.deleteProduct(id)` | DELETE | `/products/{id}` |
| `api.submitOffer(offer)` | POST | `/inquiries/{inquiryId}/offers` |

### استعلام و سفارش

| متد فرانت | HTTP | مسیر |
|---|---|---|
| `api.inquiries(scope)` | GET | `/inquiries?scope=buyer\|seller\|admin` |
| `api.inquiry(id)` | GET | `/inquiries/{id}` |
| `api.createInquiry(x)` | POST | `/inquiries` |
| `api.acceptOffer(iid, oid)` | POST | `/inquiries/{iid}/offers/{oid}/accept` → `Order` |
| `api.orders(scope)` | GET | `/orders?scope=buyer\|seller\|admin` |
| `api.order(id)` | GET | `/orders/{id}` |
| `api.placeOrder(x)` | POST | `/orders` |
| `api.setOrderStatus(id, s)` | PATCH | `/orders/{id}/status` |

`scope` تعیین می‌کند دیتا از دید چه کسی فیلتر شود؛ فیلتر واقعی باید
**سمت سرور** بر اساس کاربر لاگین‌شده انجام شود، نه صرفاً بر اساس این پارامتر.

### مدیریت

| متد فرانت | HTTP | مسیر |
|---|---|---|
| `api.allProducts()` | GET | `/admin/products` |
| `api.setProductStatus(id, s)` | PATCH | `/admin/products/{id}/status` |
| `api.setSellerStatus(id, s)` | PATCH | `/admin/sellers/{id}/status` |
| `api.saveCategory(c)` | POST / PUT | `/admin/categories` یا `/admin/categories/{id}` |
| `api.deleteCategory(id)` | DELETE | `/admin/categories/{id}` |

## اسکیمای پیشنهادی MySQL

مدل کامل دامنه در `src/lib/api/types.ts` است؛ همان‌جا منبع حقیقت شماست.

```sql
users            id, name, phone UNIQUE, email, role ENUM('buyer','seller','admin'),
                 company, avatar_color, created_at

sellers          id, user_id FK, slug UNIQUE, name, legal_name, logo_color,
                 province, city, phone,
                 status ENUM('pending','approved','suspended'),
                 verified BOOL, rating DECIMAL(2,1), review_count,
                 response_hours, commission_rate DECIMAL(4,2),
                 member_since, about TEXT

categories       id, slug UNIQUE, name, icon, parent_id NULL FK, sort_order
category_attrs   id, category_id FK, `key`, label,
                 type ENUM('text','number','select','boolean'),
                 unit, options JSON, required BOOL, filterable BOOL

products         id, slug UNIQUE, seller_id FK, category_id FK,
                 name, brand, part_number, short_description, description TEXT,
                 datasheet_url,
                 pricing_mode ENUM('fixed','quote','tiered'),
                 price BIGINT NULL, compare_at_price BIGINT NULL,
                 min_order_qty, stock_state ENUM('in_stock','low','out','on_order'),
                 stock_qty, lead_time_days NULL,
                 attributes JSON,          -- مقدار ویژگی‌های دسته
                 rating, review_count, sold_count,
                 status ENUM('pending','approved','rejected','draft'),
                 is_service BOOL, created_at
                 INDEX (category_id, status), INDEX (seller_id), FULLTEXT (name, part_number)

product_specs    id, product_id FK, `key`, label, value, unit, highlight BOOL, sort_order
price_tiers      id, product_id FK, min_qty, max_qty NULL, price BIGINT NULL

inquiries        id, code UNIQUE, kind ENUM('product','project'), buyer_id FK,
                 title, note TEXT, spec JSON NULL,
                 status ENUM('open','answered','accepted','closed','expired'),
                 created_at, expires_at
inquiry_lines    id, inquiry_id FK, product_id NULL FK, part_key,
                 title, description, quantity, unit
offers           id, inquiry_id FK, seller_id FK, unit_prices JSON,
                 total BIGINT, lead_time_days, valid_until,
                 note, status ENUM('submitted','accepted','rejected','withdrawn'), created_at

orders           id, code UNIQUE, buyer_id FK, inquiry_id NULL FK,
                 subtotal, shipping, commission, total BIGINT,
                 status ENUM('pending_payment','processing','shipped','delivered','cancelled','refunded'),
                 address JSON, created_at, updated_at
order_lines      id, order_id FK, product_id FK, seller_id FK,
                 name, part_number, unit_price BIGINT, quantity

posts            id, slug UNIQUE, title, excerpt, body LONGTEXT,
                 cover, tag, read_minutes, author, published_at
```

### نکته‌های پیاده‌سازی

- **مبالغ را BIGINT و به تومان (عدد صحیح) نگه دارید.** اعشار در پول، منبع خطاست.
- `price_tiers.price = NULL` یعنی «در این پله استعلام بگیرید» — منطق فرانت
  در `unitPriceFor()` روی همین قرارداد بنا شده است.
- `pricing_mode = 'quote'` باید `price = NULL` داشته باشد؛ در ولیدیشن سرور
  اجبارش کنید تا داده ناسازگار وارد نشود.
- کمیسیون هنگام **ثبت سفارش** با نرخ لحظه‌ای فروشنده snapshot شود و در
  `orders.commission` بماند؛ اگر نرخ فروشنده بعداً عوض شود، سفارش‌های قدیمی
  نباید تغییر کنند.
- `code` سفارش و استعلام را سمت سرور بسازید، نه سمت کلاینت.
- تاریخ‌ها در حال حاضر به‌صورت رشته جلالی رد و بدل می‌شوند. اگر ترجیح
  می‌دهید ISO بفرستید، فقط توابع نمایش در `src/lib/utils.ts` را عوض کنید.

## CORS و مسیر API

اگر فرانت و API روی یک دامنه‌اند (توصیه‌شده)، لاراول را در زیرپوشه
`api/` بگذارید. فایل `.htaccess` تحویلی، درخواست‌های `^api/` را دست‌نخورده
رد می‌کند و بقیه را به SPA می‌سپارد — پس CORS اصلاً لازم نمی‌شود.

اگر روی دامنه جداست، در `config/cors.php` دامنه فرانت را مجاز کنید و
`supports_credentials` را در صورت استفاده از کوکی روشن کنید.
