import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from '../components/Icon'
import PasswordInput from '../components/ui/PasswordInput'
import { useAuth } from '../context/AuthContext'
import './auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate(location.state?.from || '/', { replace: true })
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

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to your account to keep practicing.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Password</label>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--md auth-submit" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}