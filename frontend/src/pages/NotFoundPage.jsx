import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="text-3xl font-semibold">This page wandered off.</h1>
      <p className="mt-3 text-ink-soft">We couldn't find what you were looking for.</p>
      <Link to="/" className="btn-primary mt-8 inline-flex">Back to home</Link>
    </div>
  )
}
