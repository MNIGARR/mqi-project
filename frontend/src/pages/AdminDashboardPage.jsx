import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentAdmin, logoutAdmin } from '../services/authService'
import { getCategories } from '../services/categoryService'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService'
import { getServices, createService, updateService, deleteService } from '../services/serviceService'
import ResourceManager from '../components/admin/ResourceManager'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadData = useCallback(async () => {
    const [categoryData, productData, serviceData] = await Promise.all([
      getCategories(),
      getProducts(),
      getServices(),
    ])
    setCategories(categoryData)
    setProducts(productData)
    setServices(serviceData)
  }, [])

  useEffect(() => {
    let active = true

    getCurrentAdmin().then((currentAdmin) => {
      if (!active) return

      if (!currentAdmin) {
        navigate('/admin/login', { replace: true })
        return
      }

      setAdmin(currentAdmin)
      loadData()
        .catch((err) => {
          if (active) setLoadError(err.message)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    })

    return () => {
      active = false
    }
  }, [navigate, loadData])

  function handleLogout() {
    logoutAdmin()
    navigate('/admin/login', { replace: true })
  }

  async function refreshAfter(action) {
    await action()
    await loadData()
  }

  if (loading) {
    return (
      <div className="container-page py-16">
        <p className="text-ink-soft">Loading admin dashboard…</p>
      </div>
    )
  }

  return (
    <div className="container-page py-16 space-y-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="mt-1 text-sm text-ink-soft">Signed in as {admin.name || admin.email}</p>
        </div>
        <button type="button" className="btn-secondary text-sm px-4 py-2" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {loadError && (
        <p role="alert" className="text-sm text-plum-dark bg-plum/10 border border-plum/20 rounded-sm px-3 py-2">
          {loadError}
        </p>
      )}

      <ResourceManager
        title="Products"
        items={products}
        categories={categories}
        includeImageUrl
        onCreate={(payload) => refreshAfter(() => createProduct(payload))}
        onUpdate={(id, payload) => refreshAfter(() => updateProduct(id, payload))}
        onDelete={(id) => refreshAfter(() => deleteProduct(id))}
      />

      <ResourceManager
        title="Services"
        items={services}
        categories={categories}
        includeImageUrl={false}
        onCreate={(payload) => refreshAfter(() => createService(payload))}
        onUpdate={(id, payload) => refreshAfter(() => updateService(id, payload))}
        onDelete={(id) => refreshAfter(() => deleteService(id))}
      />
    </div>
  )
}
