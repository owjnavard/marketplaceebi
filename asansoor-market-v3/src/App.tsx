import { lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import PanelLayout from '@/layouts/PanelLayout'

/* ══════════════════════════════════════════════════════════════
   مسیرها

   هر صفحه با lazy بارگذاری می‌شود تا اولین بازدید فقط کد صفحه
   اصلی را بگیرد. پنل‌ها که حجم بیشتری دارند، تا وقتی کاربر
   واردشان نشود دانلود نمی‌شوند.
   ══════════════════════════════════════════════════════════════ */

/* ── عمومی ──────────────────────────────────────────────────── */
const Home = lazy(() => import('@/pages/public/Home'))
const Catalog = lazy(() => import('@/pages/public/Catalog'))
const ProductDetail = lazy(() => import('@/pages/public/ProductDetail'))
const Compare = lazy(() => import('@/pages/public/Compare'))
const Cart = lazy(() => import('@/pages/public/Cart'))
const Checkout = lazy(() => import('@/pages/public/Checkout'))
const Rfq = lazy(() => import('@/pages/public/Rfq'))
const Sellers = lazy(() => import('@/pages/public/Sellers'))
const SellerProfile = lazy(() => import('@/pages/public/SellerProfile'))
const Blog = lazy(() => import('@/pages/public/Blog'))
const BlogPost = lazy(() => import('@/pages/public/BlogPost'))
const Login = lazy(() => import('@/pages/public/Login'))
const NotFound = lazy(() => import('@/pages/public/NotFound'))

/* ── پنل خریدار ─────────────────────────────────────────────── */
const BuyerDashboard = lazy(() => import('@/pages/buyer/Dashboard'))
const BuyerInquiries = lazy(() => import('@/pages/buyer/Inquiries'))
const InquiryDetail = lazy(() => import('@/pages/buyer/InquiryDetail'))
const BuyerOrders = lazy(() => import('@/pages/buyer/Orders'))
const OrderDetail = lazy(() => import('@/pages/buyer/OrderDetail'))
const Favorites = lazy(() => import('@/pages/buyer/Favorites'))
const Profile = lazy(() => import('@/pages/buyer/Profile'))

/* ── پنل فروشنده ────────────────────────────────────────────── */
const SellerDashboard = lazy(() => import('@/pages/seller/Dashboard'))
const SellerProducts = lazy(() => import('@/pages/seller/Products'))
const ProductForm = lazy(() => import('@/pages/seller/ProductForm'))
const SellerInquiries = lazy(() => import('@/pages/seller/Inquiries'))
const SellerOrders = lazy(() => import('@/pages/seller/Orders'))
const SellerSettings = lazy(() => import('@/pages/seller/Settings'))

/* ── پنل مدیریت ─────────────────────────────────────────────── */
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminSellers = lazy(() => import('@/pages/admin/Sellers'))
const AdminProducts = lazy(() => import('@/pages/admin/Products'))
const AdminCategories = lazy(() => import('@/pages/admin/Categories'))
const AdminInquiries = lazy(() => import('@/pages/admin/Inquiries'))
const AdminOrders = lazy(() => import('@/pages/admin/Orders'))
const AdminCommission = lazy(() => import('@/pages/admin/Commission'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* بخش عمومی */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/rfq" element={<Rfq />} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/sellers/:id" element={<SellerProfile />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* پنل خریدار */}
        <Route path="/panel" element={<PanelLayout role="buyer" />}>
          <Route index element={<BuyerDashboard />} />
          <Route path="inquiries" element={<BuyerInquiries />} />
          <Route path="inquiries/:id" element={<InquiryDetail />} />
          <Route path="orders" element={<BuyerOrders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* پنل فروشنده */}
        <Route path="/seller" element={<PanelLayout role="seller" />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductForm />} />
          <Route path="inquiries" element={<SellerInquiries />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="settings" element={<SellerSettings />} />
        </Route>

        {/* پنل مدیریت */}
        <Route path="/admin" element={<PanelLayout role="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="commission" element={<AdminCommission />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
