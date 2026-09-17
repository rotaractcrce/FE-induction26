export default function CustomCursor() {
  return (
    <div className="custom-cursor" id="custom-cursor-root" aria-hidden="true">
  <canvas className="custom-cursor__ring" id="custom-cursor-ring-canvas" width="64" height="64" aria-hidden="true"></canvas>
  <div className="custom-cursor__dot"></div>
  <svg className="custom-cursor__arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M4 12h10M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>
  );
}
