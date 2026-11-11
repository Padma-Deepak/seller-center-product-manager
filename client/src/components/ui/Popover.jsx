import { useCallback, useRef, useState } from 'react'
import useClickOutside from '../../hooks/useClickOutside'

/** Renders `trigger({ open, toggle })` and a floating panel anchored beneath it. */
export default function Popover({ trigger, children, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(ref, close, open)

  return (
    <div className={`popover-wrap ${className}`} ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && <div className={`popover ${align}`}>{typeof children === 'function' ? children(close) : children}</div>}
    </div>
  )
}
