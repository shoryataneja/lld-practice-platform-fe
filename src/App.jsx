import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import PracticePage from './pages/PracticePage'
import LearnPage from './pages/LearnPage'
import HistoryPage from './pages/HistoryPage'
import EvaluationPage from './pages/EvaluationPage'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { useAuth } from './context/AuthContext'
import './components/ui/ui.css'
import './components/layout/layout.css'
import './pages/pages.css'
import './pages/auth.css'

function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          Loading…
        </div>
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="problems" element={<ProblemsPage />} />
            <Route path="problems/:slug" element={<ProblemDetailPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="practice/:attemptId" element={<PracticePage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="evaluation/:attemptId" element={<EvaluationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}