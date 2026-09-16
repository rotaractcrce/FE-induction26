export default function Switch({ modelValue, onChange, styleClass = '' }) {
  const checked = !!modelValue
  return (
    <div className={`switch-container ${styleClass}`}>
      <input
        className="switch switch--flat"
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label />
    </div>
  )
}