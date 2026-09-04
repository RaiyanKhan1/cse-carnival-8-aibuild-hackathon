import PageHeader from '../Components/PageHeader'

// ANNOUNCEMENTS PAGE PLACEHOLDER
function Announcements() {
  return (
    <>
      <PageHeader
        eyebrow="Notices"
        title="Announcements"
        subtitle="Official updates from departments and the administration."
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

export default Announcements
