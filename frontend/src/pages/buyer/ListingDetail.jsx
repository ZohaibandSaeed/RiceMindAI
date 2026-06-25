import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Package, Sparkles, Scale, Info, Loader2, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../lib/axios'

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Ordering state
  const [quantity, setQuantity] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderError, setOrderError] = useState(null)

  // Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    api.get(`/api/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(err => setError("Listing not found"))
      .finally(() => setLoading(false))
  }, [id])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setOrderError(null)
    setOrderSubmitting(true)

    const qty = parseFloat(quantity)
    if (isNaN(qty) || qty <= 0) {
      setOrderError("Please enter a valid quantity")
      setOrderSubmitting(false)
      return
    }
    if (qty > listing.stock_kg) {
      setOrderError("Quantity exceeds available stock")
      setOrderSubmitting(false)
      return
    }

    try {
      await api.post('/api/orders', {
        listing_id: listing.id,
        quantity_kg: qty
      })
      navigate('/buyer/orders')
    } catch (err) {
      setOrderError(err.response?.data?.detail || "Failed to place order")
    } finally {
      setOrderSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 size={32} className="animate-spin text-[#1a3d2b]" />
    </div>
  )

  if (error || !listing) return (
    <div className="text-center p-12 bg-white rounded-3xl border border-red-200 shadow-sm max-w-lg mx-auto">
      <p className="text-red-500 font-bold">{error}</p>
      <Link to="/buyer/browse" className="text-[#1a3d2b] font-bold hover:underline mt-4 inline-block">Back to Browse</Link>
    </div>
  )

  const formatScore = (score) => score ? Math.round(parseFloat(score) * 100) : null
  const totalAmount = quantity ? parseFloat(quantity) * parseFloat(listing.final_price) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <Link to="/buyer/browse" className="inline-flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors bg-white px-4 py-2 rounded-xl border border-zinc-200 w-fit font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md">
        <ArrowLeft size={14} /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Images */}
        <div className="space-y-4">
          <div className="bg-zinc-100 rounded-3xl overflow-hidden aspect-[4/3] relative group border border-zinc-200/60 shadow-md">
            {listing.images && listing.images.length > 0 ? (
              <>
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.name}
                  className="w-full h-full object-cover"
                />

                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev === 0 ? listing.images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                    >
                      <ChevronLeft size={20} className="text-zinc-700" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => prev === listing.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                    >
                      <ChevronRight size={20} className="text-zinc-700" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/35 px-3 py-1.5 rounded-full backdrop-blur-xs">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-5' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image Available</div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2.5">
            {listing.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${i === currentImageIndex ? 'border-[#1a3d2b] scale-[0.98]' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3.5 py-1 bg-[#1a3d2b]/10 text-[#1a3d2b] rounded-full text-xs font-bold uppercase tracking-wider border border-[#1a3d2b]/20">
                {listing.rice_type}
              </span>
              {listing.status === 'approved' && (
                <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Verified Stock
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-zinc-900 mb-2 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>{listing.name}</h1>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium">{listing.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-zinc-200/60 p-5 rounded-3xl shadow-sm">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Price per KG</p>
              <p className="text-2xl font-black text-[#1a3d2b]" style={{ fontFamily: 'Outfit, sans-serif' }}>PKR {parseFloat(listing.final_price).toLocaleString()}</p>
            </div>
            <div className="bg-white border border-zinc-200/60 p-5 rounded-3xl shadow-sm">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Available Stock</p>
              <p className="text-2xl font-black text-zinc-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{listing.stock_kg} <span className="text-base font-normal text-zinc-400">KG</span></p>
            </div>
          </div>

          {/* AI Assessment Box */}
          <div className="bg-gradient-to-br from-[#c8922a]/15 to-[#d9a338]/5 rounded-3xl border border-[#c8922a]/20 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#c8922a] font-extrabold text-sm uppercase tracking-wider">
              <Sparkles size={18} className="animate-spin-slow" />
              AI Quality Scanner Report
            </div>

            {listing.ai_quality_score ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-zinc-200/70 rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#c8922a] to-[#d9a338] h-3 rounded-full shadow-inner" style={{ width: `${formatScore(listing.ai_quality_score)}%` }}></div>
                  </div>
                  <span className="text-[#1a3d2b] font-black text-lg">{formatScore(listing.ai_quality_score)}%</span>
                </div>
                <p className="text-sm text-zinc-700 bg-white/70 p-4 rounded-2xl border border-zinc-200/50 leading-relaxed font-medium shadow-sm">
                  {listing.ai_quality_notes}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500 italic">No AI scanner reports generated for this crop.</p>
            )}
          </div>

          {/* Place Order Box */}
          <div className="bg-white border border-zinc-200/60 p-6 rounded-3xl shadow-md">
            <h3 className="font-extrabold text-lg text-zinc-800 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Configure Escrow Order</h3>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Quantity Required (KG)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={listing.stock_kg}
                    step="0.1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-4 pr-16 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] text-lg font-black text-zinc-800"
                    placeholder="e.g. 50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-extrabold text-sm uppercase">KG</span>
                </div>
              </div>

              {quantity > 0 && (
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-150 flex justify-between items-center shadow-inner">
                  <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Total Value</span>
                  <span className="text-xl font-black text-[#1a3d2b]" style={{ fontFamily: 'Outfit, sans-serif' }}>PKR {totalAmount.toLocaleString()}</span>
                </div>
              )}

              {orderError && <p className="text-sm text-red-600 font-bold bg-red-50 p-3 rounded-2xl border border-red-200/50">{orderError}</p>}

              <button
                type="submit"
                disabled={orderSubmitting || !quantity || quantity > listing.stock_kg}
                className="w-full py-4 bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white font-extrabold rounded-2xl hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all shadow-lg shadow-[#1a3d2b]/20 active:scale-[0.99] transform"
              >
                {orderSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Package size={20} />}
                Initiate Escrow Agreement
              </button>

              <p className="text-[10px] text-center text-zinc-400 leading-normal px-2">
                Initiating this order sends a request to the seller to generate a digital contract. Funds will remain untouched in your wallet until you sign the contract terms.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
