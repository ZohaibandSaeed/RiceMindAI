import React, { useEffect, useState } from 'react'
import { Wheat, TrendingUp, Package, ShoppingBag, Wallet, Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../../lib/axios'

export default function SellerDashboard() {
  const [listings, setListings] = useState([])
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, walletRes] = await Promise.all([
          api.get('/api/listings/mine'),
          api.get('/api/wallet/me')
        ])
        setListings(listingsRes.data)
        setWallet(walletRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = {
    total: listings.length,
    approved: listings.filter(l => l.status === 'approved').length,
    pending: listings.filter(l => l.status === 'pending_approval').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  }

  const statusConfig = {
    pending_approval: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
    sold_out: { label: 'Sold Out', color: 'bg-zinc-100 text-zinc-600', icon: Package },
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#1a3d2b] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Listings" value={stats.total} color="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-green-50 text-green-600" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={Wallet} label="Balance (PKR)" value={wallet ? parseFloat(wallet.balance).toLocaleString() : '—'} color="bg-purple-50 text-purple-600" />
      </div>

      {/* Recent Listings */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-800">Recent Listings</h2>
          <a href="/seller/my-listings" className="text-sm text-[#1a3d2b] hover:underline">View all</a>
        </div>

        {listings.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            <Wheat size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-medium">No listings yet</p>
            <p className="text-sm mt-1">Create your first rice listing to get started!</p>
            <a href="/seller/create-listing" className="mt-4 inline-block px-5 py-2 bg-[#1a3d2b] text-white text-sm rounded-lg">
              + Create Listing
            </a>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {listings.slice(0, 5).map(listing => {
              const status = statusConfig[listing.status] || statusConfig.pending_approval
              const StatusIcon = status.icon
              return (
                <div key={listing.id} className="px-5 py-4 flex items-center gap-4">
                  <img
                    src={listing.images?.[0]}
                    alt={listing.name}
                    className="w-12 h-12 rounded-lg object-cover bg-zinc-100"
                    onError={(e) => { e.target.src = 'https://placehold.co/48x48?text=Rice' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-800 truncate">{listing.name}</p>
                    <p className="text-sm text-zinc-500">{listing.rice_type} · PKR {parseFloat(listing.final_price).toLocaleString()}/kg</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-zinc-800">{value}</p>
      <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
    </div>
  )
}
