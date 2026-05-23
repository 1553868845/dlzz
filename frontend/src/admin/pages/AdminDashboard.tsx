import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminOverview } from '../../api'
import type { AdminOverview, ContactMessage } from '../../types'

const statusLabel: Record<number, { label: string; cls: string }> = {
  0: { label: '未读', cls: 'bg-red-100 text-red-600' },
  1: { label: '已读', cls: 'bg-gray-100 text-gray-500' },
  2: { label: '已回复', cls: 'bg-green-100 text-green-600' },
}

function StatCard({ label, value, icon, color, to }: {
  label: string; value: number; icon: React.ReactNode; color: string; to?: string
}) {
  const content = (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOverview = () => {
    setLoading(true)
    setError(null)
    getAdminOverview()
      .then(r => setOverview(r.data))
      .catch(err => {
        console.error(err)
        setError(err?.response?.data?.message || '加载仪表盘数据失败，请检查后端服务是否正常运行')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOverview() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-gray-800 font-medium mb-1">加载失败</p>
          <p className="text-gray-500 text-sm max-w-sm">{error}</p>
        </div>
        <button
          onClick={fetchOverview}
          className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="text-gray-500 text-sm mt-1">网站数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="产品总数"
          value={overview?.totalProducts ?? 0}
          color="bg-blue-50"
          to="/admin/products"
          icon={
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="文章总数"
          value={overview?.totalArticles ?? 0}
          color="bg-purple-50"
          to="/admin/articles"
          icon={
            <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          label="分类总数"
          value={overview?.totalCategories ?? 0}
          color="bg-amber-50"
          to="/admin/categories"
          icon={
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
        <StatCard
          label="留言总数"
          value={overview?.totalMessages ?? 0}
          color="bg-green-50"
          to="/admin/messages"
          icon={
            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="未读留言"
          value={overview?.unreadMessages ?? 0}
          color="bg-red-50"
          to="/admin/messages?status=0"
          icon={
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          }
        />
      </div>

      {/* 最近留言 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">最近留言</h2>
          <Link
            to="/admin/messages"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            查看全部 →
          </Link>
        </div>

        {!overview?.recentMessages?.length ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">暂无留言</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {overview.recentMessages.map((msg: ContactMessage) => (
              <div key={msg.id} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${msg.status === 0 ? 'bg-red-400' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">{msg.name}</span>
                    <span className="text-gray-400 text-xs">·</span>
                    <span className="text-gray-500 text-xs">{msg.email}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${msg.formType === 'quote' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                      {msg.formType === 'quote' ? '报价' : '联系'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusLabel[msg.status ?? 0]?.cls}`}>
                      {statusLabel[msg.status ?? 0]?.label}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 truncate">
                    {msg.subject || msg.product || msg.message}
                  </p>
                </div>
                <div className="text-gray-400 text-xs flex-shrink-0 whitespace-nowrap">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('zh-CN') : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/admin/products', label: '新增产品', color: 'bg-blue-500', icon: '+' },
          { to: '/admin/articles', label: '写文章', color: 'bg-purple-500', icon: '✍' },
          { to: '/admin/categories', label: '管理分类', color: 'bg-amber-500', icon: '🏷' },
          { to: '/admin/messages', label: '查看留言', color: 'bg-green-500', icon: '📩' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white text-lg`}>
              {item.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
