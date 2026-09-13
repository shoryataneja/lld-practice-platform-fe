import Icon from '../Icon'

export default function SearchBar({ placeholder = 'Search…', className = '' }) {
  return (
    <div className={`search-bar ${className}`}>
      <Icon name="search" size={18} />
      <input type="search" placeholder={placeholder} aria-label={placeholder} />
    </div>
  )
}