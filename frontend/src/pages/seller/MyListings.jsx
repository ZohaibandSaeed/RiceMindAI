import React, { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Package, Trash2, Eye, Star } from 'lucide-react'
import api from '../../lib/axios'

const statusConfig = {
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  sold_out: { label: 'Sold Out', color: 'bg-zinc-100 text-zinc-600', icon: Package },
}

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

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

  useEffect(() => { fetchListings() }, [])

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#1a3d2b] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">My Listings</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{listings.length} total listings</p>
        </div>
        <a href="/seller/create-listing"
          className="px-4 py-2 bg-[#1a3d2b] text-white text-sm font-medium rounded-lg hover:bg-[#1a3d2b]/90 transition-all">
          + New Listing
        </a>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-14 text-center">
          <Package size={44} className="mx-auto text-zinc-300 mb-3" />
          <p className="font-semibold text-zinc-600">No listings yet</p>
          <p className="text-sm text-zinc-400 mt-1">Create your first rice listing!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3 bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
            <div className="col-span-4">Listing</div>
            <div className="col-span-2 text-center">Type</div>
            <div className="col-span-2 text-center">Price/KG</div>
            <div className="col-span-2 text-center">AI Score</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-1 text-center">Actions</div>
          </div>

          {listings.map(listing => {
            const status = statusConfig[listing.status] || statusConfig.pending_approval
            const StatusIcon = status.icon

            return (
              <div key={listing.id} className="grid grid-cols-12 px-5 py-4 border-b border-zinc-100 items-center hover:bg-zinc-50 transition-colors last:border-0">
                {/* Listing Info */}
                <div className="col-span-4 flex items-center gap-3">
                  <img
                    src={listing.images?.[0]}
                    alt={listing.name}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100 shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/48x48?text=🌾' }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-800 text-sm truncate">{listing.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{parseFloat(listing.stock_kg).toLocaleString()} KG stock</p>
                  </div>
                </div>

                {/* Rice Type */}
                <div className="col-span-2 text-center">
                  <span className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded-full font-medium">
                    {listing.rice_type}
                  </span>
                </div>

                {/* Price */}
                <div className="col-span-2 text-center">
                  <p className="font-semibold text-zinc-800 text-sm">PKR {parseFloat(listing.final_price).toLocaleString()}</p>
                  {listing.ai_price_verdict && listing.ai_price_verdict !== 'price_ok' && (
                    <p className="text-xs text-orange-500">AI flagged</p>
                  )}
                </div>

                {/* AI Score */}
                <div className="col-span-2 text-center">
                  {listing.ai_quality_score != null ? (
                    <div className="flex items-center justify-center gap-1">
                      <Star size={14} className="text-[#c8922a] fill-[#c8922a]" />
                      <span className="font-semibold text-sm text-zinc-700">
                        {Math.round(parseFloat(listing.ai_quality_score) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400">—</span>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-1 flex justify-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                    <StatusIcon size={11} />
                    <span className="hidden xl:inline">{status.label}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-1 flex justify-center gap-1.5">
                  {['pending_approval', 'rejected'].includes(listing.status) && (
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deleting === listing.id}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
