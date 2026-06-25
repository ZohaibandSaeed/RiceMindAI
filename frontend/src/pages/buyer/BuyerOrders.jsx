import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, FileText, CheckCircle, AlertCircle, Loader2, X, MoveRight, HelpCircle, Wallet, Calendar } from 'lucide-react'
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
  const [buyerPhone, setBuyerPhone] = useState('')
  
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
    setBuyerPhone('')

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
    const phoneDigits = buyerPhone.replace(/\D/g, '')
    if (phoneDigits.length !== 11) {
      setSignError("Phone number must be exactly 11 digits")
      return
    }

    setSigning(true)
    setSignError(null)
    try {
      await api.put(`/api/contracts/${contractDetails.id}/sign`, {
        buyer_phone: phoneDigits
      })
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
    if (status === 'completed') return <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-500/20">Delivered</span>
    if (status === 'contract_sent') return <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider border border-amber-500/20 animate-pulse">Signature Required</span>
    if (status === 'payment_held') return <span className="px-3.5 py-1.5 bg-purple-500/10 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider border border-purple-500/20">Locked in Escrow</span>
    if (status === 'shipped') return <span className="px-3.5 py-1.5 bg-blue-500/10 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-500/20 animate-pulse">Dispatched</span>
    return <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full uppercase tracking-wider border border-zinc-200">{s}</span>
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Order History</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Track your contract signatures, locked escrow payments, and delivery statuses.</p>
        </div>
        <Link to="/buyer/browse" className="text-xs bg-white border border-zinc-200 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 shadow-sm transition-all flex items-center gap-1.5">
          Order New Batch <MoveRight size={14} />
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-32"><Loader2 className="animate-spin text-[#1a3d2b] w-8 h-8" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-20 text-center text-zinc-500 shadow-sm max-w-xl mx-auto">
          <Package className="mx-auto mb-4 text-zinc-300 w-16 h-16 animate-pulse" />
          <h2 className="text-xl font-black text-zinc-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No active orders</h2>
          <p className="mb-6 text-sm text-zinc-500">You haven't initiated any purchases or contract agreements yet.</p>
          <Link to="/buyer/browse" className="bg-[#1a3d2b] text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 shadow-md">Go to Marketplace</Link>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200/60 text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                  <th className="p-5">Order ID</th>
                  <th className="p-5">Quantity / Date</th>
                  <th className="p-5">Escrow State</th>
                  <th className="p-5 text-right">Total Amount</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/40 text-zinc-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/40 transition-colors group">
                    <td className="p-5 font-mono text-xs text-zinc-400">...{order.id.split('-')[0].toUpperCase()}</td>
                    <td className="p-5">
                      <p className="font-bold text-zinc-800 text-sm">{order.quantity_kg.toLocaleString()} KG</p>
                      <p className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="p-5">{getStatusBadge(order.status)}</td>
                    <td className="p-5 text-right font-black text-[#1a3d2b] text-sm">
                      PKR {parseFloat(order.total_amount).toLocaleString()}
                    </td>
                    <td className="p-5 flex items-center justify-center gap-2">
                      {order.status === 'contract_sent' && (
                        <button 
                          onClick={() => handleOpenContract(order)}
                          className="bg-gradient-to-r from-[#c8922a] to-[#b37f20] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-95 flex items-center gap-1 shadow-md hover:scale-[1.02] transform transition"
                        >
                          <FileText size={14} /> Review & Sign
                        </button>
                      )}
                      
                      {order.status === 'shipped' && (
                        <button 
                          onClick={() => handleConfirmDelivery(order.id)}
                          disabled={confirming}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-md hover:scale-[1.02] transform transition disabled:opacity-50"
                        >
                          {confirming ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Release Escrow
                        </button>
                      )}

                      {['placed', 'seller_approved'].includes(order.status) && (
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-ping"></span>
                          Awaiting Contract
                        </span>
                      )}

                      {order.status === 'payment_held' && (
                        <span className="text-xs text-purple-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-ping"></span>
                          Awaiting Dispatch
                        </span>
                      )}
                      
                      {['completed'].includes(order.status) && (
                        <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle size={14} /> Complete
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contract Signature Modal */}
      {actionOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-zinc-200/50 flex items-center justify-between shrink-0 bg-zinc-50">
              <h3 className="font-extrabold text-lg text-zinc-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <FileText className="text-[#c8922a]" size={22} /> Digital Escrow Agreement
              </h3>
              <button 
                onClick={() => setActionOrder(null)} 
                className="p-1.5 bg-zinc-200/60 text-zinc-500 rounded-full hover:bg-zinc-300 transition-colors"
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
                <div className="space-y-6 text-sm text-zinc-700">
                  <div className="flex justify-between pb-4 border-b border-zinc-200/50">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Agreement ID</span>
                    <span className="font-mono text-zinc-800 font-bold bg-zinc-100 px-3 py-1 rounded-xl text-xs uppercase">{contractDetails.id.split('-')[0]}</span>
                  </div>
                  
                  <div className="space-y-3 bg-[#1a3d2b]/5 p-5 rounded-3xl border border-[#1a3d2b]/15">
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-[#1a3d2b]">Agreement Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs mt-2 leading-relaxed">
                      <div>
                        <p className="text-zinc-400 font-semibold mb-0.5">Quantity</p>
                        <p className="font-bold text-zinc-800">{actionOrder.quantity_kg} KG</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 font-semibold mb-0.5">Price Per KG</p>
                        <p className="font-bold text-zinc-800">PKR {parseFloat(contractDetails.price_per_kg).toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-[#1a3d2b]/10">
                        <p className="text-zinc-400 font-semibold mb-0.5">Payment Terms</p>
                        <p className="font-semibold text-zinc-800">Escrow validation. Funds will remain locked in RiceMind Escrow until delivery is confirmed by buyer.</p>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Check */}
                  <div className="bg-zinc-50 p-5 rounded-3xl border border-zinc-200 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <Wallet size={16} /> Wallet Balance
                      </span>
                      <span className="text-zinc-800">PKR {walletBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold border-t border-zinc-200 pt-3">
                      <span className="text-zinc-600">Contract Cost</span>
                      <span className="text-zinc-900">PKR {parseFloat(contractDetails.total_cost).toLocaleString()}</span>
                    </div>

                    {walletBalance < parseFloat(contractDetails.total_cost) ? (
                      <div className="mt-2 p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-bold leading-relaxed">
                        Insufficient Funds. Please go to your Wallet to add balance before signing the contract.
                      </div>
                    ) : (
                      <div className="mt-2 p-3.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold leading-relaxed">
                        Balance verified. Proceed to sign and hold funds in escrow.
                      </div>
                    )}
                  </div>

                  {/* Buyer Phone Number Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="buyerPhone" className="text-xs font-bold text-zinc-700 block">Your Contact Phone Number (11 Digits)</label>
                    <input
                      id="buyerPhone"
                      type="text"
                      required
                      value={buyerPhone}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 11)
                        setBuyerPhone(val)
                      }}
                      placeholder="e.g. 03123456789"
                      className="w-full bg-white border border-zinc-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3d2b] font-bold text-zinc-800"
                    />
                  </div>

                  {signError && (
                    <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-semibold">
                      {signError}
                    </div>
                  )}

                  <button
                    onClick={handleSignContract}
                    disabled={signing || walletBalance < parseFloat(contractDetails.total_cost)}
                    className="w-full py-4 bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white font-extrabold rounded-2xl hover:opacity-95 shadow-lg shadow-[#1a3d2b]/20 active:scale-[0.99] transform transition disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-xs"
                  >
                    {signing ? "SECURELY SIGNING & DEPOSITING..." : "Sign Agreement & Hold Funds"}
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 text-zinc-500">Failed to load contract details.</div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
