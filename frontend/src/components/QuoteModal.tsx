import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, CheckCircle } from 'lucide-react'
import { sendQuote } from '../api'
import type { QuoteFormData } from '../types'
import { useState } from 'react'

const schema = z.object({
  name:     z.string().min(1, 'Name is required'),
  email:    z.string().email('Invalid email'),
  phone:    z.string().optional(),
  company:  z.string().optional(),
  product:  z.string().optional(),
  quantity: z.string().optional(),
  message:  z.string().min(5, 'Message too short'),
})

interface Props {
  open: boolean
  onClose: () => void
  defaultProduct?: string
}

export default function QuoteModal({ open, onClose, defaultProduct }: Props) {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuoteFormData>({
    resolver: zodResolver(schema),
    defaultValues: { product: defaultProduct ?? '' },
  })

  // Reset on open
  useEffect(() => {
    if (open) { setSuccess(false); reset({ product: defaultProduct ?? '' }) }
  }, [open, defaultProduct])

  // ESC close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const onSubmit = async (data: QuoteFormData) => {
    setLoading(true)
    try {
      await sendQuote(data)
      setSuccess(true)
    } catch {
      alert('Failed to send. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-brand-500">Request a Quote</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Success */}
        {success ? (
          <div className="p-10 flex flex-col items-center gap-4 text-center">
            <CheckCircle size={56} className="text-green-500" />
            <h3 className="text-lg font-semibold">Quote Sent!</h3>
            <p className="text-gray-500 text-sm">Thank you! We will reply within 24 hours.</p>
            <button onClick={onClose} className="btn-primary mt-2">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input {...register('name')} placeholder="Your name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input {...register('email')} type="email" placeholder="your@email.com"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone')} placeholder="+1 234 567 8900"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input {...register('company')} placeholder="Company name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input {...register('product')} placeholder="e.g. BPC157"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input {...register('quantity')} placeholder="e.g. 100 vials"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea {...register('message')} rows={4} placeholder="Describe your requirements..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-transparent outline-none resize-none" />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-60">
              {loading ? 'Sending...' : 'Send Quote Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
