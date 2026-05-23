import { useEffect, useState } from 'react'
import { adminGetWhatsappNumbers, adminCreateWhatsappNumber, adminUpdateWhatsappNumber, adminDeleteWhatsappNumber } from '../../api'
import type { WhatsAppNumber } from '../../types'
import { useToast } from '../components/Toast'
import { useLang } from '../../i18n/LanguageContext'

// WhatsApp 图标
const WaIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

interface FormState {
  number: string
  label: string
  sortOrder: number
  isActive: number
}

const defaultForm: FormState = { number: '', label: '', sortOrder: 1, isActive: 1 }

export default function AdminWhatsapp() {
  const toast = useToast()
  const { t } = useLang()
  const ts = t.adminWhatsapp

  const [numbers, setNumbers] = useState<WhatsAppNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<WhatsAppNumber | null>(null)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [saving, setSaving] = useState(false)

  const loadNumbers = () => {
    setLoading(true)
    adminGetWhatsappNumbers()
      .then(r => { if (r.success) setNumbers(r.data ?? []) })
      .catch(() => toast('Load failed', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadNumbers() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...defaultForm, sortOrder: numbers.length + 1 })
    setShowModal(true)
  }

  const openEdit = (item: WhatsAppNumber) => {
    setEditing(item)
    setForm({ number: item.number, label: item.label, sortOrder: item.sortOrder, isActive: item.isActive })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.number.trim()) { toast(ts.numberLabel + ' required', 'error'); return }
    const numOnly = form.number.replace(/\D/g, '')
    if (!numOnly) { toast('Invalid number', 'error'); return }
    // 前端校验：sort_order 不能与其他号码重复
    const isDuplicate = numbers.some(
      item => item.sortOrder === form.sortOrder && (!editing || item.id !== editing.id)
    )
    if (isDuplicate) {
      toast(`排序值 ${form.sortOrder} 已被其他号码使用，请换一个`, 'error')
      return
    }
    setSaving(true)
    try {
      const payload = { number: numOnly, label: form.label, sortOrder: form.sortOrder, isActive: form.isActive }
      let res
      if (editing) {
        res = await adminUpdateWhatsappNumber(editing.id, payload)
      } else {
        res = await adminCreateWhatsappNumber(payload)
      }
      if (res.success) {
        toast(t.common.success, 'success')
        setShowModal(false)
        loadNumbers()
      } else {
        toast(res.message || t.common.error, 'error')
      }
    } catch (e: any) {
      toast(e?.response?.data?.message || e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: WhatsAppNumber) => {
    if (!window.confirm(ts.deleteConfirm)) return
    try {
      const res = await adminDeleteWhatsappNumber(item.id)
      if (res.success) { toast(t.common.success, 'success'); loadNumbers() }
      else toast(res.message || t.common.error, 'error')
    } catch (e: any) {
      toast(e?.response?.data?.message || e.message, 'error')
    }
  }

  const toggleActive = async (item: WhatsAppNumber) => {
    try {
      const res = await adminUpdateWhatsappNumber(item.id, { isActive: item.isActive === 1 ? 0 : 1 })
      if (res.success) loadNumbers()
      else toast(res.message || t.common.error, 'error')
    } catch (e: any) {
      toast(e?.response?.data?.message || e.message, 'error')
    }
  }

  // 格式化号码显示
  const formatNumber = (num: string) => {
    const n = num.replace(/\D/g, '')
    if (n.startsWith('852') && n.length === 11) return `+852 ${n.slice(3, 7)}-${n.slice(7)}`
    if (n.length > 6) return `+${n.slice(0, n.length - 8)} ${n.slice(-8, -4)}-${n.slice(-4)}`
    return `+${n}`
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{ts.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{ts.subtitle}</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {ts.addNumber}
        </button>
      </div>

      {/* 提示 */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
        {ts.rotateTip}
      </div>

      {/* 号码列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 animate-pulse">{t.common.loading}</div>
      ) : numbers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <WaIcon />
          <p className="mt-4">{ts.noNumbers}</p>
          <button onClick={openAdd} className="btn-primary mt-4 text-sm">{ts.addNumber}</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{ts.sortLabel}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{ts.numberLabel}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{ts.labelLabel}</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{ts.statusLabel}</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {numbers.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                      ${idx === 0 && item.isActive === 1 ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                      {item.sortOrder}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#25D366]"><WaIcon /></span>
                      <div>
                        <a href={`https://wa.me/${item.number}`} target="_blank" rel="noopener noreferrer"
                          className="font-medium text-gray-800 hover:text-brand-500 transition-colors">
                          {formatNumber(item.number)}
                        </a>
                        <p className="text-xs text-gray-400 font-mono">{item.number}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{item.label || '—'}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors
                        ${item.isActive === 1
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isActive === 1 ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {item.isActive === 1 ? ts.active : ts.inactive}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="text-gray-400 hover:text-brand-500 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        title={t.common.edit}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                        title={t.common.delete}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 弹窗：新增/编辑 ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">
                {editing ? ts.editTitle : ts.addTitle}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* 号码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {ts.numberLabel} *
                </label>
                <input
                  type="text"
                  value={form.number}
                  onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                  placeholder={ts.numberPlaceholder}
                  className="input-admin w-full"
                />
                {form.number && (
                  <p className="mt-1 text-xs text-gray-400">
                    → <a href={`https://wa.me/${form.number.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                      wa.me/{form.number.replace(/\D/g,'')}
                    </a>
                  </p>
                )}
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{ts.labelLabel}</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder={ts.labelPlaceholder}
                  className="input-admin w-full"
                />
              </div>

              {/* 排序 + 状态 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{ts.sortLabel}</label>
                  <input
                    type="number"
                    min={1}
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className="input-admin w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{ts.statusLabel}</label>
                  <select
                    value={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: Number(e.target.value) }))}
                    className="input-admin w-full"
                  >
                    <option value={1}>{ts.active}</option>
                    <option value={0}>{ts.inactive}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-outline px-4 py-2 text-sm">{t.common.cancel}</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {t.common.saving}
                  </>
                ) : ts.saveBtnText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
