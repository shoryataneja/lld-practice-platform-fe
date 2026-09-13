import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/Icon'

const attempts = [
  { id: 'a-101', problem: 'Parking Lot', attempt: 2, score: 82, status: 'COMPLETED', date: 'Sep 12, 2026' },
  { id: 'a-102', problem: 'Parking Lot', attempt: 1, score: 58, status: 'COMPLETED', date: 'Sep 10, 2026' },
  { id: 'a-103', problem: 'Vending Machine', attempt: 1, score: null, status: 'EVALUATING', date: 'Sep 13, 2026' },
  { id: 'a-104', problem: 'Elevator', attempt: 1, score: null, status: 'DRAFT', date: 'Sep 9, 2026' },
  { id: 'a-105', problem: 'Movie Ticket Booking', attempt: 1, score: 71, status: 'COMPLETED', date: 'Aug 30, 2026' },
]

const statusTone = {
  COMPLETED: 'success',
  EVALUATING: 'accent',
  DRAFT: 'neutral',
  FAILED: 'danger',
}

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        subtitle="Review past attempts and see how your designs improve over time."
      />

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
                  <div className="table__cell-title">{attempt.problem}</div>
                  <div className="table__cell-sub">Attempt #{attempt.attempt}</div>
                </td>
                <td>{attempt.attempt}</td>
                <td>{attempt.score !== null ? `${attempt.score}/100` : '—'}</td>
                <td>
                  <Badge tone={statusTone[attempt.status]}>{attempt.status}</Badge>
                </td>
                <td>{attempt.date}</td>
                <td style={{ textAlign: 'right' }}>
                  {attempt.status === 'COMPLETED' ? (
                    <Link
                      to={`/evaluation/${attempt.id}`}
                      className="table__link"
                    >
                      View feedback
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
    </>
  )
}