import React, { useEffect, useState } from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react'
import api from '../../lib/axios'

const txTypeConfig = {
  credit: { label: 'Credit', color: 'text-green-600 bg-green-50', icon: ArrowDownLeft, sign: '+' },
  debit: { label: 'Debit', color: 'text-red-600 bg-red-50', icon: ArrowUpRight, sign: '-' },
  escrow_hold: { label: 'Escrow Hold', color: 'text-orange-600 bg-orange-50', icon: Clock, sign: '-' },
  escrow_release: { label: 'Released', color: 'text-green-600 bg-green-50', icon: ArrowDownLeft, sign: '+' },
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
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-800">My Wallet</h1>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#1a3d2b] to-[#2d6147] rounded-2xl p-6 text-white">
        <p className="text-white/60 text-sm mb-1">Available Balance</p>
        <p className="text-4xl font-bold tracking-tight">
          PKR {wallet ? parseFloat(wallet.balance).toLocaleString('en-PK', { minimumFractionDigits: 2 }) : '0.00'}
        </p>
        <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-lg px-4 py-2 w-fit">
          <Wallet size={15} className="text-[#c8922a]" />
          <span className="text-sm">{wallet?.currency || 'PKR'} · RiceMindAI Wallet</span>
        </div>
        <p className="text-white/50 text-xs mt-3">
          Funds are added by platform Admin. Released after order delivery confirmation.
        </p>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-800">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center text-zinc-400">
            <p className="text-sm">No transactions yet.</p>
            <p className="text-xs mt-1">Your wallet activity will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {transactions.map(tx => {
              const config = txTypeConfig[tx.type] || txTypeConfig.credit
              const TxIcon = config.icon
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <TxIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{config.label}</p>
                    <p className="text-xs text-zinc-400 truncate">{tx.description || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${config.sign === '+' ? 'text-green-600': 'text-red-600'}`}>
                      {config.sign}PKR {parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-400">
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
