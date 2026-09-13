import { Link } from 'react-router-dom'

export default function Button({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className = '',
  children,
  ...props
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {icon}
        <span>{children}</span>
        {iconRight}
      </Link>
    )
  }

  return (
    <button className={classes} type="button" {...props}>
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  )
}