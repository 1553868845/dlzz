import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { ToastProvider } from './components/Toast'
import { getAdminOverview } from '../api'
import { useLang } from '../i18n/LanguageContext'

export default function AdminLayout() {
  const { t, lang, cycleLang } = useLang()
  const { user, logout }     = useAuth()
  const navigate             = useNavigate()
  const location             = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unread, setUnread]  = useState(0)

  // ── 路由 → 面包屑 映射 ───────────────────────────────────────────
  const BREADCRUMBS: Record<string, string> = {
    '/admin':             t.admin.dashboard,
    '/admin/products':    t.admin.products,
    '/admin/categories':  t.admin.categories,
    '/admin/articles':    t.admin.articles,
    '/admin/messages':    t.admin.messages,
//    '/admin/banners':     t.admin.banners,   // 暂时注释掉轮播图管理
    '/admin/faqs':        t.admin.faqs,
    '/admin/settings':    t.admin.settings,
    '/admin/whatsapp':    t.admin.whatsapp,
    '/admin/pages':       t.admin.pages || 'Pages',
  }

  // ── 导航项 ─────────────────────────────────────────────────────────
  const navItems = [
    {
      to: '/admin',
      label: t.admin.dashboard,
      end: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M3 7a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm10 0a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2V7zm0 8a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2zM3 15a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      to: '/admin/products',
      label: t.admin.products,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      to: '/admin/categories',
      label: t.admin.categories,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      to: '/admin/articles',
      label: t.admin.articles,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: '/admin/messages',
      label: t.admin.messages,
      hasUnread: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    // 暂时注释掉轮播图管理
    // {
    //   to: '/admin/banners',
    //   label: t.admin.banners,
    //   icon: (
    //     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
    //         d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    //     </svg>
    //   ),
    // },
    {
      to: '/admin/faqs',
      label: t.admin.faqs,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      to: '/admin/whatsapp',
      label: t.admin.whatsapp,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      to: '/admin/pages',
      label: t.admin.pages || 'Pages',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      to: '/admin/settings',
      label: t.admin.settings,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ]

  // 关闭侧边栏当路由切换时
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  // 定期拉取未读数量（每30秒）
  useEffect(() => {
    const fetch = () =>
      getAdminOverview()
        .then(r => setUnread(r.data?.unreadMessages ?? 0))
        .catch(() => {})
    fetch()
    const timer = setInterval(fetch, 30_000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const currentLabel = BREADCRUMBS[location.pathname] ?? t.admin.title

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">

        {/* 移动端遮罩 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── 侧边栏 ── */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 flex flex-col
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:flex`}
        >
          {/* 品牌 */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10 flex-shrink-0">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">Fensen Polypeptide</div>
              <div className="text-gray-400 text-xs">{t.admin.title}</div>
            </div>
          </div>

          {/* 导航 */}
          <nav className="px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-brand-500/20 text-brand-300 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {/* 未读徽标 */}
                {item.hasUnread && unread > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* 底部用户信息 */}
          <div className="flex-shrink-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-300 text-sm font-bold">
                  {user?.username[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{user?.username}</div>
                <div className="text-gray-500 text-xs">{t.admin.admin}</div>
              </div>
              {/* 语言切换 */}
              <button
                onClick={cycleLang}
                title="Switch language"
                className="text-gray-500 hover:text-brand-300 transition-colors p-1.5 rounded-lg hover:bg-white/5 text-xs font-medium"
              >
                {lang === 'zh' ? 'ES' : lang === 'es' ? 'EN' : '中'}
              </button>
              {/* 修改密码快捷入口 */}
              <button
                onClick={() => navigate('/admin/settings')}
                title={t.adminSettings.passwordTitle}
                className="text-gray-500 hover:text-brand-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </button>
              <button
                onClick={handleLogout}
                title={t.admin.logout}
                className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* ── 主内容区 ── */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* 顶栏 */}
          <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 sticky top-0 z-10 shadow-sm flex-shrink-0">
            {/* 移动端汉堡 */}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 面包屑 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">{t.admin.title}</span>
              {currentLabel !== t.admin.dashboard && (
                <>
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-700 font-medium">{currentLabel}</span>
                </>
              )}
              {currentLabel === t.admin.dashboard && (
                <span className="text-gray-700 font-medium">{t.admin.dashboard}</span>
              )}
            </div>

            <div className="flex-1" />

            {/* 语言切换（顶栏醒目位置） */}
            <button
              onClick={cycleLang}
              title="Switch language"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-brand-50 hover:border-brand-300 text-gray-600 hover:text-brand-600 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {lang === 'zh' ? 'ES' : lang === 'es' ? 'EN' : '中文'}
            </button>

            <div className="w-px h-5 bg-gray-200" />
            {unread > 0 && (
              <button
                onClick={() => navigate('/admin/messages?status=0')}
                className="relative flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-semibold">{unread} {t.admin.unread}</span>
              </button>
            )}

            {/* 预览前台 */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t.admin.preview}
            </a>

            <div className="w-px h-5 bg-gray-200 hidden sm:block" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">{t.admin.logout}</span>
            </button>
          </header>

          {/* 页面内容 */}
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
