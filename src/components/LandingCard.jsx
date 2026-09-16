import { useEffect, useState } from 'react'
import Spinner from './Spinner.jsx'
import ContentDefault from './ContentDefault.jsx'
import ContentInfo from './ContentInfo.jsx'
import ContentAccount from './ContentAccount.jsx'
import { XIcon, CheckIcon } from './icons.jsx'

const VALIDATE = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

function isValidEmail(email) {
  if (!email || email.length > 254) return false
  if (!VALIDATE.test(email)) return false
  const [local, domain] = email.split('@')
  if (local.length > 64) return false
  const parts = domain.split('.')
  return !parts.some((p) => p.length > 63)
}

function useWindowHeight() {
  const [height, setHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0)
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return height
}

export default function App() {
  const [loaded, setLoaded] = useState(false)
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState('default')
  const [shake, setShake] = useState(false)
  const [joined, setJoined] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [modelValue, setModelValue] = useState(true)

  const layout = {
    default: { width: 280, height: 200 },
    info: { header: { title: () => 'Info' }, layout: { width: 340, height: 480 } },
    register: {
      header: {
        title: () => 'Join waiting list',
        confirm: async () => {
          if (isValidEmail(email) && name.trim() !== '') {
            setMode('loading')
            try {
              await fetch('https://dkp.fm/api/waitlist_entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Origin: 'https://desktop.fm' },
                body: JSON.stringify({ email, name }),
              })
              setJoined(true)
            } catch {
              setMode('register')
              setShake(true)
              setTimeout(() => setShake(false), 500)
            }
          } else {
            setShake(true)
            setTimeout(() => setShake(false), 500)
          }
        },
      },
      layout: { width: 280, height: 140 },
    },
    loading: { layout: { width: 100, height: 100 } },
  }

  const active = layout[mode]

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 0)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (mode === 'loading') {
      const t = setTimeout(() => setMode('default'), 1000)
      return () => clearTimeout(t)
    }
  }, [mode])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setMode('default')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const windowHeight = useWindowHeight()

  const springY =
    ready && mode === 'default'
      ? windowHeight / 2 - layout.default.height / 2 - 20
      : ready
        ? 0
        : windowHeight / 2 + layout[mode === 'loading' ? 'loading' : mode].height

  const cardStyle = {
    width: active.width + 'px',
    height: active.height + 'px',
    transform: `translateY(${springY}px)`,
    transition: 'all .3s cubic-bezier(.2,.8,.2,1)',
  }

  const hasHeader = !!active.header
  const headerTitle = active.header?.title?.()

  return (
    <div className="index">
      <div className={`landing-card-overlay ${mode !== 'default' ? 'blur' : ''}`} />
      {!loaded ? (
        <div className="landing-card-container">
          <div className="landig-card-spinner">
            <Spinner />
          </div>
        </div>
      ) : null}
      <div className="landing-card-container" style={cardStyle}>
        <header className={`landing-card-header ${hasHeader ? 'visible' : ''}`}>
          <button className="header-action visible" onClick={() => setMode('default')}>
            <XIcon size={18} strokeWidth={3} style={{ stroke: '#777' }} />
          </button>
          <div className="header-main">{headerTitle}</div>
          <button
            className={`header-action ${hasHeader && !!active.header.confirm ? 'visible' : ''}`}
            onClick={() => active.header?.confirm?.()}
          >
            <CheckIcon size={18} strokeWidth={3} style={{ stroke: '#009942' }} />
          </button>
        </header>
        <div className={`landing-card ${shake ? 'shake' : ''}`}>
          {mode === 'default' && (
            <ContentDefault
              handleInfoClick={() => setMode('info')}
              handleCtaClick={() => setMode('register')}
              ctaLabel={joined ? 'Thanks for joining!' : 'Join the waiting list'}
              disabled={joined}
            />
          )}
          {mode === 'info' && <ContentInfo />}
          {mode === 'register' && (
            <ContentAccount
              name={name}
              email={email}
              onUpdateName={setName}
              onUpdateEmail={setEmail}
              onUpdateModelValue={setModelValue}
            />
          )}
        </div>
      </div>
    </div>
  )
}