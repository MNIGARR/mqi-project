export default function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-2xl ${alignClass} mb-10`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl sm:text-4xl font-semibold leading-tight">{title}</h2>
      {description && (
        <p className="mt-3 text-ink-soft leading-relaxed">{description}</p>
      )}
    </div>
  )
}
