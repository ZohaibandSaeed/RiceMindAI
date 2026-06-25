import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Loader2, AlertTriangle, CheckCircle, Info, Sparkles } from 'lucide-react'
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
      <div className="max-w-xl mx-auto mt-16 text-center animate-fade-in space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Listing Submitted!</h2>
          <p className="text-zinc-500 text-sm mt-1">Your listing has been submitted and is currently <span className="font-bold text-[#c8922a]">Pending Review</span>.</p>
        </div>

        {aiResult?.quality_score && (
          <div className="bg-gradient-to-br from-[#c8922a]/15 to-[#d9a338]/5 rounded-3xl border border-[#c8922a]/20 p-6 text-left space-y-4 shadow-sm max-w-md mx-auto">
            <div className="flex items-center gap-2 text-[#c8922a] font-extrabold text-sm uppercase tracking-wider">
              <Sparkles size={16} />
              AI Quality Scanner Report
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-bold text-zinc-700">
                <span>Validated Quality Score</span>
                <span className="text-[#1a3d2b] font-black">{Math.round(aiResult.quality_score * 100)}%</span>
              </div>
              <div className="w-full bg-zinc-200 h-2.5 rounded-full">
                <div className="bg-gradient-to-r from-[#c8922a] to-[#d9a338] h-2.5 rounded-full" style={{ width: `${Math.round(aiResult.quality_score * 100)}%` }}></div>
              </div>
              <p className="text-xs text-zinc-600 bg-white/70 p-3 rounded-xl border border-zinc-200/50 mt-3 leading-relaxed">
                {aiResult.quality_notes}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center pt-4">
          <button onClick={() => navigate('/seller/my-listings')} className="px-6 py-3 bg-[#1a3d2b] text-white font-bold rounded-2xl shadow-lg shadow-[#1a3d2b]/15 hover:opacity-95 transition-all text-xs uppercase tracking-wider">
            View My Catalog
          </button>
          <button onClick={() => { setStep('form'); setAiResult(null); setImages([]) }} className="px-6 py-3 border border-zinc-200 bg-white text-zinc-600 font-bold rounded-2xl shadow-sm hover:bg-zinc-50 transition-all text-xs uppercase tracking-wider">
            Add Another crop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in relative">
      
      {/* Laser Scanning Animation Overlay during submission loading */}
      {loading && (
        <div className="fixed inset-0 bg-[#09090b]/85 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-md">
          <div className="relative w-72 h-52 border-2 border-[#c8922a]/30 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center bg-zinc-950/80">
            {images.length > 0 && (
              <img src={images[0]} alt="scanning" className="w-full h-full object-cover opacity-70" />
            )}
            {/* Laser bar animation */}
            <div className="absolute left-0 w-full h-1 bg-[#c8922a] shadow-[0_0_15px_#c8922a] animate-laser-scan"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#c8922a]/5 to-transparent pointer-events-none"></div>
          </div>
          <div className="text-center mt-6 space-y-2">
            <h3 className="text-white text-lg font-bold tracking-wide flex items-center justify-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Loader2 className="animate-spin text-[#c8922a]" size={20} />
              AI Quality Scanner Active
            </h3>
            <p className="text-zinc-400 text-sm max-w-xs leading-normal">
              Analyzing grain characteristics, grain density, and checking price validity...
            </p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Create New Listing</h1>
        <p className="text-xs text-zinc-500 mt-1 font-medium">Upload crop inventory details. AI will automatically evaluate grain quality scores and check price indexes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="bg-white rounded-3xl border border-zinc-200/60 p-6 shadow-sm">
          <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-3">
            Rice Crop Images <span className="text-zinc-300 font-bold">(Minimum 3 images, first one is scanned)</span>
          </label>
          <ImageUploader images={images} setImages={setImages} />
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-3xl border border-zinc-200/60 p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Crop Name</label>
              <input required name="name" value={form.name} onChange={handleChange}
                className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] text-sm font-semibold text-zinc-800"
                placeholder="e.g. Premium Super Kernel Basmati" />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Rice Category</label>
              <select required name="rice_type" value={form.rice_type} onChange={handleChange}
                className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] text-sm font-semibold text-zinc-800 bg-white">
                {RICE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Price per KG (PKR)</label>
              <input required name="suggested_price" value={form.suggested_price} onChange={handleChange} type="number" min="1"
                className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] text-sm font-semibold text-zinc-800"
                placeholder="e.g. 250" />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Available Stock (KG)</label>
              <input required name="stock_kg" value={form.stock_kg} onChange={handleChange} type="number" min="1"
                className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] text-sm font-semibold text-zinc-800"
                placeholder="e.g. 500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Crop Description</label>
            <textarea required name="description" value={form.description} onChange={handleChange} rows={4}
              className="w-full px-4 py-3 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] text-sm font-semibold text-zinc-800 resize-none leading-relaxed"
              placeholder="Provide crop details: grain size, origin district, packaging style, etc." />
          </div>
        </div>

        {/* AI Info Box */}
        <div className="flex gap-3.5 p-5 bg-blue-500/10 border border-blue-500/20 rounded-3xl text-blue-700">
          <Info size={20} className="shrink-0 mt-0.5" />
          <div className="text-xs font-bold leading-relaxed">
            <p className="uppercase tracking-wide">Automated Price Indexing</p>
            <p className="font-semibold text-blue-600 mt-1">Our computer vision system analyzes the first crop image to rate color consistency, broken grain ratio, and compares your listing price with the district marketplace indexes.</p>
          </div>
        </div>

        {/* Price override checkbox */}
        <label className="flex items-center gap-3 cursor-pointer select-none px-1">
          <input type="checkbox" checked={overridePrice} onChange={e => setOverridePrice(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 accent-[#1a3d2b]" />
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Override AI price flags (Publish anyway)</span>
        </label>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200/50 rounded-2xl text-red-600 text-xs font-bold">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white font-extrabold rounded-2xl hover:opacity-95 shadow-lg shadow-[#1a3d2b]/25 disabled:opacity-60 flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-xs">
          Submit Listing & Scan
        </button>
      </form>
    </div>
  )
}
