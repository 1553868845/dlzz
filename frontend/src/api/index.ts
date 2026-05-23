import axios from 'axios'
import type { ApiResult, Product, Category, Article, Faq, StatItem, Banner, ContactFormData, QuoteFormData, ContactMessage, AdminOverview, WhatsAppNumber, PageContent } from '../types'

const http = axios.create({ baseURL: '/api', timeout: 10000 })

// 自动带上 JWT Bearer Token（管理后台接口）
http.interceptors.request.use(config => {
  try {
    const stored = localStorage.getItem('qingli_admin_user')
    if (stored) {
      const user = JSON.parse(stored)
      if (user?.token) {
        config.headers['Authorization'] = `Bearer ${user.token}`
      }
    }
  } catch (_) {}
  return config
})

// 响应拦截：401 时跳转登录
http.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('qingli_admin_user')
      // 只在后台页面才跳转
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── 产品 ─────────────────────────────────────────────────────
export const getProducts = (params?: { categoryId?: number; keyword?: string; page?: number; size?: number }) =>
  http.get<ApiResult<Product[]>>('/products', { params }).then(r => r.data)

export const getFeaturedProducts = () =>
  http.get<ApiResult<Product[]>>('/products/featured').then(r => r.data)

export const getProductBySlug = (slug: string) =>
  http.get<ApiResult<Product>>(`/products/${slug}`).then(r => r.data)

// ── 分类 ─────────────────────────────────────────────────────
export const getCategories = () =>
  http.get<ApiResult<Category[]>>('/categories').then(r => r.data)

// ── 文章 ─────────────────────────────────────────────────────
export const getArticles = (params?: { category?: string; keyword?: string; page?: number; size?: number }) =>
  http.get<ApiResult<Article[]>>('/articles', { params }).then(r => r.data)

export const getArticleBySlug = (slug: string) =>
  http.get<ApiResult<Article>>(`/articles/${slug}`).then(r => r.data)

// ── 联系/报价 ─────────────────────────────────────────────────
export const sendContact = (data: ContactFormData) =>
  http.post<ApiResult<null>>('/contact/send', data).then(r => r.data)

export const sendQuote = (data: QuoteFormData) =>
  http.post<ApiResult<null>>('/contact/quote', data).then(r => r.data)

// ── 公共数据 ──────────────────────────────────────────────────
export const getFaqs = () =>
  http.get<ApiResult<Faq[]>>('/misc/faqs').then(r => r.data)

export const getStats = () =>
  http.get<ApiResult<StatItem[]>>('/misc/stats').then(r => r.data)

export const getHomeData = () =>
  http.get<ApiResult<{ stats: StatItem[]; faqs: Faq[] }>>('/misc/home').then(r => r.data)

export const getContactInfo = () =>
  http.get<ApiResult<{ email: string; whatsapp: string }>>('/misc/contact-info').then(r => r.data)

export const adminUpdateContactInfo = (data: { email?: string; whatsapp?: string }) =>
  http.put<ApiResult<{ email: string; whatsapp: string }>>('/misc/contact-info', data).then(r => r.data)

// ── WhatsApp 多号码（前台）────────────────────────────────────────
// 返回当前轮换到的号码（纯数字字符串，后端按 sort_order 顺序轮换）
export const getWhatsappNumbers = () =>
  http.get<ApiResult<string>>('/misc/whatsapp').then(r => r.data)

// ── WhatsApp 多号码管理（后台）────────────────────────────────────
export const adminGetWhatsappNumbers = () =>
  http.get<ApiResult<WhatsAppNumber[]>>('/admin/whatsapp').then(r => r.data)

export const adminCreateWhatsappNumber = (data: Partial<WhatsAppNumber>) =>
  http.post<ApiResult<WhatsAppNumber>>('/admin/whatsapp', data).then(r => r.data)

export const adminUpdateWhatsappNumber = (id: number, data: Partial<WhatsAppNumber>) =>
  http.put<ApiResult<WhatsAppNumber>>(`/admin/whatsapp/${id}`, data).then(r => r.data)

export const adminDeleteWhatsappNumber = (id: number) =>
  http.delete<ApiResult<null>>(`/admin/whatsapp/${id}`).then(r => r.data)

export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
  http.post<ApiResult<null>>('/auth/change-password', data).then(r => r.data)

// ── 后台管理 CRUD ──────────────────────────────────────────────

// 仪表盘
export const getAdminOverview = () =>
  http.get<ApiResult<AdminOverview>>('/admin/overview').then(r => r.data)

// 留言管理
export const getAdminMessages = (params?: { status?: number; formType?: string; date?: string; page?: number; size?: number }) =>
  http.get<ApiResult<ContactMessage[]>>('/admin/messages', { params }).then(r => r.data)

export const getMessageDates = () =>
  http.get<ApiResult<string[]>>('/admin/messages/dates').then(r => r.data)


export const updateMessageStatus = (id: number, status: number) =>
  http.put<ApiResult<null>>(`/admin/messages/${id}/status`, { status }).then(r => r.data)

export const deleteMessage = (id: number) =>
  http.delete<ApiResult<null>>(`/admin/messages/${id}`).then(r => r.data)

// 产品管理
export const adminCreateProduct = (data: Partial<Product>) =>
  http.post<ApiResult<Product>>('/products', data).then(r => r.data)

export const adminUpdateProduct = (id: number, data: Partial<Product>) =>
  http.put<ApiResult<Product>>(`/products/${id}`, data).then(r => r.data)

export const adminDeleteProduct = (id: number) =>
  http.delete<ApiResult<null>>(`/products/${id}`).then(r => r.data)

// 文章管理
export const adminCreateArticle = (data: Partial<Article>) =>
  http.post<ApiResult<Article>>('/articles', data).then(r => r.data)

export const adminUpdateArticle = (id: number, data: Partial<Article>) =>
  http.put<ApiResult<Article>>(`/articles/${id}`, data).then(r => r.data)

export const adminDeleteArticle = (id: number) =>
  http.delete<ApiResult<null>>(`/articles/${id}`).then(r => r.data)

// 分类管理
export const adminGetCategoriesPaged = (params?: { keyword?: string; page?: number; size?: number }) =>
  http.get<ApiResult<Category[]>>('/categories/paged', { params }).then(r => r.data)

export const adminCreateCategory = (data: Partial<Category>) =>

  http.post<ApiResult<Category>>('/categories', data).then(r => r.data)

export const adminUpdateCategory = (id: number, data: Partial<Category>) =>
  http.put<ApiResult<Category>>(`/categories/${id}`, data).then(r => r.data)

export const adminDeleteCategory = (id: number) =>
  http.delete<ApiResult<null>>(`/categories/${id}`).then(r => r.data)

// 图片上传到 MinIO（文件上传需要更长超时）
export const adminUploadImage = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return http.post<ApiResult<{ url: string }>>('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000, // 60 秒，图片上传需要更长时间
  }).then(r => r.data)
}

// 轮播图（前台）
export const getBanners = () =>
  http.get<ApiResult<Banner[]>>('/banners').then(r => r.data)

// 轮播图管理（后台）
export const adminGetBanners = () =>
  http.get<ApiResult<Banner[]>>('/admin/banners').then(r => r.data)

export const adminCreateBanner = (data: Partial<Banner>) =>
  http.post<ApiResult<Banner>>('/admin/banners', data).then(r => r.data)

export const adminUpdateBanner = (id: number, data: Partial<Banner>) =>
  http.put<ApiResult<Banner>>(`/admin/banners/${id}`, data).then(r => r.data)

export const adminDeleteBanner = (id: number) =>
  http.delete<ApiResult<null>>(`/admin/banners/${id}`).then(r => r.data)

// FAQ 管理（后台）
export const adminGetFaqs = () =>
  http.get<ApiResult<Faq[]>>('/admin/faqs').then(r => r.data)

export const adminCreateFaq = (data: Partial<Faq>) =>
  http.post<ApiResult<Faq>>('/admin/faqs', data).then(r => r.data)

export const adminUpdateFaq = (id: number, data: Partial<Faq>) =>
  http.put<ApiResult<Faq>>(`/admin/faqs/${id}`, data).then(r => r.data)

export const adminToggleFaqPublished = (id: number, published: number) =>
  http.put<ApiResult<null>>(`/admin/faqs/${id}/published`, { published }).then(r => r.data)

export const adminDeleteFaq = (id: number) =>
  http.delete<ApiResult<null>>(`/admin/faqs/${id}`).then(r => r.data)

// 页面内容（前台）
export const getPageContent = (slug: string) =>
  http.get<ApiResult<PageContent>>('/misc/page-content', { params: { slug } }).then(r => r.data)

// 页面内容管理（后台）
export const adminGetPageContents = () =>
  http.get<ApiResult<PageContent[]>>('/admin/page-contents').then(r => r.data)

export const adminUpdatePageContent = (slug: string, data: Partial<PageContent>) =>
  http.put<ApiResult<PageContent>>(`/admin/page-contents/${slug}`, data).then(r => r.data)

