import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'

// Layouts
import SellerLayout from './components/layout/SellerLayout'
import BuyerLayout from './components/layout/BuyerLayout'

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard'
import CreateListing from './pages/seller/CreateListing'
import MyListings from './pages/seller/MyListings'
import SellerOrders from './pages/seller/SellerOrders'
import SellerWallet from './pages/seller/SellerWallet'
import CreateContract from './pages/seller/CreateContract'
import SellerTracker from './pages/seller/SellerTracker'

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import BrowseListings from './pages/buyer/BrowseListings'
import ListingDetail from './pages/buyer/ListingDetail'
import BuyerOrders from './pages/buyer/BuyerOrders'
import BuyerWallet from './pages/buyer/BuyerWallet'
import BuyerTracker from './pages/buyer/BuyerTracker'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center font-semibold text-[#1a3d2b]">Loading...</div>
  if (!token) return <Navigate to="/" replace />
  return children
}

// Role Guard ensuring strictly buyer/seller isolation
const RoleGuard = ({ allowedRole, children }) => {
  const role = localStorage.getItem('userRole')
  // Automatically redirect them to their rightful place
  if (role && role !== allowedRole && role !== 'pending') {
    return <Navigate to={`/${role === 'admin' ? 'buyer' : role}/dashboard`} replace />
  }
  return children
}

function AppRoutes() {
  const { user, token, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && user) {
      if (!user.profile_complete) {
        navigate('/onboarding')
      } else {
        if (window.location.pathname === '/' || (window.location.pathname.includes('buyer') && user.role === 'seller') || (window.location.pathname.includes('seller') && user.role === 'buyer')) {
          navigate(user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard')
        }
      }
    }
  }, [token, user, navigate])

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-semibold text-[#1a3d2b]">
      Loading RiceMindAI...
    </div>
  )

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Onboarding */}
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      {/* Seller Routes */}
      <Route path="/seller" element={<ProtectedRoute><RoleGuard allowedRole="seller"><SellerLayout /></RoleGuard></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="create-listing" element={<CreateListing />} />
        <Route path="my-listings" element={<MyListings />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="orders/:id/create-contract" element={<CreateContract />} />
        <Route path="wallet" element={<SellerWallet />} />
        <Route path="tracker" element={<SellerTracker />} />
      </Route>

      {/* Buyer Routes */}
      <Route path="/buyer" element={<ProtectedRoute><RoleGuard allowedRole="buyer"><BuyerLayout /></RoleGuard></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="browse" element={<BrowseListings />} />
        <Route path="listing/:id" element={<ListingDetail />} />
        <Route path="orders" element={<BuyerOrders />} />
        <Route path="wallet" element={<BuyerWallet />} />
        <Route path="tracker" element={<BuyerTracker />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
