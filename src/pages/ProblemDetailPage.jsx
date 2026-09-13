import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Icon from '../components/Icon'
import { api } from '../api'

const difficultyTone = { EASY: 'success', MEDIUM: 'accent', HARD: 'danger' }

export default function ProblemDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    api
      .getProblem(slug)
      .then(({ problem }) => setProblem(problem))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    api.getProblems().then((data) => setRelated(data.problems)).catch(() => {})
  }, [slug])

  async function start() {
    setStarting(true)
    try {
      const { attempt } = await api.createAttempt(slug)
      navigate(`/practice/${attempt.id}`)
    } catch (err) {
      setError(err.message)
      setStarting(false)
    }
  }

  if (loading) return <div className="empty-note">Loading problem…</div>
  if (error) {
    return (
      <div className="notfound">
        <h1>Problem not found</h1>
        <p>{error}</p>
        <Button to="/problems" variant="secondary">
          Back to problems
        </Button>
      </div>
    )
  }

  const paragraphs = problem.description.split('\n')

  return (
    <>
      <Link to="/problems" className="back-link">
        <Icon name="arrowLeft" size={16} />
        All problems
      </Link>

      <header className="page-header">
        <div className="page-header__copy">
          <h1 className="page-title">{problem.title}</h1>
          <p className="page-subtitle">{problem.summary}</p>
        </div>
      </header>

      <div className="detail-grid">
        <div>
          <Card className="detail-card">
            <h2>Problem brief</h2>
            <div className="detail-body detail-body--pre">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Card>
        </div>

        <aside className="detail-side">
          <Card className="detail-card">
            <ul className="meta-list">
              <li>
                <span className="meta-list__label">Difficulty</span>
                <Badge tone={difficultyTone[problem.difficulty]}>{problem.difficulty}</Badge>
              </li>
              <li>
                <span className="meta-list__label">Category</span>
                <span>Low-level design</span>
              </li>
              <li>
                <span className="meta-list__label">Attempts</span>
                <span>{problem._count.attempts}</span>
              </li>
            </ul>
            <Button onClick={start} icon={<Icon name="play" size={16} />} disabled={starting}>
              {starting ? 'Starting…' : 'Start attempt'}
            </Button>
          </Card>

          <Card className="detail-card">
            <h2>Related problems</h2>
            <ul className="detail-list">
              {related
                .filter((item) => item.slug !== problem.slug)
                .slice(0, 3)
                .map((item) => (
                  <li key={item.slug}>
                    <Link to={`/problems/${item.slug}`}>{item.title}</Link>
                  </li>
                ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  )
}