import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageCircle, Clock } from 'lucide-react'
import { useWhatsApp, useWhatsAppNumber } from '../context/WhatsAppContext'
import { useLang } from '../i18n/LanguageContext'
import { getProducts } from '../api'
import type { Product } from '../types'

export default function Footer() {
  const { t } = useLang()
  const { email } = useWhatsApp()
  const whatsapp = useWhatsAppNumber()
  const [footerProducts, setFooterProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts({ size: 4 })
      .then(r => setFooterProducts(r.data ?? []))
      .catch(() => setFooterProducts([]))
  }, [])

  // 格式化 WhatsApp 显示：85247488025 → +852 4748-8025
  const formatWhatsapp = (num: string) => {
    const n = num.replace(/\D/g, '')
    if (n.startsWith('852') && n.length === 11) {
      return `+852 ${n.slice(3, 7)}-${n.slice(7)}`
    }
    if (n.length > 0) return `+${n}`
    return ''
  }

  return (
    <footer className="bg-brand-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-brand-500 font-bold">F</div>
              <span className="font-bold text-lg">Fensen Polypeptide</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">{t.footer.products}</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              {footerProducts.map(p => (
                <li key={p.id}>
                  <Link to={`/products/${p.slug}`}
                        className="hover:text-white transition-colors">{p.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">{t.footer.information}</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><Link to="/contact"   className="hover:text-white transition-colors">{t.nav.contactUs}</Link></li>
              <li><Link to="/articles"  className="hover:text-white transition-colors">{t.footer.newsAndBlog}</Link></li>
              <li><Link to="/privacy"   className="hover:text-white transition-colors">{t.footer.privacy}</Link></li>
              <li><Link to="/refund"    className="hover:text-white transition-colors">{t.footer.refund}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-accent">{t.footer.getInTouch}</h4>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex items-start gap-2">
                <Mail size={15} className="mt-0.5 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle size={15} className="mt-0.5 shrink-0" />
                <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  {formatWhatsapp(whatsapp)}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={15} className="mt-0.5 shrink-0" />
                <span>{t.footer.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-700 py-4 text-center text-xs text-blue-300">
        © {new Date().getFullYear()} Fensen Polypeptide. {t.footer.allRights}.
        &nbsp;|&nbsp; {t.footer.researchOnly}.
      </div>
    </footer>
  )
}
