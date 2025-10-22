import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { createItem, deleteItem, fetchItems, updateItem } from './api'
import './App.css'
import type { InventoryItem, InventoryItemInput } from './types'

const emptyForm: InventoryItemInput = {
  name: '',
  description: '',
  quantity: 0,
  location: '',
}

type FormState = InventoryItemInput & { id?: number }

function App() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchItems()
        setItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const resetForm = () => setForm(emptyForm)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Name is required')
      return
    }

    try {
      if (form.id) {
        const updated = await updateItem(form.id, {
          name: form.name,
          description: form.description,
          quantity: form.quantity,
          location: form.location,
        })
        setItems((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        )
      } else {
        const created = await createItem({
          name: form.name,
          description: form.description,
          quantity: form.quantity,
          location: form.location,
        })
        setItems((prev) => [...prev, created])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    }
  }

  const handleDelete = async (id: number) => {
    setError(null)
    try {
      await deleteItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      if (form.id === id) {
        resetForm()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setForm({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      location: item.location,
    })
  }

  const handleCancelEdit = () => resetForm()

  const formTitle = form.id ? 'Update Item' : 'Add Item'
  const submitLabel = form.id ? 'Update' : 'Add'

  return (
    <div className="app-shell">
      <header>
        <h1>Inventory</h1>
        <p>Track availability and locations for your equipment in seconds.</p>
      </header>

      <main>
        <section className="form-panel">
          <h2>{formTitle}</h2>
          <form onSubmit={handleSubmit} className="grid-form">
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="e.g. Laptop"
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional details"
                rows={3}
              />
            </label>

            <label>
              Quantity
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    quantity: Number(event.target.value),
                  }))
                }
              />
            </label>

            <label>
              Location
              <input
                value={form.location}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, location: event.target.value }))
                }
                placeholder="e.g. HQ"
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="primary">
                {submitLabel}
              </button>
              {form.id ? (
                <button
                  type="button"
                  className="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="table-panel">
          <div className="table-header">
            <h2>Items</h2>
            {loading ? <span className="badge">Loading...</span> : null}
            {!loading && sortedItems.length === 0 ? (
              <span className="badge secondary">No items yet</span>
            ) : null}
          </div>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th className="numeric">Quantity</th>
                <th>Location</th>
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.description || '--'}</td>
                  <td className="numeric">{item.quantity}</td>
                  <td>{item.location || '--'}</td>
                  <td className="actions">
                    <button
                      type="button"
                      className="ghost"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ghost danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default App
