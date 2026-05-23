// 全局类型定义

export interface Product {
  id: number
  categoryId: number
  categoryName: string
  name: string
  slug: string
  subtitle: string
  shortDesc: string
  description: string
  purity: string
  form: string
  storage: string
  specification: string
  price: number | null
  stockStatus: number   // 0=缺货 1=有货
  isFeatured: number
  coverImage: string
  sortOrder: number
  createdAt: string
  updatedAt: string
  // 中文字段（可选）
  nameZh?: string
  subtitleZh?: string
  shortDescZh?: string
  descriptionZh?: string
  purityZh?: string
  formZh?: string
  storageZh?: string
  specificationZh?: string
  // 西班牙语字段（可选）
  nameEs?: string
  subtitleEs?: string
  shortDescEs?: string
  descriptionEs?: string
  purityEs?: string
  formEs?: string
  storageEs?: string
  specificationEs?: string
}

export interface Category {
  id: number
  name: string
  nameZh?: string
  nameEs?: string
  slug: string
  description: string
  sortOrder: number
}

export interface Article {
  id: number
  title: string
  titleZh?: string
  titleEs?: string
  slug: string
  excerpt: string
  excerptZh?: string
  excerptEs?: string
  content: string
  contentZh?: string
  contentEs?: string
  coverImage: string
  category: string
  author: string
  viewCount: number
  published: number
  publishedAt: string
  createdAt: string
}

export interface Faq {
  id: number
  question: string
  questionZh?: string
  questionEs?: string
  answer: string
  answerZh?: string
  answerEs?: string
  sortOrder: number
  published?: number
}

export interface StatItem {
  id: number
  label: string
  labelZh?: string
  labelEs?: string
  value: string
  icon: string
}

export interface Banner {
  id: number
  imageUrl: string
  sortOrder: number
  description: string
  isActive: number   // 1=启用 0=禁用
  linkUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface QuoteFormData {
  name: string
  email: string
  phone: string
  company: string
  product: string
  quantity: string
  message: string
}

export interface ApiResult<T> {
  success: boolean
  message: string
  data: T
  total?: number
}

// ── 后台管理类型 ──────────────────────────────────────────────

export interface ContactMessage {
  id: number
  formType: 'contact' | 'quote'
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  product?: string
  quantity?: string
  message: string
  status: number    // 0=未读 1=已读 2=已回复
  ipAddress?: string
  createdAt: string
}

export interface AdminOverview {
  totalProducts: number
  totalArticles: number
  totalCategories: number
  totalMessages: number
  unreadMessages: number
  recentMessages: ContactMessage[]
}

export interface AdminUser {
  username: string
  token: string
}

// ── 页面内容（隐私政策、退货政策等）────────────────────────────────
export interface PageContent {
  id: number
  slug: string
  title: string
  titleZh?: string
  titleEs?: string
  content: string
  contentZh?: string
  contentEs?: string
  updatedAt: string
}

// ── WhatsApp 多号码 ───────────────────────────────────────────────
export interface WhatsAppNumber {
  id: number
  number: string      // 纯数字，含国际区号
  label: string       // 备注标签，如"香港号码1"
  sortOrder: number   // 排序值，升序轮换
  isActive: number    // 1=启用 0=禁用
  createdAt?: string
  updatedAt?: string
}
