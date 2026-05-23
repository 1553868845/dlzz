import { useState, useRef, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

/**
 * 图片裁剪弹窗组件
 *
 * 用户选择图片后弹出，可拖拽定位、滚轮/按钮缩放，锁定 4:3 比例。
 * 确认后通过 canvas 裁剪并输出为 800×600 JPEG Blob。
 */
interface ImageCropModalProps {
  imageSrc: string          // 原始图片的 data URL
  onConfirm: (blob: Blob) => void  // 确认裁剪，传出 JPEG Blob
  onCancel: () => void      // 取消
}

const ASPECT = 4 / 3
const OUTPUT_W = 800
const OUTPUT_H = 600

export default function ImageCropModal({ imageSrc, onConfirm, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const [imgLoadError, setImgLoadError] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // 预加载图片
  useEffect(() => {
    setImgLoadError(false)
    const img = new Image()
    img.onload = () => { imgRef.current = img }
    img.onerror = () => { setImgLoadError(true) }
    img.src = imageSrc
  }, [imageSrc])

  const onCropComplete = useCallback((_: Area, area: Area) => {
    setCroppedAreaPixels(area)
  }, [])

  // canvas 裁剪并输出 JPEG Blob
  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels || !imgRef.current) return
    setProcessing(true)
    try {
      const img = imgRef.current
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT_W
      canvas.height = OUTPUT_H
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H)
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0, 0, OUTPUT_W, OUTPUT_H
      )
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('canvas toBlob failed')), 'image/jpeg', 0.85)
      })
      onConfirm(blob)
    } catch (e) {
      console.error('裁剪失败:', e)
    } finally {
      setProcessing(false)
    }
  }, [croppedAreaPixels, onConfirm])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">裁剪图片</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 裁剪区域 */}
        <div className="relative bg-gray-900 flex-1" style={{ minHeight: 360 }}>
          {imgLoadError ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">图片加载失败，请换一张试试</span>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={true}
              style={{ containerStyle: { borderRadius: 0 } }}
            />
          )}
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-3 px-6 py-3 border-t border-gray-100 bg-gray-50">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 accent-brand-500"
          />
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
          <span className="text-xs text-gray-500 font-mono w-12 text-right">{(zoom * 100).toFixed(0)}%</span>
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400">输出尺寸 {OUTPUT_W} x {OUTPUT_H} px &middot; 4:3</p>
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="btn-admin-secondary">取消</button>
            <button onClick={handleConfirm} disabled={processing} className="btn-admin-primary">
              {processing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  处理中...
                </>
              ) : '确认裁剪并上传'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
