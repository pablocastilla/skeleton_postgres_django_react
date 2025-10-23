import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { createItem, deleteItem, fetchItems, updateItem } from './api'
import './App.css'
import type { InventoryItem, InventoryItemInput } from './types'
import inventoryIcon from './assets/inventory-icon.svg'

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
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items],
  )

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const locationCount = useMemo(() => {
    const unique = new Set(
      items
        .map((item) => item.location.trim())
        .filter((location) => location.length > 0),
    )
    return unique.size
  }, [items])

  const lowStockItems = useMemo(
    () => items.filter((item) => item.quantity <= 3),
    [items],
  )

  const outOfStockCount = useMemo(
    () => items.filter((item) => item.quantity === 0).length,
    [items],
  )

  const lastSyncedLabel = useMemo(() => {
    if (!lastSyncedAt) {
      return null
    }
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(lastSyncedAt)
  }, [lastSyncedAt])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchItems()
        setItems(data)
        setLastSyncedAt(new Date())
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
      setLastSyncedAt(new Date())
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
      setLastSyncedAt(new Date())
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
        <div className="hero-card">
          <div className="hero-content">
            <img
              src={inventoryIcon}
              alt="Inventory dashboard icon"
              className="hero-icon"
            />
            <p className="eyebrow">Inventory Control</p>
            <h1>Inventory</h1>
            <p>
              Keep your team in sync with live availability, locations, and
              quick edits.
            </p>
          </div>
          <div className="hero-meta">
            <div className={`sync-indicator ${loading ? 'syncing' : 'ready'}`}>
              <span className="status-dot" aria-hidden="true" />
              {loading ? 'Syncing with server...' : 'Live and ready'}
            </div>
            {lastSyncedLabel ? (
              <p className="hero-subtext">Updated at {lastSyncedLabel}</p>
            ) : (
              <p className="hero-subtext">Fetch inventory to get started</p>
            )}
          </div>
        </div>

        <div className="summary-grid" aria-label="Inventory summary">
          <article className="summary-card primary">
            <p className="summary-label">Tracked items</p>
            <p className="summary-value">{items.length}</p>
            <p className="summary-hint">
              {items.length
                ? `Across ${locationCount || 1} active location${
                    locationCount !== 1 ? 's' : ''
                  }`
                : 'Create a record to start tracking'}
            </p>
          </article>
          <article className="summary-card">
            <p className="summary-label">Total quantity</p>
            <p className="summary-value">{totalQuantity}</p>
            <p className="summary-hint">
              {totalQuantity
                ? 'Includes on-hand and reserved stock'
                : 'No inventory recorded yet'}
            </p>
          </article>
          <article className="summary-card attention">
            <p className="summary-label">Low &amp; out of stock</p>
            <p className="summary-value">
              {lowStockItems.length}
              <span className="summary-addon">
                {!!outOfStockCount && `${outOfStockCount} out`}
              </span>
            </p>
            <p className="summary-hint">
              {lowStockItems.length
                ? 'Restock soon to avoid shortages'
                : 'Everything looks healthy'}
            </p>
          </article>
        </div>
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

          {lowStockItems.length ? (
            <div className="callout">
              <div>
                <p className="callout-title">
                  {lowStockItems.length} item
                  {lowStockItems.length > 1 ? 's' : ''} running low
                </p>
                <p className="callout-text">
                  Review quantities and plan a replenishment.
                </p>
              </div>
              <div className="chip-group" aria-label="Low stock items">
                {lowStockItems.slice(0, 3).map((item) => (
                  <span key={item.id} className="chip warning">
                    {item.name} qty {item.quantity}
                  </span>
                ))}
                {lowStockItems.length > 3 ? (
                  <span className="chip muted">
                    +{lowStockItems.length - 3} more
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

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
