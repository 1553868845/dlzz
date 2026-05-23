import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAdminMessages, getMessageDates, updateMessageStatus, deleteMessage } from '../../api'
import type { ContactMessage } from '../../types'
import { useToast } from '../components/Toast'
import Pagination from '../components/Pagination'
import ConfirmDelete from '../components/ConfirmDelete'

const STATUS_MAP: Record<number, { label: string; cls: string; dot: string }> = {
  0: { label: '未读',   cls: 'bg-red-100 text-red-600',   dot: 'bg-red-400' },
  1: { label: '已读',   cls: 'bg-gray-100 text-gray-500',  dot: 'bg-gray-300' },
  2: { label: '已回复', cls: 'bg-green-100 text-green-600', dot: 'bg-green-400' },
}

const PAGE_SIZE = 15

/** 把 "2026-03-27" 格式的日期转成 "3月27日（周四）" 风格 */
function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['日','一','二','三','四','五','六']
  const m = d.getMonth() + 1
  const day = d.getDate()
  const wd = days[d.getDay()]
  // 今天/昨天
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr + 'T00:00:00'); target.setHours(0,0,0,0)
  const diff = Math.round((today.getTime() - target.getTime()) / 86400000)
  if (diff === 0) return `今天  ${m}月${day}日`
  if (diff === 1) return `昨天  ${m}月${day}日`
  return `${m}月${day}日（周${wd}）`
}

export default function AdminMessages() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [messages, setMessages]             = useState<ContactMessage[]>([])
  const [total, setTotal]                   = useState(0)
  const [page, setPage]                     = useState(1)
  const [loading, setLoading]               = useState(false)
  const [statusFilter, setStatusFilter]     = useState<number | ''>(() => {
    const s = searchParams.get('status')
    return s !== null ? Number(s) : ''
  })
  const [typeFilter, setTypeFilter]         = useState<string>('')
  const [dateFilter, setDateFilter]         = useState<string>('')
  const [dateOptions, setDateOptions]       = useState<string[]>([])
  const [selected, setSelected]             = useState<ContactMessage | null>(null)
  const [deleteId, setDeleteId]             = useState<number | null>(null)
  const [deleting, setDeleting]             = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // 获取日期列表
  useEffect(() => {
    getMessageDates().then(r => { if (r.success) setDateOptions(r.data ?? []) })
  }, [])

  const fetchMessages = useCallback(() => {
    setLoading(true)
    getAdminMessages({
      page, size: PAGE_SIZE,
      status:   statusFilter !== '' ? statusFilter : undefined,
      formType: typeFilter || undefined,
      date:     dateFilter  || undefined,
    })
      .then(r => { setMessages(r.data ?? []); setTotal(r.total ?? 0) })
      .catch(() => toast('加载消息失败', 'error'))
      .finally(() => setLoading(false))
  }, [page, statusFilter, typeFilter, dateFilter])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const handleSetStatus = async (id: number, status: number) => {
    setUpdatingStatus(true)
    try {
      await updateMessageStatus(id, status)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
      toast(status === 2 ? '已标记为已回复' : status === 0 ? '已标记为未读' : '已更新状态')
    } catch {
      toast('状态更新失败', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteMessage(deleteId)
      toast('留言已删除')
      setDeleteId(null)
      if (selected?.id === deleteId) setSelected(null)
      if (messages.length === 1 && page > 1) setPage(p => p - 1)
      else fetchMessages()
    } catch {
      toast('删除失败', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const openDetail = async (msg: ContactMessage) => {
    setSelected(msg)
    if (msg.status === 0) {
      try {
        await updateMessageStatus(msg.id, 1)
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 1 } : m))
        setSelected({ ...msg, status: 1 })
      } catch { /* 静默失败 */ }
    }
  }

  const clearFilters = () => {
    setStatusFilter('')
    setTypeFilter('')
    setDateFilter('')
    setPage(1)
  }

  const hasFilter = statusFilter !== '' || typeFilter || dateFilter

  // 按日期分组消息列表（仅在无日期筛选时展示分组标题）
  const groupedMessages = (() => {
    if (dateFilter) return [{ date: null, items: messages }]
    const map = new Map<string, ContactMessage[]>()
    messages.forEach(m => {
      const d = m.createdAt ? m.createdAt.slice(0, 10) : '未知日期'
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push(m)
    })
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
  })()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">消息管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">共 {total} 条消息</p>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* 日期筛选 */}
        <select
          value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1) }}
          className="input-admin min-w-[160px]"
        >
          <option value="">全部日期</option>
          {dateOptions.map(d => (
            <option key={d} value={d}>{formatDateLabel(d)}</option>
          ))}
        </select>

        <select value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value === '' ? '' : Number(e.target.value)); setPage(1) }}
          className="input-admin">
          <option value="">全部状态</option>
          <option value={0}>未读</option>
          <option value={1}>已读</option>
          <option value={2}>已回复</option>
        </select>

        <select value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
          className="input-admin">
          <option value="">全部类型</option>
          <option value="contact">联系留言</option>
          <option value="quote">报价请求</option>
        </select>

        {hasFilter && (
          <button onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors">✕ 清除筛选</button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 items-start">
        {/* 消息列表 */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">暂无消息</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {groupedMessages.map(({ date, items }) => (
                  <div key={date ?? 'all'}>
                    {/* 日期分组标题（无日期筛选时显示） */}
                    {date && (
                      <div className="px-5 py-2 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-gray-500 tracking-wide">
                          {formatDateLabel(date)}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{items.length} 条</span>
                      </div>
                    )}
                    {items.map(msg => (
                      <div
                        key={msg.id}
                        onClick={() => openDetail(msg)}
                        className={`px-5 py-4 flex items-start gap-4 cursor-pointer transition-colors
                          ${selected?.id === msg.id ? 'bg-brand-50 border-l-2 border-brand-400' : 'hover:bg-gray-50/60'}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${STATUS_MAP[msg.status ?? 0]?.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-semibold text-sm ${msg.status === 0 ? 'text-gray-900' : 'text-gray-600'}`}>
                              {msg.name}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium
                              ${msg.formType === 'quote' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                              {msg.formType === 'quote' ? '报价' : '联系'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_MAP[msg.status ?? 0]?.cls}`}>
                              {STATUS_MAP[msg.status ?? 0]?.label}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">{msg.email}</p>
                          <p className="text-gray-400 text-xs mt-1 truncate">
                            {msg.subject || msg.product || msg.message}
                          </p>
                        </div>
                        <div className="text-gray-400 text-xs flex-shrink-0 whitespace-nowrap">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <Pagination page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
            </>
          )}
        </div>

        {/* 详情面板 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-20">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
              </svg>
              <p className="text-sm">点击左侧消息查看详情</p>
            </div>
          ) : (
            <>
              {/* 详情头部 */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium
                    ${selected.formType === 'quote' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                    {selected.formType === 'quote' ? '报价请求' : '联系留言'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_MAP[selected.status ?? 0]?.cls}`}>
                    {STATUS_MAP[selected.status ?? 0]?.label}
                  </span>
                </div>
                <button onClick={() => setDeleteId(selected.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                  title="删除">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* 信息列表 */}
              <div className="px-5 py-4 space-y-2.5">
                <InfoRow label="姓名" value={selected.name} />
                <InfoRow label="邮箱" value={
                  <a href={`mailto:${selected.email}`} className="text-brand-600 hover:underline break-all">{selected.email}</a>
                } />
                {selected.phone   && <InfoRow label="电话" value={selected.phone} />}
                {selected.company && <InfoRow label="公司" value={selected.company} />}
                {selected.subject && <InfoRow label="主题" value={selected.subject} />}
                {selected.product && <InfoRow label="产品" value={selected.product} />}
                {selected.quantity && <InfoRow label="数量" value={selected.quantity} />}
                <InfoRow label="时间" value={selected.createdAt ? new Date(selected.createdAt).toLocaleString('zh-CN') : '—'} />
                {selected.ipAddress && <InfoRow label="IP" value={<span className="font-mono text-xs">{selected.ipAddress}</span>} />}
              </div>

              {/* 留言内容 */}
              <div className="mx-5 mb-4 bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 font-semibold mb-1.5 uppercase tracking-wide">留言内容</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>

              {/* 操作按钮 */}
              <div className="px-5 pb-5 flex flex-col gap-2">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || selected.product || 'Your inquiry'}`}
                  onClick={() => selected.status !== 2 && handleSetStatus(selected.id, 2)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  发送邮件回复
                </a>
                <div className="flex gap-2">
                  {selected.status !== 2 && (
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleSetStatus(selected.id, 2)}
                      className="flex-1 py-2 text-xs font-medium bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white rounded-xl transition-colors"
                    >✓ 标记已回复</button>
                  )}
                  {selected.status !== 0 && (
                    <button
                      disabled={updatingStatus}
                      onClick={() => handleSetStatus(selected.id, 0)}
                      className="flex-1 py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-600 rounded-xl transition-colors"
                    >↩ 标记未读</button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDelete
        open={deleteId !== null}
        message="确认删除这条留言？删除后无法恢复。"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs text-gray-400 w-12 flex-shrink-0 pt-0.5 font-medium">{label}</span>
      <span className="text-sm text-gray-700 flex-1 min-w-0">{value}</span>
    </div>
  )
}
