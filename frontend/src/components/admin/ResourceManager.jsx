import { useState } from 'react'
import ItemForm from './ItemForm'

export default function ResourceManager({ title, items, categories, includeImageUrl, onCreate, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [listError, setListError] = useState('')

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const singular = title.endsWith('s') ? title.slice(0, -1) : title

  async function handleCreate(payload) {
    await onCreate(payload)
    setShowForm(false)
  }

  async function handleUpdate(payload) {
    await onUpdate(editingId, payload)
    setEditingId(null)
  }

  async function handleDelete(id) {
    if (!window.confirm(`Delete this ${singular.toLowerCase()}? This cannot be undone.`)) {
      return
    }
    setListError('')
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch (err) {
      setListError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {!showForm && (
          <button type="button" className="btn-secondary text-sm px-4 py-2" onClick={() => setShowForm(true)}>
            + Add {singular}
          </button>
        )}
      </div>

      {showForm && (
        <ItemForm
          categories={categories}
          includeImageUrl={includeImageUrl}
          submitLabel={`Create ${singular}`}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {listError && (
        <p role="alert" className="text-sm text-plum-dark bg-plum/10 border border-plum/20 rounded-sm px-3 py-2">
          {listError}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-ink-soft">Nothing here yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) =>
            editingId === item.id ? (
              <ItemForm
                key={item.id}
                categories={categories}
                includeImageUrl={includeImageUrl}
                initialValues={item}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div key={item.id} className="card-surface p-5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-semibold">{item.name}</h3>
                    {categoryMap[item.category_id] && (
                      <span className="inline-flex items-center rounded-full border border-ink/20 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wide text-ink-soft">
                        {categoryMap[item.category_id]}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-ink-soft line-clamp-2">{item.description}</p>
                  )}
                  {item.price != null && (
                    <p className="mt-2 font-mono text-sm">${Number(item.price).toFixed(2)}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    className="btn-secondary text-sm px-3 py-2"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(item.id)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-secondary text-sm px-3 py-2"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id)}
                  >
                    {deletingId === item.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  )
}
