import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useLang } from '../i18n/LanguageContext'

interface Props {
  product: Product
  onQuote: (name: string) => void
}

export default function ProductCard({ product, onQuote }: Props) {
  const { t, lang } = useLang()

  // 三语言优先顺序：当前语言 > 英文回退
  const displayName     = lang === 'zh' ? (product.nameZh      || product.name)          :
                          lang === 'es' ? (product.nameEs       || product.name)          : product.name
  const displaySubtitle = lang === 'zh' ? (product.subtitleZh  || product.subtitle)      :
                          lang === 'es' ? (product.subtitleEs   || product.subtitle)      : product.subtitle
  const displayShortDesc= lang === 'zh' ? (product.shortDescZh || product.shortDesc)     :
                          lang === 'es' ? (product.shortDescEs  || product.shortDesc)     : product.shortDesc
  const displayPurity   = lang === 'zh' ? (product.purityZh    || product.purity)        :
                          lang === 'es' ? (product.purityEs     || product.purity)        : product.purity
  const displaySpec     = lang === 'zh' ? (product.specificationZh || product.specification) :
                          lang === 'es' ? (product.specificationEs || product.specification) : product.specification

  return (
    <div className="card overflow-hidden group flex flex-col">
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-brand-50 to-blue-100 overflow-hidden">
        {product.coverImage ? (
          <img src={product.coverImage} alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-bold text-brand-200">{displayName.charAt(0)}</span>
          </div>
        )}
        {/* Stock badge */}
        <div className="absolute top-3 right-3">
          {product.stockStatus === 1
            ? <span className="badge-instock">{t.products.inStock}</span>
            : <span className="badge-outstock">{t.products.outOfStock}</span>
          }
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-1">{product.categoryName}</p>
        <h3 className="font-bold text-lg text-brand-500 mb-1">{displayName}</h3>
        <p className="text-sm text-gray-500 mb-1">{displaySubtitle}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{displayShortDesc}</p>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {displayPurity && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
              {t.products.purityLabel}: {displayPurity}
            </span>
          )}
          {displaySpec && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {displaySpec}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-brand-500">
            {product.price ? `$${product.price.toFixed(2)}` : t.products.inquiry}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-3">
          <Link to={`/products/${product.slug}`} className="flex-1 btn-outline text-center text-sm py-2">
            {t.products.details}
          </Link>
          <button onClick={() => onQuote(displayName)} className="flex-1 btn-primary text-sm py-2">
            {t.products.quote}
          </button>
        </div>
      </div>
    </div>
  )
}
