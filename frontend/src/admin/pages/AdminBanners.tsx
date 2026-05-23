import { useEffect, useState, useRef } from 'react'
import { Image, Plus, Trash2, GripVertical, Eye, EyeOff, Upload, Link as LinkIcon, X } from 'lucide-react'
import { adminGetBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner, adminUploadImage } from '../../api'
import { useToast } from '../components/Toast'
import type { Banner } from '../../types'

export default function AdminBanners() {
  const toast = useToast()
  const [banners,  setBanners]  = useState<Banner[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Banner | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // 表单状态
  const [imageUrl,    setImageUrl]    = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl,     setLinkUrl]     = useState('')
  const [sortOrder,   setSortOrder]   = useState(99)
  const [isActive,    setIsActive]    = useState(1)

  const load = () => {
    setLoading(true)
    adminGetBanners()
      .then(r => r.success && setBanners(r.data ?? []))
      .catch(() => toast('加载失败', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setImageUrl(''); setDescription(''); setLinkUrl(''); setSortOrder(99); setIsActive(1)
    setShowForm(true)
  }

  const openEdit = (b: Banner) => {
    setEditing(b)
    setImageUrl(b.imageUrl ?? '')
    setDescription(b.description ?? '')
    setLinkUrl(b.linkUrl ?? '')
    setSortOrder(b.sortOrder ?? 99)
    setIsActive(b.isActive ?? 1)
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null) }

  // 上传图片
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast('请选择图片文件', 'error'); return }
    setUploading(true)
    try {
      const r = await adminUploadImage(file)
      if (r.success && r.data?.url) {
        setImageUrl(r.data.url)
        toast('图片上传成功', 'success')
      } else {
        toast(r.message || '上传失败', 'error')
      }
    } catch {
      toast('上传失败，请重试', 'error')
    } finally {
      setUploading(false)
    }
  }

  // 保存
  const handleSave = async () => {
    if (!imageUrl.trim()) { toast('请先上传轮播图片', 'error'); return }
    const data: Partial<Banner> = { imageUrl, description, linkUrl, sortOrder, isActive }
    try {
      const r = editing
        ? await adminUpdateBanner(editing.id, data)
        : await adminCreateBanner(data)
      if (r.success) {
        toast(editing ? '已更新' : '已添加', 'success')
        closeForm(); load()
      } else {
        toast(r.message || '保存失败', 'error')
      }
    } catch {
      toast('保存失败，请重试', 'error')
    }
  }

  // 切换上下架
  const toggleActive = async (b: Banner) => {
    try {
      const r = await adminUpdateBanner(b.id, { ...b, isActive: b.isActive === 1 ? 0 : 1 })
      if (r.success) {
        setBanners(prev => prev.map(x => x.id === b.id ? { ...x, isActive: b.isActive === 1 ? 0 : 1 } : x))
      }
    } catch { toast('操作失败', 'error') }
  }

  // 删除
  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该轮播图？')) return
    try {
      await adminDeleteBanner(id)
      toast('已删除', 'success')
      load()
    } catch { toast('删除失败', 'error') }
  }

  return (
    <div>
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">轮播图管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">管理首页轮播图，支持多张图片轮播切换</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> 添加轮播图
        </button>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 animate-pulse">加载中...</div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Image size={48} className="mb-4 text-gray-200" />
          <p className="text-lg font-medium mb-2">暂无轮播图</p>
          <p className="text-sm mb-5">点击"添加轮播图"上传您的首页横幅图片</p>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} /> 添加第一张
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map(b => (
            <div key={b.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${b.isActive !== 1 ? 'opacity-60' : ''}`}>
              {/* 图片预览 */}
              <div className="relative aspect-[16/7] bg-gray-100 overflow-hidden">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.description || ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Image size={40} />
                  </div>
                )}
                {/* 排序标签 */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <GripVertical size={11} /> 序号 {b.sortOrder}
                </div>
                {/* 状态标签 */}
                <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full font-medium ${b.isActive === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {b.isActive === 1 ? '显示中' : '已隐藏'}
                </div>
              </div>

              {/* 信息 */}
              <div className="p-4">
                {b.description && <p className="text-sm font-medium text-gray-700 mb-1 truncate">{b.description}</p>}
                {b.linkUrl && (
                  <a href={b.linkUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-500 hover:underline flex items-center gap-1 truncate mb-2">
                    <LinkIcon size={11} /> {b.linkUrl}
                  </a>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEdit(b)}
                    className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => toggleActive(b)}
                    title={b.isActive === 1 ? '点击隐藏' : '点击显示'}
                    className={`p-1.5 rounded-lg border transition-colors ${b.isActive === 1 ? 'border-green-200 text-green-600 hover:bg-green-50' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                  >
                    {b.isActive === 1 ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 弹窗表单 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editing ? '编辑轮播图' : '添加轮播图'}</h2>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 图片上传区 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  轮播图片 <span className="text-red-500">*</span>
                  <span className="ml-1 text-xs text-gray-400 font-normal">建议尺寸 1920×680px</span>
                </label>
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-[16/6] bg-gray-100">
                    <img src={imageUrl} alt="预览" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 text-xs px-3 py-1 rounded-lg shadow transition-colors flex items-center gap-1"
                    >
                      <Upload size={12} /> 重新上传
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full aspect-[16/6] border-2 border-dashed border-gray-200 rounded-xl hover:border-brand-400 hover:bg-brand-50/30 transition-colors flex flex-col items-center justify-center text-gray-400 disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <svg className="w-8 h-8 animate-spin mb-2 text-brand-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <span className="text-sm">上传中...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-medium">点击上传图片</span>
                        <span className="text-xs mt-1">支持 JPG、PNG、WebP</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = '' }}
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">图片描述（可选）</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="如：春季新品上市 横幅"
                  className="input-admin w-full"
                />
              </div>

              {/* 跳转链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  点击跳转链接（可选）
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/products"
                  className="input-admin w-full"
                />
                <p className="mt-1 text-xs text-gray-400">填写后点击轮播图会跳转到此链接，不填则仅展示图片</p>
              </div>

              {/* 排序和状态 */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">排序序号</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={e => setSortOrder(Number(e.target.value))}
                    min={1}
                    className="input-admin w-full"
                  />
                  <p className="mt-1 text-xs text-gray-400">数字越小越靠前</p>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">显示状态</label>
                  <div className="flex gap-2 mt-1">
                    {[{ v: 1, label: '显示' }, { v: 0, label: '隐藏' }].map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setIsActive(opt.v)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          isActive === opt.v
                            ? opt.v === 1 ? 'bg-green-500 text-white border-green-500' : 'bg-gray-500 text-white border-gray-500'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <button onClick={closeForm} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-sm font-medium">
                取消
              </button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition-colors text-sm font-medium">
                {editing ? '保存修改' : '添加轮播图'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
