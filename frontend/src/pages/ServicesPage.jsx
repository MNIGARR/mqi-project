import { useEffect, useMemo, useState } from 'react'
import { getServices } from '../services/serviceService'
import { getCategories } from '../services/categoryService'
import ServiceCard from '../components/services/ServiceCard'
import SectionHeading from '../components/ui/SectionHeading'

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getServices(), getCategories()]).then(([serviceData, categoryData]) => {
      if (!active) return
      setServices(serviceData)
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

  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="Book a member's time"
        title="Services"
        description="Skills and equipment offered by the collective — book directly once the booking system goes live."
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-surface p-6 h-40 animate-pulse bg-ink/5" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryName={categoryMap[service.category_id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
