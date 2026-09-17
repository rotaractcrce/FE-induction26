export default function SiteMeta() {
  return (
    <>
      <div className="site-meta-panel" id="site-meta-panel" role="dialog" aria-modal="true" aria-labelledby="site-meta-heading" aria-hidden="true" inert>
  <div className="site-meta-panel__backdrop" id="site-meta-backdrop" role="presentation"></div>
  <div className="site-meta-panel__window">
    <div className="site-meta-panel__titlebar">
      <div className="site-meta-panel__titlebar-dots" role="group" aria-label="Window controls">
        <button type="button" className="site-meta-panel__dot-btn" id="site-meta-dot-close" aria-label="Close window">
          <span className="site-meta-panel__dot site-meta-panel__dot--r" aria-hidden="true"></span>
        </button>
        <button type="button" className="site-meta-panel__dot-btn" id="site-meta-dot-minimize" aria-label="Minimize window">
          <span className="site-meta-panel__dot site-meta-panel__dot--y" aria-hidden="true"></span>
        </button>
        <button type="button" className="site-meta-panel__dot-btn" id="site-meta-dot-zoom" aria-label="Zoom window" aria-pressed="false">
          <span className="site-meta-panel__dot site-meta-panel__dot--g" aria-hidden="true"></span>
        </button>
      </div>
      <span className="site-meta-panel__titlebar-label" id="site-meta-window-title">ouro site - origin.log</span>
    </div>
    <div className="site-meta-panel__body" id="site-meta-body">
  <div className="site-meta-panel__inner">
    <h2 className="sr-only" id="site-meta-heading">Want to learn how we made this site?</h2>
    <div className="site-meta-panel__type-row site-meta-panel__type-row--head" aria-hidden="true">
      <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
      <span className="site-meta-panel__type-line" data-typewriter="# Want to learn how we made this site?"></span>
    </div>
    <div className="site-meta-panel__intro site-meta-panel__intro--terminal">
      <p className="site-meta-panel__type-row">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="This site started the way most of our creative ideas do: with a feeling, a point of view, and a willingness to keep iterating until the experience felt right."></span>
      </p>
      <p className="site-meta-panel__type-row">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="But we didn’t build it the way we used to. From concept to interface to code, we worked with AI as a copilot through the same workflows Ouro Labs exists to explore."></span>
      </p>
      <p className="site-meta-panel__type-row">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="It helped us move faster, explore wider, and refine with more ambition."></span>
      </p>
      <p className="site-meta-panel__type-row">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="AI accelerated the process. Human judgment made it unmistakably ours."></span>
      </p>
    </div>
    <ul className="site-meta-panel__stats" role="list">
      <li className="site-meta-panel__stats-line site-meta-panel__stats-li--lead">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="Over 29 days, we worked through roughly:"></span>
      </li>
      <li className="site-meta-panel__stats-line">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="160 hours of tracked AI-assisted build sessions"></span>
      </li>
      <li className="site-meta-panel__stats-line">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="3,240 Composer requests"></span>
      </li>
      <li className="site-meta-panel__stats-line">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="85 conversations"></span>
      </li>
      <li className="site-meta-panel__stats-line">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="117 commits"></span>
      </li>
      <li className="site-meta-panel__stats-line">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="30,600+ AI-attributed code edits"></span>
      </li>
      <li className="site-meta-panel__stats-line site-meta-panel__stats-li--tools">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="Tooling and models:"></span>
      </li>
      <li className="site-meta-panel__stats-line site-meta-panel__stats-li--tools-detail">
        <span className="site-meta-panel__type-measure" aria-hidden="true"></span>
        <span className="site-meta-panel__type-line" data-typewriter="Figma, Cursor, Composer 2, Claude Sonnet, GPT-5.3 Codex, Opus, and Pika 2.5."></span>
      </li>
    </ul>
    <div className="site-meta-panel__terminal-ui">
      <div className="site-meta-panel__terminal-log" id="site-meta-terminal-log" aria-live="polite"></div>
      <form className="site-meta-panel__terminal-form site-meta-panel__terminal-form--awaiting-ready" id="site-meta-terminal-form" action="#" method="get" autoComplete="off" aria-hidden="true">
        <button type="submit" className="site-meta-panel__terminal-submit" tabindex="-1" aria-hidden="true" title="Run command">Run</button>
        <span className="site-meta-panel__terminal-prompt">ourolabs@origin:~$</span>
        <div className="site-meta-panel__terminal-input-wrap" id="site-meta-terminal-input-wrap">
          <span className="site-meta-panel__terminal-mirror" id="site-meta-terminal-mirror" aria-hidden="true"></span>
          <input
            className="site-meta-panel__terminal-input"
            id="site-meta-terminal-input"
            type="text"
            spellCheck="false"
            autoCapitalize="off"
            autoComplete="off"
            inputMode="text"
            enterKeyHint="go"
            dir="ltr"
            placeholder="type a command"
            aria-label="Story command input"
          />
          <span className="site-meta-panel__terminal-cursor" id="site-meta-terminal-cursor" aria-hidden="true"></span>
        </div>
      </form>
    </div>
  </div>
    </div>
  </div>
</div>
<button type="button" className="site-meta-dock" id="site-meta-dock" hidden aria-label="Restore ouro site - origin.log window">
  ouro site - origin.log
</button>
    </>
  );
}
