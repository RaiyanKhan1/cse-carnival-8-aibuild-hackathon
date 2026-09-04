import PageHeader from '../Components/PageHeader'

// CLASS SCHEDULE PAGE PLACEHOLDER
function ClassSchedule() {
  return (
    <>
      <PageHeader
        eyebrow="Timetable"
        title="Class Schedule"
        subtitle="Every class, room and instructor for the current term."
      />

      <div className="empty">
        <p className="empty-title">Nothing here yet</p>
        <p className="empty-text">
          This section is wired up and waiting on its data view.
        </p>
      </div>
    </>
  )
}

export default ClassSchedule
