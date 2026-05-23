import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FlaskConical, Thermometer, Package, BadgeCheck } from 'lucide-react'
import { getProductBySlug } from '../api'
import { useWhatsAppNumber } from '../context/WhatsAppContext'
import type { Product } from '../types'
import { useLang } from '../i18n/LanguageContext'

interface Props { onQuote: (product?: string) => void }

export default function ProductDetailPage({ onQuote }: Props) {
  const { t, lang } = useLang()
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const whatsapp = useWhatsAppNumber()

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getProductBySlug(slug)
      .then(r => { if (r.success && r.data) setProduct(r.data) })
      .catch(() => { /* 404/500 都让 product 保持 null，显示 not found */ })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 animate-pulse">{t.common.loading}</div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">{t.products.noProducts}</p>
      <Link to="/products" className="btn-primary">{t.common.back}</Link>
    </div>
  )

  // 三语言优先顺序：当前语言 > 英文回退
  const isZh = lang === 'zh'
  const displayName     = lang === 'zh' ? (product.nameZh          || product.name)          :
                          lang === 'es' ? (product.nameEs           || product.name)          : product.name
  const displaySubtitle = lang === 'zh' ? (product.subtitleZh      || product.subtitle)      :
                          lang === 'es' ? (product.subtitleEs       || product.subtitle)      : product.subtitle
  const displayShortDesc= lang === 'zh' ? (product.shortDescZh     || product.shortDesc)     :
                          lang === 'es' ? (product.shortDescEs      || product.shortDesc)     : product.shortDesc
  const displayDesc     = lang === 'zh' ? (product.descriptionZh   || product.description)   :
                          lang === 'es' ? (product.descriptionEs    || product.description)   : product.description
  const displayPurity   = lang === 'zh' ? (product.purityZh        || product.purity)        :
                          lang === 'es' ? (product.purityEs         || product.purity)        : product.purity
  const displayForm     = lang === 'zh' ? (product.formZh          || product.form)          :
                          lang === 'es' ? (product.formEs           || product.form)          : product.form
  const displayStorage  = lang === 'zh' ? (product.storageZh       || product.storage)       :
                          lang === 'es' ? (product.storageEs        || product.storage)       : product.storage
  const displaySpec     = lang === 'zh' ? (product.specificationZh || product.specification) :
                          lang === 'es' ? (product.specificationEs  || product.specification) : product.specification

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-brand-500">{t.nav.home}</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-brand-500">{t.nav.products}</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{displayName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-6">
          <ArrowLeft size={15} /> {t.common.back}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="bg-gradient-to-br from-brand-50 to-blue-100 rounded-2xl h-80 md:h-96 flex items-center justify-center overflow-hidden">
            {product.coverImage
              ? <img src={product.coverImage} alt={displayName} className="w-full h-full object-cover" />
              : <span className="text-8xl font-extrabold text-brand-200">{displayName.charAt(0)}</span>
            }
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-sm text-gray-400 mb-1">{product.categoryName}</p>
                <h1 className="text-3xl font-extrabold text-brand-500">{displayName}</h1>
                {displaySubtitle && <p className="text-gray-500 mt-1">{displaySubtitle}</p>}
              </div>
              {product.stockStatus === 1
                ? <span className="badge-instock mt-1">{t.products.inStock}</span>
                : <span className="badge-outstock mt-1">{t.products.outOfStock}</span>
              }
            </div>

            <p className="text-gray-600 mt-4 leading-relaxed">{displayShortDesc}</p>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {displayPurity && (
                <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
                  <BadgeCheck size={18} className="text-brand-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t.products.purity}</p>
                    <p className="font-semibold text-sm">{displayPurity}</p>
                  </div>
                </div>
              )}
              {displayForm && (
                <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
                  <FlaskConical size={18} className="text-brand-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t.products.form}</p>
                    <p className="font-semibold text-sm">{displayForm}</p>
                  </div>
                </div>
              )}
              {displayStorage && (
                <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
                  <Thermometer size={18} className="text-brand-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t.products.storage}</p>
                    <p className="font-semibold text-sm">{displayStorage}</p>
                  </div>
                </div>
              )}
              {displaySpec && (
                <div className="flex items-center gap-2 bg-white rounded-xl p-3 shadow-sm">
                  <Package size={18} className="text-brand-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{t.products.spec}</p>
                    <p className="font-semibold text-sm">{displaySpec}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="flex items-center gap-4 mt-8">
              <span className="text-2xl font-bold text-brand-500">
                {product.price ? `$${product.price.toFixed(2)}` : (
                lang === 'zh' ? '价格面议' : lang === 'es' ? 'Precio a consultar' : 'Price on Inquiry'
              )}
              </span>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => onQuote(displayName)} className="flex-1 btn-primary py-3">
                {t.products.getQuote}
              </button>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 btn-outline py-3 text-center">
                {lang === 'zh' ? 'WhatsApp 咨询' : lang === 'es' ? 'WhatsApp' : 'WhatsApp Us'}
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              ⚠️ {t.products.forResearch}.
            </p>
          </div>
        </div>

        {/* Description */}
        {displayDesc && (
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-brand-500 mb-4">
              {lang === 'zh' ? '产品描述' : lang === 'es' ? 'Descripción del Producto' : 'Product Description'}
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: displayDesc }} />
          </div>
        )}
      </div>
    </div>
  )
}
