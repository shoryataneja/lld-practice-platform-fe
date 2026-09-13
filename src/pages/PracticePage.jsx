import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/Icon'
import { api } from '../api'

const sections = [
  { key: 'requirements', name: 'Requirements understanding', hint: 'Restate the core requirements in your own words' },
  { key: 'assumptions', name: 'Assumptions', hint: 'What did you assume about scope, scale or behaviour?' },
  { key: 'classes', name: 'Classes', hint: 'List the core classes in your design' },
  { key: 'responsibilities', name: 'Responsibilities', hint: 'Which class owns which behaviour?' },
  { key: 'relationships', name: 'Relationships', hint: 'How do the classes connect: composed, referenced, inherited?' },
  { key: 'decisions', name: 'Design decisions & trade-offs', hint: 'Why this shape over alternatives?' },
  { key: 'code', name: 'Code (optional)', hint: 'Sketch key class skeletons' },
]

const difficultyTone = { EASY: 'success', MEDIUM: 'accent', HARD: 'danger' }
const statusTone = { DRAFT: 'neutral', SUBMITTED: 'accent', EVALUATING: 'accent', COMPLETED: 'success', FAILED: 'danger' }

function Picker() {
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)

  useEffect(() => {
    api
      .getProblems()
      .then((data) => setProblems(data.problems))
      .finally(() => setLoading(false))
  }, [])

  async function start(slug) {
    setStarting(slug)
    try {
      const { attempt } = await api.createAttempt(slug)
      navigate(`/practice/${attempt.id}`)
    } catch {
      setStarting(null)
    }
  }

  if (loading) return <div className="empty-note">Loading problems…</div>

  return (
    <>
      <PageHeader
        title="Practice — pick a problem"
        subtitle="Start a new attempt. Your design is saved as a draft until you submit it for evaluation."
      />
      <div className="card-grid">
        {problems.map((problem) => (
          <Card key={problem.slug} className="problem-card card--hover">
            <div className="problem-card__top">
              <span className={`badge badge--${difficultyTone[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
              <Icon name="pen" size={16} />
            </div>
            <h3 className="problem-card__title">{problem.title}</h3>
            <p className="problem-card__sub">{problem.summary}</p>
            <div className="problem-card__footer">
              <Button
                variant="secondary"
                size="sm"
                disabled={starting === problem.slug}
                onClick={() => start(problem.slug)}
              >
                {starting === problem.slug ? 'Starting…' : 'Start attempt'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

function Workspace() {
  const { attemptId } = useParams()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(null)
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getAttempt(attemptId)
      .then(({ attempt }) => {
        setAttempt(attempt)
        const initial = {}
        for (const section of attempt.submission?.sections || []) initial[section.key] = section.content
        setValues(initial)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [attemptId])

  function update(key, content) {
    setValues((prev) => ({ ...prev, [key]: content }))
    setMessage(null)
  }

  async function saveDraft() {
    setSaving(true)
    setMessage(null)
    try {
      await api.saveSections(
        attemptId,
        sections.map((section) => ({ key: section.key, content: values[section.key] || '' }))
      )
      setMessage('Draft saved.')
    } catch (err) {
      setMessage(`Could not save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  async function submit() {
    setSubmitting(true)
    setMessage(null)
    try {
      const { attempt } = await api.submitAttempt(attemptId)
      navigate(`/evaluation/${attempt.id}`)
    } catch (err) {
      setMessage(`Could not submit: ${err.message}`)
      setSubmitting(false)
    }
  }

  if (loading) return <div className="empty-note">Loading attempt…</div>
  if (error) {
    return (
      <div className="notfound">
        <h1>Attempt not found</h1>
        <p>{error}</p>
        <Button to="/practice" variant="secondary">
          Back to practice
        </Button>
      </div>
    )
  }

  const finished = attempt.status !== 'DRAFT'

  return (
    <>
      <Link to="/practice" className="back-link">
        <Icon name="arrowLeft" size={16} />
        All problems
      </Link>

      <PageHeader
        title={`Practice — ${attempt.problem.title}`}
        subtitle={`Attempt #${attempt.attemptNumber} · work through the requirements and capture your design.`}
        actions={
          <Badge tone={statusTone[attempt.status]}>{attempt.status}</Badge>
        }
      />

      {finished ? (
        <section className="workspace card">
          <div className="empty-note">
            This attempt has been {attempt.status.toLowerCase()} — you can review the feedback instead of editing.
          </div>
          <Button to={`/evaluation/${attempt.id}`} icon={<Icon name="arrowRight" size={16} />}>
            View evaluation
          </Button>
        </section>
      ) : (
        <section className="workspace card">
          <div className="workspace__tabs">
            {sections.map((section, index) => (
              <button
                key={section.key}
                type="button"
                className={`workspace__tab${index === 0 ? ' workspace__tab--active' : ''}`}
              >
                {section.name}
              </button>
            ))}
          </div>

          <div className="workspace__body">
            <div className="section-list">
              {sections.map((section) => (
                <div key={section.key} className="section-row section-row--stack">
                  <div className="section-row__copy">
                    <div className="section-row__name">{section.name}</div>
                    <div className="section-row__hint">{section.hint}</div>
                  </div>
                  <textarea
                    className="section-textarea"
                    rows={6}
                    placeholder={`Write your "${section.name.toLowerCase()}" here…`}
                    value={values[section.key] || ''}
                    onChange={(event) => update(section.key, event.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="workspace__footer">
            <span className="workspace__note">
              {message ? (
                <>
                  <Icon name="check" size={14} /> {message}
                </>
              ) : (
                <>
                  <Icon name="sparkles" size={14} /> You can save a draft and return to it any time.
                </>
              )}
            </span>
            <div className="page-header__actions">
              <Button variant="secondary" disabled={saving} onClick={saveDraft}>
                {saving ? 'Saving…' : 'Save draft'}
              </Button>
              <Button disabled={submitting} onClick={submit}>
                {submitting ? 'Evaluating…' : 'Submit for evaluation'}
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default function PracticePage() {
  const { attemptId } = useParams()
  return attemptId ? <Workspace /> : <Picker />
}