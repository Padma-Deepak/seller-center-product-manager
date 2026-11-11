const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

const paths = {
  chevron: <path d="M3 4.5 6 7.5l3-3" />,
  sort: <path d="M3.5 10V2M1.5 4l2-2 2 2M8.5 2v8M6.5 8l2 2 2-2" />,
  arrowDown: <path d="M6 2v8M3 7l3 3 3-3" />,
  arrowUp: <path d="M6 10V2M3 5l3-3 3 3" />,
  plus: <path d="M6 1.5v9M1.5 6h9" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 20h16" />,
  filter: <path d="M3 4h18l-7 8v7l-4 2v-9L3 4Z" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>),
  eye: (<><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>),
  bell: <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9ZM10.3 21a1.9 1.9 0 0 0 3.4 0" />,
  xCircle: (<><circle cx="12" cy="12" r="10" /><path d="m8.5 8.5 7 7M15.5 8.5l-7 7" /></>),
  checkCircle: (<><circle cx="12" cy="12" r="10" /><path d="m7.5 12.5 3 3 6-6.5" /></>),
  note: <path d="M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  bag: (<><path d="M5 7h14l1 14H4L5 7Z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></>),
  truck: (<><path d="M2 6h12v10H2zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>),
  chart: <path d="M3 3v18h18M7 15l4-5 3 3 5-7" />,
  rocket: <path d="M5 19c0-3 1-4 3-4l-1-3 7-7c3-1 5-1 6-1 0 1 0 3-1 6l-7 7-3-1c0 2-1 3-4 3ZM15 9h.01" />,
  card: (<><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M12 9v6M10 11h3a1 1 0 0 1 0 2h-2" /></>),
  userCircle: (<><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="10" r="3" /><path d="M6.5 18c1-2.5 3-3.5 5.5-3.5s4.5 1 5.5 3.5" /></>),
  headset: <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v5H4zM17 14h3v5h-3zM20 19c0 2-2 2-5 2" />,
  gear: (<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>),
  key: (<><circle cx="12" cy="12" r="9.5" /><circle cx="9" cy="12" r="2" /><path d="M11 12h5M14 12v2" /></>),
}

export default function Icon({ name, size = 14, viewBox, className, style }) {
  const vb = viewBox || (['chevron', 'sort', 'arrowDown', 'arrowUp', 'plus'].includes(name) ? '0 0 12 12' : '0 0 24 24')
  return (
    <svg width={size} height={size} viewBox={vb} {...base} className={className} style={style} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

export function Kebab() {
  return (
    <svg width="4" height="14" viewBox="0 0 4 16" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="2" r="1.6" /><circle cx="2" cy="8" r="1.6" /><circle cx="2" cy="14" r="1.6" />
    </svg>
  )
}
