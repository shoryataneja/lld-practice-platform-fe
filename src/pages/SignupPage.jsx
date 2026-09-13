import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import PasswordInput from '../components/ui/PasswordInput'
import { useAuth } from '../context/AuthContext'
import './auth.css'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup({ name, email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <span className="auth-card__logo">
            <Icon name="layers" size={20} />
          </span>
          <div>
            <div className="auth-card__brand-text">LLD Lab</div>
            <div className="auth-card__brand-sub">Low-level design practice</div>
          </div>
        </div>

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Start practicing low-level design problems in minutes.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
              className="auth-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <PasswordInput
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--md auth-submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}