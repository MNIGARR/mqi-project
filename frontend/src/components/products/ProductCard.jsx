import Badge from '../ui/Badge'
import PriceTag from '../ui/PriceTag'

export default function ProductCard({ product, categoryName }) {
  return (
    <article className="card-surface overflow-hidden flex flex-col group">
      <div className="aspect-[4/3] overflow-hidden bg-ink/5">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          {categoryName && <Badge label={categoryName} />}
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm text-ink-soft leading-relaxed flex-1">{product.description}</p>
        <div className="mt-4">
          <PriceTag price={product.price} />
        </div>
      </div>
    </article>
  )
}
