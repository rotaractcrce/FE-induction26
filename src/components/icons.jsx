export function ChevronRightIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className="lucide lucide-chevron-right-icon"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function CheckIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className="lucide lucide-check-icon"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function XIcon({ size = 24, strokeWidth = 2, style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      className="lucide lucide-xicon"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}