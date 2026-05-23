import { useEffect, useState, useCallback } from 'react'
import { getArticles, adminCreateArticle, adminUpdateArticle, adminDeleteArticle } from '../../api'
import type { Article } from '../../types'
import { useToast } from '../components/Toast'
import Pagination from '../components/Pagination'
import ConfirmDelete from '../components/ConfirmDelete'

const EMPTY: Partial<Article> = {
  title: '', slug: '', excerpt: '', content: '',
  titleZh: '', excerptZh: '', contentZh: '',
  titleEs: '', excerptEs: '', contentEs: '',
  category: '', author: 'Admin', published: 1,
}

const CATEGORIES = ['Research', 'Peptide Science', 'Usage Guide', 'News', 'FAQ']

function slugify(title: string) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80)
}

const PAGE_SIZE = 10

export default function AdminArticles() {
  const toast = useToast()
  const [articles, setArticles]         = useState<Article[]>([])
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [keyword, setKeyword]           = useState('')
  const [searchInput, setSearchInput]   = useState('')
  const [loading, setLoading]           = useState(false)
  const [showModal, setShowModal]       = useState(false)
  const [editing, setEditing]           = useState<Partial<Article>>(EMPTY)
  const [editId, setEditId]             = useState<number | null>(null)
  const [saving, setSaving]             = useState(false)
  const [deleteId, setDeleteId]         = useState<number | null>(null)
  const [deleting, setDeleting]         = useState(false)
  const [formErrors, setFormErrors]     = useState<Record<string, string>>({})
  const [activeTab, setActiveTab]       = useState<'en' | 'zh' | 'es'>('en')

  const fetchArticles = useCallback(() => {
    setLoading(true)
    getArticles({ page, size: PAGE_SIZE, keyword: keyword || undefined })
      .then(r => { setArticles(r.data ?? []); setTotal(r.total ?? 0) })
      .catch(() => toast('加载文章失败', 'error'))
      .finally(() => setLoading(false))
  }, [page, keyword])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const openCreate = () => {
    setEditing({ ...EMPTY })
    setEditId(null)
    setFormErrors({})
    setActiveTab('en')
    setShowModal(true)
  }
  const openEdit = (a: Article) => {
    setEditing({ ...a })
    setEditId(a.id)
    setFormErrors({})
    setActiveTab('en')
    setShowModal(true)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!editing.title?.trim()) errs.title = '标题必填'
    if (!editing.slug?.trim())  errs.slug  = 'Slug 必填'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editId) {
        await adminUpdateArticle(editId, editing)
        toast('文章更新成功')
      } else {
        await adminCreateArticle(editing)
        toast('文章发布成功')
      }
      setShowModal(false)
      fetchArticles()
    } catch (e: any) {
      toast('保存失败：' + (e?.response?.data?.message || e.message || '未知错误'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await adminDeleteArticle(deleteId)
      toast('文章已删除')
      setDeleteId(null)
      if (articles.length === 1 && page > 1) setPage(p => p - 1)
      else fetchArticles()
    } catch (e: any) {
      toast('删除失败：' + (e?.response?.data?.message || e.message || '未知错误'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文章管理</h1>
          <p className="text-gray-500 text-sm mt-0.5">共 {total} 篇文章</p>
        </div>
        <button onClick={openCreate} className="btn-admin-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          写文章
        </button>
      </div>

      {/* 搜索 */}
      <div className="flex gap-3">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setKeyword(searchInput); setPage(1) } }}
          placeholder="搜索文章标题..."
          className="input-admin w-72"
        />
        <button onClick={() => { setKeyword(searchInput); setPage(1) }} className="btn-admin-secondary">搜索</button>
        {keyword && (
          <button onClick={() => { setKeyword(''); setSearchInput(''); setPage(1) }} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">✕ 清除</button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="th-admin w-10">ID</th>
                  <th className="th-admin">标题</th>
                  <th className="th-admin">分类</th>
                  <th className="th-admin">作者</th>
                  <th className="th-admin w-16">浏览</th>
                  <th className="th-admin">状态</th>
                  <th className="th-admin">发布时间</th>
                  <th className="th-admin text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm">暂无文章</span>
                      </div>
                    </td>
                  </tr>
                ) : articles.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="td-admin text-gray-400 text-xs">{a.id}</td>
                    <td className="td-admin">
                      <div>
                        <div className="font-medium text-gray-900 text-sm line-clamp-1 max-w-xs">{a.title}</div>
                        {a.titleZh && <div className="text-gray-400 text-xs line-clamp-1 max-w-xs">{a.titleZh}</div>}
                        <div className="text-gray-300 text-xs font-mono">{a.slug}</div>
                      </div>
                    </td>
                    <td className="td-admin">
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                        {a.category || '未分类'}
                      </span>
                    </td>
                    <td className="td-admin text-gray-500 text-sm">{a.author}</td>
                    <td className="td-admin text-gray-400 text-sm">{a.viewCount ?? 0}</td>
                    <td className="td-admin">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${a.published === 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {a.published === 1 ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="td-admin text-gray-400 text-xs whitespace-nowrap">
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('zh-CN') : '—'}
                    </td>
                    <td className="td-admin text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(a)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">编辑</button>
                        <button onClick={() => setDeleteId(a.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? '编辑文章' : '新建文章'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Slug *</label>
                  <input
                    className={`input-admin w-full font-mono text-sm ${formErrors.slug ? 'border-red-400 focus:ring-red-400' : ''}`}
                    value={editing.slug || ''}
                    onChange={e => {
                      setEditing(prev => ({ ...prev, slug: e.target.value }))
                      if (formErrors.slug) setFormErrors(p => ({ ...p, slug: '' }))
                    }}
                  />
                  {formErrors.slug && <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>}
                </div>
                <div>
                  <label className="form-label">分类</label>
                  <select className="input-admin w-full" value={editing.category || ''}
                    onChange={e => setEditing(prev => ({ ...prev, category: e.target.value }))}>
                    <option value="">请选择</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">作者</label>
                  <input className="input-admin w-full" value={editing.author || ''}
                    onChange={e => setEditing(prev => ({ ...prev, author: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">状态</label>
                  <select className="input-admin w-full" value={editing.published ?? 1}
                    onChange={e => setEditing(prev => ({ ...prev, published: Number(e.target.value) }))}>
                    <option value={1}>发布</option>
                    <option value={0}>草稿（不公开）</option>
                  </select>
                </div>
              </div>

              {/* 语言标签页 */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setActiveTab('en')}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'en'
                      ? 'bg-white text-brand-600 border-b-2 border-brand-500'
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    🇬🇧 EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('zh')}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'zh'
                      ? 'bg-white text-brand-600 border-b-2 border-brand-500'
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    🇨🇳 ZH
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('es')}
                    className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'es'
                      ? 'bg-white text-brand-600 border-b-2 border-brand-500'
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    🇪🇸 ES
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {activeTab === 'en' && (
                    <>
                      <div>
                        <label className="form-label">标题 (EN) *</label>
                        <input
                          className={`input-admin w-full ${formErrors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
                          value={editing.title || ''}
                          onChange={e => {
                            const title = e.target.value
                            setEditing(prev => ({ ...prev, title, slug: editId ? prev.slug : slugify(title) }))
                            if (formErrors.title) setFormErrors(p => ({ ...p, title: '' }))
                          }}
                          placeholder="English title"
                        />
                        {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                      </div>
                      <div>
                        <label className="form-label">摘要 (EN)</label>
                        <textarea className="input-admin w-full h-20 resize-none" value={editing.excerpt || ''}
                          placeholder="English excerpt..."
                          onChange={e => setEditing(prev => ({ ...prev, excerpt: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label">正文内容 (EN)</label>
                        <textarea
                          className="input-admin w-full h-52 resize-y"
                          placeholder="English content..."
                          value={editing.content || ''}
                          onChange={e => setEditing(prev => ({ ...prev, content: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                  {activeTab === 'zh' && (
                    <>
                      <div>
                        <label className="form-label">标题 (中文)</label>
                        <input
                          className="input-admin w-full"
                          value={editing.titleZh || ''}
                          onChange={e => setEditing(prev => ({ ...prev, titleZh: e.target.value }))}
                          placeholder="中文标题（选填）"
                        />
                      </div>
                      <div>
                        <label className="form-label">摘要 (中文)</label>
                        <textarea className="input-admin w-full h-20 resize-none" value={editing.excerptZh || ''}
                          placeholder="中文摘要（选填）..."
                          onChange={e => setEditing(prev => ({ ...prev, excerptZh: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label">正文内容 (中文)</label>
                        <textarea
                          className="input-admin w-full h-52 resize-y"
                          placeholder="中文正文内容（选填）..."
                          value={editing.contentZh || ''}
                          onChange={e => setEditing(prev => ({ ...prev, contentZh: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                  {activeTab === 'es' && (
                    <>
                      <div>
                        <label className="form-label">Titulo (ES)</label>
                        <input
                          className="input-admin w-full"
                          value={editing.titleEs || ''}
                          onChange={e => setEditing(prev => ({ ...prev, titleEs: e.target.value }))}
                          placeholder="Titulo en espanol (opcional)"
                        />
                      </div>
                      <div>
                        <label className="form-label">Resumen (ES)</label>
                        <textarea className="input-admin w-full h-20 resize-none" value={editing.excerptEs || ''}
                          placeholder="Resumen en espanol (opcional)..."
                          onChange={e => setEditing(prev => ({ ...prev, excerptEs: e.target.value }))} />
                      </div>
                      <div>
                        <label className="form-label">Contenido (ES)</label>
                        <textarea
                          className="input-admin w-full h-52 resize-y"
                          placeholder="Contenido en espanol (opcional)..."
                          value={editing.contentEs || ''}
                          onChange={e => setEditing(prev => ({ ...prev, contentEs: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="btn-admin-secondary">取消</button>
              <button onClick={handleSave} disabled={saving} className="btn-admin-primary">
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    保存中...
                  </>
                ) : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDelete
        open={deleteId !== null}
        message="此操作不可撤销，确定要删除这篇文章吗？"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
