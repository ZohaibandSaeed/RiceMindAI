import React, { useEffect, useState } from 'react'
import { Sparkles, Check, X, Loader2, RefreshCw } from 'lucide-react'
import api from '../lib/axios'

export default function PendingStockRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)

  const fetchPendingRequests = () => {
    setLoading(true)
    api.get('/api/listings/stock-requests/pending')
      .then(res => setRequests(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const handleApprove = async (id) => {
    setProcessingId(id)
    try {
      await api.post(`/api/listings/stock-requests/${id}/approve`)
      fetchPendingRequests()
    } catch (err) {
      alert("Failed to approve stock request")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT this stock update request?")) return
    setProcessingId(id)
    try {
      await api.post(`/api/listings/stock-requests/${id}/reject`)
      fetchPendingRequests()
    } catch (err) {
      alert("Failed to reject stock request")
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pending Stock Requests</h1>
          <p className="text-zinc-500 font-medium mt-1">Review and approve stock adjustments submitted by sellers.</p>
        </div>
        <button 
          onClick={fetchPendingRequests}
          className="p-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl transition border border-[#3f3f46]"
          title="Refresh Queue"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-green-500 w-8 h-8" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-16 text-center shadow-lg">
          <Check className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Queue Empty</h2>
          <p className="text-zinc-500">There are no pending stock update requests waiting for approval.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(req => (
            <div key={req.id} className="bg-[#09090b] border border-[#27272a] rounded-2xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors shadow-lg">
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  {req.listing_image && (
                    <img 
                      src={req.listing_image} 
                      alt={req.listing_name} 
                      className="w-16 h-16 rounded-xl object-cover border border-[#27272a]" 
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80' }}
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{req.listing_name}</h3>
                    <p className="text-xs text-zinc-400 font-semibold mt-1">Submitted by: <span className="text-green-400 font-mono">@{req.seller_username}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-[#121214] border border-[#27272a] rounded-xl p-4 mb-6">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Current Stock</span>
                    <span className="text-sm font-extrabold text-white">{req.current_stock_kg.toLocaleString()} KG</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Requested Stock</span>
                    <span className="text-sm font-extrabold text-green-400">{req.requested_stock_kg.toLocaleString()} KG</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#27272a] mt-auto">
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={processingId === req.id}
                    className="flex-1 py-2.5 bg-[#27272a] hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={processingId === req.id}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {processingId === req.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    Approve Stock
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
