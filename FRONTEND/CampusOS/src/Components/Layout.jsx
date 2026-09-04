import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import './Layout.css'

// APP SHELL WITH THE SIDEBAR AND THE ACTIVE PAGE
function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="layout">
      <div className="layout-ambient" aria-hidden="true" />

      <Sidebar />

      <main className="layout-main">
        {/* KEYED ON THE ROUTE SO THE ENTER ANIMATION REPLAYS ON NAVIGATION */}
        <div className="layout-page" key={pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
