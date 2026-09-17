export default function Stage() {
  return (
    <>
      <svg className="third-act-svg-defs" width="0" height="0" aria-hidden="true" focusable="false">
  <defs>
    <clipPath id="third-act-o-clip" clipPathUnits="objectBoundingBox">
      <path clipRule="evenodd" transform="scale(0.001362398092165588)" d="M366.999 0C569.687 6.59744e-05 733.998 164.313 733.998 367.002C733.998 569.691 569.687 734.003 366.999 734.003C164.311 734.003 6.76819e-05 569.691 0 367.002C0 164.313 164.311 0 366.999 0ZM366.999 242.449C298.208 242.449 242.442 298.215 242.441 367.007C242.441 435.798 298.208 491.565 366.999 491.565C435.79 491.565 491.557 435.798 491.557 367.007C491.556 298.215 435.79 242.449 366.999 242.449Z"/>
    </clipPath>
  </defs>
</svg>

<div className="stage" id="stage" role="presentation">
  <div className="second-hl-particles-wrap" id="second-hl-particles-wrap" aria-hidden="true">
    <canvas id="second-hl-particles-canvas" width="300" height="300"></canvas>
  </div>
  <button type="button" className="particle-sound-btn particle-sound-btn--second" id="second-act-sound-btn" aria-pressed="true" aria-label="Mute interaction sound">
    <span className="particle-sound-btn__inner">
      <span className="particle-sound-btn__rollover" aria-hidden="true"></span>
      <span className="particle-sound-btn__waves" aria-hidden="true">
        <span className="particle-sound-btn__bar"></span>
        <span className="particle-sound-btn__bar"></span>
        <span className="particle-sound-btn__bar"></span>
        <span className="particle-sound-btn__bar"></span>
      </span>
    </span>
  </button>
  <div className="hero-content">
    <div className="hero-hl-mask" id="hero-hl-mask">
      <h1 className="hero-hl" id="hero-hl" aria-label="Rotaract CRCE"></h1>
    </div>
  </div>
  
  <div className="third-act" id="third-act" aria-hidden="true">
    <div className="third-act-red" id="third-act-red"></div>
    <div className="third-act-inner third-act-inner--ring">
      <div className="third-act-video-plane">
        <div className="third-act-video-shell" id="third-act-video-shell" aria-hidden="true">
          <div className="third-act-video-ring">
            <canvas id="third-act-ring-canvas" className="third-act-ring-canvas" aria-hidden="true" style={{ clipPath: "url(#third-act-o-clip)", WebkitClipPath: "url(#third-act-o-clip)" }}></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div className="third-act-particles-vp-wrap" id="third-act-particles-vp-wrap" aria-hidden="true">
      <canvas id="third-act-particles-canvas" className="third-act-particles-canvas" width="300" height="300" aria-hidden="true"></canvas>
    </div>
    <div className="third-act-inner third-act-inner--hl" id="third-act-inner">
      <div className="hero-hl-mask third-act-mask">
        <h2 className="hero-hl third-act-hl" id="third-act-hl"></h2>
      </div>
    </div>
    <button type="button" className="particle-sound-btn particle-sound-btn--third" id="third-act-sound-btn" aria-pressed="true" aria-label="Mute interaction sound">
      <span className="particle-sound-btn__inner">
        <span className="particle-sound-btn__rollover" aria-hidden="true"></span>
        <span className="particle-sound-btn__waves" aria-hidden="true">
          <span className="particle-sound-btn__bar"></span>
          <span className="particle-sound-btn__bar"></span>
          <span className="particle-sound-btn__bar"></span>
          <span className="particle-sound-btn__bar"></span>
        </span>
      </span>
    </button>
  </div>
</div>
    </>
  );
}
