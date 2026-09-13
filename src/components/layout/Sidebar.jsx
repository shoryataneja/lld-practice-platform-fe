import { NavLink } from 'react-router-dom'
import Icon from '../Icon'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/problems', label: 'Problems', icon: 'grid' },
  { to: '/practice', label: 'Practice', icon: 'pen' },
  { to: '/learn', label: 'Learn', icon: 'book' },
  { to: '/history', label: 'History', icon: 'clock' },
]

export default function Sidebar() {
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
          <span className="profile__avatar">ST</span>
          <div className="profile__meta">
            <span className="profile__name">Demo Student</span>
            <span className="profile__sub">demo@lldlab.dev</span>
          </div>
        </div>
      </div>
    </aside>
  )
}