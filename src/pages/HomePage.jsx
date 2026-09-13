import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Icon from '../components/Icon'
import { api } from '../api'

const difficultyTone = { EASY: 'success', MEDIUM: 'accent', HARD: 'danger' }

export default function HomePage() {
  const [problems, setProblems] = useState([])
  const [attemptCount, setAttemptCount] = useState(null)
  const [averageScore, setAverageScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getProblems(), api.getAttempts()])
      .then(([problemsData, attemptsData]) => {
        setProblems(problemsData.problems)
        setAttemptCount(attemptsData.attempts.length)
        const scores = attemptsData.attempts
          .map((attempt) => attempt.score)
          .filter((score) => score != null)
        if (scores.length > 0) {
          setAverageScore(Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Problems available', value: loading ? '–' : String(problems.length), icon: 'grid' },
    { label: 'Attempts made', value: attemptCount != null ? String(attemptCount) : '–', icon: 'clock' },
    { label: 'Average score', value: averageScore != null ? `${averageScore}%` : '–', icon: 'target' },
  ]

  return (
    <>
      <section className="hero-panel card">
        <span className="badge badge--accent">
          <Icon name="sparkles" size={14} />
          Low-Level Design practice
        </span>
        <h1 className="hero-panel__title">
          Design better systems, one practice at a time.
        </h1>
        <p className="hero-panel__sub">
          Solve guided LLD problems, submit your design, and get detailed, explainable
          feedback — not just a score.
        </p>
        <div className="hero-panel__actions">
          <Button to="/problems" icon={<Icon name="play" size={16} />}>
            Browse problems
          </Button>
          <Button to="/practice" variant="secondary" icon={<Icon name="pen" size={16} />}>
            Start practicing
          </Button>
        </div>
      </section>

      <section className="stats">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat">
            <span className="stat__icon">
              <Icon name={stat.icon} size={20} />
            </span>
            <div>
              <div className="stat__value">{stat.value}</div>
              <div className="stat__label">{stat.label}</div>
            </div>
          </Card>
        ))}
      </section>

      <section className="section-block">
        <div className="section-block__head">
          <h2>Popular problems</h2>
          <Button to="/problems" variant="ghost" iconRight={<Icon name="arrowRight" size={16} />}>
            View all
          </Button>
        </div>
        {loading ? (
          <div className="empty-note">Loading problems…</div>
        ) : problems.length === 0 ? (
          <div className="empty-note">No problems published yet.</div>
        ) : (
          <div className="card-grid">
            {problems.slice(0, 3).map((problem) => (
              <Card key={problem.slug} className="problem-card card--hover">
                <div className="problem-card__top">
                  <span className={`badge badge--${difficultyTone[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                  <Icon name="arrowRight" size={16} />
                </div>
                <h3 className="problem-card__title">{problem.title}</h3>
                <p className="problem-card__sub">{problem.summary}</p>
                <div className="problem-card__footer">
                  <Button to={`/problems/${problem.slug}`} variant="secondary" size="sm">
                    View problem
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  )
}