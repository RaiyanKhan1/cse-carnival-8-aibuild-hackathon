import PageHeader from '../Components/PageHeader'

// ASSIGNMENTS PAGE PLACEHOLDER
function Assignments() {
  return (
    <>
      <PageHeader
        eyebrow="Coursework"
        title="Assignments"
        subtitle="Upcoming deadlines and submission status across your courses."
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

export default Assignments
