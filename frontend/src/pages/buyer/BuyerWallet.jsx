import React, { useEffect, useState } from 'react'
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Loader2, Landmark, History, Clock, X, Sparkles } from 'lucide-react'
import api from '../../lib/axios'

export default function BuyerWallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [depositError, setDepositError] = useState(null)

  const fetchWallet = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        api.get('/api/wallet/me'),
        api.get('/api/wallet/transactions')
      ])
      setWallet(walletRes.data)
      setTransactions(txRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  const handleDeposit = async (e) => {
    e.preventDefault()
    setDepositError(null)
    setDepositing(true)
    
    const amt = parseFloat(depositAmount)
    if (isNaN(amt) || amt <= 0) {
      setDepositError("Please enter a valid amount")
      setDepositing(false)
      return
    }

    try {
      await api.post('/api/wallet/add-demo-funds', { amount: amt })
      setDepositAmount('')
      setShowDepositModal(false)
      await fetchWallet()
    } catch (err) {
      setDepositError(err.response?.data?.detail || "Deposit failed. Try again.")
    } finally {
      setDepositing(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-[#1a3d2b]" />
    </div>
  )

  const escrowHolds = transactions.filter(t => t.type === 'escrow_hold').reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const escrowReleases = transactions.filter(t => t.type === 'escrow_release').reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const activeEscrow = escrowHolds - escrowReleases

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>My Wallet</h1>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Deposit demo funds and track active escrow deposits.</p>
        </div>
        <button 
          onClick={() => { setDepositError(null); setShowDepositModal(true); }}
          className="text-xs bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider hover:opacity-95 shadow-md flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
        >
          <Plus size={16} /> Load Demo Funds
        </button>
      </div>
      
      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-br from-[#1b3d2b] via-[#24523a] to-[#122b1d] p-8 rounded-3xl text-white relative overflow-hidden shadow-xl border border-white/5 flex flex-col justify-between min-h-[220px] group hover:scale-[1.01] transform duration-300">
          <div className="absolute right-0 bottom-0 p-8 opacity-10 pointer-events-none transform translate-x-6 translate-y-6 group-hover:scale-105 transition-transform duration-700">
            <Wallet size={180} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">RiceMind Wallet Card</span>
              <Sparkles size={18} className="text-[#c8922a] animate-pulse" />
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Available Balance</p>
              <h2 className="text-4xl font-black mt-1 flex items-baseline gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="text-lg font-normal text-white/60">PKR</span>
                {parseFloat(wallet?.balance || 0).toLocaleString()}
              </h2>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-white/65">
            <p className="font-mono">•••• •••• •••• {wallet?.id?.split('-')[0]?.toUpperCase() || 'WAL'}</p>
            <p className="font-bold uppercase tracking-widest text-[9px] bg-white/10 px-2.5 py-1 rounded-full">Active Balance</p>
          </div>
        </div>

        {/* Escrow Holds */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-zinc-200/60 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-black pointer-events-none">
            <Landmark size={140} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[#c8922a] font-bold text-xs uppercase tracking-widest">
              <Clock size={16} className="animate-spin-slow" />
              Funds Held in Escrow
            </div>
            <div className="mt-5">
              <h2 className="text-3xl font-black text-zinc-800 flex items-baseline gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="text-sm text-zinc-400 font-normal">PKR</span>
                {activeEscrow.toLocaleString()}
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
                These funds are reserved to pay sellers for active contracts. They will be released to the seller once you confirm receipt of the rice grains.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/60 backdrop-blur-md border border-zinc-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200/50 flex items-center justify-between">
          <h3 className="font-bold text-zinc-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <History size={18} className="text-[#1a3d2b]" />
            Transaction History
          </h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <History size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-bold text-zinc-700">No transactions recorded</p>
            <p className="text-xs text-zinc-400 mt-1">Transactions will appear as you deposit, lock, or release funds.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/30">
            {transactions.map(tx => (
              <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-white/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border
                    ${tx.type === 'credit' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 
                      tx.type === 'debit' ? 'bg-red-500/10 border-red-500/20 text-red-600' : 
                      'bg-amber-500/10 border-amber-500/20 text-[#c8922a]'}`}
                  >
                    {tx.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-800 text-sm capitalize">{tx.type.replace('_', ' ')}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-[200px] sm:max-w-md mt-0.5">{tx.description}</p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1 flex items-center gap-1">
                      <Clock size={11} /> {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={`font-black text-right text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-zinc-800'}`}>
                  {tx.type === 'credit' ? '+' : '-'} PKR {parseFloat(tx.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deposit Mock Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col border border-zinc-200/50">
            <div className="p-6 border-b border-zinc-200/50 flex items-center justify-between shrink-0 bg-zinc-50">
              <h3 className="font-extrabold text-lg text-zinc-800 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <Wallet size={20} className="text-[#1a3d2b]" /> Deposit Demo Funds
              </h3>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="p-1.5 bg-zinc-200/60 text-zinc-500 rounded-full hover:bg-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleDeposit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-1.5">Amount (PKR)</label>
                <input 
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] text-lg font-black text-zinc-800"
                  placeholder="e.g. 50000"
                />
              </div>

              {depositError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-200/50">{depositError}</p>
              )}

              <button
                disabled={depositing || !depositAmount}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#1a3d2b] to-[#25523a] text-white font-extrabold rounded-2xl hover:opacity-95 shadow-lg shadow-[#1a3d2b]/20 flex items-center justify-center gap-2 transition-all"
              >
                {depositing ? <Loader2 size={16} className="animate-spin" /> : null}
                Load Demo Funds
              </button>

              <p className="text-[10px] text-center text-zinc-400 leading-normal">
                This is a demo wallet. Clicking deposit simulates adding real-time credits to test the complete escrow flow of the agricultural marketplace.
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
