import { NavLink } from 'react-router-dom'
import Icon from '../Icon'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/problems', label: 'Problems', icon: 'grid' },
  { to: '/practice', label: 'Practice', icon: 'pen' },
  { to: '/learn', label: 'Learn', icon: 'book' },
  { to: '/history', label: 'History', icon: 'clock' },
]

function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export default function Sidebar() {
  const { user } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">
          <Icon name="layers" size={18} />
        </span>
        <span className="sidebar__logo-text">LLD Lab</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="profile">
          <span className="profile__avatar">{initials(user && user.name)}</span>
          <div className="profile__meta">
            <span className="profile__name">{user ? user.name : 'User'}</span>
            <span className="profile__sub">{user ? user.email : ''}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}