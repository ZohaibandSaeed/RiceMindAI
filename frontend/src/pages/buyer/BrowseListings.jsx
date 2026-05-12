import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Loader2, Sparkles, Filter } from 'lucide-react'
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-96 flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            type="text" 
            placeholder="Search rice listings..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20"
          />
        </div>
        
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Filter size={18} className="text-zinc-500 shrink-0" />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 text-sm"
          >
            {RICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 size={32} className="animate-spin text-[#c8922a]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-20 bg-white border border-zinc-200 rounded-xl">
          <Search size={40} className="mx-auto mb-4 text-zinc-300" />
          <h3 className="text-lg font-bold text-zinc-700">No Listings Found</h3>
          <p className="text-zinc-500 mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(listing => (
            <Link 
              to={`/buyer/listing/${listing.id}`} 
              key={listing.id}
              className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:border-[#1a3d2b]/40 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                <img 
                  src={listing.images[0]} 
                  alt={listing.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Rice+Image' }}
                />
                
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded shadow-sm text-zinc-700">
                  {listing.rice_type}
                </div>
                
                {formatScore(listing.ai_quality_score) && (
                  <div className="absolute bottom-3 right-3 bg-[#c8922a] text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    <Sparkles size={12} fill="currentColor" />
                    {formatScore(listing.ai_quality_score)}% Score
                  </div>
                )}
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <div className="mb-2 flex-1">
                  <h3 className="font-bold text-zinc-800 text-lg leading-tight line-clamp-1">{listing.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{listing.description}</p>
                </div>
                
                <div className="pt-3 border-t border-zinc-100 mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Price</p>
                    <p className="font-bold text-[#1a3d2b]">PKR {parseFloat(listing.final_price).toLocaleString()} <span className="text-xs font-normal text-zinc-500">/kg</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 mb-0.5">Stock</p>
                    <p className="text-sm font-medium text-zinc-800">{listing.stock_kg} kg</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
