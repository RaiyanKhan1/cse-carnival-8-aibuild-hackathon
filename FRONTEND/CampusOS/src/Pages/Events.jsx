import PageHeader from '../Components/PageHeader'
import events from '../data/events.json'
import {
  dayName,
  formatTime,
  monthYear,
  parseDate,
  shortDate,
  todayIso,
} from '../lib/dates'
import './Events.css'

// HOW EACH status VALUE FROM THE SCHEMA IS LABELLED AND COLOURED
const STATUS = {
  upcoming: { label: 'Upcoming', className: 'badge' },
  ongoing: { label: 'Ongoing', className: 'badge badge-success' },
  completed: { label: 'Completed', className: 'badge badge-neutral' },
  cancelled: { label: 'Cancelled', className: 'badge badge-danger' },
  full: { label: 'Full', className: 'badge badge-warning' },
}

// CHRONOLOGICAL ORDER: BY DATE, THEN BY START TIME WITHIN A DAY.
// ISO DATE AND 24H TIME STRINGS BOTH SORT CORRECTLY AS PLAIN TEXT.
function sortByDate(list) {
  return [...list].sort(
    (a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time),
  )
}

// COLLAPSE THE SORTED LIST INTO ONE SECTION PER CALENDAR DAY
function groupByDay(sorted) {
  const days = []
  for (const event of sorted) {
    const current = days.at(-1)
    if (current && current.date === event.date) current.events.push(event)
    else days.push({ date: event.date, events: [event] })
  }
  return days
}

// EVENTS PAGE, ORDERED BY DATE
function Events() {
  const days = groupByDay(sortByDate(events))
  const today = todayIso()

  if (!events.length) {
    return (
      <>
        <EventsHeader count={0} />
        <div className="empty">
          <p className="empty-title">No events scheduled</p>
          <p className="empty-text">Anything added to the calendar will show up here.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <EventsHeader count={events.length} />

      <div className="event-days">
        {days.map((day) => (
          <section className="event-day" key={day.date}>
            <header className="day-head">
              <div className="day-chip">
                <span className="day-num">{parseDate(day.date).getDate()}</span>
                <span className="day-mon">
                  {parseDate(day.date).toLocaleDateString(undefined, { month: 'short' })}
                </span>
              </div>

              <div className="day-label">
                <span className="day-name">{dayName(day.date)}</span>
                <span className="day-sub">{monthYear(day.date)}</span>
              </div>

              {day.date === today && <span className="badge badge-info">Today</span>}
            </header>

            <ul className="event-list stagger">
              {day.events.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}

function EventsHeader({ count }) {
  return (
    <PageHeader
      eyebrow="Campus life"
      title="Events"
      subtitle="What is happening on campus today and in the weeks ahead."
    >
      <span className="badge badge-neutral">
        {count} {count === 1 ? 'event' : 'events'}
      </span>
    </PageHeader>
  )
}

function EventCard({ event, index }) {
  const {
    name,
    description,
    date,
    start_time,
    end_time,
    end_date,
    venue,
    organizer,
    capacity,
    registered,
    status,
  } = event

  const badge = STATUS[status] ?? STATUS.upcoming
  const multiDay = end_date && end_date !== date

  // Guard against a capacity of 0 so the bar never divides by zero.
  const filled = capacity > 0 ? Math.min(registered / capacity, 1) : 0
  const seatsLeft = Math.max(capacity - registered, 0)
  const fillLevel = filled >= 1 ? 'is-full' : filled >= 0.8 ? 'is-tight' : ''

  return (
    <li className="card card-interactive event-card" style={{ '--i': index }}>
      <div className="event-time">
        <span className="time-start">{formatTime(start_time)}</span>
        <span className="time-end">
          {multiDay ? `→ ${shortDate(end_date)}, ${formatTime(end_time)}` : formatTime(end_time)}
        </span>
      </div>

      <div className="event-main">
        <div className="event-title-row">
          <h3 className="card-title">{name}</h3>
          <span className={badge.className}>{badge.label}</span>
        </div>

        <p className="event-desc">{description}</p>

        <div className="event-meta">
          <span className="meta-item">
            <Icon name="pin" />
            Room {venue}
          </span>
          <span className="meta-item">
            <Icon name="user" />
            {organizer}
          </span>
          {multiDay && (
            <span className="meta-item">
              <Icon name="clock" />
              Runs to {shortDate(end_date)}
            </span>
          )}
        </div>
      </div>

      <div className="event-seats">
        <div className={`seat-bar ${fillLevel}`}>
          <span style={{ width: `${filled * 100}%` }} />
        </div>
        <span className="seat-text">
          <strong>{registered}</strong> / {capacity}
          <span className="seat-left">
            {seatsLeft > 0 ? `${seatsLeft} left` : 'No seats left'}
          </span>
        </span>
      </div>
    </li>
  )
}

const ICONS = {
  pin: 'M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z M12 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
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

export default Events
