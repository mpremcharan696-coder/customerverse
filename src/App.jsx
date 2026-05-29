import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import CanvasContainer from './components/CanvasContainer'
import SplashCursor from './components/SplashCursor'
import LandingPage from './pages/LandingPage'
import PortalSelection from './pages/PortalSelection'
import CustomerLoginPage from './pages/CustomerLoginPage'
import DashboardPage from './pages/DashboardPage'
import StoreSearchPage from './pages/StoreSearchPage'
import StorefrontPage from './pages/StorefrontPage'

// Auth Guard Component
function AuthGuard({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-display tracking-widest uppercase">Loading Auth Status…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  const location = useLocation()

  // Show 3D background on landing + login pages
  const showCanvas = ['/', '/login'].includes(location.pathname)
  const isPortals  = location.pathname === '/login'

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-white">
      {/* Dynamic Liquid Fluid Splash Cursor */}
      <SplashCursor />

      {/* 3D background */}
      {showCanvas && <CanvasContainer isPortals={isPortals} />}

      {/* Page Routing */}
      <div className="relative z-10 w-full min-h-screen">
        <Routes>
          {/* Public: Landing page — "Get Started" button goes to /login */}
          <Route path="/"               element={<LandingPage />} />
          <Route path="/portals"        element={<Navigate to="/login" replace />} />
          <Route path="/login"          element={<CustomerLoginPage />} />
          
          {/* Protected Routes (Require Login) */}
          <Route path="/dashboard"      element={<AuthGuard><DashboardPage /></AuthGuard>} />
          <Route path="/search-stores"  element={<AuthGuard><StoreSearchPage /></AuthGuard>} />
          <Route path="/store/:storeId" element={<AuthGuard><StorefrontPage /></AuthGuard>} />
        </Routes>
      </div>
    </div>
  )
}
