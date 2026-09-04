import { Link } from 'react-router-dom'
import PageHeader from '../Components/PageHeader'
import PromptBar from '../Components/PromptBar'
import rooms from '../data/rooms.json'
import events from '../data/events.json'
import schedules from '../data/schedules.json'
import assignments from '../data/assignments.json'
import announcements from '../data/announcements.json'

// AT-A-GLANCE COUNTS PULLED STRAIGHT FROM THE SEED DATA
const stats = [
  {
    label: 'Rooms free',
    value: rooms.filter((r) => r.status === 'available').length,
    of: rooms.length,
    to: '/rooms',
  },
  { label: 'Classes this week', value: schedules.length, to: '/schedule' },
  { label: 'Upcoming events', value: events.length, to: '/events' },
  { label: 'Open assignments', value: assignments.length, to: '/assignments' },
]

// DASHBOARD LANDING PAGE
function Home() {
  const urgent = announcements.filter((a) => a.priority === 'high').length

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Good to see you"
        subtitle="Everything happening across campus right now, in one place."
      >
        <Link className="btn" to="/announcements">
          View announcements
          {urgent > 0 && <span className="badge badge-danger">{urgent}</span>}
        </Link>
      </PageHeader>

      <PromptBar />

      <h2 className="section-title">Today at a glance</h2>

      <div className="grid stagger">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            to={s.to}
            className="card card-interactive stat"
            style={{ '--i': i, textDecoration: 'none' }}
          >
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">
              {s.value}
              {s.of != null && (
                <span className="card-meta"> / {s.of}</span>
              )}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}

export default Home
