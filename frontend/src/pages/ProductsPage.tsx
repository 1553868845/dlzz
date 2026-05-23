import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { getProducts, getCategories } from '../api'
import type { Product, Category } from '../types'
import ProductCard from '../components/ProductCard'
import { useLang } from '../i18n/LanguageContext'

interface Props { onQuote: (product?: string) => void }

export default function ProductsPage({ onQuote }: Props) {
  const { t, lang } = useLang()
  const isZh = lang === 'zh'
  const isEs = lang === 'es'
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [keyword, setKeyword]       = useState('')
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(false)
  const size = 12

  useEffect(() => {
    getCategories().then(r => r.success && setCategories(r.data ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    getProducts({ categoryId, keyword, page, size })
      .then(r => { if (r.success) { setProducts(r.data ?? []); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [categoryId, keyword, page])

  const totalPages = Math.ceil(total / size)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">{t.products.title}</h1>
        <p className="text-blue-200">{t.products.subtitle}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.products.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setKeyword(search); setPage(1) } }}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-400 outline-none bg-white"
            />
          </div>
          {/* Category */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <select
              value={categoryId ?? ''}
              onChange={e => { setCategoryId(e.target.value ? Number(e.target.value) : undefined); setPage(1) }}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-400 outline-none bg-white"
            >
              <option value="">{t.products.allCategories}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6">
          {isZh ? `找到 ${total} 个产品` : isEs ? `${total} producto${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}` : `${total} product${total !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-200" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p} onQuote={name => onQuote(name)} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">{t.products.noProducts}</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 text-sm">
              {isZh ? '上一页' : isEs ? 'Anterior' : 'Previous'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-brand-500 text-white' : 'border hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 text-sm">
              {isZh ? '下一页' : isEs ? 'Siguiente' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
