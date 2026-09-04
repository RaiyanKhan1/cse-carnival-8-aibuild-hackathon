// SHARED PAGE TITLE BLOCK SO EVERY SECTION OPENS THE SAME WAY
function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      {/* OPTIONAL ACTIONS ON THE RIGHT, E.G. FILTERS OR BUTTONS */}
      {children}
    </header>
  )
}

export default PageHeader
