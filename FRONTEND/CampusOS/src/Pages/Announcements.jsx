import PageHeader from '../Components/PageHeader'
import announcements from '../data/announcements.json'
import { dayName, daysUntil, monthYear, parseDate, relativeDay, shortDate } from '../lib/dates'
import './Announcements.css'

// HOW EACH priority VALUE FROM THE SCHEMA IS LABELLED AND COLOURED
const PRIORITY = {
  high: { label: 'High', className: 'badge badge-danger', rank: 0 },
  medium: { label: 'Medium', className: 'badge badge-warning', rank: 1 },
  low: { label: 'Low', className: 'badge badge-neutral', rank: 2 },
}

const priorityOf = (value) => PRIORITY[value] ?? PRIORITY.low

// A notice is stale once its expiry date has passed (schema: `expires`).
const isExpired = (announcement) =>
  Boolean(announcement.expires) && daysUntil(announcement.expires) < 0

// NEWEST FIRST — A NOTICE BOARD READS TOP-DOWN FROM THE MOST RECENT POST.
// SAME-DAY NOTICES FALL BACK TO PRIORITY SO URGENT ONES LEAD THE DAY.
function sortNewestFirst(list) {
  return [...list].sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      priorityOf(a.priority).rank - priorityOf(b.priority).rank,
  )
}

// COLLAPSE THE SORTED LIST INTO ONE SECTION PER DAY POSTED
function groupByDay(sorted) {
  const days = []
  for (const item of sorted) {
    const current = days.at(-1)
    if (current && current.date === item.date) current.items.push(item)
    else days.push({ date: item.date, items: [item] })
  }
  return days
}

// TURNS THE expires DATE INTO SOMETHING WORTH READING AT A GLANCE
function expiryLabel(expires) {
  if (!expires) return null
  const days = daysUntil(expires)
  if (days < 0) return `Expired ${shortDate(expires)}`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  if (days <= 7) return `Expires in ${days} days`
  return `Expires ${shortDate(expires)}`
}

// ANNOUNCEMENTS PAGE, NEWEST POSTS FIRST
function Announcements() {
  const active = sortNewestFirst(announcements.filter((a) => !isExpired(a)))
  const expired = sortNewestFirst(announcements.filter(isExpired))
  const highCount = active.filter((a) => a.priority === 'high').length

  if (!announcements.length) {
    return (
      <>
        <AnnouncementsHeader count={0} highCount={0} />
        <div className="empty">
          <p className="empty-title">Nothing posted yet</p>
          <p className="empty-text">
            Notices from departments and the administration will appear here.
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <AnnouncementsHeader count={active.length} highCount={highCount} />

      <div className="ann-days">
        {groupByDay(active).map((day) => (
          <section className="ann-day" key={day.date}>
            <DayHeading date={day.date} />
            <ul className="ann-list stagger">
              {day.items.map((item, i) => (
                <AnnouncementCard key={item.id} announcement={item} index={i} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {expired.length > 0 && (
        <section className="ann-expired">
          <h2 className="section-title">
            Expired · {expired.length}
          </h2>
          <ul className="ann-list">
            {expired.map((item, i) => (
              <AnnouncementCard key={item.id} announcement={item} index={i} expired />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function AnnouncementsHeader({ count, highCount }) {
  return (
    <PageHeader
      eyebrow="Notices"
      title="Announcements"
      subtitle="Official updates from departments and the administration."
    >
      <div className="ann-header-badges">
        {highCount > 0 && (
          <span className="badge badge-danger">{highCount} high priority</span>
        )}
        <span className="badge badge-neutral">
          {count} active
        </span>
      </div>
    </PageHeader>
  )
}

function DayHeading({ date }) {
  const relative = relativeDay(date)

  return (
    <header className="day-head">
      <div className="day-chip">
        <span className="day-num">{parseDate(date).getDate()}</span>
        <span className="day-mon">
          {parseDate(date).toLocaleDateString(undefined, { month: 'short' })}
        </span>
      </div>

      <div className="day-label">
        <span className="day-name">{relative ?? dayName(date)}</span>
        <span className="day-sub">
          {relative ? `${dayName(date)}, ${monthYear(date)}` : monthYear(date)}
        </span>
      </div>
    </header>
  )
}

function AnnouncementCard({ announcement, index, expired = false }) {
  const { title, body, priority, posted_by, expires } = announcement
  const badge = priorityOf(priority)
  const expiry = expiryLabel(expires)

  return (
    <li
      className={`card ann-card ann-${priority}${expired ? ' is-expired' : ''}`}
      style={{ '--i': index }}
    >
      <div className="ann-head">
        <h3 className="card-title">{title}</h3>
        <div className="ann-tags">
          {expired && <span className="badge badge-neutral">Expired</span>}
          <span className={badge.className}>{badge.label}</span>
        </div>
      </div>

      <p className="ann-body">{body}</p>

      <footer className="ann-meta">
        <span className="meta-item">
          <Icon name="user" />
          {posted_by}
        </span>
        {expiry && (
          <span className={`meta-item${!expired && daysUntil(expires) <= 1 ? ' is-soon' : ''}`}>
            <Icon name="clock" />
            {expiry}
          </span>
        )}
      </footer>
    </li>
  )
}

const ICONS = {
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2',
}

function Icon({ name }) {
  return (
    <svg className="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

export default Announcements
