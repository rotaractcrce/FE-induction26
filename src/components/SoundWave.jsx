import { useState } from 'react'

export default function SoundWave() {
  const [muted, setMuted] = useState(true)
  const playing = !muted
  return (
    <div
      className={`soundwave ${playing ? 'playing' : ''}`}
      onClick={() => setMuted((m) => !m)}
    >
      {Array.from({ length: 7 }).map((_, i) => (
        <div className="line" key={i} />
      ))}
    </div>
  )
}