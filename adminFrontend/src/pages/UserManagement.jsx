import React, { useEffect, useState } from 'react'
import { Users, Search, Wallet, KeySquare, ShieldAlert, Loader2, ArrowUpRight, ArrowDownRight, X } from 'lucide-react'
import api from '../lib/axios'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modal State
  const [activeUser, setActiveUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [action, setAction] = useState('add')
  const [submitting, setSubmitting] = useState(false)

  const fetchUsers = () => {
    setLoading(true)
    api.get('/api/admin/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleChargeSubmit = async (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return

    setSubmitting(true)
    try {
      await api.post(`/api/admin/wallet/charge/${activeUser.id}`, {
        amount: parseFloat(amount),
        action: action
      })
      fetchUsers()
      setActiveUser(null)
      setAmount('')
    } catch (err) {
      alert(err.response?.data?.detail || "Transaction failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">User Directory</h1>
          <p className="text-zinc-500 font-medium mt-1">Manage network participants and their financial accounts.</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] text-white border border-[#27272a] rounded-xl focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-zinc-500 w-8 h-8" />
        </div>
      ) : (
        <div className="bg-[#09090b] border border-[#27272a] rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#121214] border-b border-[#27272a] text-xs uppercase tracking-widest text-zinc-500 font-bold">
                  <th className="px-6 py-4">Account</th>
                  <th className="px-6 py-4">Role / Auth</th>
                  <th className="px-6 py-4 text-right">Wallet Balance</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-white font-bold border border-zinc-700 shrink-0">
                          {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{user.full_name || 'N/A'}</p>
                          <p className="text-zinc-500 text-xs mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                           user.role === 'admin' ? 'bg-red-500/10 text-red-500' :
                           user.role === 'seller' ? 'bg-[#c8922a]/10 text-[#c8922a]' :
                           'bg-blue-500/10 text-blue-500'
                         }`}>
                           {user.role}
                         </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-mono text-zinc-300 font-medium">PKR <span className="font-bold text-white text-base">{user.wallet_balance.toLocaleString()}</span></p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setActiveUser(user)}
                        disabled={user.role === 'admin'}
                        className="p-2 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors inline-block disabled:opacity-20 disabled:cursor-not-allowed"
                        title={user.role === 'admin' ? "Cannot modify admin" : "Manage Wallet"}
                      >
                        <Wallet size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
               No users found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Charge Wallet Modal */}
      {activeUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-[#27272a] flex items-center justify-between">
               <h3 className="font-bold text-white flex items-center gap-2">
                 <Wallet size={18} className="text-zinc-400" /> Modify Balance
               </h3>
               <button onClick={() => setActiveUser(null)} className="text-zinc-500 hover:text-white transition-colors">
                 <X size={20} />
               </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-[#121214] border border-[#27272a] rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 text-center">Target Account</p>
                  <p className="font-bold text-white text-center">{activeUser.email}</p>
                </div>
              </div>

              <form onSubmit={handleChargeSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setAction('add')} className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${action === 'add' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-[#121214] border-[#27272a] text-zinc-500 hover:border-zinc-700'}`}>
                    <ArrowUpRight size={20} />
                    <span className="font-bold text-xs uppercase tracking-wider">Credit</span>
                  </button>
                  <button type="button" onClick={() => setAction('subtract')} className={`p-3 border rounded-xl flex flex-col items-center gap-1 transition-all ${action === 'subtract' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-[#121214] border-[#27272a] text-zinc-500 hover:border-zinc-700'}`}>
                    <ArrowDownRight size={20} />
                    <span className="font-bold text-xs uppercase tracking-wider">Debit</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Amount (PKR)</label>
                  <input 
                    type="number" min="1" step="0.1" required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#121214] text-white border border-[#27272a] px-4 py-3 rounded-xl focus:outline-none focus:border-zinc-400 text-lg font-mono"
                    placeholder="0.00"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" disabled={submitting || !amount}
                    className="w-full py-3.5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
