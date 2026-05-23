/**
 * ContactInfoContext
 * App 挂载时获取一次 WhatsApp 号码 + Email，整个会话内固定不变。
 *
 * 缓存策略（sessionStorage）：
 *   - 同一标签页/会话：刷新也读缓存，不再触发接口 → 号码不变
 *   - 新开标签页 / 关闭后重开：缓存失效 → 重新请求接口 → 轮换到下一个号码
 *
 * 对外导出：
 *   useWhatsApp()       → { whatsapp, email }
 *   useWhatsAppNumber() → whatsapp 字符串（向后兼容）
 */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getWhatsappNumbers, getContactInfo } from '../api'

const DEFAULT_WHATSAPP = '85247488025'
const DEFAULT_EMAIL    = 'info@qinglipeptide.com'

const SESSION_KEY = 'qingli_contact_info'   // sessionStorage 键名

interface ContactInfo {
  whatsapp: string
  email: string
}

const ContactInfoContext = createContext<ContactInfo>({
  whatsapp: DEFAULT_WHATSAPP,
  email:    DEFAULT_EMAIL,
})

/** 读取 sessionStorage 缓存，没有或解析失败返回 null */
function readSession(): ContactInfo | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ContactInfo
    if (parsed.whatsapp && parsed.email) return parsed
    return null
  } catch {
    return null
  }
}

/** 写入 sessionStorage */
function writeSession(info: ContactInfo) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(info))
  } catch {
    // 无痛失败，隐私模式下 sessionStorage 可能被禁
  }
}

/** App 根节点挂一次，所有子组件直接读取，不再各自发请求 */
export function WhatsAppProvider({ children }: { children: ReactNode }) {
  // 优先用 session 缓存初始化，避免首屏闪烁
  const [info, setInfo] = useState<ContactInfo>(() => readSession() ?? {
    whatsapp: DEFAULT_WHATSAPP,
    email:    DEFAULT_EMAIL,
  })

  useEffect(() => {
    // 有缓存就直接用，本次 session 内不再请求接口（号码不会再变）
    if (readSession()) return

    // 无缓存（新 session / 新标签页）才请求接口 → 触发轮换
    Promise.allSettled([
      getWhatsappNumbers(),
      getContactInfo(),
    ]).then(([waResult, ciResult]) => {
      setInfo(prev => {
        const next = { ...prev }
        if (waResult.status === 'fulfilled' && waResult.value?.success && waResult.value.data) {
          next.whatsapp = waResult.value.data.replace(/\D/g, '')
        }
        if (ciResult.status === 'fulfilled' && ciResult.value?.success && ciResult.value.data) {
          if (ciResult.value.data.email) next.email = ciResult.value.data.email
          // WhatsApp 接口失败时用 contact-info 备用
          if (!next.whatsapp && ciResult.value.data.whatsapp) {
            next.whatsapp = ciResult.value.data.whatsapp.replace(/\D/g, '')
          }
        }
        // 写入 session，本次 session 内固定
        writeSession(next)
        return next
      })
    })
  }, [])

  return (
    <ContactInfoContext.Provider value={info}>
      {children}
    </ContactInfoContext.Provider>
  )
}

/** 主 Hook：同时拿 whatsapp + email */
export function useWhatsApp() {
  return useContext(ContactInfoContext)
}

/** 兼容旧调用，只取 whatsapp */
export function useWhatsAppNumber() {
  return useContext(ContactInfoContext).whatsapp
}
