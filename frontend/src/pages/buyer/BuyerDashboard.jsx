import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Wallet, Search, MapPin, TrendingUp, Package, MoveRight } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#1a3d2b] p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Find the perfect rice for your business
          </h2>
          <p className="text-white/80 mb-6 text-sm">
            AI-validated quality and fair prices from verified sellers across Pakistan.
          </p>
          <Link to="/buyer/browse" className="inline-flex items-center gap-2 bg-[#c8922a] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#c8922a]/90 transition-all">
            <Search size={18} />
            Browse Listings
          </Link>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <LayoutDashboard size={250} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Orders" value={orders.length} color="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label="Active Orders" value={activeOrders.length} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={MapPin} label="Completed" value={orders.length - activeOrders.length} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Wallet} label="Wallet Balance" value={`PKR ${wallet ? parseFloat(wallet.balance).toLocaleString() : '0'}`} color="bg-green-50 text-green-600" />
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-semibold text-zinc-800">Recent Activity</h2>
          <Link to="/buyer/orders" className="text-sm text-[#1a3d2b] font-medium hover:underline flex items-center gap-1">
            View all orders <MoveRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            <Package size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1 mb-4">Start exploring listings to place your first order.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
             {orders.slice(0, 4).map(order => (
               <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors">
                  <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center shrink-0">
                    <Package size={20} className="text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs bg-zinc-200 text-zinc-600 font-semibold px-2 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                      {order.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm font-medium text-zinc-800">Order Placed - {order.quantity_kg} KG</p>
                    <p className="text-xs text-zinc-500 truncate">Total: PKR {parseFloat(order.total_amount).toLocaleString()}</p>
                  </div>
                  <Link to="/buyer/orders" className="shrink-0 p-2 text-zinc-400 hover:text-[#1a3d2b] transition-colors bg-white border border-zinc-200 rounded shadow-sm">
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
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-zinc-800 truncate">{value}</p>
      <p className="text-sm text-zinc-500 mt-0.5">{label}</p>
    </div>
  )
}
