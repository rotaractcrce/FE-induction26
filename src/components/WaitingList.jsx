import { useEffect, useRef, useState } from 'react'

function Switch({ modelValue, onChange, styleClass = '' }) {
  const [checked, setChecked] = useState(!!modelValue)

  const handleChange = (e) => {
    const val = e.target.checked
    setChecked(val)
    onChange?.(val)
  }

  return (
    <div className={`switch-container ${styleClass}`}>
      <input
        className="switch switch--flat"
        type="checkbox"
        checked={checked}
        onChange={handleChange}
      />
      <label />
    </div>
  )
}

function SoundWave() {
  return (
    <div className="soundwave playing">
      <div className="line" />
      <div className="line" />
      <div className="line" />
      <div className="line" />
      <div className="line" />
      <div className="line" />
      <div className="line" />
    </div>
  )
}

export default function WaitingList({
  name = '',
  email = '',
  modelValue = true,
  showFrequencyOption = false,
  initialState = 'default',
  handleSubmit,
  onClose,
  onUpdateName,
  onUpdateEmail,
  onUpdateModelValue,
}) {
  const [viewState, setViewState] = useState(initialState) // 'default' | 'register'
  const [mounted, setMounted] = useState(false)
  const firstInput = useRef(null)
  const [freq, setFreq] = useState(modelValue)
  const [internalName, setInternalName] = useState(name)
  const [internalEmail, setInternalEmail] = useState(email)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (viewState === 'register') {
      firstInput.current?.focus()
    }
  }, [viewState])

  const effectiveFreq = onUpdateModelValue ? modelValue : freq
  const effectiveName = onUpdateName ? name : internalName
  const effectiveEmail = onUpdateEmail ? email : internalEmail

  const handleFormSubmit = (e) => {
    e?.preventDefault()
    handleSubmit?.({ name: effectiveName, email: effectiveEmail, frequency: effectiveFreq })
  }

  const containerHeight = viewState === 'default' ? '200px' : showFrequencyOption ? '200px' : '140px'

  return (
    <>
      <div className={`landing-card-overlay ${viewState !== 'default' ? 'blur' : ''}`} />

      <div
        className={`landing-card-container ${!mounted ? 'entry-hidden' : ''} state-${viewState}`}
        style={{ width: '280px', height: containerHeight }}
      >
        <header className={`landing-card-header ${viewState === 'register' ? 'visible' : ''}`}>
          <button
            type="button"
            className="header-action visible"
            onClick={() => {
              if (onClose) onClose()
              else setViewState('default')
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-xicon"
              style={{ stroke: 'rgb(119, 119, 119)' }}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
          <div className="header-main">Join waiting list</div>
          <button type="button" className="header-action visible" onClick={handleFormSubmit}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check-icon"
              style={{ stroke: 'rgb(0, 153, 66)' }}
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </button>
        </header>

        <div className="landing-card">
          {viewState === 'default' ? (
            <div key="default" className="landing-card-content card-view-fade">
              <button type="button" className="info-button">
                i
              </button>

              <div className="action-left">
                <SoundWave />
              </div>

              <div className="action">
                <Switch styleClass="dark" />
              </div>

              <div className="landing-card-title">Desktop.fm</div>

              <div className="landing-card-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() => setViewState('register')}
                >
                  <div>Join the waiting list</div>
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-chevron-right-icon"
                      style={{ position: 'relative', right: '-5px' }}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div key="register" className="landing-card-content card-view-fade">
              <form onSubmit={handleFormSubmit}>
                <input
                  ref={firstInput}
                  placeholder="Type your name..."
                  value={effectiveName}
                  onChange={(e) => {
                    setInternalName(e.target.value)
                    onUpdateName?.(e.target.value)
                  }}
                />
                <input
                  placeholder="Type your email..."
                  type="email"
                  value={effectiveEmail}
                  onChange={(e) => {
                    setInternalEmail(e.target.value)
                    onUpdateEmail?.(e.target.value)
                  }}
                />
                <input type="submit" className="hidden" />
                {showFrequencyOption ? (
                  <div className="block">
                    <div className="label">
                      {effectiveFreq
                        ? 'Send me all progress updates'
                        : 'Only contact me for access related notifications'}
                    </div>
                    <div className="flex-fill" />
                    <Switch
                      modelValue={effectiveFreq}
                      onChange={(v) => {
                        if (onUpdateModelValue) onUpdateModelValue(v)
                        else setFreq(v)
                      }}
                      styleClass="dark"
                    />
                  </div>
                ) : null}
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}