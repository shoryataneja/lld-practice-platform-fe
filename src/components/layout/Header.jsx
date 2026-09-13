import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Icon from '../Icon'
import SearchBar from '../ui/SearchBar'
import { useAuth } from '../../context/AuthContext'
import { isSearchable, useSearch } from '../../context/SearchContext'

function initials(name) {
  return (name || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export default function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const { query, setQuery } = useSearch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function onClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="header">
      {isSearchable(pathname) && (
        <SearchBar
          placeholder="Search…"
          className="header__search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      <div className="header__right">
        <div className="header__menu" ref={menuRef}>
          <button
            type="button"
            className="icon-btn"
            aria-label="Account"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="header__avatar">{initials(user && user.name)}</span>
          </button>
          {menuOpen && (
            <div className="header__menu-popover">
              <div className="header__menu-head">
                <span className="header__menu-name">{user ? user.name : 'User'}</span>
                <span className="header__menu-email">{user ? user.email : ''}</span>
              </div>
              <button type="button" className="header__menu-item" onClick={handleLogout}>
                <Icon name="logout" size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}