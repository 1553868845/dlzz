import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../api'
import type { Article } from '../types'
import { useLang } from '../i18n/LanguageContext'

/** 无封面图时的占位组件 */
function ArticlePlaceholder({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-500/10 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* 装饰圆圈 */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-400/10" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-blue-400/10" />
      {/* DNA / 分子图标 SVG */}
      <svg className="w-12 h-12 text-brand-300 mb-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="16" cy="16" r="4" fill="currentColor" fillOpacity="0.5" />
        <circle cx="32" cy="32" r="4" fill="currentColor" fillOpacity="0.5" />
        <circle cx="32" cy="16" r="3" fill="currentColor" fillOpacity="0.3" />
        <circle cx="16" cy="32" r="3" fill="currentColor" fillOpacity="0.3" />
        <line x1="16" y1="16" x2="32" y2="32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1="32" y1="16" x2="16" y2="32" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
      </svg>
      <span className="text-sm font-semibold text-brand-400/80 px-4 text-center line-clamp-2 leading-tight">
        {title}
      </span>
    </div>
  )
}

export default function ArticlesPage() {
  const { t, lang } = useLang()
  const isZh = lang === 'zh'
  const isEs = lang === 'es'
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const size = 9

  useEffect(() => {
    setLoading(true)
    getArticles({ page, size })
      .then(r => { if (r.success) { setArticles(r.data ?? []); setTotal(r.total ?? 0) } })
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / size)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">{t.articles.title}</h1>
        <p className="text-blue-200">{t.articles.subtitle}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({length:6}).map((_,i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl" />
                <div className="p-5 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map(a => {
              const displayTitle   = lang === 'zh' ? (a.titleZh   || a.title)   :
                                    lang === 'es' ? (a.titleEs   || a.title)   : a.title
              const displayExcerpt = lang === 'zh' ? (a.excerptZh || a.excerpt) :
                                    lang === 'es' ? (a.excerptEs || a.excerpt) : a.excerpt
              return (
                <Link
                  key={a.id}
                  to={`/articles/${a.slug}`}
                  className="card overflow-hidden group flex flex-col hover:shadow-lg transition-shadow duration-300"
                >
                  {/* 封面图区域 — 固定高度 + 16:9 感觉 */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl bg-gray-100">
                    {a.coverImage ? (
                      <>
                        <img
                          src={a.coverImage}
                          alt={displayTitle}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* 底部渐变遮罩，让文字区过渡更自然 */}
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/10 to-transparent" />
                      </>
                    ) : (
                      <ArticlePlaceholder title={displayTitle} />
                    )}
                  </div>

                  {/* 文字区 */}
                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-gray-400 mb-2">
                      {new Date(a.publishedAt || a.createdAt).toLocaleDateString(isZh ? 'zh-CN' : isEs ? 'es-ES' : 'en-US')}
                    </p>
                    <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-brand-500 transition-colors leading-snug mb-2">
                      {displayTitle}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 flex-1">
                      {displayExcerpt}
                    </p>
                    <span className="inline-block mt-4 text-xs text-brand-500 font-medium">
                      {t.articles.readMore} →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">{t.articles.noArticles}</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 text-sm">
              {isZh ? '上一页' : isEs ? 'Anterior' : 'Previous'}
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} className={`w-9 h-9 rounded-lg text-sm font-medium ${p===page?'bg-brand-500 text-white':'border hover:bg-gray-100'}`}>{p}</button>
            ))}
            <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-4 py-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100 text-sm">
              {isZh ? '下一页' : isEs ? 'Siguiente' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
