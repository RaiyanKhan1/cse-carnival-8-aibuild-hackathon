import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import announcements from '../data/announcements.json'
import { currentUser, initialsOf } from '../lib/currentUser'
import { daysUntil } from '../lib/dates'
import './Topbar.css'

// UNREAD = HIGH PRIORITY NOTICES THAT HAVE NOT EXPIRED YET
function unreadCount() {
  return announcements.filter(
    (a) => a.priority === 'high' && (!a.expires || daysUntil(a.expires) >= 0),
  ).length
}

// TOP PANEL: TODAY'S DATE, NOTIFICATIONS, AND THE PROFILE BUTTON
function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()

  const unread = unreadCount()
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  // CLOSE ON OUTSIDE CLICK OR ESCAPE
  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(e) {
      if (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return
      setMenuOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  function go(to) {
    setMenuOpen(false)
    navigate(to)
  }

  return (
    <header className="topbar">
      <p className="topbar-date">{today}</p>

      <div className="topbar-actions">
        <Link
          to="/announcements"
          className="icon-button"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : 'Notifications, none unread'
          }
        >
          <svg viewBox="0 0 24 24" className="icon-button-glyph" aria-hidden="true">
            <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6M10.5 20a1.8 1.8 0 0 0 3 0" />
          </svg>
          {unread > 0 && <span className="notif-dot" aria-hidden="true" />}
        </Link>

        <div className="profile">
          <button
            ref={buttonRef}
            type="button"
            className="profile-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar />
            <span className="profile-name">{currentUser.name}</span>
            <svg viewBox="0 0 24 24" className="profile-caret" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {menuOpen && (
            <div className="profile-menu" ref={menuRef} role="menu">
              <div className="profile-menu-head">
                <Avatar large />
                <div className="profile-menu-id">
                  <span className="profile-menu-name">{currentUser.name}</span>
                  <span className="profile-menu-sub">{currentUser.studentId}</span>
                  <span className="profile-menu-sub">{currentUser.program}</span>
                </div>
              </div>

              <div className="profile-menu-group">
                <button
                  type="button"
                  role="menuitem"
                  className="profile-menu-item"
                  onClick={() => go('/assignments')}
                >
                  My assignments
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="profile-menu-item"
                  onClick={() => go('/events')}
                >
                  My events
                </button>
              </div>

              <div className="profile-menu-group">
                {/* TODO: wire up once auth exists. */}
                <button
                  type="button"
                  role="menuitem"
                  className="profile-menu-item is-danger"
                  disabled
                  title="Sign-in is not wired up yet"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// PHOTO IF THERE IS ONE, INITIALS OTHERWISE
function Avatar({ large = false }) {
  const className = `avatar${large ? ' avatar-lg' : ''}`

  if (currentUser.avatarUrl) {
    return <img className={className} src={currentUser.avatarUrl} alt="" />
  }

  return (
    <span className={className} aria-hidden="true">
      {initialsOf(currentUser.name)}
    </span>
  )
}

export default Topbar
