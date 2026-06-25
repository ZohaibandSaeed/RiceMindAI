import React from 'react'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'

// Layout & Pages
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import PendingListings from './pages/PendingListings'
import UserManagement from './pages/UserManagement'
import PendingStockRequests from './pages/PendingStockRequests'
import DealMonitor from './pages/DealMonitor'
import AdminLogin from './pages/AdminLogin'

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminAuthToken')

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Console */}
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="pending" element={<PendingListings />} />
           <Route path="stock-requests" element={<PendingStockRequests />} />
           <Route path="deals" element={<DealMonitor />} />
           <Route path="users" element={<UserManagement />} />
        </Route>
        
        {/* Redirect root to admin dashboard */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
