import Badge from '../ui/Badge'
import PriceTag from '../ui/PriceTag'

export default function ServiceCard({ service, categoryName }) {
  return (
    <article className="card-surface p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3">
        {categoryName && <Badge label={categoryName} />}
        <PriceTag price={service.price} suffix="starting" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold leading-snug">{service.name}</h3>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{service.description}</p>
    </article>
  )
}
