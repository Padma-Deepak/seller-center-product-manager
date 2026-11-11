import { useEffect, useState } from 'react'
import Icon from '../ui/Icons'
import { getMe } from '../../api/products'

export default function Header() {
  const [me, setMe] = useState(null)
  useEffect(() => {
    getMe().then(setMe).catch(() => {})
  }, [])

  return (
    <header className="topbar">
      <div className="logo">
        <div>
          <div>
            <span className="seller">seller</span>
            <span className="center">center</span>
          </div>
          <small>FALABELLA</small>
        </div>
        <div className="dots">
          <i style={{ background: '#1e9ed8' }} />
          <i style={{ background: '#54b948' }} />
          <i style={{ background: '#d9232d' }} />
          <i style={{ background: '#aaa' }} />
        </div>
      </div>
      <div className="top-right">
        <span className="fpay">F<b>pay</b></span>
        <span className="item">Guided tour <Icon name="eye" /></span>
        <span className="item">{me?.seller.name ?? ' '} <Icon name="user" size={15} /></span>
        <button className="bell" aria-label="Notifications">
          <Icon name="bell" size={15} />
          {me?.notifications.unread > 0 && <span className="badge" />}
        </button>
      </div>
    </header>
  )
}
