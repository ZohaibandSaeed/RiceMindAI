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
    <div className="text-center p-12 bg-white rounded-xl border border-red-200">
      <p className="text-red-500 font-semibold">{error}</p>
      <Link to="/buyer/browse" className="text-[#1a3d2b] hover:underline mt-4 inline-block">Back to Browse</Link>
    </div>
  )

  const formatScore = (score) => score ? Math.round(parseFloat(score) * 100) : null
  const totalAmount = quantity ? parseFloat(quantity) * parseFloat(listing.final_price) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link to="/buyer/browse" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-800 transition-colors bg-white px-3 py-1.5 rounded-lg border border-zinc-200 w-fit">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="bg-zinc-100 rounded-2xl overflow-hidden aspect-[4/3] relative group border border-zinc-200">
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => prev === listing.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {listing.images.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
            )}
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {listing.images.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentImageIndex(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === currentImageIndex ? 'border-[#1a3d2b]' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold uppercase tracking-wider">
                {listing.rice_type}
              </span>
              {listing.status === 'approved' && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold uppercase tracking-wider">
                  Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">{listing.name}</h1>
            <p className="text-zinc-600 leading-relaxed">{listing.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-zinc-200 p-4 rounded-xl">
              <p className="text-sm text-zinc-500 mb-1">Price per KG</p>
              <p className="text-2xl font-bold text-[#1a3d2b]">PKR {listing.final_price}</p>
            </div>
            <div className="bg-white border border-zinc-200 p-4 rounded-xl">
              <p className="text-sm text-zinc-500 mb-1">Available Stock</p>
              <p className="text-2xl font-bold text-zinc-800">{listing.stock_kg} <span className="text-base font-medium">KG</span></p>
            </div>
          </div>

          {/* AI Assessment Box */}
          <div className="bg-[#1a3d2b]/5 rounded-xl border border-[#1a3d2b]/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#b07d18] font-bold">
              <Sparkles size={18} />
              AI Quality Assessment
            </div>
            
            {listing.ai_quality_score ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-zinc-200 rounded-full h-2.5">
                    <div className="bg-[#c8922a] h-2.5 rounded-full" style={{ width: `${formatScore(listing.ai_quality_score)}%` }}></div>
                  </div>
                  <span className="text-[#1a3d2b] font-bold">{formatScore(listing.ai_quality_score)}%</span>
                </div>
                <p className="text-sm text-zinc-700 mt-2 bg-white/60 p-3 rounded-lg border border-zinc-200/50">
                  {listing.ai_quality_notes}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500 italic">No AI assessment available for this listing.</p>
            )}
          </div>

          {/* Place Order Box */}
          <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg text-zinc-800 mb-4">Ready to Order?</h3>
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Quantity Required (KG)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="1" 
                    max={listing.stock_kg}
                    step="0.1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 text-lg font-medium"
                    placeholder="e.g. 50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-medium">KG</span>
                </div>
              </div>

              {quantity > 0 && (
                <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-center">
                  <span className="text-zinc-600 font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-[#1a3d2b]">PKR {totalAmount.toLocaleString()}</span>
                </div>
              )}

              {orderError && <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg">{orderError}</p>}

              <button 
                type="submit" 
                disabled={orderSubmitting || !quantity || quantity > listing.stock_kg}
                className="w-full py-3.5 bg-[#1a3d2b] text-white font-bold rounded-xl hover:bg-[#1a3d2b]/90 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all"
              >
                {orderSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Package size={20} />}
                Place Initial Order
              </button>
              
              <p className="text-xs text-center text-zinc-500">
                You will not be charged yet. The seller will create a contract for you to review and sign before payment is held in escrow.
              </p>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
