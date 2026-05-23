import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Eye, Calendar } from 'lucide-react'
import { getArticleBySlug } from '../api'
import type { Article } from '../types'
import { useLang } from '../i18n/LanguageContext'

export default function ArticleDetailPage() {
  const { t, lang } = useLang()
  const isZh = lang === 'zh'
  const { slug }                      = useParams<{ slug: string }>()
  const [article, setArticle]         = useState<Article | null>(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    getArticleBySlug(slug)
      .then(r => r.success && setArticle(r.data))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400">{t.common.loading}</div>
    </div>
  )

  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-gray-500">{t.articles.noArticles}</p>
      <Link to="/articles" className="btn-primary">{t.common.back}</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      {article.coverImage && (
        <div className="h-64 md:h-80 overflow-hidden">
          <img src={article.coverImage} alt={
          lang === 'zh' ? (article.titleZh || article.title) :
          lang === 'es' ? (article.titleEs || article.title) : article.title
        } className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/articles" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-500 mb-6">
            <ArrowLeft size={15} /> {lang === 'zh' ? '返回文章列表' : lang === 'es' ? 'Volver a artículos' : 'Back to Articles'}
          </Link>

        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
            {lang === 'zh' ? (article.titleZh || article.title) :
             lang === 'es' ? (article.titleEs || article.title) : article.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {new Date(article.publishedAt || article.createdAt).toLocaleDateString(
                lang === 'zh' ? 'zh-CN' : lang === 'es' ? 'es-ES' : 'en-US'
              )}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={13} />
              {article.viewCount} {t.articles.views}
            </span>
            {article.author && <span>{t.articles.by} {article.author}</span>}
          </div>

          {(() => {
            const body = lang === 'zh' ? (article.contentZh || article.content) :
                         lang === 'es' ? (article.contentEs || article.content) : article.content
            const fallback = lang === 'zh' ? (article.excerptZh || article.excerpt) :
                             lang === 'es' ? (article.excerptEs || article.excerpt) : article.excerpt
            return body
              ? <div className="space-y-5 text-gray-700">
                  {body.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                    <p key={idx} className="leading-8 text-[15px]">{paragraph}</p>
                  ))}
                </div>
              : <p className="text-gray-600 leading-relaxed">{fallback}</p>
          })()}
        </div>
      </div>
    </div>
  )
}
