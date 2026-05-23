import { useEffect, useState, useCallback, useRef, memo } from 'react'
import {
  getProducts, getCategories,
  adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminUploadImage
} from '../../api'
import type { Product, Category } from '../../types'
import { useToast } from '../components/Toast'
import Pagination from '../components/Pagination'
import ConfirmDelete from '../components/ConfirmDelete'
import ImageCropModal from '../components/ImageCropModal'

const EMPTY: Partial<Product> = {
  name: '', slug: '', subtitle: '', shortDesc: '', description: '',
  purity: '', form: '', storage: '', specification: '',
  nameZh: '', subtitleZh: '', shortDescZh: '', descriptionZh: '',
  purityZh: '', formZh: '', storageZh: '', specificationZh: '',
  nameEs: '', subtitleEs: '', shortDescEs: '', descriptionEs: '',
  purityEs: '', formEs: '', storageEs: '', specificationEs: '',
  categoryId: undefined, price: undefined,
  stockStatus: 1, isFeatured: 0, coverImage: '', sortOrder: 0,
}

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 100)
}

const PAGE_SIZE = 10

// 必须定义在组件外部，否则每次渲染会重建组件导致输入框失焦
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   编辑弹窗 —— 完全内部管理表单状态，隔离父组件重渲染
   ═══════════════════════════════════════════════════════════════ */
interface ProductFormModalProps {
  editId: number | null
  initialData: Partial<Product>
  categories: Category[]
  onSave: (data: Partial<Product>) => Promise<void>
  onClose: () => void
}

const ProductFormModal = memo(function ProductFormModal({
  editId, initialData, categories, onSave, onClose,
}: ProductFormModalProps) {
  // 表单状态完全在弹窗内部管理，不依赖父组件
  const [editing, setEditing] = useState<Partial<Product>>(initialData)
  const [activeTab, setActiveTab] = useState<'en' | 'zh' | 'es'>('en')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  // 当 initialData 变化时（打开新弹窗）同步
  useEffect(() => {
    setEditing(initialData)
    setFormErrors({})
    setActiveTab('en')
    setCropSrc(null)
  }, [initialData])

  const updateField = useCallback(<K extends keyof Partial<Product>>(key: K, value: Partial<Product>[K]) => {
    setEditing(prev => ({ ...prev, [key]: value }))
    // 清除该字段的错误状态
    setFormErrors(prev => { const next = { ...prev }; delete next[key as string]; return next })
  }, [])

  const handleSave = useCallback(async () => {
    const errs: Record<string, string> = {}
    if (!editing.name?.trim()) errs.name = '产品名称必填'
    if (!editing.slug?.trim()) errs.slug = 'Slug 必填'
    if (!editing.categoryId) errs.categoryId = '请选择分类'
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }

    setSaving(true)
    try {
      await onSave(editing)
    } catch (e: any) {
      const msg = e?.response?.data?.message || e.message || '未知错误'
      // slug 冲突错误显示在字段下方，其他错误用 toast
      if (msg.includes('Slug') || msg.includes('slug') || msg.includes('已存在')) {
        setFormErrors(prev => ({ ...prev, slug: msg }))
      } else {
        toast('保存失败：' + msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }, [editing, onSave, toast])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('请选择图片文件', 'error')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      if (result) setCropSrc(result)
      else toast('图片读取失败，请换一张试试', 'error')
    }
    reader.onerror = () => {
      toast('图片读取失败，请换一张试试', 'error')
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [toast])

  const handleCropConfirm = useCallback(async (blob: Blob) => {
    setCropSrc(null)
    setUploading(true)
    try {
      const file = new File([blob], 'crop.jpg', { type: 'image/jpeg' })
      const res = await adminUploadImage(file)
      if (res.success && res.data?.url) {
        setEditing(prev => ({ ...prev, coverImage: res.data!.url }))
        toast('图片上传成功', 'success')
      } else {
        toast(res.message || '上传失败', 'error')
      }
    } catch (e: any) {
      toast('上传失败：' + (e?.response?.data?.message || e.message), 'error')
    } finally {
      setUploading(false)
    }
  }, [toast])

  const handleCropCancel = useCallback(() => setCropSrc(null), [])

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {editId ? '编辑产品' : '新增产品'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
            {/* 公共字段：Slug + 分类 */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug *" error={formErrors.slug}>
                <input
                  className={`input-admin w-full font-mono text-sm ${formErrors.slug ? 'border-red-400 focus:ring-red-400' : ''}`}
                  value={editing.slug || ''}
                  onChange={e => updateField('slug', e.target.value)}
                />
              </Field>
              <Field label="所属分类 *" error={formErrors.categoryId}>
                <select
                  className={`input-admin w-full ${formErrors.categoryId ? 'border-red-400 focus:ring-red-400' : ''}`}
                  value={editing.categoryId || ''}
                  onChange={e => updateField('categoryId', Number(e.target.value) || undefined)}
                >
                  <option value="">请选择分类</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            </div>

            {/* 语言标签页 */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50">
                <button type="button" onClick={() => setActiveTab('en')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'en' ? 'bg-white text-brand-600 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700'}`}>🇬🇧 EN</button>
                <button type="button" onClick={() => setActiveTab('zh')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'zh' ? 'bg-white text-brand-600 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700'}`}>🇨🇳 ZH</button>
                <button type="button" onClick={() => setActiveTab('es')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${activeTab === 'es' ? 'bg-white text-brand-600 border-b-2 border-brand-500' : 'text-gray-500 hover:text-gray-700'}`}>🇪🇸 ES</button>
              </div>
              <div className="p-4 space-y-4">
                {/* EN */}
                {activeTab === 'en' && (
                  <>
                    <Field label="产品名称（EN）*" error={formErrors.name}>
                      <input
                        className={`input-admin w-full ${formErrors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                        value={editing.name || ''}
                        onChange={e => {
                          const n = e.target.value
                          setEditing(prev => ({ ...prev, name: n, slug: editId ? prev.slug : slugify(n) }))
                        }}
                      />
                    </Field>
                    <Field label="副标题（EN）"><input className="input-admin w-full" value={editing.subtitle || ''} onChange={e => updateField('subtitle', e.target.value)} /></Field>
                    <Field label="简短描述（EN）"><textarea className="input-admin w-full h-20 resize-none" value={editing.shortDesc || ''} onChange={e => updateField('shortDesc', e.target.value)} /></Field>
                    <Field label="详细描述（EN）"><textarea className="input-admin w-full h-28 resize-none" value={editing.description || ''} onChange={e => updateField('description', e.target.value)} /></Field>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="纯度（EN）"><input className="input-admin w-full" value={editing.purity || ''} onChange={e => updateField('purity', e.target.value)} /></Field>
                      <Field label="剂型（EN）"><input className="input-admin w-full" value={editing.form || ''} onChange={e => updateField('form', e.target.value)} /></Field>
                      <Field label="储存条件（EN）"><input className="input-admin w-full" value={editing.storage || ''} onChange={e => updateField('storage', e.target.value)} /></Field>
                    </div>
                    <Field label="规格（EN）"><input className="input-admin w-full" value={editing.specification || ''} onChange={e => updateField('specification', e.target.value)} /></Field>
                  </>
                )}
                {/* ZH */}
                {activeTab === 'zh' && (
                  <>
                    <Field label="产品名称（中文）"><input className="input-admin w-full" value={editing.nameZh || ''} onChange={e => updateField('nameZh', e.target.value)} /></Field>
                    <Field label="副标题（中文）"><input className="input-admin w-full" value={editing.subtitleZh || ''} onChange={e => updateField('subtitleZh', e.target.value)} /></Field>
                    <Field label="简短描述（中文）"><textarea className="input-admin w-full h-20 resize-none" value={editing.shortDescZh || ''} onChange={e => updateField('shortDescZh', e.target.value)} /></Field>
                    <Field label="详细描述（中文）"><textarea className="input-admin w-full h-28 resize-none" value={editing.descriptionZh || ''} onChange={e => updateField('descriptionZh', e.target.value)} /></Field>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="纯度（中文）"><input className="input-admin w-full" value={editing.purityZh || ''} onChange={e => updateField('purityZh', e.target.value)} /></Field>
                      <Field label="剂型（中文）"><input className="input-admin w-full" value={editing.formZh || ''} onChange={e => updateField('formZh', e.target.value)} /></Field>
                      <Field label="储存条件（中文）"><input className="input-admin w-full" value={editing.storageZh || ''} onChange={e => updateField('storageZh', e.target.value)} /></Field>
                    </div>
                    <Field label="规格（中文）"><input className="input-admin w-full" value={editing.specificationZh || ''} onChange={e => updateField('specificationZh', e.target.value)} /></Field>
                  </>
                )}
                {/* ES */}
                {activeTab === 'es' && (
                  <>
                    <Field label="产品名称（ES）"><input className="input-admin w-full" value={editing.nameEs || ''} onChange={e => updateField('nameEs', e.target.value)} /></Field>
                    <Field label="副标题（ES）"><input className="input-admin w-full" value={editing.subtitleEs || ''} onChange={e => updateField('subtitleEs', e.target.value)} /></Field>
                    <Field label="简短描述（ES）"><textarea className="input-admin w-full h-20 resize-none" value={editing.shortDescEs || ''} onChange={e => updateField('shortDescEs', e.target.value)} /></Field>
                    <Field label="详细描述（ES）"><textarea className="input-admin w-full h-28 resize-none" value={editing.descriptionEs || ''} onChange={e => updateField('descriptionEs', e.target.value)} /></Field>
                    <div className="grid grid-cols-3 gap-4">
                      <Field label="纯度（ES）"><input className="input-admin w-full" value={editing.purityEs || ''} onChange={e => updateField('purityEs', e.target.value)} /></Field>
                      <Field label="剂型（ES）"><input className="input-admin w-full" value={editing.formEs || ''} onChange={e => updateField('formEs', e.target.value)} /></Field>
                      <Field label="储存条件（ES）"><input className="input-admin w-full" value={editing.storageEs || ''} onChange={e => updateField('storageEs', e.target.value)} /></Field>
                    </div>
                    <Field label="规格（ES）"><input className="input-admin w-full" value={editing.specificationEs || ''} onChange={e => updateField('specificationEs', e.target.value)} /></Field>
                  </>
                )}
              </div>
            </div>

            {/* 公共字段：图片 + 状态 */}
            <Field label="封面图片">
              <div className="flex gap-2">
                <input
                  className="input-admin flex-1 bg-gray-50"
                  placeholder="请点击右侧按钮上传图片"
                  value={editing.coverImage || ''}
                  readOnly
                />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-3 py-2 text-xs bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg flex items-center gap-1.5 transition whitespace-nowrap">
                  {uploading ? <span className="animate-spin">⏳</span> : '选择并裁剪'}
                  {uploading ? '上传中...' : ''}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              {editing.coverImage && (
                <div className="mt-2 w-40 h-24 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                  <img src={editing.coverImage} alt="预览" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">选择图片后将弹出裁剪框，可拖拽调整位置和缩放，输出 800x600</p>
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="库存状态">
                <select className="input-admin w-full" value={editing.stockStatus ?? 1} onChange={e => updateField('stockStatus', Number(e.target.value))}>
                  <option value={1}>有货</option><option value={0}>缺货</option>
                </select>
              </Field>
              <Field label="推荐展示">
                <select className="input-admin w-full" value={editing.isFeatured ?? 0} onChange={e => updateField('isFeatured', Number(e.target.value))}>
                  <option value={0}>否</option><option value={1}>是（首页推荐）</option>
                </select>
              </Field>
              <Field label="排序权重">
                <input type="number" className="input-admin w-full" value={editing.sortOrder ?? 0} onChange={e => updateField('sortOrder', Number(e.target.value))} />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button onClick={onClose} className="btn-admin-secondary">取消</button>
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

      {/* 图片裁剪弹窗（在弹窗内部渲染，不触发父组件重渲染） */}
      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  )
})

export default function AdminProducts() {
  const toast = useToast()
  const [products, setProducts]       = useState<Product[]>([])
  const [categories, setCategories]   = useState<Category[]>([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [keyword, setKeyword]         = useState('')
  const [catFilter, setCatFilter]     = useState<number | ''>('')
  const [loading, setLoading]         = useState(false)
  const [showModal, setShowModal]     = useState(false)
  const [editId, setEditId]           = useState<number | null>(null)
  const [modalData, setModalData]     = useState<Partial<Product>>(EMPTY)
  const [deleteId, setDeleteId]       = useState<number | null>(null)
  const [deleting, setDeleting]       = useState(false)
  const [searchInput, setSearchInput] = useState('')

  // 弹窗打开时禁止背景滚动，关闭时恢复
  useEffect(() => {
    if (showModal) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = originalOverflow }
    }
  }, [showModal])

  const fetchProducts = useCallback(() => {
    setLoading(true)
    getProducts({
      page, size: PAGE_SIZE,
      keyword: keyword || undefined,
      categoryId: catFilter !== '' ? catFilter : undefined,
    })
      .then(r => { setProducts(r.data ?? []); setTotal(r.total ?? 0) })
      .catch(() => toast('加载产品数据失败', 'error'))
      .finally(() => setLoading(false))
  }, [page, keyword, catFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { getCategories().then(r => setCategories(r.data ?? [])) }, [])

  const openCreate = useCallback(() => {
    setEditId(null)
    setModalData({ ...EMPTY })
    setShowModal(true)
  }, [])

  const openEdit = useCallback((p: Product) => {
    setEditId(p.id)
    setModalData({ ...p })
    setShowModal(true)
  }, [])

  const handleCloseModal = useCallback(() => setShowModal(false), [])

  const handleModalSave = useCallback(async (data: Partial<Product>) => {
    if (editId) {
      await adminUpdateProduct(editId, data)
      toast('产品更新成功')
    } else {
      await adminCreateProduct(data)
      toast('产品创建成功')
    }
    setShowModal(false)
    fetchProducts()
  }, [editId, fetchProducts, toast])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await adminDeleteProduct(deleteId)
      toast('产品已删除')
      setDeleteId(null)
      if (products.length === 1 && page > 1) setPage(p => p - 1)
      else fetchProducts()
    } catch (e: any) {
      toast('删除失败：' + (e?.response?.data?.message || e.message || '未知错误'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">产品管理</h1>
          <p className="text-gray-500 text-sm mt-0.5">共 {total} 个产品</p>
        </div>
        <button onClick={openCreate} className="btn-admin-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增产品
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { setKeyword(searchInput); setPage(1) } }}
          placeholder="搜索产品名称..."
          className="input-admin w-64"
        />
        <select
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1) }}
          className="input-admin"
        >
          <option value="">全部分类</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => { setKeyword(searchInput); setPage(1) }} className="btn-admin-secondary">搜索</button>
        {(keyword || catFilter !== '') && (
          <button
            onClick={() => { setKeyword(''); setSearchInput(''); setCatFilter(''); setPage(1) }}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >✕ 清除</button>
        )}
      </div>

      {/* 表格 */}
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
                  <th className="th-admin">产品名称</th>
                  <th className="th-admin">分类</th>
                  <th className="th-admin">纯度</th>
                  <th className="th-admin">库存</th>
                  <th className="th-admin">推荐</th>
                  <th className="th-admin w-16">排序</th>
                  <th className="th-admin text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-sm">暂无产品数据</span>
                      </div>
                    </td>
                  </tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="td-admin text-gray-400 text-xs">{p.id}</td>
                    <td className="td-admin">
                      <div className="flex items-center gap-3">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{p.name}</div>
                          <div className="text-gray-400 text-xs font-mono">{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="td-admin">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                        {p.categoryName || '未分类'}
                      </span>
                    </td>
                    <td className="td-admin text-gray-500 text-sm">{p.purity || '-'}</td>
                    <td className="td-admin">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${p.stockStatus === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                        {p.stockStatus === 1 ? '有货' : '缺货'}
                      </span>
                    </td>
                    <td className="td-admin">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${p.isFeatured === 1 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                        {p.isFeatured === 1 ? '★ 推荐' : '—'}
                      </span>
                    </td>
                    <td className="td-admin text-gray-400 text-sm">{p.sortOrder}</td>
                    <td className="td-admin text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs text-brand-600 hover:text-brand-700 font-medium px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
                        >编辑</button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >删除</button>
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
        <ProductFormModal
          editId={editId}
          initialData={modalData}
          categories={categories}
          onSave={handleModalSave}
          onClose={handleCloseModal}
        />
      )}

      <ConfirmDelete
        open={deleteId !== null}
        message="此操作不可撤销，确定要删除这个产品吗？"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}
