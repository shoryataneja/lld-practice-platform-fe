import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import PageHeader from '../components/ui/PageHeader'
import SearchBar from '../components/ui/SearchBar'
import Icon from '../components/Icon'
import { problems } from '../data/problems'

const difficultyTone = { EASY: 'success', MEDIUM: 'accent', HARD: 'danger' }
const filters = ['All', 'Easy', 'Medium', 'Hard']

export default function ProblemsPage() {
  return (
    <>
      <PageHeader
        title="Problems"
        subtitle="Pick an LLD problem, work through the requirements, and design a clean solution."
      />

      <div className="problems-toolbar">
        <div className="problems-toolbar__filter">
          {filters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`chip${index === 0 ? ' chip--active' : ''}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <SearchBar placeholder="Search problems…" />
      </div>

      <div className="card-grid">
        {problems.map((problem) => (
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
    </>
  )
}