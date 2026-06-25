import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Wallet, Search, MapPin, TrendingUp, Package, MoveRight, Wheat, Calendar } from 'lucide-react'
import api from '../../lib/axios'
import DashboardChatbot from '../../components/chat/DashboardChatbot'

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([])
  const [wallet, setWallet] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, walletRes] = await Promise.all([
          api.get('/api/orders/buyer'),
          api.get('/api/wallet/me')
        ])
        setOrders(ordersRes.data)
        setWallet(walletRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#c8922a] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#163525] to-[#25523a] p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-xl border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <Wheat size={300} className="text-[#c8922a]" />
        </div>
        <div className="relative z-10 max-w-lg">
          <span className="inline-block bg-[#c8922a]/20 text-[#c8922a] border border-[#c8922a]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            AI Quality Scanner Active
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Trade premium rice with data-driven trust
          </h2>
          <p className="text-white/80 mb-8 text-base font-medium">
            Browse through AI-validated quality scores and complete transactions securely under on-platform escrow.
          </p>
          <Link to="/buyer/browse" className="inline-flex items-center gap-3 bg-gradient-to-r from-[#c8922a] to-[#b37f20] text-white px-6 py-3 rounded-2xl font-bold hover:opacity-95 transition-all shadow-lg shadow-[#c8922a]/25 hover:scale-[1.02] transform">
            <Search size={18} />
            Explore Marketplace
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Package} label="Total Orders" value={orders.length} color="from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-500/20" />
        <StatCard icon={TrendingUp} label="Active Escrow" value={activeOrders.length} color="from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-500/20" />
        <StatCard icon={MapPin} label="Completed Orders" value={orders.length - activeOrders.length} color="from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-500/20" />
        <StatCard icon={Wallet} label="Wallet Balance" value={`PKR ${wallet ? parseFloat(wallet.balance).toLocaleString() : '0'}`} color="from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-500/20" />
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-zinc-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200/50 flex items-center justify-between">
          <h2 className="font-bold text-lg text-zinc-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Recent Transactions</h2>
          <Link to="/buyer/orders" className="text-sm text-[#1a3d2b] font-bold hover:underline flex items-center gap-1">
            View directory <MoveRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Package size={44} className="mx-auto mb-3 text-zinc-300 animate-pulse" />
            <p className="font-bold text-zinc-700">No transactions recorded</p>
            <p className="text-sm mt-1 mb-4 text-zinc-500">Create an escrow order by buying one of the listings.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/40">
             {orders.slice(0, 4).map(order => (
               <div key={order.id} className="p-5 flex items-center gap-4 hover:bg-white/40 transition-colors">
                  <div className="w-12 h-12 bg-[#1a3d2b]/10 rounded-2xl flex items-center justify-center shrink-0 border border-[#1a3d2b]/10">
                    <Package size={22} className="text-[#1a3d2b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-red-500/10 text-red-700 border border-red-500/20' :
                        'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-800">Order - Basmati Premium ({order.quantity_kg} KG)</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> Total Amount: PKR {parseFloat(order.total_amount).toLocaleString()}
                    </p>
                  </div>
                  <Link to="/buyer/orders" className="shrink-0 p-2.5 text-zinc-400 hover:text-[#1a3d2b] transition-all bg-white border border-zinc-200 rounded-xl hover:shadow-md">
                    <MoveRight size={16} />
                  </Link>
               </div>
             ))}
          </div>
        )}
      </div>
      
      {/* Bot */}
      <DashboardChatbot />
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
