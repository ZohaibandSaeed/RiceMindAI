import React, { useEffect, useState } from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, History, Landmark, Sparkles } from 'lucide-react'
import api from '../../lib/axios'

const txTypeConfig = {
  credit: { label: 'Credit', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', icon: ArrowDownLeft, sign: '+' },
  debit: { label: 'Debit', color: 'text-red-600 bg-red-500/10 border-red-500/20', icon: ArrowUpRight, sign: '-' },
  escrow_hold: { label: 'Escrow Hold', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20', icon: Clock, sign: '-' },
  escrow_release: { label: 'Released', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', icon: ArrowDownLeft, sign: '+' },
}

export default function SellerWallet() {
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, tRes] = await Promise.all([
          api.get('/api/wallet/me'),
          api.get('/api/wallet/transactions')
        ])
        setWallet(wRes.data)
        setTransactions(tRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#1a3d2b] border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>My Wallet</h1>
        <p className="text-xs text-zinc-500 mt-1 font-medium">Track your earnings and pending releases from secure on-platform transactions.</p>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1b3d2b] via-[#24523a] to-[#122b1d] p-8 rounded-3xl text-white relative overflow-hidden shadow-xl border border-white/5 md:col-span-2 flex flex-col justify-between min-h-[200px] group hover:scale-[1.01] transform duration-300">
          <div className="absolute right-0 bottom-0 p-8 opacity-10 pointer-events-none transform translate-x-6 translate-y-6 group-hover:scale-105 transition-transform duration-700">
            <Wallet size={160} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">RiceMind Wallet Card</span>
              <Sparkles size={18} className="text-[#c8922a] animate-pulse" />
            </div>
            <div className="mt-5">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Available Balance</p>
              <h2 className="text-4xl font-black mt-1 flex items-baseline gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="text-lg font-normal text-white/60">PKR</span>
                {parseFloat(wallet?.balance || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-white/65">
            <p className="font-mono">•••• •••• •••• {wallet?.id?.split('-')[0]?.toUpperCase() || 'WAL'}</p>
            <p className="font-bold uppercase tracking-widest text-[9px] bg-white/10 px-2.5 py-1 rounded-full">Available Balance</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-200/60 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-black pointer-events-none">
            <Landmark size={120} />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-extrabold text-[#c8922a] uppercase tracking-widest flex items-center gap-1.5">
              <Landmark size={14} /> Settlement Info
            </p>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              Payouts are processed automatically and released to your balance once the buyer verifies and signs delivery of cargo batches.
            </p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-zinc-200/60 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200/50 flex items-center gap-2">
          <History size={18} className="text-[#1a3d2b]" />
          <h2 className="font-bold text-zinc-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Transaction Logs</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <History size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="font-bold text-zinc-700">No transactions recorded</p>
            <p className="text-xs text-zinc-400 mt-1">Settlement payouts will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200/30">
            {transactions.map(tx => {
              const config = txTypeConfig[tx.type] || txTypeConfig.credit
              const TxIcon = config.icon
              return (
                <div key={tx.id} className="flex items-center justify-between p-5 hover:bg-white/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border uppercase tracking-wider text-xs font-bold ${config.color}`}>
                      <TxIcon size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-800 text-sm">{config.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{tx.description || '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm ${config.sign === '+' ? 'text-emerald-600': 'text-zinc-800'}`}>
                      {config.sign} PKR {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                      {new Date(tx.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
