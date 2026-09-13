import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import PracticePage from './pages/PracticePage'
import LearnPage from './pages/LearnPage'
import HistoryPage from './pages/HistoryPage'
import EvaluationPage from './pages/EvaluationPage'
import NotFoundPage from './pages/NotFoundPage'
import './components/ui/ui.css'
import './components/layout/layout.css'
import './pages/pages.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  )
}