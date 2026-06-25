import React, { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import api from '../../lib/axios'
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Inbox,
  Activity
} from 'lucide-react'


const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Control Center' },
  { to: '/admin/pending', icon: CheckSquare, label: 'Pending Listings' },
  { to: '/admin/stock-requests', icon: Inbox, label: 'Stock Requests' },
  { to: '/admin/deals', icon: Activity, label: 'Deals Monitor' },
  { to: '/admin/users', icon: Users, label: 'User Directory' },
]

export default function AdminLayout() {
  const [adminUser, setAdminUser] = React.useState(null)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  React.useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('adminAuthToken')
        if (!token) {
          navigate('/admin/login')
          return
        }
        const { data } = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (data.role !== 'admin') {
          localStorage.removeItem('adminAuthToken')
          navigate('/admin/login')
          return
        }
        setAdminUser(data)
      } catch (err) {
        console.error("Admin verification failed:", err)
        localStorage.removeItem('adminAuthToken')
        navigate('/admin/login')
      }
    }
    fetchAdmin()
  }, [navigate])

  const handleLogout = async () => {
    localStorage.removeItem('adminAuthToken')
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-zinc-900 overflow-hidden font-sans text-zinc-100">
      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 w-72 bg-[#09090b] flex flex-col border-r border-[#27272a]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-[#27272a]">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
             <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-wide uppercase">RiceMind</p>
            <p className="text-red-500 text-xs font-bold tracking-widest mt-0.5">ADMINISTRATION</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Main Menu</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-zinc-800 text-white shadow-inner'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-5 py-5 border-t border-[#27272a] bg-[#09090b]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold border border-[#27272a]">
              {adminUser?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate">{adminUser?.full_name || adminUser?.username || 'Admin User'}</p>
              <p className="text-zinc-500 text-xs truncate font-medium">{adminUser?.email || 'admin@ricemind.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-zinc-400 hover:bg-red-500 hover:text-white text-sm font-bold transition-all"
          >
            <LogOut size={16} />
            RESTRICTED LOGOUT
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#121214]">
        {/* Top Bar for mobile toggle */}
        <header className="bg-[#09090b] border-b border-[#27272a] px-4 md:px-8 py-5 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
             <h1 className="text-xl font-bold text-white hidden md:block">
               System Interface Active
             </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-800 text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold uppercase tracking-wider">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               System Online
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
