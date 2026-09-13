import { createContext, useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'

const SearchContext = createContext(null)

const SEARCHABLE_PATHS = ['/problems', '/history', '/learn']

// eslint-disable-next-line react-refresh/only-export-components
export function isSearchable(pathname) {
  return SEARCHABLE_PATHS.includes(pathname)
}

export function SearchProvider({ children }) {
  const { pathname } = useLocation()
  const [prevPath, setPrevPath] = useState(pathname)
  const [query, setQuery] = useState('')

  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setQuery('')
  }

  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearch() {
  return useContext(SearchContext)
}