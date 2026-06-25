import React, { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Package, Trash2, Eye, Star, Plus } from 'lucide-react'
import api from '../../lib/axios'

const statusConfig = {
  pending_approval: { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Clock },
  pending: { label: 'Pending Review', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Clock },
  approved: { label: 'Active Crop', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: XCircle },
  sold_out: { label: 'Sold Out', color: 'bg-zinc-100 text-zinc-600 border-zinc-200', icon: Package },
}

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  
  // Stock Update states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [newStock, setNewStock] = useState('')
  const [stockRequests, setStockRequests] = useState([])
  const [submittingRequest, setSubmittingRequest] = useState(false)

  const fetchListings = async () => {
    try {
      const res = await api.get('/api/listings/mine')
      setListings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStockRequests = async () => {
    try {
      const res = await api.get('/api/listings/stock-requests/mine')
      setStockRequests(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchListings()
    fetchStockRequests()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    setDeleting(id)
    try {
      await api.delete(`/api/listings/${id}`)
      setListings(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const openStockModal = (listing) => {
    setSelectedListing(listing)
    setNewStock(parseFloat(listing.stock_kg).toString())
    setIsModalOpen(true)
  }

  const handleRequestStockUpdate = async (e) => {
    e.preventDefault()
    if (!selectedListing || !newStock) return
    
    const stockVal = parseFloat(newStock)
    if (isNaN(stockVal) || stockVal < 0) {
      alert('Please enter a valid positive stock quantity')
      return
    }

    setSubmittingRequest(true)
    try {
      await api.post(`/api/listings/${selectedListing.id}/stock-request`, {
        requested_stock_kg: stockVal
      })
      alert('Stock update request submitted successfully for Admin approval.')
      setIsModalOpen(false)
      setNewStock('')
      fetchStockRequests()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit stock request')
    } finally {
      setSubmittingRequest(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#1a3d2b] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>My Listings</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">{listings.length} total crops registered in catalog</p>
        </div>
        <a href="/seller/create-listing"
          className="text-xs bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider hover:opacity-95 shadow-md flex items-center gap-1.5 transition-all transform hover:scale-[1.02]">
          <Plus size={16} /> New Listing
        </a>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-20 text-center shadow-sm max-w-xl mx-auto">
          <Package size={44} className="mx-auto text-zinc-300 mb-3 animate-pulse" />
          <h2 className="text-xl font-black text-zinc-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Catalog is empty</h2>
          <p className="text-sm text-zinc-500 mb-6">You have not registered any crop inventories yet.</p>
          <a href="/seller/create-listing" className="bg-[#1a3d2b] text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 shadow-md">Add First Crop</a>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/60 text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                  <th className="p-5">Crop Listing</th>
                  <th className="p-5 text-center">Category</th>
                  <th className="p-5 text-center">Price / KG</th>
                  <th className="p-5 text-center">AI Rating</th>
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 text-zinc-700">
                {listings.map(listing => {
                  const status = statusConfig[listing.status] || statusConfig.pending_approval
                  const StatusIcon = status.icon

                  return (
                    <tr key={listing.id} className="hover:bg-white/40 transition-colors group">
                      {/* Listing Info */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.images?.[0]}
                            alt={listing.name}
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-150 shrink-0 border border-zinc-200/40"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80' }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-800 text-sm truncate">{listing.name}</p>
                            <p className="text-[11px] text-zinc-400 font-semibold mt-1">{parseFloat(listing.stock_kg).toLocaleString()} KG In Stock</p>
                          </div>
                        </div>
                      </td>

                      {/* Rice Type */}
                      <td className="p-5 text-center">
                        <span className="text-[10px] bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full font-extrabold uppercase tracking-wider border border-amber-500/20">
                          {listing.rice_type}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-5 text-center">
                        <p className="font-extrabold text-zinc-850 text-sm">PKR {parseFloat(listing.final_price).toLocaleString()}</p>
                        {listing.ai_price_verdict && listing.ai_price_verdict !== 'price_ok' && (
                          <p className="text-[9px] font-extrabold text-amber-600 uppercase tracking-widest mt-0.5">AI Flagged</p>
                        )}
                      </td>

                      {/* AI Score */}
                      <td className="p-5 text-center">
                        {listing.ai_quality_score != null ? (
                          <div className="flex items-center justify-center gap-1 font-black text-sm text-zinc-800">
                            <Star size={14} className="text-[#c8922a] fill-[#c8922a]" />
                            <span>
                              {Math.round(parseFloat(listing.ai_quality_score) * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-5 text-center">
                        <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 border uppercase tracking-wider w-fit mx-auto ${status.color}`}>
                          <StatusIcon size={12} />
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-5 text-center">
                        {['pending_approval', 'pending', 'rejected'].includes(listing.status) ? (
                          <button
                            onClick={() => handleDelete(listing.id)}
                            disabled={deleting === listing.id}
                            className="p-2 text-red-400 hover:text-red-650 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                            title="Delete Listing"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : ['approved', 'sold_out'].includes(listing.status) ? (
                          <button
                            onClick={() => openStockModal(listing)}
                            className="text-xs bg-[#1a3d2b] hover:bg-[#25523a] text-white px-3.5 py-2 rounded-xl font-bold transition shadow-sm"
                            title="Request Stock Update"
                          >
                            Update Stock
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Locked</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Requests History */}
      {stockRequests.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Stock Update Requests</h2>
            <p className="text-xs text-zinc-500 font-medium">History of inventory modifications awaiting admin approval</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200/60 text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                    <th className="p-5">Crop Name</th>
                    <th className="p-5 text-center">Previous Stock</th>
                    <th className="p-5 text-center">Requested Stock</th>
                    <th className="p-5 text-center">Status</th>
                    <th className="p-5 text-center">Requested Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 text-zinc-700">
                  {stockRequests.map(req => (
                    <tr key={req.id} className="hover:bg-white/40 transition-colors">
                      <td className="p-5 font-bold text-zinc-800 text-sm">{req.listing_name}</td>
                      <td className="p-5 text-center font-semibold text-zinc-500 text-xs">{req.current_stock_kg.toLocaleString()} KG</td>
                      <td className="p-5 text-center font-bold text-[#1a3d2b] text-xs">{req.requested_stock_kg.toLocaleString()} KG</td>
                      <td className="p-5 text-center">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border inline-block ${
                          req.status === 'approved' ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200' :
                          req.status === 'rejected' ? 'bg-red-50/80 text-red-700 border-red-200' :
                          'bg-amber-50/80 text-amber-700 border-amber-200'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-5 text-center text-xs text-zinc-400 font-medium">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Premium Stock Update Modal */}
      {isModalOpen && selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-scale-up">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="font-black text-lg text-zinc-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Update Inventory Stock</h3>
                <p className="text-xs text-zinc-400 font-semibold truncate max-w-[280px]">For listing: {selectedListing.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 font-bold text-lg p-1.5 bg-white rounded-full border border-zinc-200/80 hover:border-zinc-300 transition shadow-sm">&times;</button>
            </div>
            
            <form onSubmit={handleRequestStockUpdate} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 rounded-2xl p-4 border border-zinc-200/40">
                <div>
                  <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">Current Stock</label>
                  <p className="font-extrabold text-sm text-zinc-850 mt-1">{parseFloat(selectedListing.stock_kg).toLocaleString()} KG</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">Suggested Price</label>
                  <p className="font-extrabold text-sm text-zinc-850 mt-1">PKR {parseFloat(selectedListing.final_price).toLocaleString()}/KG</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="targetStock" className="text-xs font-bold text-zinc-700 block">New Target Stock (KG)</label>
                <input
                  id="targetStock"
                  type="number"
                  step="any"
                  required
                  value={newStock}
                  onChange={e => setNewStock(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] font-bold text-zinc-800 shadow-inner"
                />
                <p className="text-[10px] text-zinc-400 font-medium">Note: Stock updates must be approved by the admin before they are made live.</p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="flex-1 py-3 bg-gradient-to-r from-[#1a3d2b] to-[#25523a] hover:opacity-95 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition shadow-md disabled:opacity-50"
                >
                  {submittingRequest ? 'Submitting...' : 'Request Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
