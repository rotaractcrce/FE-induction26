export default function Continuation({ onRequestAccess }) {
  return (
    <div id="scroll-intro-continuation" className="scroll-intro-continuation" hidden>

  <section className="scroll-intro-below" id="scroll-intro-below-after-cards" aria-labelledby="scroll-intro-below-leaders-heading">
    <div className="scroll-intro-below__inner">
      <h2 className="sr-only" id="scroll-intro-below-leaders-heading">Experience and leadership</h2>
      <div id="scroll-intro-below-statement-leaders" className="scroll-intro-below__statements">
        <p className="scroll-intro-below__statement">We are two design leaders who&rsquo;ve spent years leading teams and launching products used by millions. And now we&rsquo;re building our own apps, tools, and brands, and we treat each one as a way to sharpen our craft.</p>
      </div>
    </div>
  </section>

  <section className="kim-team-section" aria-labelledby="kim-team-heading" hidden>
    <h2 className="sr-only" id="kim-team-heading">Systems and experimentation</h2>
    <div className="kim-team-wall">
      <div className="kim-team-lines" aria-hidden="true">
        <div className="kim-team-line">SYSTEMS. TOOLS. CODE. AND. DESIGN.</div>
        <div className="kim-team-line">EXPERIMENTATION. PROTOTYPES. AND. PLAY.</div>
        <div className="kim-team-line">PROCESS. PRACTICE. AND. WHAT&#8217;S. NEXT.</div>
      </div>
      <div className="kim-team-note" aria-hidden="true"></div>
    </div>
  </section>

  <footer aria-label="Ouro Labs">
    <div className="wordmark-row">
      <span className="wordmark" id="wm-letters-scroll-intro">
        <svg className="wordmark-svg-physics" viewBox="0 0 2374 433" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
          <g className="wm-l"><g transform="translate(0,103)">
            <path d="M165 0C256.127 0 330 73.873 330 165C330 256.127 256.127 330 165 330C73.873 330 0 256.127 0 165C0 73.873 73.873 0 165 0ZM165 109C134.072 109 109 134.072 109 165C109 195.928 134.072 221 165 221C195.928 221 221 195.928 221 165C221 134.072 195.928 109 165 109Z" fill="currentColor"/>
          </g></g>
          <g className="wm-l"><g transform="translate(329,110.669)">
            <path d="M164.759 322.331C246.738 322.331 329.518 272.312 329.518 157.571L329.519 1.71015e-06L219.587 -1.91969e-05L219.587 157.571L219.679 157.571C219.679 187.868 195.057 212.492 164.759 212.492C134.461 212.492 109.839 187.868 109.839 157.571L109.931 157.571L109.931 -9.61051e-06L-2.8179e-05 0L-1.44037e-05 157.571C-6.44968e-06 248.555 73.7758 322.331 164.759 322.331Z" fill="currentColor"/>
          </g></g>
          <g className="wm-l"><g transform="translate(674.518,110.669) scale(1.00102795)">
            <path d="M111 322H0V0H111V322ZM184 0C214.928 0 240 25.0721 240 56C240 86.9279 214.928 112 184 112C153.072 112 128 86.9279 128 56C128 25.0721 153.072 0 184 0Z" fill="currentColor"/>
          </g></g>
          <g className="wm-l"><g transform="translate(906.7647,103)">
            <path d="M165 0C256.127 0 330 73.873 330 165C330 256.127 256.127 330 165 330C73.873 330 0 256.127 0 165C0 73.873 73.873 0 165 0ZM165 109C134.072 109 109 134.072 109 165C109 195.928 134.072 221 165 221C195.928 221 221 195.928 221 165C221 134.072 195.928 109 165 109Z" fill="currentColor"/>
          </g></g>
          <g className="wm-l"><g transform="translate(1336.7647,7)">
            <rect width="111" height="426" fill="currentColor"/>
          </g></g>
          <g className="wm-l"><g transform="translate(1447.7647,103)">
            <path d="M165 0C256.127 0 330 73.873 330 165C330 165.334 329.995 165.667 329.993 166H330V323H212.691C197.593 327.551 181.582 330 165 330C73.873 330 0 256.127 0 165C0 73.873 73.873 0 165 0ZM165 109C134.072 109 109 134.072 109 165C109 195.928 134.072 221 165 221C195.928 221 221 195.928 221 165C221 134.072 195.928 109 165 109Z" fill="currentColor"/>
          </g></g>
          <g className="wm-l"><g transform="translate(1773.7647,0)">
            <path d="M111 112.041C127.92 106.184 146.088 103 165 103C256.127 103 330 176.873 330 268C330 359.127 256.127 433 165 433C74.2066 433 0 359.667 0 269H0V0H111V112.041ZM165 212C134.072 212 109 237.072 109 268C109 298.928 134.072 324 165 324C195.928 324 221 298.928 221 268C221 237.072 195.928 212 165 212Z" fill="currentColor"/>
          </g></g>
          <g className="wm-l"><g transform="translate(2068.7647,102)">
            <path d="M298.958 65.666C277.492 27.1351 229.441 0 163.896 0C132.18 0 99.5579 6.11249 73.1309 22.8223C44.5649 40.8846 25.0146 70.7029 25.0146 108.689C25.0148 146.896 44.7452 176.559 73.8867 194.157C100.358 210.143 149.779 213.5 164.779 214C179.779 214.5 193.059 215 192.779 226C192.5 237 169.935 242.085 132.279 231C96 220.32 87.5586 208.846 87.5586 208.846L0 257.154C16.1188 286.37 45.5592 304.157 71.9346 314.452C99.7317 325.303 131.996 331 163.896 331C196.479 331 229.579 324.144 256.269 307.058C284.516 288.973 305.279 259.024 305.279 220.198C305.279 180.013 283.016 150.869 253.286 134.623C226.532 120.004 188 116 163.896 115.5C139.793 115 126 112 126 104C126 96 133 93.5 154 94.5C193.036 96.3588 212.063 115.165 211.601 114.334L298.958 65.666Z" fill="currentColor"/>
          </g></g>
        </svg>
        <canvas id="wm-vid-canvas-scroll-intro" width="300" height="150" aria-hidden="true"></canvas>
      </span>
      <hr className="wordmark-footer-hairline" aria-hidden="true" />
      <nav className="wordmark-footer-nav" aria-label="Site links">
        <span className="wordmark-footer-start">
          <button type="button" className="wl-footer-btn" onClick={onRequestAccess}>Join the waiting list</button>
          <a href="#studio">Studio</a>
          <a href="#projects">Projects</a>
          <a href="mailto:rotaractcrce@gmail.com">Contact</a>
          <a href="https://www.linkedin.com/company/ouro-labs/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </span>
        <span className="wordmark-footer-copyright">&copy; 2026</span>
      </nav>
    </div>
  </footer>

</div>
  );
}
