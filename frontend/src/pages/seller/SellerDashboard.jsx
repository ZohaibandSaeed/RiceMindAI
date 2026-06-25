import React, { useEffect, useState } from 'react'
import { Wheat, TrendingUp, Package, ShoppingBag, Wallet, Clock, CheckCircle, XCircle, ChevronRight, BarChart2 } from 'lucide-react'
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
    pending: listings.filter(l => l.status === 'pending_approval' || l.status === 'pending').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  }

  const statusConfig = {
    pending_approval: { label: 'Pending Approval', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Clock },
    pending: { label: 'Pending Approval', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Clock },
    approved: { label: 'Active Listing', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: XCircle },
    sold_out: { label: 'Sold Out', color: 'bg-zinc-100 text-zinc-600 border-zinc-200', icon: Package },
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#1a3d2b] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Package} label="Total Crops Listed" value={stats.total} color="from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-500/20" />
        <StatCard icon={CheckCircle} label="Active listings" value={stats.approved} color="from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-500/20" />
        <StatCard icon={Clock} label="Under Review" value={stats.pending} color="from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-500/20" />
        <StatCard icon={Wallet} label="Earnings Wallet" value={wallet ? `PKR ${parseFloat(wallet.balance).toLocaleString()}` : 'PKR 0'} color="from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-500/20" />
      </div>

      {/* Analytics & Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-zinc-800 text-base uppercase tracking-wider flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <TrendingUp size={16} className="text-[#1a3d2b]" /> Sales Trend (Demo)
            </h3>
            <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full uppercase tracking-wider">Last 6 Months</span>
          </div>

          {/* Inline SVG Line Chart */}
          <div className="relative h-44 w-full">
            <svg viewBox="0 0 600 160" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* Glowing Area Fill */}
              <path
                d="M 50 120 L 150 90 L 250 110 L 350 40 L 450 70 L 550 20 L 550 140 L 50 140 Z"
                fill="url(#green-gradient)"
                opacity="0.15"
              />
              
              {/* Line */}
              <path
                d="M 50 120 L 150 90 L 250 110 L 350 40 L 450 70 L 550 20"
                fill="none"
                stroke="#1a3d2b"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              
              {/* Points */}
              <circle cx="50" cy="120" r="5" fill="#1a3d2b" stroke="#ffffff" strokeWidth="2" />
              <circle cx="150" cy="90" r="5" fill="#1a3d2b" stroke="#ffffff" strokeWidth="2" />
              <circle cx="250" cy="110" r="5" fill="#1a3d2b" stroke="#ffffff" strokeWidth="2" />
              <circle cx="350" cy="40" r="5" fill="#1a3d2b" stroke="#ffffff" strokeWidth="2" />
              <circle cx="450" cy="70" r="5" fill="#1a3d2b" stroke="#ffffff" strokeWidth="2" />
              <circle cx="550" cy="20" r="5" fill="#1a3d2b" stroke="#ffffff" strokeWidth="2" />

              <defs>
                <linearGradient id="green-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a3d2b" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between text-[10px] text-zinc-400 font-extrabold uppercase mt-2 px-6">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        {/* Rice Type Sales Volume Chart */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-6 shadow-sm">
          <h3 className="font-extrabold text-zinc-800 text-base uppercase tracking-wider flex items-center gap-2 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <BarChart2 size={16} className="text-[#c8922a]" /> Volume / Category
          </h3>
          <div className="space-y-4">
            <VolumeProgress label="Basmati Premium" percent={82} color="bg-[#1a3d2b]" />
            <VolumeProgress label="Sella Long Grain" percent={60} color="bg-[#c8922a]" />
            <VolumeProgress label="Jasmine Organic" percent={38} color="bg-emerald-600" />
            <VolumeProgress label="Brown Rice" percent={15} color="bg-purple-600" />
          </div>
        </div>

      </div>

      {/* Recent Listings */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-zinc-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200/50 flex items-center justify-between">
          <h2 className="font-bold text-lg text-zinc-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Crop Catalog Overview</h2>
          <a href="/seller/my-listings" className="text-xs text-[#1a3d2b] font-bold hover:underline flex items-center gap-0.5">
            Manage all listings <ChevronRight size={14} />
          </a>
        </div>

        {listings.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <Wheat size={44} className="mx-auto mb-3 text-zinc-300 animate-pulse" />
            <p className="font-bold text-zinc-700">Catalog is empty</p>
            <p className="text-xs text-zinc-400 mt-1 mb-4">Create your first rice listing to begin selling.</p>
            <a href="/seller/create-listing" className="inline-block px-5 py-3 bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-[#1a3d2b]/25 hover:opacity-95 transition-all">
              + Add New Listing
            </a>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/40">
            {listings.slice(0, 4).map(listing => {
              const status = statusConfig[listing.status] || statusConfig.pending_approval
              const StatusIcon = status.icon
              return (
                <div key={listing.id} className="p-5 flex items-center gap-4 hover:bg-white/40 transition-colors">
                  <img
                    src={listing.images?.[0]}
                    alt={listing.name}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200/50"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&q=80' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-800 text-sm truncate">{listing.name}</p>
                    <p className="text-xs text-zinc-400 font-semibold mt-1">{listing.rice_type} · PKR {parseFloat(listing.final_price).toLocaleString()}/KG · {listing.stock_kg} KG available</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 border uppercase tracking-wider ${status.color}`}>
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
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-6 shadow-sm hover:shadow-md transition-shadow hover:scale-[1.01] transform duration-300">
      <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-tr ${color} mb-4`}>
        <Icon size={22} />
      </div>
      <p className="text-xl sm:text-2xl font-black text-zinc-800 truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>{value}</p>
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function VolumeProgress({ label, percent, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold text-zinc-600">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-zinc-150 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  )
}
