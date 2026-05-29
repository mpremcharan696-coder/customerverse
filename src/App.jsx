import { Routes, Route, useLocation } from 'react-router-dom'
import CanvasContainer from './components/CanvasContainer'
import LandingPage from './pages/LandingPage'
import PortalSelection from './pages/PortalSelection'
import CustomerLoginPage from './pages/CustomerLoginPage'
import DashboardPage from './pages/DashboardPage'
import StoreSearchPage from './pages/StoreSearchPage'
import StorefrontPage from './pages/StorefrontPage'

export default function App() {
  const location = useLocation()

  // Show 3D background only on these routes
  const showCanvas = ['/', '/portals', '/login'].includes(location.pathname)
  const isPortals  = location.pathname === '/portals' || location.pathname === '/login'

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-white">
      {/* Persistent morphing 3D background (hidden on dashboard/stores) */}
      {showCanvas && <CanvasContainer isPortals={isPortals} />}

      {/* Page Routing */}
      <div className="relative z-10 w-full min-h-screen">
        <Routes>
          <Route path="/"               element={<LandingPage />} />
          <Route path="/portals"        element={<PortalSelection />} />
          <Route path="/login"          element={<CustomerLoginPage />} />
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/search-stores"  element={<StoreSearchPage />} />
          <Route path="/store/:storeId" element={<StorefrontPage />} />
        </Routes>
      </div>
    </div>
  )
}
