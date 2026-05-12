import React, { useEffect, useState } from 'react'
import { Sparkles, Check, X, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import api from '../lib/axios'

export default function PendingListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  const fetchPending = () => {
    setLoading(true)
    api.get('/api/listings/pending')
      .then(res => setListings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (id) => {
    setProcessingId(id)
    try {
      await api.post(`/api/listings/${id}/approve`)
      fetchPending()
    } catch (err) {
      alert("Failed to approve")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT this listing and permanently remove its visibility?")) return

    setProcessingId(id)
    try {
      await api.post(`/api/listings/${id}/reject`)
      fetchPending()
    } catch (err) {
      alert("Failed to reject")
    } finally {
      setProcessingId(null)
    }
  }

  const formatScore = (score) => score ? Math.round(parseFloat(score) * 100) : null

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Pending Listings</h1>
        <p className="text-zinc-500 font-medium mt-1">Review AI assessments and approve legitimate seller products.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-red-500 w-8 h-8" />
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-16 text-center shadow-lg">
          <Check className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Queue Empty</h2>
          <p className="text-zinc-500">There are no pending listings requiring approval right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {listings.map(listing => (
            <div key={listing.id} className="bg-[#09090b] border border-[#27272a] rounded-2xl overflow-hidden flex flex-col md:flex-row group hover:border-zinc-700 transition-colors shadow-lg">
              {/* Image side */}
              <div className="w-full md:w-64 h-48 md:h-auto bg-zinc-800 shrink-0 relative">
                <img src={listing.images[0]} alt="Listing" className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-1 text-xs font-bold uppercase rounded border border-white/10">
                  {listing.rice_type}
                </div>
              </div>

              {/* Content side */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{listing.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-wide mb-4">
                    <span className="bg-[#27272a] px-2 py-1 rounded text-white font-mono">{listing.stock_kg} Mound</span>
                    <span className="text-green-400">PKR {listing.suggested_price}/KG</span>
                  </div>

                  {/* AI Box */}
                  <div className="bg-[#121214] rounded-lg p-3 border border-[#27272a] mb-5">
                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase mb-2">
                      <Sparkles size={14} /> AI Evaluation
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white">{formatScore(listing.ai_quality_score)}%</span>
                      <p className="text-sm text-zinc-400 leading-tight line-clamp-2">{listing.ai_quality_notes}</p>
                    </div>

                    {listing.ai_price_verdict && (
                      <div className={`mt-3 text-xs font-bold px-2 py-1 rounded w-fit uppercase ${listing.ai_price_verdict.includes('high') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                        }`}>
                        Price: {listing.ai_price_verdict}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#27272a] mt-auto">
                  <button
                    onClick={() => handleReject(listing.id)}
                    disabled={processingId === listing.id}
                    className="flex-1 py-2.5 bg-[#27272a] hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(listing.id)}
                    disabled={processingId === listing.id}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {processingId === listing.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Approve Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
