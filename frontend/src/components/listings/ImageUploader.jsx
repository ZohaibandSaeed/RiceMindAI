import React, { useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import api from '../../lib/axios'

export default function ImageUploader({ images, setImages }) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const inputRef = useRef()

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const totalAfter = images.length + files.length
    if (totalAfter > 5) {
      setUploadError(`Maximum 5 images allowed. You can add ${5 - images.length} more.`)
      return
    }

    setUploadError(null)
    setUploadProgress('')
    setUploading(true)

    try {
      // Get signed auth params from backend (one call for all files)
      const { data: authParams } = await api.get('/api/imagekit/auth')

      const uploaded = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Uploading image ${i + 1} of ${files.length}...`)

        if (file.size > 5 * 1024 * 1024) {
          setUploadError(`"${file.name}" exceeds 5MB limit. Skipped.`)
          continue
        }

        const uniqueName = `rice_${Date.now()}_${i}_${file.name.replace(/\s+/g, '_')}`

        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileName', uniqueName)
        formData.append('publicKey', authParams.publicKey)
        formData.append('signature', authParams.signature)
        formData.append('expire', authParams.expire)
        formData.append('token', authParams.token)
        formData.append('folder', '/ricemindai/listings')

        const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: formData,
        })

        if (!ikRes.ok) {
          const errData = await ikRes.json().catch(() => ({}))
          console.error('ImageKit upload failed:', ikRes.status, errData)
          setUploadError(`Upload failed: ${errData.message || 'Please check your ImageKit configuration.'}`)
          continue
        }

        const data = await ikRes.json()
        if (data.url) {
          uploaded.push(data.url)
        } else {
          console.error('No URL in ImageKit response:', data)
          setUploadError('Upload issue: no URL returned from ImageKit.')
        }
      }

      if (uploaded.length > 0) {
        setImages(prev => [...prev, ...uploaded])
        setUploadError(null)
      }
      setUploadProgress('')
    } catch (err) {
      setUploadError('Upload failed. Please check your connection and try again.')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      setUploadProgress('')
      e.target.value = ''
    }
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={url} alt={`Rice ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-zinc-200" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-[#c8922a] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  AI
                </span>
              )}
              <button type="button" onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < 5 && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all
            ${uploading
              ? 'border-[#1a3d2b]/30 bg-[#1a3d2b]/5 cursor-not-allowed'
              : 'border-zinc-200 cursor-pointer hover:border-[#1a3d2b]/40 hover:bg-[#1a3d2b]/5'
            }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <Loader2 size={28} className="animate-spin text-[#1a3d2b]" />
              <p className="text-sm font-medium text-[#1a3d2b]">{uploadProgress || 'Uploading...'}</p>
              <p className="text-xs text-zinc-400">Please wait, do not close this page</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Upload size={28} />
              <p className="text-sm font-medium text-zinc-600">Click to upload images</p>
              <p className="text-xs">{images.length}/5 uploaded · Min 3 required · Max 5MB each · JPG, PNG, WebP</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
            multiple className="hidden" onChange={handleFileSelect} disabled={uploading} />
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 flex items-center gap-1">⚠ {uploadError}</p>
      )}

      {!uploadError && images.length >= 3 && images.length < 5 && (
        <p className="text-xs text-green-600">✓ Minimum images uploaded. You can add {5 - images.length} more.</p>
      )}

      {images.length === 5 && (
        <p className="text-xs text-[#1a3d2b] font-medium">✓ Maximum 5 images uploaded.</p>
      )}
    </div>
  )
}
