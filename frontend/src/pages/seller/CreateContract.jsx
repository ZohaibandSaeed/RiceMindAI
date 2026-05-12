import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Loader2, ArrowLeft } from 'lucide-react'
import api from '../../lib/axios'

export default function CreateContract() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  
  const [form, setForm] = useState({
    delivery_days: '',
    terms: ''
  })

  useEffect(() => {
    // Fetch the order to ensure it exists and get details for the contract
    api.get('/api/orders/seller')
      .then(res => {
        const found = res.data.find(o => o.id === id)
        if (!found) {
          setError("Order not found or unauthorized")
        } else if (found.status !== 'seller_approved') {
          setError("Contract can only be created for approved orders")
        } else {
          setOrder(found)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      await api.post(`/api/contracts/order/${id}`, {
        delivery_days: parseInt(form.delivery_days),
        terms: form.terms
      })
      navigate('/seller/orders')
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create contract")
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-[#1a3d2b]" />
    </div>
  )

  if (error && !order) return (
    <div className="text-center p-10 bg-white rounded-xl border border-red-200">
      <p className="text-red-500 font-semibold">{error}</p>
      <button onClick={() => navigate('/seller/orders')} className="mt-4 text-[#1a3d2b] underline">
        Back to Orders
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/seller/orders')} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-zinc-800">Create Contract</h1>
          <p className="text-sm text-zinc-500">For Order: {order.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-zinc-500">Quantity</p>
            <p className="text-lg font-semibold text-zinc-800">{order.quantity_kg} KG</p>
          </div>
          <div>
            <p className="text-sm text-right font-medium text-zinc-500">Unit Price</p>
            <p className="text-lg text-right font-semibold text-zinc-800">PKR {order.unit_price}</p>
          </div>
          <div>
            <p className="text-sm text-right font-medium text-zinc-500">Total Amount</p>
            <p className="text-xl text-right font-bold text-[#1a3d2b]">PKR {order.total_amount}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Delivery Duration (Days)</label>
            <input 
              type="number" min="1" required
              value={form.delivery_days}
              onChange={e => setForm({...form, delivery_days: e.target.value})}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20"
              placeholder="e.g. 7"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Additional Terms (Optional)</label>
            <textarea 
              rows={4}
              value={form.terms}
              onChange={e => setForm({...form, terms: e.target.value})}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20"
              placeholder="Enter any additional conditions, shipping details, or guarantees..."
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-3 bg-[#1a3d2b] text-white font-semibold rounded-lg hover:bg-[#1a3d2b]/90 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
            Generate & Send Contract
          </button>
        </form>
      </div>
    </div>
  )
}
