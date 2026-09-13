import { Link, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Icon from '../components/Icon'
import { getProblemBySlug, problems } from '../data/problems'

export default function ProblemDetailPage() {
  const { slug } = useParams()
  const problem = getProblemBySlug(slug)

  if (!problem) {
    return (
      <div className="notfound">
        <h1>Problem not found</h1>
        <p>The problem you are looking for does not exist.</p>
        <Button to="/problems" variant="secondary">
          Back to problems
        </Button>
      </div>
    )
  }

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
            <h2>Background</h2>
            <div className="detail-body">
              <p>
                {problem.title} is a classic low-level design scenario. You are expected to
                identify the core entities, assign clear responsibilities, and model the
                key relationships before worry about implementation details.
              </p>
              <p>
                There is no single correct answer. The evaluation rewards clean
                separation of concerns, sensible use of interfaces and abstractions, and
                designs that are easy to extend.
              </p>
            </div>
          </Card>

          <Card className="detail-card" style={{ marginTop: 16 }}>
            <h2>Key requirements</h2>
            <ul className="detail-list">
              <li>Identify the primary actors and their interactions with the system.</li>
              <li>Define the core classes and the responsibility of each class.</li>
              <li>Model relationships and ownership between classes.</li>
              <li>Handle basic edge cases gracefully (empty state, invalid input, limits).</li>
              <li>Keep the design extensible for new features.</li>
            </ul>
          </Card>

          <Card className="detail-card" style={{ marginTop: 16 }}>
            <h2>Constraints</h2>
            <ul className="detail-list">
              <li>Focus on the conceptual model — persistence and UI are out of scope.</li>
              <li>Prefer composition and interfaces over deep inheritance chains.</li>
              <li>Assume a single process; distributed concerns are not required.</li>
            </ul>
          </Card>
        </div>

        <aside className="detail-side">
          <Card className="detail-card">
            <ul className="meta-list">
              <li>
                <span className="meta-list__label">Difficulty</span>
                <Badge tone="accent">{problem.difficulty}</Badge>
              </li>
              <li>
                <span className="meta-list__label">Category</span>
                <span>System design</span>
              </li>
              <li>
                <span className="meta-list__label">Attempts</span>
                <span>—</span>
              </li>
            </ul>
            <Button to="/practice" icon={<Icon name="play" size={16} />}>
              Start attempt
            </Button>
          </Card>

          <Card className="detail-card">
            <h2>Related problems</h2>
            <ul className="detail-list">
              {problems
                .filter((item) => item.slug !== problem.slug)
                .slice(0, 3)
                .map((item) => {
                  const slug = `/problems/${item.slug}`
                  return (
                    <li key={item.slug}>
                      <Link to={slug}>{item.title}</Link>
                    </li>
                  )
                })}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  )
}