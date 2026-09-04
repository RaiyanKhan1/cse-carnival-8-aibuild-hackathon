import { useState } from 'react'
import PageHeader from '../Components/PageHeader'
import schedules from '../data/schedules.json'

const days = ['All', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']

// FORMATS A SCHEDULE TIME FOR DISPLAY
function formatTime(time) {
  const [hour, minute] = time.split(':')
  const hourNumber = Number(hour)
  const displayHour = hourNumber % 12 || 12
  const period = hourNumber >= 12 ? 'PM' : 'AM'

  return displayHour + ':' + minute + ' ' + period
}

// RETURNS THE CLASSES FOR THE SELECTED DAY
function getSchedulesForDay(items, selectedDay) {
  if (selectedDay === 'All') return items

  const filteredSchedules = []

  for (const item of items) {
    if (item.day === selectedDay) filteredSchedules.push(item)
  }

  return filteredSchedules
}

// DISPLAYS ONE DAY FILTER BUTTON
function DayButton({ day, selectedDay, onSelect }) {
  // SELECTS THIS DAY
  function handleClick() {
    onSelect(day)
  }

  return (
    <button
      className={'btn ' + (selectedDay === day ? '' : 'btn-secondary')}
      onClick={handleClick}
      type="button"
    >
      {day}
    </button>
  )
}

// DISPLAYS ONE CLASS IN THE SCHEDULE TABLE
function renderScheduleRow(schedule) {
  return (
    <tr key={schedule.id}>
      <td>
        <span className="badge badge-neutral">{schedule.day}</span>
      </td>
      <td>
        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
      </td>
      <td>
        <strong>{schedule.course}</strong>
      </td>
      <td>{schedule.title}</td>
      <td>{schedule.room}</td>
      <td>{schedule.instructor}</td>
      <td>{schedule.section}</td>
    </tr>
  )
}

// DISPLAYS THE WEEKLY CLASS SCHEDULE
function ClassSchedule() {
  const [selectedDay, setSelectedDay] = useState('All')
  const visibleSchedules = getSchedulesForDay(schedules, selectedDay)

  // DISPLAYS A FILTER FOR ONE DAY
  function renderDayButton(day) {
    return (
      <DayButton
        day={day}
        key={day}
        onSelect={setSelectedDay}
        selectedDay={selectedDay}
      />
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Timetable"
        title="Class Schedule"
        subtitle="Every class, room and instructor for the current term."
      >
        <span className="badge">{visibleSchedules.length} classes</span>
      </PageHeader>

      <div className="toolbar" aria-label="Filter schedule by day">
        {/* SHOWS ONE FILTER BUTTON FOR EACH CLASS DAY */}
        {days.map(renderDayButton)}
      </div>

      {visibleSchedules.length > 0 ? (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Class</th>
                  <th>Room</th>
                  <th>Instructor</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {/* SHOWS ONE TABLE ROW FOR EACH SCHEDULE ENTRY */}
                {visibleSchedules.map(renderScheduleRow)}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty">
          <p className="empty-title">No classes scheduled</p>
          <p className="empty-text">There are no classes for the selected day.</p>
        </div>
      )}
    </>
  )
}

export default ClassSchedule
