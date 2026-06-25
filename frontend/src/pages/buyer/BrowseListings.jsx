import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2, Sparkles, Filter, ChevronRight, ShoppingBag } from 'lucide-react'
import api from '../../lib/axios'

const RICE_TYPES = ['All', 'Basmati', 'Jasmine', 'Brown', 'Sella', 'Super Kernel', 'Broken', 'Other']

export default function BrowseListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    api.get('/api/listings')
      .then(res => setListings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = listings.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || 
                          l.description.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' || l.rice_type === typeFilter
    return matchesSearch && matchesType
  })

  // Format AI Quality Score safely
  const formatScore = (score) => {
    if (!score) return null
    return Math.round(parseFloat(score) * 100)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-zinc-200/60 shadow-sm flex flex-col md:flex-row gap-5 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Search premium basmati, sella or jasmine rice..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] transition-all font-medium text-zinc-800"
          />
        </div>
        
        {/* Horizontal Scroll Filter Tabs */}
        <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter size={18} className="text-zinc-500 shrink-0 mr-1 hidden md:block" />
          <div className="flex gap-2">
            {RICE_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider ${
                  typeFilter === t
                    ? 'bg-gradient-to-r from-[#1a3d2b] to-[#2e6b4e] text-white shadow-md'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-32">
          <Loader2 size={36} className="animate-spin text-[#c8922a]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-20 bg-white/80 backdrop-blur-md border border-zinc-200/60 rounded-3xl shadow-sm">
          <Search size={44} className="mx-auto mb-4 text-zinc-300 animate-pulse" />
          <h3 className="text-lg font-bold text-zinc-800" style={{ fontFamily: 'Outfit, sans-serif' }}>No listings matching criteria</h3>
          <p className="text-zinc-500 mt-1">Try altering your keywords or using a different category tab.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(listing => {
            const score = formatScore(listing.ai_quality_score)
            return (
              <Link 
                to={`/buyer/listing/${listing.id}`} 
                key={listing.id}
                className="group bg-white rounded-3xl border border-zinc-200/60 overflow-hidden hover:border-[#1a3d2b]/40 hover:shadow-xl transition-all duration-300 flex flex-col hover:scale-[1.01] transform"
              >
                {/* Image & Tags */}
                <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                  <img 
                    src={listing.images[0]} 
                    alt={listing.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' }}
                  />
                  
                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-sm text-zinc-800 uppercase tracking-widest border border-zinc-200/40">
                    {listing.rice_type}
                  </div>
                  
                  {/* Premium AI Rating Gauge overlay */}
                  {score && (
                    <div className="absolute bottom-4 right-4 bg-gradient-to-r from-[#c8922a] to-[#d9a338] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 tracking-wider uppercase">
                      <Sparkles size={11} fill="currentColor" className="animate-spin-slow" />
                      AI Score: {score}%
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="font-bold text-zinc-800 text-lg leading-tight line-clamp-1 group-hover:text-[#1a3d2b] transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {listing.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                  
                  {/* Price & Actions */}
                  <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-0.5">Price / KG</p>
                      <p className="font-extrabold text-[#1a3d2b] text-base">
                        PKR {parseFloat(listing.final_price).toLocaleString()} 
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-1">
                        <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-0.5">Stock</p>
                        <p className="text-xs font-bold text-zinc-800">{listing.stock_kg} KG</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-200 group-hover:bg-[#1a3d2b] group-hover:border-[#1a3d2b] group-hover:text-white text-zinc-400 flex items-center justify-center transition-all duration-300">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
