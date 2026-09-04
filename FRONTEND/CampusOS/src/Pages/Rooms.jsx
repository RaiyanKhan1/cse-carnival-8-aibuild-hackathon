import PageHeader from '../Components/PageHeader'

// ROOMS PAGE PLACEHOLDER
function Rooms() {
  return (
    <>
      <PageHeader
        eyebrow="Facilities"
        title="Rooms"
        subtitle="Live availability across lecture halls, labs and study spaces."
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

export default Rooms
