import { useEffect, useState } from 'react'
import { getPageContent } from '../api'
import type { PageContent } from '../types'
import { useLang } from '../i18n/LanguageContext'

export default function RefundPage() {
  const { lang } = useLang()
  const [page, setPage] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPageContent('refund')
      .then(r => r.success && setPage(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!page) return null

  // 三语言支持
  const title =
    lang === 'zh' ? (page.titleZh || page.title) :
    lang === 'es' ? (page.titleEs || page.title) :
    page.title

  const content =
    lang === 'zh' ? (page.contentZh || page.content) :
    lang === 'es' ? (page.contentEs || page.content) :
    page.content

  const paragraphs = content.split('\n').filter(p => p.trim())

  // 日期格式化
  const locale = lang === 'zh' ? 'zh-CN' : lang === 'es' ? 'es-ES' : 'en-US'
  const updatedLabel = lang === 'zh' ? '最后更新' : lang === 'es' ? 'Última actualización' : 'Last updated'

  return (
    <div className="min-h-screen bg-gray-50 py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-brand-500 mb-2">{title}</h1>
          <p className="text-sm text-gray-400 mb-8">
            {updatedLabel}: {new Date(page.updatedAt).toLocaleDateString(locale)}
          </p>
          {/* 改用 p 标签，避免 ol 导致双重编号 */}
          <div className="space-y-4 text-gray-700 leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-wrap">{p.trim()}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
