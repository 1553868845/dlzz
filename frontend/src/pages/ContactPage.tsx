import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, MessageCircle, Clock, CheckCircle } from 'lucide-react'
import { sendContact } from '../api'
import type { ContactFormData } from '../types'
import { useLang } from '../i18n/LanguageContext'
import { useWhatsApp } from '../context/WhatsAppContext'

export default function ContactPage() {
  const { t } = useLang()
  const { whatsapp, email } = useWhatsApp()   // 全局共享，不再单独请求
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const schema = z.object({
    name:    z.string().min(1, t.contact.nameLabel + ' *'),
    email:   z.string().email('Invalid email'),
    subject: z.string().optional(),
    message: z.string().min(5, 'Message too short'),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setLoading(true)
    try {
      await sendContact(data)
      setSuccess(true)
      reset()
    } catch {
      alert('Failed to send. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">{t.contact.title}</h1>
        <p className="text-blue-200">{t.contact.subtitle}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Contact Info Cards */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <Mail size={28} className="text-brand-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-1">{t.common.email}</h3>
              <p className="text-xs text-gray-400 mb-1">{t.contact.emailTip}</p>
              <a href={`mailto:${email}`} className="text-brand-500 hover:underline text-sm">
                {email}
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <MessageCircle size={28} className="text-brand-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-1">{t.common.whatsapp}</h3>
              <p className="text-xs text-gray-400 mb-1">{t.contact.whatsappTip}</p>
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="text-brand-500 hover:underline text-sm">
                +{whatsapp.replace(/\D/g, '')}
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <Clock size={28} className="text-brand-500 mb-3" />
              <h3 className="font-semibold text-gray-800 mb-1">{t.contact.businessHours}</h3>
              <p className="text-gray-500 text-sm">{t.contact.hoursValue}</p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-brand-500 mb-6">{t.contact.sendMessage}</h2>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <CheckCircle size={56} className="text-green-500" />
                <h3 className="text-lg font-semibold">{t.contact.messageSent}</h3>
                <p className="text-gray-500 text-sm">We will reply within 24 hours.</p>
                <button onClick={() => setSuccess(false)} className="btn-primary mt-2">{t.common.send}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.contact.nameLabel} *</label>
                    <input {...register('name')} placeholder={t.contact.namePlaceholder}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.contact.emailLabel} *</label>
                    <input {...register('email')} type="email" placeholder={t.contact.emailPlaceholder}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.contact.subjectLabel}</label>
                  <input {...register('subject')} placeholder={t.contact.subjectPlaceholder}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-400 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.contact.messageLabel} *</label>
                  <textarea {...register('message')} rows={6} placeholder={t.contact.messagePlaceholder}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-brand-400 outline-none resize-none" />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-60">
                  {loading ? t.common.sending : t.contact.sendMessage}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
