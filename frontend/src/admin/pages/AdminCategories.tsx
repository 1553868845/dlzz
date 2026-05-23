import { useEffect, useState, useCallback } from 'react'
import { getCategories, adminGetCategoriesPaged, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api'
import type { Category } from '../../types'
import { useToast } from '../components/Toast'
import ConfirmDelete from '../components/ConfirmDelete'
import Pagination from '../components/Pagination'

const EMPTY: Partial<Category> = { name: '', slug: '', description: '', sortOrder: 0, nameZh: '', nameEs: '' }
const PAGE_SIZE = 10

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function AdminCategories() {
  const toast = useToast()
  const [cats, setCats]           = useState<Category[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [keyword, setKeyword]     = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Partial<Category>>(EMPTY)
  const [editId, setEditId]       = useState<number | null>(null)
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState<number | null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const fetchCats = useCallback(() => {
    setLoading(true)
    adminGetCategoriesPaged({ keyword: keyword || undefined, page, size: PAGE_SIZE })
      .then(r => { setCats(r.data ?? []); setTotal(r.total ?? 0) })
      .catch(() => toast('加载分类失败', 'error'))
      .finally(() => setLoading(false))
  }, [page, keyword])

  useEffect(() => { fetchCats() }, [fetchCats])

  const openCreate = () => { setEditing({ ...EMPTY }); setEditId(null); setFormErrors({}); setShowModal(true) }
  const openEdit   = (c: Category) => { setEditing({ ...c }); setEditId(c.id); setFormErrors({}); setShowModal(true) }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!editing.name?.trim()) errs.name = '分类名称必填'
    if (!editing.slug?.trim()) errs.slug = 'Slug 必填'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (editId) {
        await adminUpdateCategory(editId, editing)
        toast('分类更新成功')
      } else {
        await adminCreateCategory(editing)
        toast('分类创建成功')
      }
      setShowModal(false)
      fetchCats()
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
      await adminDeleteCategory(deleteId)
      toast('分类已删除')
      setDeleteId(null)
      if (cats.length === 1 && page > 1) setPage(p => p - 1)
      else fetchCats()
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
          <h1 className="text-2xl font-bold text-gray-900">分类管理</h1>
          <p className="text-gray-500 text-sm mt-0.5">共 {total} 个分类</p>
        </div>
        <button onClick={openCreate} className="btn-admin-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增分类
        </button>
      </div>

      {/* 搜索 */}
      <div className="flex gap-3">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setKeyword(searchInput); setPage(1) } }}
          placeholder="搜索分类名称..."
          className="input-admin w-64"
        />
        <button onClick={() => { setKeyword(searchInput); setPage(1) }} className="btn-admin-secondary">搜索</button>
        {keyword && (
          <button onClick={() => { setKeyword(''); setSearchInput(''); setPage(1) }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors">✕ 清除</button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="th-admin w-10">ID</th>
                  <th className="th-admin">分类名称</th>
                  <th className="th-admin">Slug</th>
                  <th className="th-admin">描述</th>
                  <th className="th-admin w-16">排序</th>
                  <th className="th-admin text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-sm">暂无分类</span>
                      </div>
                    </td>
                  </tr>
                ) : cats.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="td-admin text-gray-400 text-xs">{c.id}</td>
                    <td className="td-admin">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                        {c.name}
                      </span>
                    </td>
                    <td className="td-admin text-gray-400 text-sm font-mono">{c.slug}</td>
                    <td className="td-admin text-gray-500 text-sm max-w-xs truncate">{c.description || '—'}</td>
                    <td className="td-admin text-gray-400 text-sm">{c.sortOrder}</td>
                    <td className="td-admin text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors">编辑</button>
                        <button onClick={() => setDeleteId(c.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">删除</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
          </>
        )}
      </div>

      {/* 新增/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? '编辑分类' : '新增分类'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="form-label">分类名称 *</label>
                <input
                  className={`input-admin w-full ${formErrors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                  value={editing.name || ''}
                  onChange={e => {
                    const name = e.target.value
                    setEditing(prev => ({ ...prev, name, slug: editId ? prev.slug : slugify(name) }))
                    if (formErrors.name) setFormErrors(p => ({ ...p, name: '' }))
                  }}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="form-label">Slug（URL 标识）*</label>
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
                <label className="form-label">中文名称</label>
                <input className="input-admin w-full" value={editing.nameZh || ''}
                  onChange={e => setEditing(prev => ({ ...prev, nameZh: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Spanish Name</label>
                <input className="input-admin w-full" value={editing.nameEs || ''}
                  onChange={e => setEditing(prev => ({ ...prev, nameEs: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">描述</label>
                <textarea className="input-admin w-full h-20 resize-none" value={editing.description || ''}
                  onChange={e => setEditing(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">排序权重（越小越前）</label>
                <input type="number" className="input-admin w-full" value={editing.sortOrder ?? 0}
                  onChange={e => setEditing(prev => ({ ...prev, sortOrder: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
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
        message="删除分类后，该分类下的产品将变为「未分类」，确认删除？"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
