import React, { useEffect, useState } from 'react'
import { ShoppingBag, Clock, CheckCircle, XCircle, Truck, AlertCircle } from 'lucide-react'
import api from '../../lib/axios'

const statusConfig = {
  placed: { label: 'New Order', color: 'bg-blue-100 text-blue-700', icon: Clock },
  seller_approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  contract_sent: { label: 'Contract Sent', color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
  contract_signed: { label: 'Contract Signed', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  payment_held: { label: 'Payment Held', color: 'bg-amber-100 text-amber-700', icon: Clock },
  shipped: { label: 'Shipped', color: 'bg-sky-100 text-sky-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-zinc-100 text-zinc-600', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-800">Seller Orders</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{orders.length} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-14 text-center">
          <ShoppingBag size={44} className="mx-auto text-zinc-300 mb-3" />
          <p className="font-semibold text-zinc-600">No orders yet</p>
          <p className="text-sm text-zinc-400 mt-1">Orders from buyers will appear here when your listings are approved</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = statusConfig[order.status] || statusConfig.placed
            const StatusIcon = status.icon

            return (
              <div key={order.id} className="bg-white rounded-xl border border-zinc-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-zinc-800">{order.listing_name || 'Rice Order'}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {parseFloat(order.quantity_kg).toLocaleString()} KG ·  PKR {parseFloat(order.unit_price).toLocaleString()}/KG
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-zinc-800">PKR {parseFloat(order.total_amount).toLocaleString()}</p>
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full mt-1 ${status.color}`}>
                      <StatusIcon size={11} />
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {order.status === 'placed' && (
                    <>
                      <button onClick={() => handleApprove(order.id)}
                        className="px-4 py-2 bg-[#1a3d2b] text-white text-sm font-medium rounded-lg hover:bg-[#1a3d2b]/90">
                        ✓ Approve Order
                      </button>
                      <button onClick={() => handleReject(order.id)}
                        className="px-4 py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50">
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {order.status === 'seller_approved' && (
                    <a href={`/seller/orders/${order.id}/create-contract`}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700">
                      📄 Create Contract
                    </a>
                  )}
                  {order.status === 'payment_held' && (
                    <button onClick={() => handleShip(order.id)}
                      className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700">
                      🚚 Mark as Shipped
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
