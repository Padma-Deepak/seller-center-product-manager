export default function Checkbox({ checked, onChange, label, indeterminate }) {
  return (
    <input
      type="checkbox"
      className="cb"
      checked={checked}
      aria-label={label}
      ref={(el) => el && (el.indeterminate = !!indeterminate && !checked)}
      onChange={onChange}
    />
  )
}
