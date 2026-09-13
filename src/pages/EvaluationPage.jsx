import { Link, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/Icon'

const criteria = [
  {
    name: 'Requirement Understanding',
    score: 8,
    max: 10,
    confidence: 0.92,
    good: true,
    evidence: 'Correctly identified vehicles, spots, and the entry/exit flow as the primary actors.',
    concern: null,
    suggestion: 'Consider naming explicit invariants, e.g. total capacity across the lot.',
  },
  {
    name: 'Class Responsibilities',
    score: 6,
    max: 10,
    confidence: 0.85,
    good: false,
    evidence: 'Spot and Vehicle classes have clear owners.',
    concern: 'ParkingLot both tracks spot allocation and computes pricing — two responsibilities.',
    suggestion: 'Extract a PricingPolicy so a lot only manages allocation.',
  },
  {
    name: 'Coupling / Cohesion',
    score: 7,
    max: 10,
    confidence: 0.8,
    good: true,
    evidence: 'Most classes interact through small, focused methods.',
    concern: null,
    suggestion: 'Reduce direct dependence of EntryGate on database rows.',
  },
  {
    name: 'Encapsulation / Interfaces',
    score: 6,
    max: 10,
    confidence: 0.78,
    good: false,
    evidence: 'A ParkingSpot interface was introduced.',
    concern: 'Vehicle exposes internal position data through public getters.',
    suggestion: 'Expose behaviour (park, move) rather than raw state.',
  },
  {
    name: 'Abstraction / Design Patterns',
    score: 7,
    max: 10,
    confidence: 0.74,
    good: true,
    evidence: 'Factory for spot creation and strategy for pricing.',
    concern: null,
    suggestion: 'A Visitor is not justified here — keep the model plain.',
  },
  {
    name: 'Extensibility',
    score: 7,
    max: 10,
    confidence: 0.7,
    good: true,
    evidence: 'New spot types can slot in through the interface.',
    concern: null,
    suggestion: 'Document the extension points you expect to need.',
  },
  {
    name: 'Edge Cases / Testability',
    score: 5,
    max: 10,
    confidence: 0.82,
    good: false,
    evidence: 'A few unit tests were sketched for spot allocation.',
    concern: 'No handling for a full lot or an invalid ticket at exit.',
    suggestion: 'Model failure explicitly and cover it with tests.',
  },
  {
    name: 'Quality of Explanation',
    score: 8,
    max: 10,
    confidence: 0.9,
    good: true,
    evidence: 'Clear reasoning for each major decision.',
    concern: null,
    suggestion: 'Keep it tight — lead with the trade-offs.',
  },
]

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
  const overall = 67

  return (
    <>
      <Link to="/history" className="back-link">
        <Icon name="arrowLeft" size={16} />
        History
      </Link>

      <PageHeader
        title="Evaluation"
        subtitle={`Feedback for attempt ${attemptId} — Parking Lot.`}
      />

      <div className="eval-meta">
        <Badge tone="success">
          <Icon name="check" size={13} />
          Completed
        </Badge>
        <span className="confidence">
          <Icon name="target" size={14} />
          Evaluated with moderate confidence
        </span>
      </div>

      <Card className="eval-summary">
        <ScoreRing score={overall} />
        <div className="eval-headline">
          <h2>Solid shape, fuzzy edges.</h2>
          <p>
            Your core model is clean and the options you made are defensible. The main
            gaps are a few overburdened classes and some missing edge cases.
          </p>
        </div>
      </Card>

      <div className="criterion-list">
        {criteria.map((criterion) => {
          const pct = Math.round((criterion.score / criterion.max) * 100)
          return (
            <Card key={criterion.name} className="criterion-card">
              <div className="criterion-card__head">
                <span className="criterion-card__name">{criterion.name}</span>
                <span className="confidence">
                  <Icon name="target" size={13} />
                  {Math.round(criterion.confidence * 100)}% confidence
                </span>
              </div>
              <div className="criterion-bar">
                <div className="criterion-bar__fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="criterion-body">
                <div className="criterion-block criterion-block--good">
                  <h4>Evidence</h4>
                  <p>{criterion.evidence}</p>
                </div>
                {criterion.concern && (
                  <div className="criterion-block criterion-block--concern">
                    <h4>Concern</h4>
                    <p>{criterion.concern}</p>
                  </div>
                )}
                <div className="criterion-block">
                  <h4>Suggestion</h4>
                  <p>{criterion.suggestion}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Button to="/practice" icon={<Icon name="play" size={16} />}>
          Try again
        </Button>
        <Button to="/history" variant="secondary">
          Back to history
        </Button>
      </div>
    </>
  )
}