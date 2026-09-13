import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import Icon from '../components/Icon'
import { api } from '../api'

const difficultyTone = { EASY: 'success', MEDIUM: 'accent', HARD: 'danger' }
const filters = ['All', 'Easy', 'Medium', 'Hard']

const filterValue = { All: null, Easy: 'EASY', Medium: 'MEDIUM', Hard: 'HARD' }

export default function ProblemsPage() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState('All')
  const [query, setQuery] = useState('')

  useEffect(() => {
    api
      .getProblems()
      .then((data) => setProblems(data.problems))
      .finally(() => setLoading(false))
  }, [])

  const visible = problems.filter((problem) => {
    const matchesDifficulty = !filterValue[active] || problem.difficulty === filterValue[active]
    const q = query.trim().toLowerCase()
    const matchesQuery = !q || `${problem.title} ${problem.summary}`.toLowerCase().includes(q)
    return matchesDifficulty && matchesQuery
  })

  return (
    <>
      <PageHeader
        title="Problems"
        subtitle="Pick an LLD problem, work through the requirements, and design a clean solution."
      />

      <div className="problems-toolbar">
        <div className="problems-toolbar__filter">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`chip${active === filter ? ' chip--active' : ''}`}
              onClick={() => setActive(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <SearchBar placeholder="Search problems…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty-note">Loading problems…</div>
      ) : visible.length === 0 ? (
        <div className="empty-note">No problems match your filters.</div>
      ) : (
        <div className="card-grid">
          {visible.map((problem) => (
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
    </>
  )
}