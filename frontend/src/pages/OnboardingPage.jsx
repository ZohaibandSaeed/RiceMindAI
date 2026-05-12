import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import api from '../lib/axios'

export default function OnboardingPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    role: 'buyer',
    username: user?.username || user?.firstName || '',
    full_name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      await api.put('/api/auth/complete-profile', formData)
      localStorage.setItem('userRole', formData.role)
      navigate(formData.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update profile. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 text-zinc-900 border-t-4 border-accent">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        <h2 className="text-3xl font-serif font-bold text-primary mb-2">Complete Your Profile</h2>
        <p className="text-zinc-500 mb-8">Tell us a little more about yourself to get started.</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold">I want to...</label>
            <div className="flex gap-4">
              <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition flex items-center justify-center gap-2 ${formData.role === 'buyer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-zinc-50'}`}>
                <input type="radio" name="role" value="buyer" checked={formData.role === 'buyer'} onChange={handleChange} className="hidden" />
                <span className="font-medium">Buy Rice</span>
              </label>
              <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition flex items-center justify-center gap-2 ${formData.role === 'seller' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-zinc-50'}`}>
                <input type="radio" name="role" value="seller" checked={formData.role === 'seller'} onChange={handleChange} className="hidden" />
                <span className="font-medium">Sell Rice</span>
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Username</label>
            <input required name="username" value={formData.username} onChange={handleChange} className="w-full p-2.5 border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <input required name="full_name" value={formData.full_name} onChange={handleChange} className="w-full p-2.5 border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Phone Number</label>
            <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="+92 300 1234567" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Address</label>
            <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full p-2.5 border rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Your business or delivery address"></textarea>
          </div>

          <button disabled={loading} type="submit" className="w-full py-3 mt-4 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-70 transition-all font-sans text-lg">
            {loading ? "Saving..." : "Start Using RiceMindAI"}
          </button>
        </form>
      </div>
    </div>
  )
}
