import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Package, Check, Sparkles, AlertCircle, ArrowRight, ShieldCheck, FileText, Truck, HelpCircle } from 'lucide-react'
import api from '../../lib/axios'

const TRACKING_STEPS = [
  { title: "Order Initialized", desc: "Order details sent to the seller.", icon: Package },
  { title: "Seller Approved", desc: "Seller reviewed and approved the order capacity.", icon: Check },
  { title: "Contract Drafted", desc: "Digital contract has been sent by the seller.", icon: FileText },
  { title: "Escrow Locked", desc: "Buyer signed the contract; funds locked securely.", icon: ShieldCheck },
  { title: "Cargo Dispatched", desc: "Crops are packaged and shipped to delivery address.", icon: Truck },
  { title: "Deal Completed", desc: "Cargo received; escrow funds released to seller.", icon: Sparkles }
]

export default function BuyerTracker() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState(null)

  useEffect(() => {
    api.get('/api/orders/buyer')
      .then(res => {
        setOrders(res.data)
        if (res.data.length > 0) {
          setSelectedOrder(res.data[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedOrder) {
      setContract(null)
      return
    }
    if (['contract_sent', 'payment_held', 'shipped', 'completed'].includes(selectedOrder.status)) {
      api.get(`/api/contracts/order/${selectedOrder.id}`)
        .then(res => setContract(res.data))
        .catch(err => {
          console.error(err)
          setContract(null)
        })
    } else {
      setContract(null)
    }
  }, [selectedOrder])

  const getStepIndex = (status) => {
    switch (status) {
      case 'placed': return 0
      case 'seller_approved': return 1
      case 'contract_sent': return 2
      case 'payment_held':
      case 'contract_signed': return 3
      case 'shipped': return 4
      case 'completed': return 5
      case 'cancelled': return -1
      default: return 0
    }
  }

  if (loading) return (
    <div className="flex justify-center p-32">
      <Loader2 size={36} className="animate-spin text-[#1a3d2b]" />
    </div>
  )

  const activeStep = selectedOrder ? getStepIndex(selectedOrder.status) : -1

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Deal Tracker</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Real-time agricultural escrow monitoring and grain trace tracking.</p>
        </div>
        
        {/* Order Selector */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Select active deal:</span>
            <select
              value={selectedOrder?.id || ''}
              onChange={(e) => setSelectedOrder(orders.find(o => o.id === e.target.value))}
              className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-[#1a3d2b]/15 shadow-sm"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  Batch #{o.id.split('-')[0].toUpperCase()} - {o.quantity_kg} KG ({o.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-20 text-center shadow-sm max-w-xl mx-auto">
          <Package className="mx-auto mb-4 text-zinc-300 w-16 h-16 animate-pulse" />
          <h2 className="text-xl font-black text-zinc-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>No active tracking logs</h2>
          <p className="text-sm text-zinc-500 mb-6">Place an order first to monitor real-time grain escrow contracts.</p>
          <Link to="/buyer/browse" className="bg-[#1a3d2b] text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 shadow-md">Go to Marketplace</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline Tracking */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-8 shadow-sm lg:col-span-2 space-y-8 relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-widest text-[#1a3d2b]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Escrow Stepper Progress
              </h3>
              {selectedOrder?.status === 'cancelled' && (
                <span className="bg-red-500/10 text-red-700 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Agreement Cancelled
                </span>
              )}
            </div>

            {/* Direct Contact Numbers */}
            {contract && (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-inner">
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-widest text-[#c8922a] mb-0.5">Deal Contact Info</h4>
                  <p className="text-[10px] text-zinc-400 font-semibold">Direct phone lines generated for active agreement coordination.</p>
                </div>
                <div className="flex gap-3 text-xs font-bold">
                  {contract.seller_phone && (
                    <div className="bg-white border border-zinc-200 px-3 py-2 rounded-xl shadow-sm">
                      <span className="text-zinc-400 block text-[9px] uppercase tracking-wider mb-0.5">Seller Phone</span>
                      <span className="text-[#1a3d2b] font-mono font-black">{contract.seller_phone}</span>
                    </div>
                  )}
                  {contract.buyer_phone && (
                    <div className="bg-white border border-zinc-200 px-3 py-2 rounded-xl shadow-sm">
                      <span className="text-zinc-400 block text-[9px] uppercase tracking-wider mb-0.5">Buyer Phone</span>
                      <span className="text-[#1a3d2b] font-mono font-black">{contract.buyer_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedOrder?.status !== 'cancelled' ? (
              <div className="relative pl-8 space-y-8">
                {/* Timeline connector bar */}
                <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-zinc-200/60 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-b from-[#1a3d2b] to-[#c8922a] w-full transition-all duration-1000 ease-out"
                    style={{ height: `${(activeStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {TRACKING_STEPS.map((step, index) => {
                  const StepIcon = step.icon
                  const isCompleted = index < activeStep
                  const isActive = index === activeStep
                  const isUpcoming = index > activeStep

                  return (
                    <div key={index} className="flex gap-6 relative group">
                      
                      {/* Step Indicator Dot */}
                      <div className="absolute -left-[27px] top-1.5 z-10 flex items-center justify-center">
                        {isCompleted ? (
                          <div className="w-[20px] h-[20px] rounded-full bg-[#1a3d2b] flex items-center justify-center text-white border-2 border-white shadow-md shadow-[#1a3d2b]/25 transform scale-110 transition-transform">
                            <Check size={10} strokeWidth={4} />
                          </div>
                        ) : isActive ? (
                          <div className="w-[20px] h-[20px] rounded-full bg-[#c8922a] border-2 border-white shadow-lg shadow-[#c8922a]/30 flex items-center justify-center relative transform scale-125 transition-all">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          </div>
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full bg-zinc-200 border-2 border-white transition-all group-hover:bg-zinc-300"></div>
                        )}
                      </div>

                      {/* Step Icon */}
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isCompleted ? 'bg-[#1a3d2b]/10 border-[#1a3d2b]/20 text-[#1a3d2b]' :
                        isActive ? 'bg-[#c8922a]/10 border-[#c8922a]/20 text-[#c8922a] scale-105 shadow-md shadow-[#c8922a]/5' :
                        'bg-zinc-50 border-zinc-200 text-zinc-400'
                      }`}>
                        <StepIcon size={20} className={isActive ? 'animate-pulse' : ''} />
                      </div>

                      {/* Step Text Info */}
                      <div className="space-y-1">
                        <h4 className={`text-sm font-extrabold tracking-tight transition-colors duration-300 ${
                          isCompleted ? 'text-[#1a3d2b]' :
                          isActive ? 'text-[#c8922a] text-base' :
                          'text-zinc-500'
                        }`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {step.title}
                        </h4>
                        <p className={`text-xs font-medium leading-relaxed max-w-md ${isActive ? 'text-zinc-600' : 'text-zinc-400'}`}>
                          {step.desc}
                        </p>
                      </div>

                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-2">
                <AlertCircle className="mx-auto text-red-500" size={36} />
                <h4 className="font-bold text-red-800">This order agreement has been cancelled.</h4>
                <p className="text-xs text-red-650 leading-relaxed max-w-sm mx-auto">
                  The deal was rejected by the seller, cancelled, or closed due to invalid credentials.
                </p>
              </div>
            )}
          </div>

          {/* Action Prompt / Summary Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#163525] to-[#0f251a] p-6 rounded-3xl text-white border border-white/5 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
              <div className="absolute right-0 bottom-0 p-8 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
                <ShieldCheck size={180} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">Deal Summary</span>
                  <ShieldCheck size={20} className="text-[#c8922a]" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-white/70">Order ID: #{selectedOrder?.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-xs font-semibold text-white/70">Quantity: {selectedOrder?.quantity_kg} KG</p>
                  <p className="text-xs font-semibold text-white/70">Total Cost: PKR {parseFloat(selectedOrder?.total_amount).toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full">
                  Real-time Escrow Validated
                </span>
              </div>
            </div>

            {/* Prompt Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-zinc-200/60 p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-xs uppercase tracking-widest text-zinc-500">Operation Prompts</h4>
              
              {selectedOrder?.status === 'placed' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">The order has been registered. We are waiting for the seller to verify and approve the order parameters.</p>
                  <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-2xl text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider text-center">Awaiting Seller Approval</div>
                </div>
              )}

              {selectedOrder?.status === 'seller_approved' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">The seller has approved the crop batch. Awaiting them to create the digital contract terms.</p>
                  <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-2xl text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider text-center">Awaiting Contract Draft</div>
                </div>
              )}

              {selectedOrder?.status === 'contract_sent' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">The seller has generated the contract. Your signature is required to lock funds in escrow.</p>
                  <Link to="/buyer/orders" className="w-full py-3 bg-gradient-to-r from-[#c8922a] to-[#b37f20] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider text-center block shadow-md shadow-[#c8922a]/15 hover:opacity-95">
                    Go to Sign Contract
                  </Link>
                </div>
              )}

              {selectedOrder?.status === 'payment_held' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">Escrow funds are locked. The seller has been notified to package and ship the crops.</p>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-700 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider text-center">Awaiting Cargo Shipment</div>
                </div>
              )}

              {selectedOrder?.status === 'shipped' && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">Cargo has been dispatched. Please confirm receipt once you inspect the grains to release the locked funds.</p>
                  <Link to="/buyer/orders" className="w-full py-3 bg-[#1a3d2b] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider text-center block shadow-md">
                    Go to Confirm Delivery
                  </Link>
                </div>
              )}

              {selectedOrder?.status === 'completed' && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 leading-relaxed font-semibold">This agreement has been successfully closed. Grains delivered and funds released.</p>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider text-center">Deal Closed Successfully</div>
                </div>
              )}

              {selectedOrder?.status === 'cancelled' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 rounded-2xl text-[10px] font-extrabold uppercase tracking-wider text-center">Cancelled</div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
