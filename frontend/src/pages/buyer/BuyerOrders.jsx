import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, FileText, CheckCircle, AlertCircle, Loader2, X, MoveRight } from 'lucide-react'
import api from '../../lib/axios'

export default function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Contract Modal State
  const [actionOrder, setActionOrder] = useState(null)
  const [contractDetails, setContractDetails] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [modalLoading, setModalLoading] = useState(false)
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState(null)
  
  // Deliver Actions
  const [confirming, setConfirming] = useState(false)

  const fetchOrders = () => {
    setLoading(true)
    api.get('/api/orders/buyer')
      .then(res => setOrders(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleOpenContract = async (order) => {
    setActionOrder(order)
    setModalLoading(true)
    setSignError(null)

    try {
      const [contractRes, walletRes] = await Promise.all([
        api.get(`/api/contracts/order/${order.id}`),
        api.get('/api/wallet/me')
      ])
      setContractDetails(contractRes.data)
      setWalletBalance(parseFloat(walletRes.data.balance))
    } catch (err) {
      setSignError("Failed to load contract or wallet details")
    } finally {
      setModalLoading(false)
    }
  }

  const handleSignContract = async () => {
    setSigning(true)
    setSignError(null)
    try {
      await api.put(`/api/contracts/${contractDetails.id}/sign`)
      setActionOrder(null)
      fetchOrders()
    } catch (err) {
      setSignError(err.response?.data?.detail || "Failed to sign contract. Please check your wallet balance.")
    } finally {
      setSigning(false)
    }
  }

  const handleConfirmDelivery = async (orderId) => {
    if (!window.confirm("Are you sure you have received your order? This will release the escrow funds to the seller and complete the order.")) return;
    
    setConfirming(true)
    try {
      await api.put(`/api/orders/${orderId}/deliver`)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to confirm delivery")
    } finally {
      setConfirming(false)
    }
  }

  const getStatusBadge = (status) => {
    const s = status.replace('_', ' ')
    if (status === 'completed') return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded uppercase">{s}</span>
    if (status === 'contract_sent') return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded mx-1 uppercase">Contract waiting for signature</span>
    if (status === 'payment_held') return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded uppercase">Escrow Held</span>
    if (status === 'shipped') return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded uppercase animate-pulse">{s}</span>
    return <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded uppercase">{s}</span>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-800">My Orders</h1>
        <Link to="/buyer/browse" className="text-sm bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors">
          Browse More
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#1a3d2b] w-8 h-8" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-16 text-center text-zinc-500 shadow-sm">
          <Package className="mx-auto mb-4 text-zinc-300 w-16 h-16" />
          <h2 className="text-xl font-bold text-zinc-700 mb-2">No orders yet</h2>
          <p className="mb-6">Start browsing the marketplace to find the best rice quality.</p>
          <Link to="/buyer/browse" className="bg-[#1a3d2b] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#1a3d2b]/90">Go to Marketplace</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-sm text-zinc-500 font-semibold">
                <th className="p-4 w-24">Order ID</th>
                <th className="p-4">Details</th>
                <th className="p-4 w-32">Status</th>
                <th className="p-4 text-right w-40">Total (PKR)</th>
                <th className="p-4 text-center w-36">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors group">
                  <td className="p-4 font-mono text-xs text-zinc-500">...{order.id.split('-')[0]}</td>
                  <td className="p-4">
                    <p className="font-semibold text-zinc-800 flex items-center gap-2">
                       {order.quantity_kg} KG
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">{getStatusBadge(order.status)}</td>
                  <td className="p-4 text-right font-bold text-zinc-800">
                    {parseFloat(order.total_amount).toLocaleString()}
                  </td>
                  <td className="p-4 flex items-center justify-center gap-2">
                    {order.status === 'contract_sent' && (
                      <button 
                        onClick={() => handleOpenContract(order)}
                        className="bg-[#c8922a] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#c8922a]/90 flex items-center gap-1 shadow-sm"
                      >
                        <FileText size={14} /> View Contract
                      </button>
                    )}
                    
                    {order.status === 'shipped' && (
                      <button 
                        onClick={() => handleConfirmDelivery(order.id)}
                        disabled={confirming}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-green-700 flex items-center gap-1 shadow-sm"
                      >
                        {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Confirm Delivery
                      </button>
                    )}

                    {['placed', 'seller_approved', 'payment_held'].includes(order.status) && (
                      <span className="text-xs text-zinc-400 italic">Waiting on Seller</span>
                    )}
                    
                    {['completed'].includes(order.status) && (
                      <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Delivered
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contract Signature Modal */}
      {actionOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50">
              <h3 className="font-bold text-lg text-zinc-800 flex items-center gap-2">
                <FileText className="text-[#c8922a]" size={20} /> Contract Detail
              </h3>
              <button 
                onClick={() => setActionOrder(null)} 
                className="p-1.5 bg-zinc-200 text-zinc-500 rounded-full hover:bg-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto min-h-[300px]">
              {modalLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="animate-spin w-8 h-8 text-[#1a3d2b]" />
                </div>
              ) : contractDetails ? (
                <div className="space-y-5 text-sm text-zinc-700">
                  <div className="flex justify-between pb-4 border-b border-zinc-100">
                    <span className="text-zinc-500 font-medium">Transaction ID</span>
                    <span className="font-mono text-zinc-900 font-medium bg-zinc-100 px-2 py-0.5 rounded">{contractDetails.transaction_id}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Order Ref</span>
                      <span className="font-medium text-zinc-900">{contractDetails.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Quantity</span>
                      <span className="font-medium text-zinc-900">{actionOrder.quantity_kg} KG</span>
                    </div>
                    <div className="flex justify-between items-center mt-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                       <span className="font-semibold text-zinc-800">Total Escrow Amount</span>
                       <span className="font-bold text-lg text-[#1a3d2b]">PKR {parseFloat(contractDetails.total_amount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-800">
                    <div className="flex gap-2 font-semibold mb-2">
                      <AlertCircle size={18} /> Important Terms
                    </div>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>The total amount will be deducted directly from your wallet and held in secure Escrow.</li>
                      <li>Delivery deadline: <strong>{new Date(contractDetails.delivery_deadline).toLocaleDateString()}</strong></li>
                      {contractDetails.terms && <li>Additional: {contractDetails.terms}</li>}
                    </ul>
                  </div>

                  <div className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center font-medium shadow-inner">
                     <span>Seller Signed</span>
                     <span>✅ Verified</span>
                  </div>

                  {walletBalance < parseFloat(contractDetails.total_amount) ? (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <AlertCircle size={18} /> Insufficient Balance
                      </div>
                      <p className="text-sm">Your current wallet balance (PKR {walletBalance.toLocaleString()}) is less than the required escrow amount (PKR {parseFloat(contractDetails.total_amount).toLocaleString()}). Please contact the Platform Admin to top-up your testing wallet.</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm flex items-center gap-2 font-medium">
                       <CheckCircle size={16} /> Balance Verified: Sufficient funds available.
                    </div>
                  )}
                  
                  {signError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded border border-red-200 text-xs font-semibold">
                      {signError}
                    </div>
                  )}

                </div>
              ) : (
                <p className="text-red-500 text-center font-semibold">Could not load contract details.</p>
              )}
            </div>

            <div className="p-5 border-t border-zinc-100 bg-zinc-50 flex gap-3 shrink-0">
              <button 
                onClick={() => setActionOrder(null)}
                className="flex-1 py-2.5 font-semibold text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors"
                disabled={signing}
              >
                Go Back
              </button>
              <button 
                onClick={handleSignContract}
                disabled={!contractDetails || signing || walletBalance < parseFloat(contractDetails?.total_amount)}
                className="flex-[2] py-2.5 bg-[#1a3d2b] text-white font-bold rounded-lg shadow-md hover:bg-[#1a3d2b]/95 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {signing ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing Hold...</>
                ) : (
                  <>Sign & Hold Payment <MoveRight size={18} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
