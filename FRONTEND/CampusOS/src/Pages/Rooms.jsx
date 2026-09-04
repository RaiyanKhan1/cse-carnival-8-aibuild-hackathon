import { useState } from 'react'
import PageHeader from '../Components/PageHeader'
import rooms from '../data/rooms.json'

const roomTypes = [
  { label: 'All', value: 'all' },
  { label: 'Classrooms', value: 'classroom' },
  { label: 'Labs', value: 'lab' },
  { label: 'Seminar rooms', value: 'seminar' },
]

// RETURNS ROOMS THAT MATCH THE SELECTED TYPE
function getRoomsByType(items, selectedType) {
  if (selectedType === 'all') return items

  const filteredRooms = []

  for (const room of items) {
    if (room.type === selectedType) filteredRooms.push(room)
  }

  return filteredRooms
}

// CAPITALIZES A ROOM TYPE
function formatRoomType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

// FORMATS A BOOKING TIME
function formatTime(time) {
  const [hour, minute] = time.split(':')
  const hourNumber = Number(hour)
  const displayHour = hourNumber % 12 || 12
  const period = hourNumber >= 12 ? 'PM' : 'AM'

  return displayHour + ':' + minute + ' ' + period
}

// DISPLAYS ONE ROOM TYPE FILTER
function RoomTypeButton({ option, selectedType, onSelect }) {
  // SELECTS THIS ROOM TYPE
  function handleClick() {
    onSelect(option.value)
  }

  return (
    <button
      className={'btn ' + (selectedType === option.value ? '' : 'btn-secondary')}
      onClick={handleClick}
      type="button"
    >
      {option.label}
    </button>
  )
}

// DISPLAYS ONE ROOM IN THE TABLE
function renderRoomRow(room) {
  const booking = room.bookings[0]

  return (
    <tr key={room.id}>
      <td>
        <strong>{room.room_number}</strong>
      </td>
      <td>
        <span className="badge badge-neutral">{formatRoomType(room.type)}</span>
      </td>
      <td>Floor {room.floor}</td>
      <td>{room.capacity} people</td>
      <td>{room.equipment.join(', ')}</td>
      <td>
        <span className={'badge ' + (room.status === 'available' ? 'badge-success' : 'badge-warning')}>
          {formatRoomType(room.status)}
        </span>
      </td>
      <td>
        {booking ? (
          <>
            <strong>{booking.purpose}</strong>
            <div className="card-meta">
              {booking.date}, {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </div>
          </>
        ) : (
          <span className="card-meta">No bookings</span>
        )}
      </td>
    </tr>
  )
}

// DISPLAYS ROOM AVAILABILITY AND DETAILS
function Rooms() {
  const [selectedType, setSelectedType] = useState('all')
  const visibleRooms = getRoomsByType(rooms, selectedType)

  // DISPLAYS A FILTER BUTTON FOR ONE ROOM TYPE
  function renderRoomTypeButton(option) {
    return (
      <RoomTypeButton
        key={option.value}
        onSelect={setSelectedType}
        option={option}
        selectedType={selectedType}
      />
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Facilities"
        title="Rooms"
        subtitle="Live availability across lecture halls, labs and study spaces."
      >
        <span className="badge">{visibleRooms.length} rooms</span>
      </PageHeader>

      <div className="toolbar" aria-label="Filter rooms by type">
        {/* SHOWS ONE FILTER BUTTON FOR EACH ROOM TYPE */}
        {roomTypes.map(renderRoomTypeButton)}
      </div>

      {visibleRooms.length > 0 ? (
        <div className="table-wrap">
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Equipment</th>
                  <th>Status</th>
                  <th>Booking</th>
                </tr>
              </thead>
              <tbody>
                {/* SHOWS ONE TABLE ROW FOR EACH ROOM */}
                {visibleRooms.map(renderRoomRow)}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty">
          <p className="empty-title">No rooms found</p>
          <p className="empty-text">There are no rooms for the selected type.</p>
        </div>
      )}
    </>
  )
}

export default Rooms
