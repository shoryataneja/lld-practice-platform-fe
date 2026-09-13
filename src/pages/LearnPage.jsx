import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/Icon'

const topics = [
  { name: 'OOP', icon: 'target', sub: 'Encapsulation, inheritance, polymorphism and how they shape designs.' },
  { name: 'SOLID', icon: 'shield', sub: 'Five principles that keep classes focused and systems resilient to change.' },
  { name: 'Abstraction', icon: 'layers', sub: 'Hiding complexity behind clean, stable interfaces.' },
  { name: 'Interfaces', icon: 'grid', sub: 'Programming to contracts instead of concrete implementations.' },
  { name: 'Composition', icon: 'component', sub: 'Building behaviour by combining small, single-purpose objects.' },
  { name: 'Design patterns', icon: 'book', sub: 'Proven templates for common modelling problems.' },
]

export default function LearnPage() {
  return (
    <>
      <PageHeader
        title="Learn"
        subtitle="Light reading on the foundational ideas behind clean low-level design."
      />

      <div className="card-grid">
        {topics.map((topic) => (
          <Card key={topic.name} className="learn-card card--hover">
            <span className="learn-card__icon">
              <Icon name={topic.icon} size={20} />
            </span>
            <h3 className="learn-card__title">{topic.name}</h3>
            <p className="learn-card__sub">{topic.sub}</p>
            <div className="learn-card__footer">
              <Badge tone="neutral">Coming soon</Badge>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}