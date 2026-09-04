import PageHeader from '../Components/PageHeader'
import assignments from '../data/assignments.json'
import { daysUntil, parseDate, shortDate } from '../lib/dates'
import './Assignments.css'

// HOW EACH status VALUE FROM THE SCHEMA IS LABELLED AND COLOURED
const STATUS = {
  pending: { label: 'Pending', className: 'badge' },
  submitted: { label: 'Submitted', className: 'badge badge-success' },
  graded: { label: 'Graded', className: 'badge badge-info' },
  late: { label: 'Overdue', className: 'badge badge-danger' },
}

const DONE = ['submitted', 'graded']

/**
 * A pending assignment whose deadline has passed is overdue, even though the
 * data still says "pending" — the schema's own `late` status is what that is.
 */
function effectiveStatus(assignment) {
  if (DONE.includes(assignment.status)) return assignment.status
  return daysUntil(assignment.deadline) < 0 ? 'late' : 'pending'
}

const isDone = (assignment) => DONE.includes(assignment.status)

// HOW CLOSE THE DEADLINE IS, IN WORDS
function deadlineLabel(deadline) {
  const days = daysUntil(deadline)
  if (days < 0) return `Overdue by ${Math.abs(days)} day${days === -1 ? '' : 's'}`
  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'
  if (days <= 7) return `${days} days left`
  return `Due ${shortDate(deadline)}`
}

// DRIVES THE COLOUR OF THE DEADLINE CHIP AND COUNTDOWN
function urgencyOf(assignment) {
  if (isDone(assignment)) return 'is-done'
  const days = daysUntil(assignment.deadline)
  if (days < 0) return 'is-overdue'
  if (days <= 1) return 'is-urgent'
  if (days <= 3) return 'is-soon'
  return ''
}

// SOONEST DEADLINE FIRST — THE NEXT THING DUE SHOULD BE THE FIRST THING SEEN
const byDeadlineAsc = (a, b) => a.deadline.localeCompare(b.deadline)
// MOST RECENTLY DUE FIRST, SO FINISHED WORK READS NEWEST-DOWN
const byDeadlineDesc = (a, b) => b.deadline.localeCompare(a.deadline)

// ASSIGNMENTS PAGE, ORDERED BY DEADLINE
function Assignments() {
  const outstanding = assignments.filter((a) => !isDone(a)).sort(byDeadlineAsc)
  const completed = assignments.filter(isDone).sort(byDeadlineDesc)

  const overdueCount = outstanding.filter((a) => daysUntil(a.deadline) < 0).length
  const marksAtStake = outstanding.reduce((sum, a) => sum + (a.marks ?? 0), 0)

  if (!assignments.length) {
    return (
      <>
        <AssignmentsHeader outstanding={0} overdue={0} marks={0} />
        <div className="empty">
          <p className="empty-title">Nothing due</p>
          <p className="empty-text">Assignments set by your courses will appear here.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <AssignmentsHeader
        outstanding={outstanding.length}
        overdue={overdueCount}
        marks={marksAtStake}
      />

      {outstanding.length > 0 ? (
        <ul className="asgn-list stagger">
          {outstanding.map((assignment, i) => (
            <AssignmentCard key={assignment.id} assignment={assignment} index={i} />
          ))}
        </ul>
      ) : (
        <div className="empty">
          <p className="empty-title">All caught up</p>
          <p className="empty-text">Nothing outstanding — every assignment is submitted.</p>
        </div>
      )}

      {completed.length > 0 && (
        <section className="asgn-done">
          <h2 className="section-title">Completed · {completed.length}</h2>
          <ul className="asgn-list">
            {completed.map((assignment, i) => (
              <AssignmentCard key={assignment.id} assignment={assignment} index={i} />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function AssignmentsHeader({ outstanding, overdue, marks }) {
  return (
    <PageHeader
      eyebrow="Coursework"
      title="Assignments"
      subtitle="Upcoming deadlines and submission status across your courses."
    >
      <div className="asgn-header-badges">
        {overdue > 0 && <span className="badge badge-danger">{overdue} overdue</span>}
        <span className="badge badge-neutral">{outstanding} outstanding</span>
        {marks > 0 && <span className="badge">{marks} marks at stake</span>}
      </div>
    </PageHeader>
  )
}

function AssignmentCard({ assignment, index }) {
  const {
    course,
    course_title,
    title,
    description,
    assigned_date,
    deadline,
    submission_platform,
    marks,
  } = assignment

  const status = STATUS[effectiveStatus(assignment)] ?? STATUS.pending
  const urgency = urgencyOf(assignment)
  const due = parseDate(deadline)

  return (
    <li className={`card card-interactive asgn-card ${urgency}`} style={{ '--i': index }}>
      <div className="asgn-due">
        <div className="day-chip">
          <span className="day-num">{due.getDate()}</span>
          <span className="day-mon">
            {due.toLocaleDateString(undefined, { month: 'short' })}
          </span>
        </div>
        <span className="due-label">
          {isDone(assignment) ? `Was due ${shortDate(deadline)}` : deadlineLabel(deadline)}
        </span>
      </div>

      <div className="asgn-main">
        <p className="asgn-course">
          <span className="course-code">{course}</span>
          <span className="course-title">{course_title}</span>
        </p>

        <div className="asgn-title-row">
          <h3 className="card-title">{title}</h3>
          <span className={status.className}>{status.label}</span>
        </div>

        <p className="asgn-desc">{description}</p>

        <div className="asgn-meta">
          <span className="meta-item">
            <Icon name="upload" />
            {submission_platform}
          </span>
          <span className="meta-item">
            <Icon name="calendar" />
            Assigned {shortDate(assigned_date)}
          </span>
        </div>
      </div>

      <div className="asgn-marks">
        <span className="marks-value">{marks}</span>
        <span className="marks-label">marks</span>
      </div>
    </li>
  )
}

const ICONS = {
  upload: 'M12 15V4M8 8l4-4 4 4 M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
}

function Icon({ name }) {
  return (
    <svg className="meta-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  )
}

export default Assignments
