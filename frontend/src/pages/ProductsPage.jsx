import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../services/productService'
import { getCategories } from '../services/categoryService'
import ProductCard from '../components/products/ProductCard'
import SectionHeading from '../components/ui/SectionHeading'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getProducts(), getCategories()]).then(([productData, categoryData]) => {
      if (!active) return
      setProducts(productData)
      setCategories(categoryData)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  )

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.category_id === activeCategory)
  }, [products, activeCategory])

  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="Shop the collective"
        title="Products"
        description="Handmade goods, food, and clothing made by members of MQI Community."
      />

      <div className="flex flex-wrap gap-2 mb-10">
        <FilterPill
          label="All"
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
        />
        {categories.map((cat) => (
          <FilterPill
            key={cat.id}
            label={cat.name}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
          />
        ))}
      </div>

      {loading ? (
        <GridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categoryMap[product.category_id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-ink text-paper border-ink'
          : 'border-ink/20 text-ink-soft hover:border-ink/40 hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}

function GridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-surface overflow-hidden animate-pulse">
          <div className="aspect-[4/3] bg-ink/10" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-1/3 bg-ink/10 rounded" />
            <div className="h-5 w-2/3 bg-ink/10 rounded" />
            <div className="h-4 w-full bg-ink/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="card-surface p-10 text-center text-ink-soft">
      Nothing here yet — try a different category.
    </div>
  )
}
