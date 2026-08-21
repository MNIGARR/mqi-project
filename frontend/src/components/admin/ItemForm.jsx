import { useEffect, useState } from 'react'

const inputClass =
  'w-full rounded-sm border border-ink/20 bg-paper px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:border-teal focus:outline-none'

export default function ItemForm({ categories, initialValues, includeImageUrl, submitLabel, onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    setName(initialValues?.name || '')
    setDescription(initialValues?.description || '')
    setPrice(initialValues?.price != null ? String(initialValues.price) : '')
    setCategoryId(initialValues?.category_id != null ? String(initialValues.category_id) : '')
    setImageUrl(initialValues?.image_url || '')
  }, [initialValues])

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setStatus('error')
      setError('Name is required.')
      return
    }

    if (price.trim() !== '' && (Number.isNaN(Number(price)) || Number(price) < 0)) {
      setStatus('error')
      setError('Price must be a non-negative number.')
      return
    }

    setStatus('loading')
    setError('')

    const payload = {
      name: trimmedName,
      description: description.trim(),
      price: price.trim() === '' ? null : Number(price),
      categoryId: categoryId === '' ? null : Number(categoryId),
    }
    if (includeImageUrl) {
      payload.imageUrl = imageUrl.trim() === '' ? null : imageUrl.trim()
    }

    try {
      await onSubmit(payload)
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Price">
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {includeImageUrl && (
          <Field label="Image URL">
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={inputClass}
            />
          </Field>
        )}
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-plum-dark bg-plum/10 border border-plum/20 rounded-sm px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={status === 'loading'} className="btn-primary">
          {status === 'loading' ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-2">{label}</span>
      {children}
    </label>
  )
}
