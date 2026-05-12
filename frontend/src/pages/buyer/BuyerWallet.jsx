import React, { useEffect, useState } from 'react'
import { Wallet, ArrowDownRight, ArrowUpRight, Plus, Loader2, Landmark, History, Clock } from 'lucide-react'
import api from '../../lib/axios'

export default function BuyerWallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  


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


  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-[#1a3d2b]" />
    </div>
  )

  const escrowHolds = transactions.filter(t => t.type === 'escrow_hold').reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const escrowReleases = transactions.filter(t => t.type === 'escrow_release').reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const activeEscrow = escrowHolds - escrowReleases

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Balance */}
        <div className="bg-[#1a3d2b] p-6 rounded-2xl text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 mb-2">
              <Wallet size={20} />
              <span className="font-medium">Available Balance</span>
            </div>
            <h2 className="text-4xl font-bold mb-6 flex items-baseline gap-2">
              <span className="text-xl">PKR</span>
              {parseFloat(wallet?.balance || 0).toLocaleString()}
            </h2>
          </div>
          <Wallet size={120} className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5" />
        </div>

        {/* Escrow Holds */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-orange-600 font-medium mb-2">
            <Clock size={20} />
            Funds Held in Escrow
          </div>
          <h2 className="text-3xl font-bold text-zinc-800 mb-2 flex items-baseline gap-2">
            <span className="text-base text-zinc-500">PKR</span>
            {activeEscrow.toLocaleString()}
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            These funds are reserved for your ongoing contracts and will be released to the seller upon delivery confirmation.
          </p>
          <Landmark size={80} className="absolute -bottom-4 -right-4 opacity-[0.03] text-black" />
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-bold text-zinc-800 flex items-center gap-2">
            <History size={18} className="text-[#1a3d2b]" />
            Transaction History
          </h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {transactions.map(tx => (
              <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
                    ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 
                      tx.type === 'debit' ? 'bg-red-100 text-red-600' : 
                      'bg-orange-100 text-orange-600'}`}
                  >
                    {tx.type === 'credit' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-800 capitalize">{tx.type.replace('_', ' ')}</p>
                    <p className="text-sm text-zinc-500 truncate max-w-[200px] sm:max-w-md">{tx.description}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`font-bold text-right ${tx.type === 'credit' ? 'text-green-600' : 'text-zinc-800'}`}>
                  {tx.type === 'credit' ? '+' : '-'} PKR {parseFloat(tx.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
