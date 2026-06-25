import React, { useEffect, useState } from 'react'
import { Calendar, Search, Printer, DollarSign, Scale, ArrowRight, Loader2 } from 'lucide-react'
import api from '../lib/axios'

export default function DealMonitor() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchDeals = () => {
    setLoading(true)
    const params = {}
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate

    api.get('/api/admin/deals', { params })
      .then(res => setDeals(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const handleFilter = (e) => {
    e.preventDefault()
    fetchDeals()
  }

  const handlePrint = () => {
    window.print()
  }

  // Statistics
  const totalVolume = deals.reduce((acc, d) => acc + d.quantity_kg, 0)
  const totalValue = deals.reduce((acc, d) => acc + d.total_amount, 0)
  const completedDeals = deals.filter(d => d.status === 'completed').length
  const activeDeals = deals.filter(d => ['placed', 'seller_approved', 'contract_sent', 'payment_held', 'shipped'].includes(d.status)).length

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Dynamic CSS for clean print output */}
      <style>{`
        @media print {
          /* Hide everything except the printable report */
          body * {
            visibility: hidden;
            background: transparent !important;
            color: black !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            color: #000 !important;
            background: #fff !important;
          }
          /* Remove background gradients and cards shadows during print */
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            color: black !important;
          }
        }
      `}</style>

      {/* Main UI (Hidden when printing via CSS classes if needed, or using no-print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Escrow Deals Monitor</h1>
          <p className="text-zinc-500 font-medium mt-1">Oversee, audit, and analyze deal progress between all platform buyers and sellers.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#c8922a] hover:bg-[#b37f20] text-white text-xs font-bold rounded-xl uppercase tracking-wider shadow-md hover:scale-[1.02] transform transition"
        >
          <Printer size={16} /> Print/Save PDF Ledger
        </button>
      </div>

      {/* Filters (no-print) */}
      <form onSubmit={handleFilter} className="no-print bg-[#09090b] border border-[#27272a] rounded-2xl p-5 flex flex-wrap gap-4 items-end shadow-md">
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 text-zinc-500 w-4 h-4" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-[#121214] border border-[#27272a] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-zinc-500 font-semibold"
            />
          </div>
        </div>
        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 text-zinc-500 w-4 h-4" />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full bg-[#121214] border border-[#27272a] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-zinc-500 font-semibold"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 border border-zinc-700"
        >
          <Search size={14} /> Filter
        </button>
      </form>

      {/* Printable Area containing Ledger Report */}
      <div id="print-area" className="space-y-6">
        {/* Print Only Header */}
        <div className="hidden print:flex items-center justify-between pb-6 border-b-2 border-zinc-300">
          <div>
            <h1 className="text-2xl font-black text-black">RiceMind AI Platform</h1>
            <p className="text-xs text-zinc-600 font-bold mt-1">Official Marketplace Audit Ledger Report</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 font-bold">Generated On: {new Date().toLocaleString()}</p>
            {startDate && endDate && (
              <p className="text-xs text-zinc-700 font-bold mt-1">Period: {startDate} to {endDate}</p>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#09090b] print:bg-zinc-50 border border-[#27272a] print:border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 print:text-zinc-600 font-bold uppercase tracking-wider">Total Value Exchanged</p>
              <p className="text-xl font-black text-white print:text-black mt-1">PKR {totalValue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-[#09090b] print:bg-zinc-50 border border-[#27272a] print:border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Scale size={22} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 print:text-zinc-600 font-bold uppercase tracking-wider">Total Weight Sold</p>
              <p className="text-xl font-black text-white print:text-black mt-1">{totalVolume.toLocaleString()} KG</p>
            </div>
          </div>

          <div className="bg-[#09090b] print:bg-zinc-50 border border-[#27272a] print:border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500">
              <span className="text-lg font-black font-mono">AD</span>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 print:text-zinc-600 font-bold uppercase tracking-wider">Active Deals</p>
              <p className="text-xl font-black text-white print:text-black mt-1">{activeDeals} deals</p>
            </div>
          </div>

          <div className="bg-[#09090b] print:bg-zinc-50 border border-[#27272a] print:border-zinc-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
              <span className="text-lg font-black font-mono">CD</span>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 print:text-zinc-600 font-bold uppercase tracking-wider">Completed Deals</p>
              <p className="text-xl font-black text-white print:text-black mt-1">{completedDeals} deals</p>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-[#09090b] print:bg-white border border-[#27272a] print:border-none rounded-2xl overflow-hidden shadow-md">
          {loading ? (
            <div className="flex justify-center items-center py-20 no-print">
              <Loader2 className="animate-spin text-green-500 w-8 h-8" />
            </div>
          ) : deals.length === 0 ? (
            <div className="p-16 text-center text-zinc-500">
              No transactions recorded in the selected range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-zinc-300">
                <thead>
                  <tr className="bg-zinc-950/40 print:bg-zinc-100 border-b border-[#27272a] print:border-zinc-300 text-[10px] text-zinc-400 print:text-zinc-700 font-extrabold uppercase tracking-wider">
                    <th className="p-4">Transaction ID / ID</th>
                    <th className="p-4">Buyer & Seller</th>
                    <th className="p-4">Rice Listing</th>
                    <th className="p-4 text-center">Weight</th>
                    <th className="p-4 text-right">Value (PKR)</th>
                    <th className="p-4 text-center">Deal Status</th>
                    <th className="p-4 text-center">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a] print:divide-zinc-200 text-xs">
                  {deals.map(deal => (
                    <tr key={deal.id} className="hover:bg-white/5 print:hover:bg-transparent transition-colors">
                      <td className="p-4 font-mono text-zinc-400 print:text-black">
                        <span className="block text-white print:text-black font-semibold">{deal.transaction_id}</span>
                        <span className="text-[10px]">...{deal.id.split('-')[0].toUpperCase()}</span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white print:text-black flex items-center gap-1">
                            {deal.buyer_name} <span className="text-zinc-500 font-normal font-mono text-[10px]">@{deal.buyer_username}</span>
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium">
                            <span className="bg-[#27272a] print:bg-zinc-200 px-1 rounded text-white print:text-black">Seller</span> {deal.seller_name}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-zinc-200 print:text-black">{deal.listing_name}</td>
                      <td className="p-4 text-center font-bold">{deal.quantity_kg.toLocaleString()} KG</td>
                      <td className="p-4 text-right font-black text-green-400 print:text-black">
                        PKR {deal.total_amount.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border print:border-none inline-block ${
                          deal.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          deal.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          deal.status === 'payment_held' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {deal.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-center text-zinc-500 font-medium">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
