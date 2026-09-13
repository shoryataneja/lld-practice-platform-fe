import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/Icon'
import { api } from '../api'

const statusTone = {
  COMPLETED: 'success',
  EVALUATING: 'accent',
  SUBMITTED: 'accent',
  DRAFT: 'neutral',
  FAILED: 'danger',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function HistoryPage() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getAttempts()
      .then((data) => setAttempts(data.attempts))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="History"
        subtitle="Review past attempts and see how your designs improve over time."
      />

      {loading ? (
        <div className="empty-note">Loading history…</div>
      ) : error ? (
        <div className="empty-note">{error}</div>
      ) : attempts.length === 0 ? (
        <div className="empty-note">
          No attempts yet — start one from the problems page.
        </div>
      ) : (
        <Card className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Attempt</th>
                <th>Score</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>
                    <div className="table__cell-title">{attempt.problem.title}</div>
                    <div className="table__cell-sub">Attempt #{attempt.attemptNumber}</div>
                  </td>
                  <td>{attempt.attemptNumber}</td>
                  <td>{attempt.score != null ? `${attempt.score}/100` : '—'}</td>
                  <td>
                    <Badge tone={statusTone[attempt.status]}>{attempt.status}</Badge>
                  </td>
                  <td>{formatDate(attempt.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    {attempt.status === 'COMPLETED' ? (
                      <Link to={`/evaluation/${attempt.id}`} className="table__link">
                        View feedback
                        <Icon name="arrowRight" size={15} />
                      </Link>
                    ) : attempt.status === 'DRAFT' ? (
                      <Link to={`/practice/${attempt.id}`} className="table__link">
                        Resume
                        <Icon name="arrowRight" size={15} />
                      </Link>
                    ) : (
                      <span className="table__cell-sub">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  )
}