import PageHeader from '../Components/PageHeader'

// EVENTS PAGE PLACEHOLDER
function Events() {
  return (
    <>
      <PageHeader
        eyebrow="Campus life"
        title="Events"
        subtitle="What is happening on campus today and in the weeks ahead."
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

export default Events
