export default function ContentInfo() {
  return (
    <div className="landing-card-content">
      <div className="version">0.0.1</div>
      <div className="logo">
        <img src="/app/landing-card/logo.svg" alt="desktop.fm slime logo" />
      </div>
      <div className="landing-card-title">Desktop.fm</div>
      <div className="paragraph">
        {' '}
        Virtual interhuman connection<br />through sound and visuals{' '}
      </div>
      <div className="pill">http://desktop.fm</div>
    </div>
  )
}