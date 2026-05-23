import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Truck, FlaskConical, Award, Users, Package, Globe, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { getFeaturedProducts, getHomeData, getArticles, getBanners } from '../api'
import type { Product, StatItem, Faq, Article, Banner } from '../types'
import ProductCard from '../components/ProductCard'
import { useLang } from '../i18n/LanguageContext'

interface HomePageProps {
  onQuote: (product?: string) => void
}

export default function HomePage({ onQuote }: HomePageProps) {
  const { t, lang } = useLang()

  const whyUsItems = [
    { icon: <Shield size={32} className="text-brand-400" />,
      title: lang === 'zh' ? '品质认证' : lang === 'es' ? 'Calidad Verificada' : 'Verified Quality',
      desc:  lang === 'zh' ? '纯度≥99%，HPLC 检测，附质检报告。'
           : lang === 'es' ? 'Pureza ≥99%, analizado por HPLC con Certificado de Análisis.'
           : '≥99% purity, HPLC-tested with Certificate of Analysis.' },
    { icon: <Truck size={32} className="text-brand-400" />,
      title: lang === 'zh' ? '全球发货' : lang === 'es' ? 'Envío Global' : 'Global Shipping',
      desc:  lang === 'zh' ? '从香港发货，全球7–14个工作日送达。'
           : lang === 'es' ? 'Envíos desde Hong Kong. Entrega mundial en 7–14 días hábiles.'
           : 'Ships from Hong Kong. Worldwide delivery in 7–14 days.' },
    { icon: <FlaskConical size={32} className="text-brand-400" />,
      title: lang === 'zh' ? '7年以上经验' : lang === 'es' ? 'Más de 7 Años de Experiencia' : '7+ Years Experience',
      desc:  lang === 'zh' ? '自2017年起，深受科研机构和生物技术企业信赖。'
           : lang === 'es' ? 'Con la confianza de investigadores y empresas de biotecnología desde 2017.'
           : 'Trusted by researchers and biotech firms since 2017.' },
    { icon: <Award size={32} className="text-brand-400" />,
      title: lang === 'zh' ? '第三方检测' : lang === 'es' ? 'Pruebas de Terceros' : 'Third-Party Tested',
      desc:  lang === 'zh' ? '每批次独立验证安全性和纯度。'
           : lang === 'es' ? 'Cada lote verificado de forma independiente para garantizar seguridad y pureza.'
           : 'Every batch independently verified for safety and purity.' },
  ]
  const [products, setProducts]   = useState<Product[]>([])
  const [stats, setStats]         = useState<StatItem[]>([])
  const [faqs, setFaqs]           = useState<Faq[]>([])
  const [articles, setArticles]   = useState<Article[]>([])
  const [openFaq, setOpenFaq]     = useState<number | null>(null)
  const [banners, setBanners]     = useState<Banner[]>([])
  const [bannerIdx, setBannerIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isZh = lang === 'zh'
  const isEs = lang === 'es'

  const resetTimer = useCallback((total: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (total <= 1) return
    timerRef.current = setInterval(() => {
      setBannerIdx(i => (i + 1) % total)
    }, 4500)
  }, [])

  useEffect(() => {
    getFeaturedProducts().then(r => r.success && setProducts(r.data ?? []))
    getHomeData().then(r => {
      if (r.success) {
        setStats(r.data?.stats ?? [])
        setFaqs(r.data?.faqs ?? [])
      }
    })
    getArticles({ page: 1, size: 3 }).then(r => r.success && setArticles(r.data ?? []))
    getBanners().then(r => {
      if (r.success && r.data?.length) {
        setBanners(r.data)
        resetTimer(r.data.length)
      }
    })
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  const statIcons: Record<string, JSX.Element> = {
    users:   <Users size={28} />,
    award:   <Award size={28} />,
    package: <Package size={28} />,
    globe:   <Globe size={28} />,
  }

  return (
    <div>
      {/* ── Hero / Banner 轮播 ────────────────────────────────── */}
      {banners.length > 0 ? (
        <section className="relative w-full overflow-hidden bg-gray-900" style={{ height: 'clamp(300px, 55vw, 680px)' }}>
          {/* 图片层 */}
          {banners.map((b, i) => (
            <div
              key={b.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === bannerIdx ? 1 : 0 }}
            >
              {b.linkUrl ? (
                <a href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <img src={b.imageUrl} alt={b.description || ''} className="w-full h-full object-cover" />
                </a>
              ) : (
                <img src={b.imageUrl} alt={b.description || ''} className="w-full h-full object-cover" />
              )}
              {/* 底部渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
            </div>
          ))}

          {/* 左右切换按钮（超过1张才显示） */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => { setBannerIdx(i => (i - 1 + banners.length) % banners.length); resetTimer(banners.length) }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                aria-label="上一张"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => { setBannerIdx(i => (i + 1) % banners.length); resetTimer(banners.length) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                aria-label="下一张"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* 底部圆点指示器 */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setBannerIdx(i); resetTimer(banners.length) }}
                  className={`rounded-full transition-all duration-300 ${i === bannerIdx ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'}`}
                  aria-label={`跳转到第${i + 1}张`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        /* 无轮播图时显示默认 Hero */
        <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-white/10 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wider uppercase">
              {lang === 'zh' ? '研究级 · COA 认证' : lang === 'es' ? 'Grado Investigación · Certificado COA' : 'Research Grade · COA Certified'}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              {t.home.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
              {t.home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="bg-white text-brand-500 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                {lang === 'zh' ? '浏览产品' : lang === 'es' ? 'Ver Productos' : 'Browse Products'}
              </Link>
              <button onClick={() => onQuote()} className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
                {t.home.getQuote}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── Why Us ─────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t.home.whyUs}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{t.home.whyUsSub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyUsItems.map(item => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-semibold text-brand-500 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">{t.home.featured}</h2>
              <p className="text-gray-500">{t.home.featuredSub}</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-1 text-brand-500 font-medium hover:underline">
              {t.common.viewAll} <ArrowRight size={16} />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p} onQuote={name => onQuote(name)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {['KLOW','Tirz','BPC157','TB500','GLOW','NAD+','Epithalon','AOD9604'].map(name => (
                <div key={name} className="card p-6 text-center">
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-brand-400">{name.charAt(0)}</span>
                  </div>
                  <h3 className="font-bold text-brand-500 mb-1">{name}</h3>
                  <p className="text-xs text-gray-400 mb-3">{lang === 'zh' ? '纯度 ≥99%' : lang === 'es' ? 'Pureza ≥99%' : 'Purity ≥99%'}</p>
                  <button onClick={() => onQuote(name)} className="btn-primary text-sm py-1.5 px-4 w-full">{t.products.quote}</button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link to="/products" className="btn-outline inline-flex items-center gap-2">
              {t.common.viewAll} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <section className="bg-brand-500 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {(stats.length > 0 ? stats : [
              { id: 1, label: 'Products',         labelZh: '产品种类',   labelEs: 'Productos',       value: '200+', icon: 'package' },
              { id: 2, label: 'Happy Customers',  labelZh: '满意客户',   labelEs: 'Clientes',         value: '5000+', icon: 'users' },
              { id: 3, label: 'Countries',        labelZh: '覆盖国家',   labelEs: 'Países',           value: '50+',  icon: 'globe' },
              { id: 4, label: 'Years Experience', labelZh: '年从业经验', labelEs: 'Años de Experiencia', value: '8+', icon: 'award' },
            ]).map(s => (
              <div key={s.id}>
                <div className="flex justify-center mb-2 text-blue-200">
                  {statIcons[s.icon] ?? <Award size={28} />}
                </div>
                <div className="text-4xl font-extrabold text-accent mb-1">{s.value}</div>
                <div className="text-blue-200 text-sm">{
                  lang === 'zh' ? (s.labelZh || s.label) :
                  lang === 'es' ? (s.labelEs || s.label) : s.label
                }</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Articles ─────────────────────────────────── */}
      {articles.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <h2 className="section-title">{isZh ? '最新动态' : isEs ? 'Últimas Noticias' : 'Latest News'}</h2>
              <Link to="/articles" className="hidden sm:flex items-center gap-1 text-brand-500 font-medium hover:underline">
                {t.articles.readMore} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map(a => {
                const displayTitle   = lang === 'zh' ? (a.titleZh   || a.title)   :
                                      lang === 'es' ? (a.titleEs   || a.title)   : a.title
                const displayExcerpt = lang === 'zh' ? (a.excerptZh || a.excerpt) :
                                      lang === 'es' ? (a.excerptEs || a.excerpt) : a.excerpt
                return (
                  <Link key={a.id} to={`/articles/${a.slug}`} className="card overflow-hidden group hover:shadow-lg transition-shadow duration-300 flex flex-col">
                    {/* 封面图 */}
                    <div className="relative h-48 overflow-hidden rounded-t-xl bg-gray-100">
                      {a.coverImage ? (
                        <>
                          <img
                            src={a.coverImage}
                            alt={displayTitle}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-500/10 via-blue-50 to-indigo-100 relative overflow-hidden">
                          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-400/10" />
                          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-blue-400/10" />
                          <svg className="w-12 h-12 text-brand-300 mb-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
                            <circle cx="16" cy="16" r="4" fill="currentColor" fillOpacity="0.5" />
                            <circle cx="32" cy="32" r="4" fill="currentColor" fillOpacity="0.5" />
                            <circle cx="32" cy="16" r="3" fill="currentColor" fillOpacity="0.3" />
                            <circle cx="16" cy="32" r="3" fill="currentColor" fillOpacity="0.3" />
                            <line x1="16" y1="16" x2="32" y2="32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                            <line x1="32" y1="16" x2="16" y2="32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
                          </svg>
                          <span className="text-sm font-semibold text-brand-400/80 px-4 text-center line-clamp-2 leading-tight">{displayTitle}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs text-gray-400 mb-2">{new Date(a.publishedAt || a.createdAt).toLocaleDateString(isZh ? 'zh-CN' : isEs ? 'es-ES' : 'en-US')}</p>
                      <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-500 transition-colors leading-snug mb-2">{displayTitle}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 flex-1">{displayExcerpt}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t.home.faq}</h2>
            <p className="text-gray-500">{t.home.faqSub}</p>
          </div>
          <div className="space-y-3">
            {(faqs.length > 0 ? faqs : (isZh ? [
              { id: 1, question: 'What is the purity?', questionZh: '你们的肽类产品纯度如何？', questionEs: '', answer: '', answerZh: '我们所有肽类产品均通过 HPLC 检测，纯度 ≥99%，并提供质检报告（COA）。', answerEs: '', sortOrder: 1 },
              { id: 2, question: 'International shipping?', questionZh: '是否支持国际发货？', questionEs: '', answer: '', answerZh: '是的，我们从香港向全球发货，通常7–14个工作日内送达。', answerEs: '', sortOrder: 2 },
              { id: 3, question: 'Payment methods?', questionZh: '支持哪些付款方式？', questionEs: '', answer: '', answerZh: '我们接受 PayPal、比特币（BTC）、USDT 和 USDC。', answerEs: '', sortOrder: 3 },
              { id: 4, question: 'For human use?', questionZh: '这些肽类产品可以用于人体吗？', questionEs: '', answer: '', answerZh: '不可以。所有产品仅用于科研目的，严禁用于人体。', answerEs: '', sortOrder: 4 },
            ] : isEs ? [
              { id: 1, question: 'What is the purity?', questionZh: '', questionEs: '¿Cuál es la pureza de sus péptidos?', answer: '', answerZh: '', answerEs: 'Todos nuestros péptidos son analizados con una pureza ≥99% por HPLC, con Certificado de Análisis.', sortOrder: 1 },
              { id: 2, question: 'International shipping?', questionZh: '', questionEs: '¿Realizan envíos internacionales?', answer: '', answerZh: '', answerEs: 'Sí, enviamos a todo el mundo desde Hong Kong. La entrega suele tardar 7–14 días hábiles.', sortOrder: 2 },
              { id: 3, question: 'Payment methods?', questionZh: '', questionEs: '¿Qué métodos de pago aceptan?', answer: '', answerZh: '', answerEs: 'Aceptamos PayPal, Bitcoin (BTC), USDT y USDC.', sortOrder: 3 },
              { id: 4, question: 'For human use?', questionZh: '', questionEs: '¿Estos péptidos son para uso humano?', answer: '', answerZh: '', answerEs: 'No. Todos los productos son estrictamente para fines de investigación.', sortOrder: 4 },
            ] : [
              { id: 1, question: 'What is the purity of your peptides?', answer: 'All our peptides are tested to ≥99% purity by HPLC analysis with COA provided.', sortOrder: 1 },
              { id: 2, question: 'Do you ship internationally?',         answer: 'Yes, we ship worldwide from Hong Kong. Delivery typically takes 7–14 business days.', sortOrder: 2 },
              { id: 3, question: 'What payment methods do you accept?',  answer: 'We accept PayPal, Bitcoin (BTC), USDT, and USDC.', sortOrder: 3 },
              { id: 4, question: 'Are these peptides for human use?',    answer: 'No. All products are strictly for research purposes only.', sortOrder: 4 },
            ])).map(faq => {
              const displayQ = lang === 'zh' ? (faq.questionZh || faq.question) :
                               lang === 'es' ? (faq.questionEs || faq.question) : faq.question
              const displayA = lang === 'zh' ? (faq.answerZh   || faq.answer)   :
                               lang === 'es' ? (faq.answerEs   || faq.answer)   : faq.answer
              return (
                <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  >
                    <span>{displayQ}</span>
                    <ChevronDown size={18} className={`shrink-0 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === faq.id && (
                    <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                      {displayA}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-brand-500 to-brand-700 py-16 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">{t.home.readyTitle}</h2>
          <p className="text-blue-200 mb-8">{t.home.readySub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => onQuote()} className="bg-white text-brand-500 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              {t.home.getQuote}
            </button>
            <Link to="/contact" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              {t.common.contactUs}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
