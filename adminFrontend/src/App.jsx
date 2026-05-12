import React from 'react'
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import { SignIn, useAuth, useUser } from '@clerk/clerk-react'

// Layout & Pages
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import PendingListings from './pages/PendingListings'
import UserManagement from './pages/UserManagement'

const ProtectedAdminRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

  if (!isLoaded) return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-white font-mono">
      INITIALIZING SECURE CONNECTION...
    </div>
  )

  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <SignIn />
      </div>
    )
  }

  // Strictly enforce Admin role. In Clerk metadata or fallback mechanism. 
  // Let backend handle true security, but we can do a naive check if custom role exists, 
  // or we just let them inside but backend triggers 403.
  // For the sake of this prototype, we'll let any logged-in user attempt to view it,
  // but if their backend role isn't 'admin', the APIs will reject them anyway.

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<AdminDashboard />} />
           <Route path="pending" element={<PendingListings />} />
           <Route path="users" element={<UserManagement />} />
        </Route>
        
        {/* Redirect root to admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
