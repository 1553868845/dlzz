import { useState } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import QuoteModal from './components/QuoteModal'
import FloatingContact from './components/FloatingContact'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ArticlesPage from './pages/ArticlesPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import RefundPage from './pages/RefundPage'

// i18n
import { LanguageProvider } from './i18n/LanguageContext'

// WhatsApp 全局共享
import { WhatsAppProvider } from './context/WhatsAppContext'

// 后台管理
import { AuthProvider } from './admin/AuthContext'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import RequireAuth from './admin/RequireAuth'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminProducts from './admin/pages/AdminProducts'
import AdminCategories from './admin/pages/AdminCategories'
import AdminArticles from './admin/pages/AdminArticles'
import AdminMessages from './admin/pages/AdminMessages'
import AdminSettings from './admin/pages/AdminSettings'
import AdminBanners from './admin/pages/AdminBanners'
import AdminWhatsapp from './admin/pages/AdminWhatsapp'
import AdminFaqs from './admin/pages/AdminFaqs'
import AdminPages from './admin/pages/AdminPages'

// 前台公共布局
function FrontLayout() {
  const [quoteOpen, setQuoteOpen]       = useState(false)
  const [quoteProduct, setQuoteProduct] = useState<string | undefined>()

  const openQuote = (product?: string) => {
    setQuoteProduct(product)
    setQuoteOpen(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onQuoteClick={() => openQuote()} />
      <main className="flex-1">
        {/* Outlet 需要传 context 才能透传 openQuote，这里用 Context 方案 */}
        <QuoteContext.Provider value={openQuote}>
          <Outlet />
        </QuoteContext.Provider>
      </main>
      <Footer />
      <FloatingContact />
      <QuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        defaultProduct={quoteProduct}
      />
    </div>
  )
}

import { createContext, useContext } from 'react'
const QuoteContext = createContext<(product?: string) => void>(() => {})
export function useQuote() { return useContext(QuoteContext) }

// 前台页面包装（从 context 取 openQuote）
function HomePageWrapper()          { const q = useQuote(); return <HomePage onQuote={q} /> }
function ProductsPageWrapper()      { const q = useQuote(); return <ProductsPage onQuote={q} /> }
function ProductDetailPageWrapper() { const q = useQuote(); return <ProductDetailPage onQuote={q} /> }

export default function App() {
  return (
    <LanguageProvider>
      <WhatsAppProvider>
        <AuthProvider>
          <Routes>
            {/* ── 前台 ── */}
            <Route element={<FrontLayout />}>
              <Route path="/"                      element={<HomePageWrapper />} />
              <Route path="/products"              element={<ProductsPageWrapper />} />
              <Route path="/products/:slug"        element={<ProductDetailPageWrapper />} />
              <Route path="/articles"              element={<ArticlesPage />} />
              <Route path="/articles/:slug"        element={<ArticleDetailPage />} />
              <Route path="/contact"               element={<ContactPage />} />
              <Route path="/privacy"               element={<PrivacyPage />} />
              <Route path="/refund"                element={<RefundPage />} />
            </Route>

            {/* ── 后台 ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<RequireAuth />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"                element={<AdminDashboard />} />
                <Route path="/admin/products"       element={<AdminProducts />} />
                <Route path="/admin/categories"     element={<AdminCategories />} />
                <Route path="/admin/articles"       element={<AdminArticles />} />
                <Route path="/admin/messages"       element={<AdminMessages />} />
                <Route path="/admin/settings"       element={<AdminSettings />} />
                <Route path="/admin/banners"        element={<AdminBanners />} />
                <Route path="/admin/faqs"           element={<AdminFaqs />} />
                <Route path="/admin/whatsapp"       element={<AdminWhatsapp />} />
                <Route path="/admin/pages"          element={<AdminPages />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-6xl font-bold text-brand-200">404</h1>
                <p className="text-gray-500">Page not found</p>
                <a href="/" className="btn-primary">Go Home</a>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </WhatsAppProvider>
    </LanguageProvider>
  )
}
