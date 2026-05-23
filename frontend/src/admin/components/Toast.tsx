import { useEffect, useState, createContext, useContext, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  type: ToastType
  message: string
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

let _id = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++_id
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast容器 */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} item={t} onRemove={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 进入动画
    const t1 = setTimeout(() => setVisible(true), 10)
    // 提前开始退出动画
    const t2 = setTimeout(() => setVisible(false), 3000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const configs: Record<ToastType, { bg: string; icon: string; bar: string }> = {
    success: {
      bg: 'bg-white border-green-200',
      icon: '✓',
      bar: 'bg-green-500',
    },
    error: {
      bg: 'bg-white border-red-200',
      icon: '✕',
      bar: 'bg-red-500',
    },
    warning: {
      bg: 'bg-white border-amber-200',
      icon: '⚠',
      bar: 'bg-amber-500',
    },
    info: {
      bg: 'bg-white border-blue-200',
      icon: 'i',
      bar: 'bg-blue-500',
    },
  }

  const iconColors: Record<ToastType, string> = {
    success: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600',
  }

  const cfg = configs[item.type]
  const iconCls = iconColors[item.type]

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl
        ${cfg.bg} transition-all duration-300 ease-out min-w-[260px] max-w-sm overflow-hidden relative
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* 进度条 */}
      <div className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} animate-shrink-bar`} />

      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${iconCls}`}>
        {cfg.icon}
      </div>

      <p className="text-gray-800 text-sm font-medium flex-1 leading-snug">{item.message}</p>

      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
