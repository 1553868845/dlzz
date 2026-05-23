import { useEffect, useState } from 'react'
import { HelpCircle, Plus, Trash2, Eye, EyeOff, X, ChevronDown, ChevronUp } from 'lucide-react'
import { adminGetFaqs, adminCreateFaq, adminUpdateFaq, adminToggleFaqPublished, adminDeleteFaq } from '../../api'
import { useToast } from '../components/Toast'
import type { Faq } from '../../types'

export default function AdminFaqs() {
  const toast = useToast()
  const [faqs,     setFaqs]     = useState<Faq[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing,  setEditing]  = useState<Faq | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  // 表单状态
  const [question,    setQuestion]    = useState('')
  const [questionZh,  setQuestionZh]  = useState('')
  const [questionEs,  setQuestionEs]  = useState('')
  const [answer,      setAnswer]      = useState('')
  const [answerZh,    setAnswerZh]    = useState('')
  const [answerEs,    setAnswerEs]    = useState('')
  const [sortOrder,   setSortOrder]   = useState(99)
  const [published,   setPublished]   = useState(1)

  const load = () => {
    setLoading(true)
    adminGetFaqs()
      .then(r => r.success && setFaqs(r.data ?? []))
      .catch(() => toast('加载失败', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setQuestion(''); setQuestionZh(''); setQuestionEs(''); setAnswer(''); setAnswerZh(''); setAnswerEs('')
    setSortOrder(99); setPublished(1)
    setShowForm(true)
  }

  const openEdit = (f: Faq) => {
    setEditing(f)
    setQuestion(f.question ?? '')
    setQuestionZh(f.questionZh ?? '')
    setQuestionEs(f.questionEs ?? '')
    setAnswer(f.answer ?? '')
    setAnswerZh(f.answerZh ?? '')
    setAnswerEs(f.answerEs ?? '')
    setSortOrder(f.sortOrder ?? 99)
    setPublished(f.published ?? 1)
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null) }

  const handleSave = async () => {
    if (!question.trim()) { toast('请填写英文问题', 'error'); return }
    if (!answer.trim())   { toast('请填写英文回答', 'error'); return }
    const data: Partial<Faq> = { question, questionZh, questionEs, answer, answerZh, answerEs, sortOrder, published }
    try {
      const r = editing
        ? await adminUpdateFaq(editing.id, data)
        : await adminCreateFaq(data)
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

  const togglePublished = async (f: Faq) => {
    try {
      const next = f.published === 1 ? 0 : 1
      await adminToggleFaqPublished(f.id, next)
      setFaqs(prev => prev.map(x => x.id === f.id ? { ...x, published: next } : x))
    } catch { toast('操作失败', 'error') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除该问题？')) return
    try {
      await adminDeleteFaq(id)
      toast('已删除', 'success')
      load()
    } catch { toast('删除失败', 'error') }
  }

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">常见问题管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">管理首页 FAQ 区块，支持中英文双语展示</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> 添加问题
        </button>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 animate-pulse">加载中...</div>
      ) : faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <HelpCircle size={48} className="mb-4 text-gray-200" />
          <p className="text-lg font-medium mb-2">暂无常见问题</p>
          <p className="text-sm mb-5">点击"添加问题"开始创建 FAQ</p>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Plus size={16} /> 添加第一条
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map(f => {
            const isOpen = expanded.has(f.id)
            return (
              <div
                key={f.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${f.published !== 1 ? 'opacity-60' : ''}`}
              >
                {/* 问题头部 */}
                <div className="flex items-start gap-3 px-5 py-4">
                  {/* 序号 */}
                  <span className="mt-0.5 flex-shrink-0 w-6 h-6 bg-brand-50 text-brand-600 text-xs font-bold rounded-lg flex items-center justify-center">
                    {f.sortOrder}
                  </span>

                  {/* 问题文本 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{f.question}</p>
                    {f.questionZh && (
                      <p className="text-xs text-gray-400 mt-0.5">{f.questionZh}</p>
                    )}
                    {f.questionEs && (
                      <p className="text-xs text-gray-400 mt-0.5">{f.questionEs}</p>
                    )}
                    {/* 展开的回答 */}
                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">EN</span>
                          <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">{f.answer}</p>
                        </div>
                        {f.answerZh && (
                          <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">中文</span>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">{f.answerZh}</p>
                          </div>
                        )}
                        {f.answerEs && (
                          <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">ES</span>
                            <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-wrap">{f.answerEs}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 右侧操作 */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* 状态标签 */}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.published === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {f.published === 1 ? '已发布' : '已隐藏'}
                    </span>

                    {/* 展开/收起 */}
                    <button
                      onClick={() => toggleExpand(f.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title={isOpen ? '收起回答' : '查看回答'}
                    >
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* 编辑 */}
                    <button
                      onClick={() => openEdit(f)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      title="编辑"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* 切换显示/隐藏 */}
                    <button
                      onClick={() => togglePublished(f)}
                      title={f.published === 1 ? '点击隐藏' : '点击显示'}
                      className={`p-1.5 rounded-lg border transition-colors ${f.published === 1
                        ? 'border-green-200 text-green-600 hover:bg-green-50'
                        : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                    >
                      {f.published === 1 ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    {/* 删除 */}
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 弹窗表单 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">{editing ? '编辑 FAQ' : '添加 FAQ'}</h2>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* 英文问题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  问题（英文）<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="e.g. What is the purity of your peptides?"
                  className="input-admin w-full"
                />
              </div>

              {/* 中文问题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  问题（中文）
                  <span className="ml-1 text-xs text-gray-400 font-normal">可选</span>
                </label>
                <input
                  type="text"
                  value={questionZh}
                  onChange={e => setQuestionZh(e.target.value)}
                  placeholder="例如：你们肽类产品的纯度是多少？"
                  className="input-admin w-full"
                />
              </div>

              {/* 西班牙语问题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pregunta (ES)
                  <span className="ml-1 text-xs text-gray-400 font-normal">Opcional</span>
                </label>
                <input
                  type="text"
                  value={questionEs}
                  onChange={e => setQuestionEs(e.target.value)}
                  placeholder="P. ej. ¿Cuál es la pureza de sus péptidos?"
                  className="input-admin w-full"
                />
              </div>

              {/* 英文回答 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  回答（英文）<span className="text-red-500">*</span>
                </label>
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Enter the answer in English..."
                  rows={4}
                  className="input-admin w-full resize-none"
                />
              </div>

              {/* 中文回答 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  回答（中文）
                  <span className="ml-1 text-xs text-gray-400 font-normal">可选</span>
                </label>
                <textarea
                  value={answerZh}
                  onChange={e => setAnswerZh(e.target.value)}
                  placeholder="请输入中文回答..."
                  rows={4}
                  className="input-admin w-full resize-none"
                />
              </div>

              {/* 西班牙语回答 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Respuesta (ES)
                  <span className="ml-1 text-xs text-gray-400 font-normal">Opcional</span>
                </label>
                <textarea
                  value={answerEs}
                  onChange={e => setAnswerEs(e.target.value)}
                  placeholder="Introduzca la respuesta en español..."
                  rows={4}
                  className="input-admin w-full resize-none"
                />
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
                  <p className="mt-1 text-xs text-gray-400">数字越小越靠前显示</p>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">发布状态</label>
                  <div className="flex gap-2 mt-1">
                    {[{ v: 1, label: '发布' }, { v: 0, label: '隐藏' }].map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setPublished(opt.v)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          published === opt.v
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
                {editing ? '保存修改' : '添加问题'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
