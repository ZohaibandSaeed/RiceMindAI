import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { ShieldAlert, Key } from 'lucide-react'

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username_or_email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const extractError = (err) => {
    if (err.response?.data?.detail) {
      const detail = err.response.data.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail)) {
        return detail.map(d => d.msg).join(', ')
      }
      return JSON.stringify(detail)
    }
    return err.message || "An unexpected error occurred. Please try again."
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/api/auth/login', formData)
      
      if (data.user.role !== 'admin') {
        throw new Error("Access Denied: Restricted to Administrator accounts only.")
      }

      localStorage.setItem('adminAuthToken', data.access_token)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-100 font-mono">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-4">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">SYSTEM ACCESS</h2>
          <p className="text-zinc-500 text-xs mt-1">AUTHORIZED PERSONNEL ONLY</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs leading-relaxed font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Username / Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.username_or_email}
                onChange={(e) => setFormData({ ...formData, username_or_email: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                placeholder="system_admin"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest">Security Key</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-widest shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Key size={16} />
            {loading ? "INITIALIZING SECURE LINK..." : "AUTHENTICATE"}
          </button>
        </form>
      </div>
    </div>
  )
}
