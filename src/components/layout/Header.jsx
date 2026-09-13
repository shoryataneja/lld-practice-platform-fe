import Icon from '../Icon'
import SearchBar from '../ui/SearchBar'

export default function Header() {
  return (
    <header className="header">
      <SearchBar placeholder="Search problems, topics…" className="header__search" />
      <div className="header__right">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Icon name="bell" size={20} />
          <span className="icon-btn__dot" />
        </button>
        <button type="button" className="icon-btn" aria-label="Account">
          <span className="header__avatar">ST</span>
        </button>
      </div>
    </header>
  )
}