import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button to="/" variant="primary">
        Back to home
      </Button>
    </div>
  )
}