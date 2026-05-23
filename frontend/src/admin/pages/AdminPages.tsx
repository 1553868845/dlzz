import { useEffect, useState } from 'react'
import { adminGetPageContents, adminUpdatePageContent } from '../../api'
import type { PageContent } from '../../types'
import { useToast } from '../components/Toast'
import { useLang } from '../../i18n/LanguageContext'

type Lang = 'en' | 'zh' | 'es'

const LANG_META: Record<Lang, { label: string; labelEn: string; flag: string }> = {
  en: { label: 'English', labelEn: 'English (EN)', flag: '🇺🇸' },
  zh: { label: '中文', labelEn: 'Chinese (ZH)', flag: '🇨🇳' },
  es: { label: 'Español', labelEn: 'Spanish (ES)', flag: '🇪🇸' },
}

const SLUG_LABELS: Record<string, { en: string; zh: string; es: string; icon: string }> = {
  privacy: { en: 'Privacy Policy', zh: '隐私政策', es: 'Política de Privacidad', icon: '🛡️' },
  refund:  { en: 'Refund & Returns', zh: '退货退款政策', es: 'Devoluciones y Reembolsos', icon: '↩️' },
}

export default function AdminPages() {
  const { lang } = useLang()
  const isZh = lang === 'zh'
  const toast = useToast()
  const [pages, setPages]     = useState<PageContent[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState<string | null>(null)

  const fetchPages = () => {
    setLoading(true)
    adminGetPageContents()
      .then(r => r.success && setPages(r.data ?? []))
      .catch(() => toast('加载失败', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPages() }, [])

  const handleSave = async (slug: string, data: Partial<PageContent>) => {
    setSaving(slug)
    try {
      await adminUpdatePageContent(slug, data)
      toast(isZh ? '保存成功' : 'Saved successfully')
      fetchPages()
    } catch (e: any) {
      toast((e?.response?.data?.message || e.message || '未知错误'), 'error')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{isZh ? '页面管理' : 'Page Management'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isZh ? '管理网站政策页面的多语言内容' : 'Manage multilingual content for policy pages'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {pages.map(page => (
            <PageEditor
              key={page.slug}
              page={page}
              saving={saving === page.slug}
              onSave={(data) => handleSave(page.slug, data)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────── 页面编辑卡片 ────────────────────────────── */

function PageEditor({
  page,
  saving,
  onSave,
}: {
  page: PageContent
  saving: boolean
  onSave: (data: Partial<PageContent>) => void
}) {
  const { lang } = useLang()
  const isZh = lang === 'zh'

  const [activeTab, setActiveTab] = useState<Lang>('en')

  // 各语言标题
  const [titleEn, setTitleEn] = useState(page.title || '')
  const [titleZh, setTitleZh] = useState(page.titleZh || '')
  const [titleEs, setTitleEs] = useState(page.titleEs || '')

  // 各语言内容
  const [contentEn, setContentEn] = useState(page.content || '')
  const [contentZh, setContentZh] = useState(page.contentZh || '')
  const [contentEs, setContentEs] = useState(page.contentEs || '')

  // 页面数据刷新时同步
  useEffect(() => {
    setTitleEn(page.title || '')
    setTitleZh(page.titleZh || '')
    setTitleEs(page.titleEs || '')
    setContentEn(page.content || '')
    setContentZh(page.contentZh || '')
    setContentEs(page.contentEs || '')
  }, [page])

  const slugInfo = SLUG_LABELS[page.slug] || { en: page.slug, zh: page.slug, es: page.slug, icon: '📄' }

  const titles: Record<Lang, string> = { en: titleEn, zh: titleZh, es: titleEs }
  const contents: Record<Lang, string> = { en: contentEn, zh: contentZh, es: contentEs }
  const setTitles: Record<Lang, (v: string) => void> = { en: setTitleEn, zh: setTitleZh, es: setTitleEs }
  const setContents: Record<Lang, (v: string) => void> = { en: setContentEn, zh: setContentZh, es: setContentEs }

  const handleSave = () => {
    onSave({
      title: titleEn,
      titleZh: titleZh || undefined,
      titleEs: titleEs || undefined,
      content: contentEn,
      contentZh: contentZh || undefined,
      contentEs: contentEs || undefined,
    })
  }

  // 当前标题和内容是否为空
  const currentTitleEmpty = !titles[activeTab].trim()
  const currentContentEmpty = !contents[activeTab].trim()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{slugInfo.icon}</span>
            <div>
              <h2 className="font-semibold text-gray-900 text-lg">{isZh ? slugInfo.zh : slugInfo.en}</h2>
              <span className="text-xs text-gray-400 font-mono">/{page.slug}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {isZh ? '查看页面' : 'View Page'}
            </a>
          </div>
        </div>
      </div>

      {/* 语言标签栏 */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {(Object.keys(LANG_META) as Lang[]).map(l => {
            const meta = LANG_META[l]
            const isActive = activeTab === l
            const hasContent = contents[l].trim().length > 0
            return (
              <button
                key={l}
                onClick={() => setActiveTab(l)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-base">{meta.flag}</span>
                <span>{isZh ? meta.label : meta.labelEn}</span>
                {hasContent && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-gray-300'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 表单内容 */}
      <div className="p-6 space-y-5">
        {/* 标题输入 */}
        <div>
          <label className="form-label">
            {activeTab === 'en' ? 'Title' : activeTab === 'zh' ? '标题' : 'Título'}
          </label>
          <input
            className={`input-admin w-full text-base font-medium ${currentTitleEmpty ? 'border-orange-200 bg-orange-50/30' : ''}`}
            value={titles[activeTab]}
            onChange={e => setTitles[activeTab](e.target.value)}
            placeholder={activeTab === 'en' ? 'Enter page title...' : activeTab === 'zh' ? '输入页面标题...' : 'Introduzca el título...'}
          />
        </div>

        {/* 内容输入 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="form-label mb-0">
              {activeTab === 'en' ? 'Content' : activeTab === 'zh' ? '内容' : 'Contenido'}
            </label>
            {currentContentEmpty && (
              <span className="text-xs text-orange-500 font-medium">
                {isZh ? '内容为空' : 'No content'}
              </span>
            )}
          </div>
          <textarea
            className={`input-admin w-full resize-y min-h-[280px] leading-relaxed ${currentContentEmpty ? 'border-orange-200 bg-orange-50/30' : ''}`}
            value={contents[activeTab]}
            onChange={e => setContents[activeTab](e.target.value)}
            placeholder={
              activeTab === 'en'
                ? 'Enter page content...'
                : activeTab === 'zh'
                  ? '输入页面内容...'
                  : 'Introduzca el contenido de la página...'
            }
          />
          <p className="mt-1.5 text-xs text-gray-400">
            {contents[activeTab].length} {isZh ? '字符' : 'chars'}
          </p>
        </div>

        {/* 保存按钮 */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* 各语言内容状态指示 */}
            {(Object.keys(LANG_META) as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => setActiveTab(l)}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-150 ${
                  contents[l].trim()
                    ? 'text-green-600 bg-green-50 hover:bg-green-100'
                    : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span>{LANG_META[l].flag}</span>
                <span>
                  {contents[l].trim()
                    ? (isZh ? '已填写' : 'Filled')
                    : (isZh ? '未填写' : 'Empty')
                  }
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-admin-primary"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {isZh ? '保存中...' : 'Saving...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isZh ? '保存' : 'Save'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
