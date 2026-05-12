import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import api from './lib/axios'

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

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import BrowseListings from './pages/buyer/BrowseListings'
import ListingDetail from './pages/buyer/ListingDetail'
import BuyerOrders from './pages/buyer/BuyerOrders'
import BuyerWallet from './pages/buyer/BuyerWallet'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (!isSignedIn) return <Navigate to="/" replace />
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
  const { user, isLoaded, isSignedIn } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        setIsSyncing(true)
        try {
          const clerkData = {
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username || user.firstName,
            full_name: `${user.firstName} ${user.lastName}`,
          }
          const token = await getToken()
          const { data } = await api.post('/api/auth/sync', clerkData, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          localStorage.setItem('userRole', data.role)

          if (!data.profile_complete) {
            navigate('/onboarding')
          } else {
            if (window.location.pathname === '/' || window.location.pathname.includes('buyer') && data.role === 'seller' || window.location.pathname.includes('seller') && data.role === 'buyer') {
              navigate(data.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard')
            }
          }
        } catch (error) {
          console.error("Failed to sync user:", error)
        } finally {
          setIsSyncing(false)
        }
      }
    }

    if (isLoaded) {
      window.Clerk = { session: { getToken } }
      syncUser()
    }
  }, [isLoaded, isSignedIn, user, navigate, getToken])

  if (!isLoaded || isSyncing) return (
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
      </Route>

      {/* Buyer Routes */}
      <Route path="/buyer" element={<ProtectedRoute><RoleGuard allowedRole="buyer"><BuyerLayout /></RoleGuard></ProtectedRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<BuyerDashboard />} />
        <Route path="browse" element={<BrowseListings />} />
        <Route path="listing/:id" element={<ListingDetail />} />
        <Route path="orders" element={<BuyerOrders />} />
        <Route path="wallet" element={<BuyerWallet />} />
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
