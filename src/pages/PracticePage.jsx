import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Icon from '../components/Icon'

const tabs = ['Requirements', 'My design', 'Notes']

const sections = [
  { key: 'requirements', name: 'Requirements understanding', hint: 'Restate the core requirements in your own words' },
  { key: 'assumptions', name: 'Assumptions', hint: 'What did you assume about scope, scale or behavior?' },
  { key: 'classes', name: 'Classes', hint: 'List the core classes in your design' },
  { key: 'responsibilities', name: 'Responsibilities', hint: 'Which class owns which behaviour?' },
  { key: 'relationships', name: 'Relationships', hint: 'How do the classes connect: composed, referenced, inherited?' },
  { key: 'decisions', name: 'Design decisions & trade-offs', hint: 'Why this shape over alternatives?' },
  { key: 'code', name: 'Code (optional)', hint: 'Sketch key class skeletons' },
]

export default function PracticePage() {
  return (
    <>
      <PageHeader
        title="Practice — Design workspace"
        subtitle="Work through the problem and capture your design. Feedback will be structured around each section."
      />

      <section className="workspace card">
        <div className="workspace__tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              type="button"
              className={`workspace__tab${index === 1 ? ' workspace__tab--active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="workspace__body">
          <div className="section-list">
            {sections.map(section => (
              <div key={section.key} className="section-row">
                <span className="section-row__icon">
                  <Icon name="pen" size={16} />
                </span>
                <div className="section-row__copy">
                  <div className="section-row__name">{section.name}</div>
                  <div className="section-row__hint">{section.hint}</div>
                </div>
                <Button variant="secondary" size="sm">
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="workspace__footer">
          <span className="workspace__note">
            <Icon name="sparkles" size={14} />
            The evaluation pipeline is the next step — submissions will be scored per section.
          </span>
          <div className="page-header__actions">
            <Button variant="secondary">Save draft</Button>
            <Button>Submit for evaluation</Button>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
        <Badge tone="neutral">Draft</Badge>
        <Badge tone="accent">In-progress</Badge>
      </div>
    </>
  )
}