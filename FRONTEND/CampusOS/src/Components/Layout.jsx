import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import './Layout.css'

// APP SHELL WITH THE SIDEBAR AND THE ACTIVE PAGE
function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
