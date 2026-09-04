import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import './Layout.css'

// APP SHELL WITH THE SIDEBAR AND THE ACTIVE PAGE
function Layout({ user, onSignOut }) {
  const { pathname } = useLocation()

  return (
    <div className="layout">
      <div className="layout-ambient" aria-hidden="true" />

      <Sidebar onSignOut={onSignOut} user={user} />

      <div className="layout-col">
        <Topbar />

        <main className="layout-main">
          {/* KEYED ON THE ROUTE SO THE ENTER ANIMATION REPLAYS ON NAVIGATION */}
          <div className="layout-page" key={pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
