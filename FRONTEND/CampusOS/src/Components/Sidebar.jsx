import { NavLink } from 'react-router-dom'
import './Sidebar.css'

// NAV ITEMS SHOWN IN THE SIDEBAR
const navItems = [
  { to: '/schedule', label: 'Class Schedule', icon: 'calendar' },
  { to: '/rooms', label: 'Rooms', icon: 'door' },
  { to: '/events', label: 'Events', icon: 'star' },
  { to: '/announcements', label: 'Announcements', icon: 'bell' },
  { to: '/assignments', label: 'Assignments', icon: 'file' },
]

// SIMPLE STROKE ICON PATHS KEYED BY NAME
const iconPaths = {
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  door: 'M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17M3 21h18M13 12h.5',
  star: 'M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z',
  bell: 'M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6M10.5 20a1.8 1.8 0 0 0 3 0',
  file: 'M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h4',
}

// RENDERS A SMALL LINE ICON BY NAME
function Icon({ name }) {
  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[name]} />
    </svg>
  )
}

// SIDE NAVIGATION BAR WITH THE FIVE MAIN SECTIONS
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">CampusOS</div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className="nav-link">
          <Icon name="grid" />
          <span>Dashboard</span>
        </NavLink>

        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className="nav-link">
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
