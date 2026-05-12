import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import api from '../../lib/axios'
import ImageUploader from '../../components/listings/ImageUploader'

const RICE_TYPES = ['Basmati', 'Jasmine', 'Brown', 'Sella', 'Super Kernel', 'Broken', 'Other']

export default function CreateListing() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    rice_type: 'Basmati',
    suggested_price: '',
    stock_kg: '',
  })
  const [images, setImages] = useState([]) // ImageKit URLs
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [overridePrice, setOverridePrice] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('form') // form | ai_result | success

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (images.length < 3) {
      setError('Please upload at least 3 images')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/api/listings', {
        ...form,
        suggested_price: parseFloat(form.suggested_price),
        stock_kg: parseFloat(form.stock_kg),
        images,
        override_price: overridePrice
      })

      setAiResult({
        quality_score: res.data.ai_quality_score,
        quality_notes: res.data.ai_quality_notes,
        price_verdict: res.data.ai_price_verdict,
        price_message: res.data.ai_price_message,
        suggested_min: res.data.ai_validated_price,
      })
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800 mb-2">Listing Submitted!</h2>
        <p className="text-zinc-500 mb-1">Your listing is now <span className="font-medium text-yellow-600">pending buyer approval</span>.</p>
        {aiResult?.quality_score && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-left">
            <p className="text-sm font-semibold text-blue-800 mb-1">AI Quality Report</p>
            <p className="text-sm text-blue-600">Score: <strong>{Math.round(aiResult.quality_score * 100)}%</strong></p>
            <p className="text-sm text-blue-600 mt-1">{aiResult.quality_notes}</p>
          </div>
        )}
        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => navigate('/seller/my-listings')} className="px-5 py-2.5 bg-[#1a3d2b] text-white rounded-lg font-medium">
            View My Listings
          </button>
          <button onClick={() => { setStep('form'); setAiResult(null); setImages([]) }} className="px-5 py-2.5 border border-zinc-200 rounded-lg font-medium">
            Create Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-800">Create New Listing</h1>
        <p className="text-zinc-500 mt-1 text-sm">Upload your rice listing. AI will analyze quality and validate your price.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5">
          <label className="block text-sm font-semibold text-zinc-700 mb-3">
            Rice Images <span className="text-zinc-400 font-normal">(3–5 images, first used for AI analysis)</span>
          </label>
          <ImageUploader images={images} setImages={setImages} />
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Rice Name</label>
            <input required name="name" value={form.name} onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/30 focus:border-[#1a3d2b] text-sm"
              placeholder="e.g. Premium Super Kernel Basmati" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Rice Type</label>
            <select required name="rice_type" value={form.rice_type} onChange={handleChange}
              className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/30 focus:border-[#1a3d2b] text-sm bg-white">
              {RICE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Price per MOUND (PKR)</label>
              <input required name="suggested_price" value={form.suggested_price} onChange={handleChange} type="number" min="1"
                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/30 focus:border-[#1a3d2b] text-sm"
                placeholder="e.g. 250" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Stock (MOUND)</label>
              <input required name="stock_kg" value={form.stock_kg} onChange={handleChange} type="number" min="1"
                className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/30 focus:border-[#1a3d2b] text-sm"
                placeholder="e.g. 500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Description</label>
            <textarea required name="description" value={form.description} onChange={handleChange} rows={3}
              className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/30 focus:border-[#1a3d2b] text-sm resize-none"
              placeholder="Describe your rice quality, origin, packaging, etc." />
          </div>
        </div>

        {/* AI Info Box */}
        <div className="flex gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <strong>AI Analysis:</strong> After submission, our AI will analyze your first image to validate quality and price. You'll see the results immediately.
          </p>
        </div>

        {/* Price override checkbox */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={overridePrice} onChange={e => setOverridePrice(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 accent-[#1a3d2b]" />
          <span className="text-sm text-zinc-600">I understand the AI suggestion and want to keep my price if AI flags it</span>
        </label>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#1a3d2b] text-white font-semibold rounded-xl hover:bg-[#1a3d2b]/90 disabled:opacity-60 flex items-center justify-center gap-2 transition-all">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing with AI...</> : 'Submit Listing'}
        </button>
      </form>
    </div>
  )
}
