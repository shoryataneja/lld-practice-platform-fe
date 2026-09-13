import { useState } from 'react'
import Icon from '../Icon'

export default function PasswordInput({ id, value, onChange, className, ...inputProps }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-input">
      <input
        id={id}
        className={`auth-input ${className || ''}`.trim()}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        {...inputProps}
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  )
}