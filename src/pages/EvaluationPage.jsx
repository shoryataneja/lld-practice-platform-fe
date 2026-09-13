import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/Icon'
import { api } from '../api'

const criterionLabels = {
  REQUIREMENT_UNDERSTANDING: 'Requirement Understanding',
  CLASS_RESPONSIBILITIES: 'Class Responsibilities',
  COUPLING_AND_COHESION: 'Coupling / Cohesion',
  ENCAPSULATION_AND_INTERFACES: 'Encapsulation / Interfaces',
  ABSTRACTION_AND_DESIGN_PATTERNS: 'Abstraction / Design Patterns',
  EXTENSIBILITY: 'Extensibility',
  EDGE_CASES_AND_TESTABILITY: 'Edge Cases / Testability',
  EXPLANATION_QUALITY: 'Quality of Explanation',
}

const statusTone = { COMPLETED: 'success', EVALUATING: 'accent', SUBMITTED: 'accent', DRAFT: 'neutral', FAILED: 'danger' }

function ScoreRing({ score }) {
  return (
    <div className="score-ring" style={{ '--score': `${score}%` }}>
      <div className="score-ring__inner">
        <div>
          <div className="score-ring__value">{score}</div>
          <div className="score-ring__label">/ 100</div>
        </div>
      </div>
    </div>
  )
}

export default function EvaluationPage() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState(null)

  useEffect(() => {
    api
      .getAttempt(attemptId)
      .then(({ attempt }) => setAttempt(attempt))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [attemptId])

  async function retry() {
    setRetrying(true)
    setRetryError(null)
    try {
      const { attempt: newAttempt } = await api.createAttempt(attempt.problem.slug)
      navigate(`/practice/${newAttempt.id}`)
    } catch {
      setRetryError('Could not start a new attempt. Please try again.')
      setRetrying(false)
    }
  }

  if (loading) return <div className="empty-note">Loading evaluation…</div>
  if (error) {
    return (
      <div className="notfound">
        <h1>Evaluation not found</h1>
        <p>{error}</p>
        <Button to="/history" variant="secondary">
          Back to history
        </Button>
      </div>
    )
  }

  const overall = attempt.score ?? 0
  const evaluation = attempt.evaluation
  const results = evaluation?.results || []
  const done = evaluation && evaluation.status === 'COMPLETED'

  return (
    <>
      <Link to="/history" className="back-link">
        <Icon name="arrowLeft" size={16} />
        History
      </Link>

      <PageHeader
        title="Evaluation"
        subtitle={`Feedback for ${attempt.problem.title} — attempt #${attempt.attemptNumber}.`}
        actions={<Badge tone={statusTone[attempt.status]}>{attempt.status}</Badge>}
      />

      {!done ? (
        <section className="workspace card">
          <div className="empty-note">
            This attempt is {evaluation ? evaluation.status.toLowerCase() : attempt.status.toLowerCase()} — feedback is not
            ready yet.
          </div>
          {attempt.status === 'DRAFT' && (
            <Button to={`/practice/${attempt.id}`} icon={<Icon name="pen" size={16} />}>
              Resume draft
            </Button>
          )}
        </section>
      ) : (
        <>
          <Card className="eval-summary">
            <ScoreRing score={overall} />
            <div className="eval-headline">
              <h2>{overall >= 70 ? 'Solid shape, ready to refine.' : 'A solid base — tighten the weak spots.'}</h2>
              <p>{evaluation.summary}</p>
            </div>
          </Card>

          <div className="criterion-list">
            {results.map((result) => {
              const pct = Math.round((result.score / result.maxScore) * 100)
              return (
                <Card key={result.criterion} className="criterion-card">
                  <div className="criterion-card__head">
                    <span className="criterion-card__name">
                      {criterionLabels[result.criterion] || result.criterion}
                    </span>
                    <span className="confidence">
                      <Icon name="target" size={13} />
                      {result.confidence != null ? `${Math.round(result.confidence * 100)}% confidence` : 'rule-based'}
                    </span>
                  </div>
                  <div className="criterion-bar">
                    <div className="criterion-bar__fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="criterion-body">
                    <div className="criterion-block criterion-block--good">
                      <h4>Evidence</h4>
                      <p>{result.evidence}</p>
                    </div>
                    {result.concern && (
                      <div className="criterion-block criterion-block--concern">
                        <h4>Concern</h4>
                        <p>{result.concern}</p>
                      </div>
                    )}
                    {result.suggestion && (
                      <div className="criterion-block">
                        <h4>Suggestion</h4>
                        <p>{result.suggestion}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button icon={<Icon name="play" size={16} />} onClick={retry} disabled={retrying}>
              {retrying ? 'Starting…' : 'Try again'}
            </Button>
            <Button to="/history" variant="secondary">
              Back to history
            </Button>
            {retryError && <span className="evaluation-error">{retryError}</span>}
          </div>
        </>
      )}
    </>
  )
}