import React, { useEffect, useState } from 'react'
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, AlertCircle, FileText, Loader2, ArrowRight } from 'lucide-react'
import api from '../../lib/axios'

const statusConfig = {
  placed: { label: 'New Order', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: Clock },
  seller_approved: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', icon: CheckCircle },
  contract_sent: { label: 'Contract Sent', color: 'bg-purple-500/10 text-purple-700 border-purple-500/20', icon: AlertCircle },
  contract_signed: { label: 'Contract Signed', color: 'bg-purple-500/10 text-purple-700 border-purple-500/20', icon: CheckCircle },
  payment_held: { label: 'Payment Held', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-sky-500/10 text-sky-700 border-sky-500/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-500/10 text-green-700 border-green-500/20', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-zinc-100 text-zinc-600 border-zinc-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-700 border-red-500/20', icon: XCircle },
}

export default function SellerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/orders/seller')
      .then(res => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/orders/${id}/approve`)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'seller_approved' } : o))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed')
    }
  }

  const handleReject = async (id) => {
    if (!confirm('Reject this order?')) return
    try {
      await api.put(`/api/orders/${id}/reject`)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed')
    }
  }

  const handleShip = async (id) => {
    try {
      await api.put(`/api/orders/${id}/ship`)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'shipped' } : o))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#1a3d2b] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Received Orders</h1>
        <p className="text-xs text-zinc-500 mt-1 font-medium">{orders.length} active consumer and distributor orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-20 text-center shadow-sm max-w-xl mx-auto">
          <ShoppingBag size={44} className="mx-auto text-zinc-300 mb-3 animate-pulse" />
          <h2 className="text-xl font-black text-zinc-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No orders yet</h2>
          <p className="text-sm text-zinc-500">Orders will appear here automatically when buyers initiate purchases from your catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map(order => {
            const status = statusConfig[order.status] || statusConfig.placed
            const StatusIcon = status.icon

            return (
              <div key={order.id} className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-3 py-1.5 rounded-full border uppercase tracking-wider mb-3 ${status.color}`}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                      <h3 className="font-bold text-zinc-800 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {order.listing_name || 'Rice Cargo Batch'}
                      </h3>
                      <p className="text-xs text-zinc-400 font-semibold mt-1">
                        {parseFloat(order.quantity_kg).toLocaleString()} KG · PKR {parseFloat(order.unit_price).toLocaleString()} / KG
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Payout</p>
                      <p className="font-black text-lg text-[#1a3d2b]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        PKR {parseFloat(order.total_amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-zinc-400 font-semibold mt-4 pt-3 border-t border-zinc-100 flex justify-between items-center">
                    <span>ORDER ID: #{order.id.split('-')[0].toUpperCase()}</span>
                    <span>{new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-5 pt-3 border-t border-zinc-100">
                  {order.status === 'placed' && (
                    <>
                      <button onClick={() => handleApprove(order.id)}
                        className="flex-1 py-3 bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md hover:opacity-95 transition-all">
                        Approve Crop Order
                      </button>
                      <button onClick={() => handleReject(order.id)}
                        className="py-3 px-5 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-red-50 transition-all">
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === 'seller_approved' && (
                    <a href={`/seller/orders/${order.id}/create-contract`}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md hover:opacity-95 text-center transition-all flex items-center justify-center gap-1.5">
                      <FileText size={14} /> Create Digital Contract
                    </a>
                  )}
                  {order.status === 'payment_held' && (
                    <button onClick={() => handleShip(order.id)}
                      className="flex-1 py-3 bg-gradient-to-r from-sky-600 to-sky-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5">
                      <Truck size={14} /> Dispatch Grain Batch
                    </button>
                  )}
                  
                  {!['placed', 'seller_approved', 'payment_held'].includes(order.status) && (
                    <div className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest py-2 bg-zinc-50 w-full text-center rounded-xl border border-zinc-150">
                      No Pending Seller Operations
                    </div>
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
