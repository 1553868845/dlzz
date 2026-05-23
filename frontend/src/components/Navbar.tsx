import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useLang, type Language } from '../i18n/LanguageContext'
import { useWhatsApp } from '../context/WhatsAppContext'

interface NavbarProps {
  onQuoteClick: () => void
}

// 语言标签映射
const LANG_LABELS: Record<Language, string> = {
  en: 'EN',
  zh: '中',
  es: 'ES',
}

// 下一语言提示
const LANG_TITLES: Record<Language, string> = {
  en: 'Switch to 中文',
  zh: 'Cambiar a Español',
  es: 'Switch to English',
}

export default function Navbar({ onQuoteClick }: NavbarProps) {
  const { t, lang, cycleLang } = useLang()
  const { email: contactEmail } = useWhatsApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)

  const navLinks = [
    { label: t.nav.home,      to: '/' },
    { label: t.nav.products,  to: '/products' },
    { label: t.nav.news,      to: '/articles' },
    { label: t.nav.contactUs, to: '/contact' },
  ]

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* ── 公告栏 ─────────────────────────────────────── */}
      <div className="bg-amber-500 text-white text-xs text-center py-1.5 px-4">
        {t.announcement.text}
        &nbsp;{t.announcement.contact} <strong>{contactEmail}</strong>
      </div>

      {/* ── 主导航 ─────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-sm">F</div>
              <span className="text-brand-500 font-bold text-lg leading-tight">
                Fensen<br />
                <span className="text-xs font-normal text-gray-500">Polypeptide</span>
              </span>
            </Link>

            {/* Desktop links */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === '/'}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${isActive ? 'text-brand-500' : 'text-gray-600 hover:text-brand-500'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* CTA + 语言切换 */}
            <div className="hidden md:flex items-center gap-3">
              {/* 三语循环切换按钮 */}
              <button
                onClick={cycleLang}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-500 transition-colors border border-gray-200 hover:border-brand-300 rounded-lg px-2.5 py-1.5"
                title={LANG_TITLES[lang]}
              >
                <span className="text-base leading-none">🌐</span>
                <span className="text-xs font-semibold tracking-wide">{LANG_LABELS[lang]}</span>
              </button>
              <button onClick={onQuoteClick} className="btn-primary text-sm py-2 px-4">
                {t.common.quoteNow}
              </button>
            </div>

            {/* Mobile toggle */}
            <div className="md:hidden flex items-center gap-2">
              {/* 移动端三语循环按钮 */}
              <button
                onClick={cycleLang}
                className="text-xs font-semibold text-gray-500 hover:text-brand-500 border border-gray-200 rounded-lg px-2 py-1"
                title={LANG_TITLES[lang]}
              >
                {LANG_LABELS[lang]}
              </button>
              <button
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block py-2 text-sm font-medium rounded-lg px-2 ${isActive ? 'text-brand-500 bg-brand-50' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={() => { setMobileOpen(false); onQuoteClick() }}
              className="w-full btn-primary text-sm py-2 mt-2"
            >
              {t.common.quoteNow}
            </button>
          </div>
        )}
      </header>
    </>
  )
}
