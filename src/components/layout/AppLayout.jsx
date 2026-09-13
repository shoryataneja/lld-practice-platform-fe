import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="app__main">
        <Header />
        <main className="app__content">
          <div className="app__content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}