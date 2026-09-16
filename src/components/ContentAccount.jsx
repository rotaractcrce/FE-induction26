import { useEffect, useRef } from 'react'
import Switch from './Switch.jsx'

export default function ContentAccount({
  name,
  email,
  modelValue = true,
  showFrequencyOption = true,
  handleSubmit,
  onUpdateName,
  onUpdateEmail,
  onUpdateModelValue,
}) {
  const firstInput = useRef(null)

  useEffect(() => {
    firstInput.current?.focus()
  }, [])

  return (
    <div className="landing-card-content">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit?.()
        }}
      >
        <input
          ref={firstInput}
          placeholder="Type your name..."
          value={name}
          onChange={(e) => onUpdateName?.(e.target.value)}
        />
        <input
          placeholder="Type your email..."
          type="email"
          value={email}
          onChange={(e) => onUpdateEmail?.(e.target.value)}
        />
        <input type="submit" className="hidden" />
        {showFrequencyOption ? (
          <div className="block">
            <div className="label">
              {modelValue
                ? 'Send me all progress updates'
                : 'Only contact me for access related notifications'}
            </div>
            <div className="flex-fill" />
            <Switch
              modelValue={modelValue}
              onChange={onUpdateModelValue}
              styleClass="dark"
            />
          </div>
        ) : null}
      </form>
    </div>
  )
}