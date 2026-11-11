import Popover from '../ui/Popover'
import { Kebab } from '../ui/Icons'

/** Kebab "Actions" menu. actions: [{ label, onClick, danger? }] */
export default function RowMenu({ actions }) {
  return (
    <Popover
      align="right"
      trigger={({ toggle }) => (
        <button className="kebab" aria-label="Actions" onClick={toggle}><Kebab /></button>
      )}
    >
      {(close) => (
        <ul className="menu-list compact">
          {actions.map((a) => (
            <li key={a.label}>
              <button
                className={a.danger ? 'danger' : ''}
                onClick={() => {
                  a.onClick()
                  close()
                }}
              >
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  )
}
