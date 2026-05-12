import React, { useEffect, useState } from 'react'
import { Activity, Users, CheckSquare, Banknote, ShieldAlert, FileWarning, ArrowUpRight } from 'lucide-react'
import api from '../lib/axios'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/admin/metrics')
      .then(res => setMetrics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-extrabold text-white tracking-tight">Main Control</h1>
           <p className="text-zinc-500 font-medium mt-1">Platform overview and health metrics.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#27272a]/50 text-zinc-400 px-4 py-2 rounded-lg border border-[#27272a] text-sm font-bold">
           <Activity size={16} /> Data is Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          icon={Users} 
          label="Total Registered Users" 
          value={metrics?.total_users || 0} 
          trend="Platform Reach"
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <MetricCard 
          icon={FileWarning} 
          label="Pending Approvals" 
          value={metrics?.pending_listings || 0} 
          trend="Requires Action"
          color="text-yellow-500"
          bg="bg-yellow-500/10"
        />
        <MetricCard 
          icon={Banknote} 
          label="Total Escrow Capital" 
          value={`PKR ${(metrics?.total_escrow_held || 0).toLocaleString()}`} 
          trend="Value Locked"
          color="text-green-500"
          bg="bg-green-500/10"
        />
      </div>

      <div className="mt-8 bg-[#09090b] border border-[#27272a] rounded-2xl p-8">
         <div className="flex items-start gap-4">
            <div className="p-3 bg-zinc-800 rounded-xl text-zinc-300">
               <ShieldAlert size={24} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-white mb-2">Administrator Protocol</h3>
               <p className="text-zinc-400 leading-relaxed max-w-3xl">
                 You are currently logged into the RiceMindAI administration panel. Operations executed here affect all buyers and sellers on the platform. Please exercise extreme caution when modifying user balances and performing listing approvals to continuously ensure a safe environment.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, trend, color, bg }) {
  return (
    <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon size={22} />
        </div>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{trend}</span>
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-black text-white mb-1">{value}</h3>
        <p className="text-zinc-500 font-medium text-sm">{label}</p>
      </div>
      <Icon size={120} className={`absolute -bottom-6 -right-6 ${color} opacity-[0.03] group-hover:opacity-[0.05] transition-opacity`} />
    </div>
  )
}
