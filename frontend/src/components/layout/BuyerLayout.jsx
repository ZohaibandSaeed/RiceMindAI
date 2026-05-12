import React, { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useClerk, useUser } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  Search,
  ShoppingBag,
  Wallet,
  LogOut,
  Menu,
  X,
  Wheat
} from 'lucide-react'

const navItems = [
  { to: '/buyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/buyer/browse', icon: Search, label: 'Browse Listings' },
  { to: '/buyer/orders', icon: ShoppingBag, label: 'My Orders' },
  { to: '/buyer/wallet', icon: Wallet, label: 'Wallet' },
]

export default function BuyerLayout() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    localStorage.removeItem('userRole')
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-[#faf7f0] overflow-hidden">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 bg-[#1a3d2b] flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <Wheat size={26} className="text-[#c8922a]" />
          <div>
            <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: 'Georgia, serif' }}>RiceMindAI</p>
            <p className="text-white/50 text-xs mt-0.5">Buyer Portal</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/buyer/dashboard'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c8922a] text-white shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#c8922a] flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0] || 'B'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-white/40 text-xs truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-zinc-200 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-lg font-semibold text-zinc-800 md:block">
            Welcome back, <span className="text-[#1a3d2b]">{user?.firstName || 'Buyer'}</span> 👋
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#c8922a]/10 text-[#c8922a] px-3 py-1 rounded-full font-medium">
              Buyer
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
