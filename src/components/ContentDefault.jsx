import { useEffect, useState } from 'react'
import Switch from './Switch.jsx'
import SoundWave from './SoundWave.jsx'
import { ChevronRightIcon, CheckIcon } from './icons.jsx'

export default function ContentDefault({ handleInfoClick, handleCtaClick, ctaLabel, disabled }) {
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setDebug(window.canvas?.renderer?.props?.mode === 'debug' || false)
    }, 100)
  }, [])

  return (
    <div className="landing-card-content landing-card-content--default">
      <button className="info-button" onClick={handleInfoClick}>
        i
      </button>
      <div className="action-left">
        <SoundWave />
      </div>
      <div className="action">
        <Switch
          modelValue={debug}
          onChange={(v) => {
            setDebug(v)
            if (window.canvas) window.canvas.renderer.props.mode = v ? 'debug' : 'normal'
          }}
        />
      </div>
      <div className="landing-card-title">Desktop.fm</div>
      <div className="landing-card-actions">
        <button className="primary" disabled={disabled} onClick={handleCtaClick}>
          <div>{ctaLabel}</div>
          <div>
            {disabled ? null : <ChevronRightIcon size={18} style={{ position: 'relative', right: '-5px' }} />}
            {disabled ? <CheckIcon size={18} style={{ position: 'relative', right: '-5px' }} /> : null}
          </div>
        </button>
      </div>
    </div>
  )
}