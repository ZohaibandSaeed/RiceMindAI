import React, { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Search,
  ShoppingBag,
  Wallet,
  LogOut,
  Menu,
  X,
  Wheat,
  Activity
} from 'lucide-react'

const navItems = [
  { to: '/buyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buyer/browse', icon: Search, label: 'Browse Listings' },
  { to: '/buyer/orders', icon: ShoppingBag, label: 'My Orders' },
  { to: '/buyer/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/buyer/tracker', icon: Activity, label: 'Deal Tracker' },
]

export default function BuyerLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gradient-to-tr from-[#fbfaf7] via-[#f7f3e8] to-[#eeeae0] overflow-hidden">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-[#163525] to-[#0f251a] flex flex-col border-r border-white/5 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="p-1.5 bg-[#c8922a]/10 rounded-lg">
            <Wheat size={24} className="text-[#c8922a] animate-pulse" />
          </div>
          <div>
            <p className="text-white font-extrabold text-lg tracking-tight leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>RiceMindAI</p>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Buyer Terminal</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/buyer/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#c8922a] to-[#b37f20] text-white shadow-lg shadow-[#c8922a]/20 scale-[1.02]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-5 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c8922a] to-[#e6a933] flex items-center justify-center text-white font-bold text-base shadow-md">
              {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'B'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate leading-tight">{user?.full_name || user?.username || 'Buyer User'}</p>
              <p className="text-white/45 text-[11px] truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm font-bold transition-all border border-red-500/10"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 px-6 py-5 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-bold text-zinc-800 md:block">
            Welcome back, <span className="text-[#1a3d2b]">{user?.full_name?.split(' ')[0] || user?.username || 'Buyer'}</span> 👋
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#c8922a]/10 text-[#c8922a] border border-[#c8922a]/20 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Buyer Account
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

